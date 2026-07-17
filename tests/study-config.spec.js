const { test, expect } = require('@playwright/test');

const ALL_TEST_IDS = [
    'flanker',
    'dccs',
    'list-sorting',
    'visual_digit_span',
    'ecorsi',
    'pattern-comparison',
    'picture-sequence',
];

const FIXED_TASK_ORDER = ['ecorsi', 'visual_digit_span', 'flanker'];

function fixedConfig(overrides = {}) {
    return {
        study_id: 'fixed-order-study',
        participant_language: 'en',
        language_policy: 'fixed',
        task_selection_policy: 'researcher_fixed',
        selected_tests: FIXED_TASK_ORDER.slice(),
        order_policy: 'fixed',
        fixed_order: FIXED_TASK_ORDER.slice(),
        config_source: 'researcher_ui',
        ...overrides,
    };
}

function williamsConfig(overrides = {}) {
    return {
        study_id: 'williams-study',
        participant_language: 'ja',
        language_policy: 'fixed',
        task_selection_policy: 'researcher_fixed',
        selected_tests: ALL_TEST_IDS.slice(),
        order_policy: 'williams',
        fixed_order: ALL_TEST_IDS.slice(),
        config_source: 'researcher_ui',
        ...overrides,
    };
}

function encodeStudyPayload(payload) {
    return Buffer.from(JSON.stringify(payload), 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

async function waitForApp(page) {
    await page.waitForFunction(() => (
        typeof App !== 'undefined'
        && typeof App.applyStudyConfig === 'function'
        && typeof StudyConfig !== 'undefined'
    ));
}

async function applyConfig(page, config) {
    return page.evaluate(async rawConfig => App.applyStudyConfig(rawConfig), config);
}

async function startSession(page, participantId) {
    await page.evaluate(async id => {
        document.getElementById('participant-id').value = id;
        document.getElementById('participant-age').value = '40';
        document.getElementById('participant-viewing-distance').value = '60';
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });

        // Keep these integration tests focused on configuration resolution.
        App.captureDisplayTiming = async () => {};
        App.preloadStimuli = async () => {};
        App.requestFullscreenIfPossible = async () => {};
        App.runCurrentTest = () => {};
        await App.start();
    }, participantId);
}

async function reloadAndRestore(page) {
    await page.reload();
    await waitForApp(page);
    await expect(page.locator('#saved-session')).not.toHaveClass(/hidden/);
    await page.evaluate(async () => App.restoreSavedSession());
    return page.evaluate(() => ({
        activeScreen: document.querySelector('.screen.active')?.id || null,
        startError: document.getElementById('start-error')?.textContent || '',
        startTime: App.startTime ? App.startTime.toISOString() : null,
        selectedTests: App.selectedTests.slice(),
        counterbalanceGroup: App.counterbalanceGroup,
        locale: I18n.getLocale(),
    }));
}

async function mutateSavedSession(page, mutation) {
    await page.evaluate(kind => {
        const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));

        if (kind === 'order') {
            const alteredOrder = App.COUNTERBALANCE_WILLIAMS_DESIGN.find(row => (
                JSON.stringify(row) !== JSON.stringify(saved.resolvedTaskOrder)
            )).slice();
            saved.resolvedTaskOrder = alteredOrder;
            saved.selectedTests = alteredOrder.slice();
            saved.inProgressTestId = alteredOrder[saved.currentTestIndex || 0];
        } else if (kind === 'group') {
            saved.counterbalanceGroup = (saved.counterbalanceGroup + 1) % App.COUNTERBALANCE_WILLIAMS_DESIGN.length;
        } else if (kind === 'fixed_language') {
            const alteredLocale = saved.studyConfig.participant_language === 'en' ? 'ja' : 'en';
            const languageFields = ['ui_language', 'instruction_language', 'stimulus_language', 'consent_language'];
            languageFields.forEach(field => {
                saved[field] = alteredLocale;
                if (saved.quality) saved.quality[field] = alteredLocale;
                if (saved.sessionProtocolMetadata) saved.sessionProtocolMetadata[field] = alteredLocale;
                if (saved.quality?.protocol) saved.quality.protocol[field] = alteredLocale;
            });
            saved.consent_version = App.getConsentVersion(alteredLocale);
            if (saved.quality) saved.quality.consent_version = saved.consent_version;
            if (saved.sessionProtocolMetadata) saved.sessionProtocolMetadata.consent_version = saved.consent_version;
            if (saved.quality?.protocol) saved.quality.protocol.consent_version = saved.consent_version;
        }

        localStorage.setItem(App.STORAGE_KEY, JSON.stringify(saved));
        // Reload emits visibilitychange/pagehide in the old document. Prevent
        // that document from overwriting this deliberately corrupted fixture
        // with its still-valid in-memory session immediately before navigation.
        App.persistSession = () => {};
    }, mutation);
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await page.evaluate(() => localStorage.clear());
});

for (const scenario of [
    { name: 'empty study parameter', query: '' },
    { name: 'malformed payload', query: 'not-valid-base64!' },
    { name: 'configuration without a hash', query: encodeStudyPayload(williamsConfig({ study_id: 'missing-hash-study' })) },
]) {
    test(`participant link rejects ${scenario.name} and does not use a stale active configuration`, async ({ page }) => {
        await applyConfig(page, fixedConfig({ study_id: 'stale-local-study' }));

        await page.goto(`/?study=${encodeURIComponent(scenario.query)}`);
        await waitForApp(page);
        await expect(page.locator('#start-error')).toBeVisible();

        await startSession(page, 'LINK-FAIL-01');

        const state = await page.evaluate(() => ({
            configurationError: App.studyConfigError,
            startTime: App.startTime,
            activeScreen: document.querySelector('.screen.active')?.id || null,
            activeConfig: StudyConfig.activeConfig,
        }));
        expect(state.configurationError).toBeTruthy();
        expect(state.startTime).toBeNull();
        expect(state.activeScreen).toBe('screen-start');
        expect(state.activeConfig).toBeNull();
    });
}

test('fixed configuration starts exactly the selected tasks in the configured order', async ({ page }) => {
    const applied = await applyConfig(page, fixedConfig());
    expect(applied.config_hash).toMatch(/^sha256:[0-9a-f]{64}$/);

    await startSession(page, 'FIXED-ORDER-01');

    const state = await page.evaluate(() => ({
        selectedTests: App.selectedTests.slice(),
        resolvedTaskOrder: App.resolvedTaskOrder.slice(),
        counterbalanceGroup: App.counterbalanceGroup,
        metadata: App.getEffectiveStudyConfigMetadata(),
        participantLanguageLocked: App.participantLanguageLocked,
    }));
    expect(state.selectedTests).toEqual(FIXED_TASK_ORDER);
    expect(state.resolvedTaskOrder).toEqual(FIXED_TASK_ORDER);
    expect(state.counterbalanceGroup).toBeNull();
    expect(state.metadata.task_order_policy).toBe('fixed');
    expect(state.metadata.configured_tasks).toBe(FIXED_TASK_ORDER.join(','));
    expect(state.metadata.resolved_task_order).toBe(FIXED_TASK_ORDER.join(','));
    expect(state.participantLanguageLocked).toBe(true);
});

test('Williams configuration resolves deterministically from the participant ID', async ({ page }) => {
    const participantId = 'WILLIAMS-ORDER-01';
    await applyConfig(page, williamsConfig());
    const expected = await page.evaluate(id => App.counterbalanceOrderFor(id), participantId);

    await startSession(page, participantId);

    const state = await page.evaluate(() => ({
        selectedTests: App.selectedTests.slice(),
        resolvedTaskOrder: App.resolvedTaskOrder.slice(),
        counterbalanceGroup: App.counterbalanceGroup,
        metadata: App.getEffectiveStudyConfigMetadata(),
    }));
    expect(state.selectedTests).toEqual(expected.order);
    expect(state.resolvedTaskOrder).toEqual(expected.order);
    expect(state.counterbalanceGroup).toBe(expected.group);
    expect(state.metadata.task_order_policy).toBe('williams');
    expect(state.metadata.configured_tasks).toBe(ALL_TEST_IDS.join(','));
    expect(state.metadata.resolved_task_order).toBe(expected.order.join(','));
});

test('an intact configured session restores its fixed order and language', async ({ page }) => {
    await applyConfig(page, fixedConfig());
    await startSession(page, 'RESTORE-VALID-01');

    const state = await reloadAndRestore(page);
    expect(state.activeScreen).toBe('screen-test');
    expect(state.startError).toBe('');
    expect(state.startTime).not.toBeNull();
    expect(state.selectedTests).toEqual(FIXED_TASK_ORDER);
    expect(state.counterbalanceGroup).toBeNull();
    expect(state.locale).toBe('en');
});

for (const mutation of [
    { key: 'order', label: 'resolved Williams order' },
    { key: 'group', label: 'Williams counterbalance group' },
]) {
    test(`saved session rejects an altered ${mutation.label}`, async ({ page }) => {
        await applyConfig(page, williamsConfig());
        await startSession(page, `RESTORE-${mutation.key.toUpperCase()}-01`);
        await mutateSavedSession(page, mutation.key);

        const state = await reloadAndRestore(page);
        expect(state.activeScreen).toBe('screen-start');
        expect(state.startError).not.toBe('');
        expect(state.startTime).toBeNull();
    });
}

test('saved session rejects a language that conflicts with a fixed-language configuration', async ({ page }) => {
    await applyConfig(page, fixedConfig({ participant_language: 'en', language_policy: 'fixed' }));
    await startSession(page, 'RESTORE-LANGUAGE-01');
    await mutateSavedSession(page, 'fixed_language');

    const state = await reloadAndRestore(page);
    expect(state.activeScreen).toBe('screen-start');
    expect(state.startError).not.toBe('');
    expect(state.startTime).toBeNull();
});

test('apply and clear reject changes after a session starts without mutating its configuration', async ({ page }) => {
    await applyConfig(page, fixedConfig());
    await startSession(page, 'ACTIVE-CONFIG-01');

    const result = await page.evaluate(async replacement => {
        const snapshot = () => ({
            appHash: App.studyConfigHash,
            appConfigId: App.studyConfig?.config_id || null,
            activeHash: StudyConfig.activeConfig?.config_hash || null,
            resolvedTaskOrder: App.resolvedTaskOrder.slice(),
            storedHash: JSON.parse(localStorage.getItem(StudyConfig.ACTIVE_STORAGE_KEY))?.config_hash || null,
            protocolHash: App.sessionProtocolMetadata?.study_config_hash || null,
        });
        const before = snapshot();
        let applyError = null;
        try {
            await App.applyStudyConfig(replacement);
        } catch (error) {
            applyError = error?.message || String(error);
        }
        const afterApply = snapshot();
        const clearResult = App.clearStudyConfig();
        const afterClear = snapshot();
        return { before, applyError, afterApply, clearResult, afterClear };
    }, williamsConfig({ study_id: 'replacement-study' }));

    expect(result.applyError).toBe('session_active');
    expect(result.clearResult).toBe(false);
    expect(result.afterApply).toEqual(result.before);
    expect(result.afterClear).toEqual(result.before);
});

test('blocking link errors stay visible and are retranslated when the interface language changes', async ({ page }) => {
    await page.goto('/?study=');
    await waitForApp(page);
    await expect(page.locator('#start-error')).toBeVisible();

    await page.locator('.language-option[data-locale="en"]').click();
    await expect(page.locator('#start-error')).toBeVisible();
    await expect(page.locator('#start-error')).toContainText('invalid');

    await page.locator('#participant-id').fill('ERROR-STAYS-VISIBLE');
    await expect(page.locator('#start-error')).toBeVisible();
    await expect(page.locator('#start-error')).toContainText('invalid');
});

test('fixed-order edits survive a temporary switch to Williams mode', async ({ page }) => {
    await page.goto('/?mode=researcher');
    await waitForApp(page);
    await page.locator('input[name="study-order-policy"][value="fixed"]').check();
    const flankerRow = page.locator('#study-task-order-list [data-task-id="flanker"]');
    await flankerRow.locator('.study-task-checkbox').uncheck();

    const dccsRow = page.locator('#study-task-order-list [data-task-id="dccs"]');
    await dccsRow.locator('.task-move-down').click();
    await expect(page.locator('#study-config-status')).toContainText('2');

    const before = await page.locator('#study-task-order-list .study-task-checkbox:checked')
        .evaluateAll(boxes => boxes.map(box => box.closest('[data-task-id]').dataset.taskId));
    await page.locator('input[name="study-order-policy"][value="williams"]').check();
    await page.locator('input[name="study-order-policy"][value="fixed"]').check();
    const after = await page.locator('#study-task-order-list .study-task-checkbox:checked')
        .evaluateAll(boxes => boxes.map(box => box.closest('[data-task-id]').dataset.taskId));

    expect(after).toEqual(before);
    await expect(flankerRow.locator('.study-task-checkbox')).not.toBeChecked();
});

test('concurrent start requests create only one session', async ({ page }) => {
    await applyConfig(page, fixedConfig());
    const result = await page.evaluate(async () => {
        document.getElementById('participant-id').value = 'DOUBLE-START-01';
        document.getElementById('participant-age').value = '40';
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(checkbox => { checkbox.checked = true; });
        let runCount = 0;
        App.captureDisplayTiming = async () => {};
        App.preloadStimuli = async () => {};
        App.requestFullscreenIfPossible = async () => {};
        App.runCurrentTest = () => { runCount += 1; };
        const outcomes = await Promise.all([App.start(), App.start()]);
        return { outcomes, runCount, sessionNumber: App.sessionNumber };
    });

    expect(result.outcomes.filter(Boolean)).toHaveLength(1);
    expect(result.runCount).toBe(1);
    expect(result.sessionNumber).toBe(1);
});

test('researcher interface language is independent from the fixed participant language', async ({ page }) => {
    await applyConfig(page, fixedConfig({ participant_language: 'en', language_policy: 'fixed' }));
    await page.goto('/?mode=researcher&researcher_lang=ja');
    await waitForApp(page);

    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('#study-language')).toHaveValue('en');
    await expect(page.locator('[data-i18n="common.researcherConfig.title"]')).toHaveText('研究者用の研究設定');

    await page.locator('.researcher-ui-language-option[data-locale="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#study-language')).toHaveValue('en');
    await page.locator('.researcher-ui-language-option[data-locale="ja"]').click();
    await page.locator('#btn-cancel-study-config').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.language-option[data-locale="en"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.language-option').first()).toBeDisabled();
    await expect(page.locator('.language-option').last()).toBeDisabled();
    await expect(page).not.toHaveURL(/(?:mode=researcher|researcher_lang=)/);
});
