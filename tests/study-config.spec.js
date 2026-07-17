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

function decodeStudyPayload(payload) {
    return JSON.parse(Buffer.from(
        String(payload).replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
    ).toString('utf8'));
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
    return page.evaluate(async id => {
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
        return App.start();
    }, participantId);
}

async function createConfiguredSessionLinks(page, {
    activeConfig,
    differentConfig,
    participantId,
    participantName = '',
}) {
    const applied = await applyConfig(page, activeConfig);
    const sameLink = await page.evaluate(config => App.buildParticipantLink(config), activeConfig);
    const differentLink = differentConfig
        ? await page.evaluate(config => App.buildParticipantLink(config), differentConfig)
        : null;
    if (participantName) await page.locator('#participant-name').fill(participantName);
    expect(await startSession(page, participantId)).toBe(true);
    return { applied, sameLink, differentLink };
}

async function openSavedSessionLink(page, link, compatibility) {
    await page.goto(link);
    await waitForApp(page);
    const banner = page.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', compatibility);
    return banner;
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
    const participantName = 'Language Integrity Private Name';
    await applyConfig(page, fixedConfig({ participant_language: 'en', language_policy: 'fixed' }));
    await page.locator('#participant-name').fill(participantName);
    await startSession(page, 'RESTORE-LANGUAGE-01');
    await mutateSavedSession(page, 'fixed_language');

    await page.reload();
    await waitForApp(page);
    const banner = page.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', 'mismatch');
    await expect(banner).not.toContainText(participantName);
    await expect(banner).not.toContainText('RESTORE-LANGUAGE-01');
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);

    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(false);
    const state = await page.evaluate(() => ({
        activeScreen: document.querySelector('.screen.active')?.id || null,
        startError: document.getElementById('start-error')?.textContent || '',
        startTime: App.startTime ? App.startTime.toISOString() : null,
    }));
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

test('researcher creates an English-locked participant link that survives reload with verified metadata', async ({ page }) => {
    await page.goto('/?mode=researcher&lang=ja&researcher_lang=en&debug=1#researcher-fragment');
    await waitForApp(page);

    const language = page.locator('#study-language');
    const languageLock = page.locator('#lock-participant-language');
    const studyId = page.locator('#study-id');
    const output = page.locator('#participant-link-output');
    const copyButton = page.locator('#btn-copy-participant-link');
    const preview = page.locator('#participant-link-preview');

    await expect(language).toHaveValue('en');
    await expect(languageLock).toBeChecked();
    await expect(output).toHaveAttribute('readonly', '');
    await expect(output).toHaveValue('');
    await expect(copyButton).toBeDisabled();
    await expect(preview).toHaveAttribute('aria-disabled', 'true');
    expect(await preview.getAttribute('href')).toBeNull();

    await page.locator('#btn-generate-participant-link').click();
    await expect(output).not.toHaveValue('');
    await expect(copyButton).toBeEnabled();
    await expect(preview).toHaveAttribute('aria-disabled', 'false');

    const firstLink = await output.inputValue();
    const firstUrl = new URL(firstLink);
    expect([...firstUrl.searchParams.keys()]).toEqual(['study']);
    expect(firstUrl.hash).toBe('');
    expect(await preview.getAttribute('href')).toBe(firstLink);

    await page.evaluate(async () => {
        window.__copiedParticipantLink = null;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: async (text) => { window.__copiedParticipantLink = text; },
            },
        });
    });
    await copyButton.click();
    await expect.poll(() => page.evaluate(() => window.__copiedParticipantLink)).toBe(firstLink);
    await expect(page.locator('#study-config-status')).toHaveText(await page.evaluate(() => (
        App.t('common.researcherConfig.link.copied')
    )));

    await studyId.fill('participant-link-roundtrip');
    await expect(output).toHaveValue('');
    await expect(copyButton).toBeDisabled();
    await expect(preview).toHaveAttribute('aria-disabled', 'true');
    expect(await preview.getAttribute('href')).toBeNull();

    await page.locator('#btn-generate-participant-link').click();
    await expect(output).not.toHaveValue('');
    const participantLink = await output.inputValue();
    const participantUrl = new URL(participantLink);
    const encodedPayload = participantUrl.searchParams.get('study');
    const payload = decodeStudyPayload(encodedPayload);

    expect([...participantUrl.searchParams.keys()]).toEqual(['study']);
    expect(participantUrl.hash).toBe('');
    expect(payload.study_id).toBe('participant-link-roundtrip');
    expect(payload.participant_language).toBe('en');
    expect(payload.language_policy).toBe('fixed');
    expect(payload.config_source).toBe('researcher_ui');
    expect(payload.config_hash).toMatch(/^sha256:[0-9a-f]{64}$/);

    await page.goto(participantLink);
    await waitForApp(page);

    const assertLinkedConfiguration = async () => {
        const state = await page.evaluate(() => ({
            locale: I18n.getLocale(),
            participantLanguageLocked: App.participantLanguageLocked,
            appHash: App.studyConfigHash,
            activeConfig: StudyConfig.activeConfig ? {
                studyId: StudyConfig.activeConfig.study_id,
                participantLanguage: StudyConfig.activeConfig.participant_language,
                languagePolicy: StudyConfig.activeConfig.language_policy,
                configHash: StudyConfig.activeConfig.config_hash,
                configSource: StudyConfig.activeConfig.config_source,
            } : null,
        }));

        expect(state.locale).toBe('en');
        expect(state.participantLanguageLocked).toBe(true);
        expect(state.appHash).toBe(payload.config_hash);
        expect(state.activeConfig).toEqual({
            studyId: 'participant-link-roundtrip',
            participantLanguage: 'en',
            languagePolicy: 'fixed',
            configHash: payload.config_hash,
            configSource: 'participant_link',
        });
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('.language-option[data-locale="en"]')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.language-option').first()).toBeDisabled();
        await expect(page.locator('.language-option').last()).toBeDisabled();
    };

    await assertLinkedConfiguration();
    await page.reload();
    await waitForApp(page);
    await assertLinkedConfiguration();
});

test('a pending participant-link generation cannot restore a link after the settings change', async ({ page }) => {
    await page.goto('/?mode=researcher');
    await waitForApp(page);

    await page.evaluate(() => {
        const originalComputeSha256 = App.computeSha256.bind(App);
        const originalGenerateParticipantLink = StudyConfig.generateParticipantLink.bind(StudyConfig);
        let releaseDigest;
        const digestGate = new Promise(resolve => { releaseDigest = resolve; });

        window.__participantLinkHashStarted = false;
        window.__participantLinkGenerationFinished = false;
        window.__releaseParticipantLinkHash = releaseDigest;
        App.computeSha256 = async (value) => {
            window.__participantLinkHashStarted = true;
            await digestGate;
            return originalComputeSha256(value);
        };
        StudyConfig.generateParticipantLink = async () => {
            try {
                return await originalGenerateParticipantLink();
            } finally {
                App.computeSha256 = originalComputeSha256;
                window.__participantLinkGenerationFinished = true;
            }
        };
    });

    await page.locator('#btn-generate-participant-link').click();
    await page.waitForFunction(() => window.__participantLinkHashStarted === true);
    await page.locator('#study-id').fill('changed-while-generating');
    await page.evaluate(() => window.__releaseParticipantLinkHash());
    await page.waitForFunction(() => window.__participantLinkGenerationFinished === true);

    const output = page.locator('#participant-link-output');
    const copyButton = page.locator('#btn-copy-participant-link');
    const preview = page.locator('#participant-link-preview');
    await expect(output).toHaveValue('');
    await expect(copyButton).toBeDisabled();
    await expect(preview).toHaveAttribute('aria-disabled', 'true');
    expect(await preview.getAttribute('href')).toBeNull();

    await page.locator('#btn-generate-participant-link').click();
    await expect(output).not.toHaveValue('');
    const regeneratedUrl = new URL(await output.inputValue());
    const regeneratedPayload = decodeStudyPayload(regeneratedUrl.searchParams.get('study'));
    expect(regeneratedPayload.study_id).toBe('changed-while-generating');
});

test('a saved session remains resumable when the current participant link has the same configuration hash', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'resume-same-hash' });
    const participantName = 'Same Hash <img id="saved-banner-injection" src=x>';
    const { applied, sameLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        participantId: 'RESUME-SAME-01',
        participantName,
    });

    const banner = await openSavedSessionLink(page, sameLink, 'match');
    await expect(banner.locator('#btn-resume-session')).toBeVisible();
    await expect(banner.locator('#btn-discard-session')).toBeVisible();
    await expect(banner).toContainText(participantName);
    await expect(banner.locator('#saved-banner-injection')).toHaveCount(0);

    const restored = await page.evaluate(async () => App.restoreSavedSession());
    const state = await page.evaluate(() => ({
        startTime: App.startTime ? App.startTime.toISOString() : null,
        activeScreen: document.querySelector('.screen.active')?.id || null,
        studyConfigHash: App.studyConfigHash,
        participantId: App.participantId,
    }));
    expect(restored).toBe(true);
    expect(state.startTime).not.toBeNull();
    expect(state.activeScreen).toBe('screen-test');
    expect(state.studyConfigHash).toBe(applied.config_hash);
    expect(state.participantId).toBe('RESUME-SAME-01');
    await expect(page.locator('#resume-session-heading')).toBeFocused();
});

for (const restoredStage of ['break', 'results']) {
    test(`restoring a ${restoredStage} stage moves focus into the visible screen`, async ({ page }) => {
        const activeConfig = fixedConfig({ study_id: `restore-focus-${restoredStage}` });
        const { sameLink } = await createConfiguredSessionLinks(page, {
            activeConfig,
            participantId: `RESTORE-FOCUS-${restoredStage.toUpperCase()}`,
        });

        await page.evaluate(stage => {
            const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
            if (stage === 'break') {
                saved.sessionStage = 'break';
                saved.currentTestIndex = 1;
                saved.inProgressTestId = saved.selectedTests[1];
            } else {
                saved.sessionStage = 'results';
                saved.currentTestIndex = saved.selectedTests.length;
                saved.inProgressTestId = null;
            }
            localStorage.setItem(App.STORAGE_KEY, JSON.stringify(saved));
            App.persistSession = () => {};
        }, restoredStage);

        const banner = await openSavedSessionLink(page, sameLink, 'match');
        await banner.locator('#btn-resume-session').click();
        if (restoredStage === 'break') {
            await expect(page.locator('#screen-test')).toHaveClass(/active/);
            await expect(page.locator('#break-screen-heading')).toBeFocused();
        } else {
            await expect(page.locator('#screen-results')).toHaveClass(/active/);
            await expect(page.locator('#results-heading')).toBeFocused();
        }
    });
}

test('saved-session verification requires every hash mirror and a canonical matching body without mutating App state', async ({ page }) => {
    await applyConfig(page, fixedConfig({ study_id: 'verify-all-hash-mirrors' }));
    expect(await startSession(page, 'VERIFY-MIRRORS-01')).toBe(true);

    const result = await page.evaluate(async () => {
        const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
        const expectedActiveHash = StudyConfig.activeConfig.config_hash;
        const clone = value => JSON.parse(JSON.stringify(value));
        const snapshot = () => ({
            studyConfigHash: App.studyConfigHash,
            studyId: App.studyConfig?.study_id || null,
            resolvedTaskOrder: App.resolvedTaskOrder.slice(),
        });
        const mutations = [
            { label: 'studyConfigHash', remove: value => { delete value.studyConfigHash; }, conflict: value => { value.studyConfigHash = `sha256:${'0'.repeat(64)}`; } },
            { label: 'studyConfig.config_hash', remove: value => { delete value.studyConfig.config_hash; }, conflict: value => { value.studyConfig.config_hash = `sha256:${'0'.repeat(64)}`; } },
            { label: 'sessionProtocolMetadata.study_config_hash', remove: value => { delete value.sessionProtocolMetadata.study_config_hash; }, conflict: value => { value.sessionProtocolMetadata.study_config_hash = `sha256:${'0'.repeat(64)}`; } },
            { label: 'quality.study_config_hash', remove: value => { delete value.quality.study_config_hash; }, conflict: value => { value.quality.study_config_hash = `sha256:${'0'.repeat(64)}`; } },
            { label: 'quality.protocol.study_config_hash', remove: value => { delete value.quality.protocol.study_config_hash; }, conflict: value => { value.quality.protocol.study_config_hash = `sha256:${'0'.repeat(64)}`; } },
        ];
        const before = snapshot();
        const missing = [];
        const conflicts = [];
        for (const mutation of mutations) {
            const missingPayload = clone(saved);
            mutation.remove(missingPayload);
            missing.push({
                label: mutation.label,
                status: (await StudyConfig.verifySavedSession(missingPayload, { expectedActiveHash })).status,
            });

            const conflictPayload = clone(saved);
            mutation.conflict(conflictPayload);
            conflicts.push({
                label: mutation.label,
                status: (await StudyConfig.verifySavedSession(conflictPayload, { expectedActiveHash })).status,
            });
        }
        const alteredBody = clone(saved);
        alteredBody.studyConfig.study_id = 'canonical-body-was-altered';
        const alteredBodyStatus = (await StudyConfig.verifySavedSession(alteredBody, { expectedActiveHash })).status;
        const alteredAppVersion = clone(saved);
        alteredAppVersion.appVersion = 'unexpected-app-version';
        const alteredProtocolVersion = clone(saved);
        alteredProtocolVersion.protocolVersion = 'unexpected-protocol-version';
        const versionStatuses = await Promise.all([
            StudyConfig.verifySavedSession(alteredAppVersion, { expectedActiveHash }),
            StudyConfig.verifySavedSession(alteredProtocolVersion, { expectedActiveHash }),
        ]);
        return {
            before,
            after: snapshot(),
            missing,
            conflicts,
            alteredBodyStatus,
            versionStatuses: versionStatuses.map(entry => entry.status),
        };
    });

    expect(result.missing).toEqual(result.missing.map(entry => ({ ...entry, status: 'missing_hash' })));
    expect(result.conflicts).toEqual(result.conflicts.map(entry => ({ ...entry, status: 'hash_conflict' })));
    expect(result.alteredBodyStatus).toBe('invalid');
    expect(result.versionStatuses).toEqual(['invalid', 'invalid']);
    expect(result.after).toEqual(result.before);
});

test('a different current configuration hides saved-session PII and rejects direct restore', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'saved-configuration-a' });
    const differentConfig = fixedConfig({
        study_id: 'current-configuration-b',
        participant_language: 'ja',
        fixed_order: FIXED_TASK_ORDER.slice().reverse(),
        selected_tests: FIXED_TASK_ORDER.slice().reverse(),
    });
    const participantName = 'Sensitive Saved Name';
    const participantId = 'SENSITIVE-SAVED-ID';
    const { differentLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        differentConfig,
        participantId,
        participantName,
    });
    const currentPayload = decodeStudyPayload(new URL(differentLink).searchParams.get('study'));

    const banner = await openSavedSessionLink(page, differentLink, 'mismatch');
    await expect(banner).not.toContainText(participantName);
    await expect(banner).not.toContainText(participantId);
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    await expect(banner.locator('#btn-discard-session')).toBeVisible();

    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    const restored = await page.evaluate(async () => App.restoreSavedSession());
    const state = await page.evaluate(() => ({
        stored: localStorage.getItem(App.STORAGE_KEY),
        startTime: App.startTime,
        activeScreen: document.querySelector('.screen.active')?.id || null,
        startError: document.getElementById('start-error')?.textContent || '',
        currentHash: App.studyConfigHash,
        activeHash: StudyConfig.activeConfig?.config_hash || null,
        resolvedTaskOrder: App.resolvedTaskOrder.slice(),
    }));
    expect(restored).toBe(false);
    expect(state.stored).toBe(before);
    expect(state.startTime).toBeNull();
    expect(state.activeScreen).toBe('screen-start');
    expect(state.startError).not.toBe('');
    expect(state.currentHash).toBe(currentPayload.config_hash);
    expect(state.activeHash).toBe(currentPayload.config_hash);
    expect(state.resolvedTaskOrder).toEqual([]);
});

test('a saved configuration body altered without updating its hashes is hidden and rejected before App state changes', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'canonical-body-original' });
    const participantName = 'Hidden Altered Body Name';
    const participantId = 'HIDDEN-ALTERED-BODY-ID';
    const { sameLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        participantId,
        participantName,
    });

    await page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
        saved.studyConfig.study_id = 'canonical-body-tampered';
        localStorage.setItem(App.STORAGE_KEY, JSON.stringify(saved));
        App.persistSession = () => {};
    });

    const banner = await openSavedSessionLink(page, sameLink, 'mismatch');
    await expect(banner).not.toContainText(participantName);
    await expect(banner).not.toContainText(participantId);
    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(false);
    const state = await page.evaluate(() => ({
        raw: localStorage.getItem(App.STORAGE_KEY),
        activeStudyId: StudyConfig.activeConfig?.study_id || null,
        appStudyId: App.studyConfig?.study_id || null,
        resolvedTaskOrder: App.resolvedTaskOrder.slice(),
        startTime: App.startTime,
    }));
    expect(state.raw).toBe(before);
    expect(state.activeStudyId).toBe('canonical-body-original');
    expect(state.appStudyId).toBe('canonical-body-original');
    expect(state.resolvedTaskOrder).toEqual([]);
    expect(state.startTime).toBeNull();
});

test('a versioned saved session without a configuration hash is not resumable under an active configuration', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'missing-saved-hash' });
    const participantName = 'Hidden Missing Hash Name';
    const participantId = 'HIDDEN-MISSING-HASH-ID';
    const { sameLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        participantId,
        participantName,
    });

    await page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
        delete saved.studyConfigHash;
        if (saved.studyConfig) delete saved.studyConfig.config_hash;
        if (saved.sessionProtocolMetadata) delete saved.sessionProtocolMetadata.study_config_hash;
        if (saved.quality) delete saved.quality.study_config_hash;
        if (saved.quality?.protocol) delete saved.quality.protocol.study_config_hash;
        localStorage.setItem(App.STORAGE_KEY, JSON.stringify(saved));
        App.persistSession = () => {};
    });

    const banner = await openSavedSessionLink(page, sameLink, 'mismatch');
    await expect(banner).not.toContainText(participantName);
    await expect(banner).not.toContainText(participantId);
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    await expect(banner.locator('#btn-discard-session')).toBeVisible();

    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    const restored = await page.evaluate(async () => App.restoreSavedSession());
    const state = await page.evaluate(() => ({
        stored: localStorage.getItem(App.STORAGE_KEY),
        startTime: App.startTime,
        startError: document.getElementById('start-error')?.textContent || '',
    }));
    expect(restored).toBe(false);
    expect(state.stored).toBe(before);
    expect(state.startTime).toBeNull();
    expect(state.startError).not.toBe('');
});

test('a legacy saved session remains resumable when no active study configuration exists', async ({ page }) => {
    await page.evaluate(async () => {
        App.setLanguage('en');
        App.participantName = 'Legacy Participant';
        App.participantId = 'LEGACY-UNSCOPED-01';
        App.participantAge = 40;
        App.consentAccepted = true;
        App.selectedTests = ['flanker'];
        App.resolvedTaskOrder = [];
        App.currentTestIndex = 0;
        App.results = {};
        App.trialData = {};
        App.startTime = new Date('2026-07-18T00:00:00.000Z');
        App._sessionPerfStart = performance.now();
        App.sessionStage = 'test';
        App.inProgressTestId = 'flanker';
        App.counterbalanceGroup = null;
        App.studyConfig = null;
        App.studyConfigHash = null;
        App.sessionProtocolMetadata = null;
        App.quality = App.createQualityState();
        App.quality.environment = App.collectEnvironmentSnapshot();
        await App.persistSession({ claim: true, expectedRaw: null });
    });

    await page.reload();
    await waitForApp(page);
    const banner = page.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', 'unscoped');
    await expect(banner.locator('#btn-resume-session')).toBeVisible();

    const restored = await page.evaluate(async () => App.restoreSavedSession());
    const state = await page.evaluate(() => ({
        participantId: App.participantId,
        startTime: App.startTime ? App.startTime.toISOString() : null,
        activeScreen: document.querySelector('.screen.active')?.id || null,
        locale: I18n.getLocale(),
    }));
    expect(restored).toBe(true);
    expect(state.participantId).toBe('LEGACY-UNSCOPED-01');
    expect(state.startTime).not.toBeNull();
    expect(state.activeScreen).toBe('screen-test');
    expect(state.locale).toBe('en');
});

test('corrupt saved JSON is fail-closed and privacy mode cannot silently delete or overwrite it', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'corrupt-session-guard' });
    const { sameLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        participantId: 'CORRUPT-SOURCE-01',
    });
    const corruptRaw = '{"participantName":"CORRUPT-PRIVATE-NAME","startTime":';
    await page.evaluate(raw => {
        localStorage.setItem(App.STORAGE_KEY, raw);
        App.persistSession = () => {};
    }, corruptRaw);

    const banner = await openSavedSessionLink(page, sameLink, 'mismatch');
    await expect(banner).not.toContainText('CORRUPT-PRIVATE-NAME');
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    await page.locator('#privacy-no-persist').check();

    expect(await startSession(page, 'CORRUPT-NEW-ATTEMPT')).toBe(false);
    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(false);
    const state = await page.evaluate(() => ({
        raw: localStorage.getItem(App.STORAGE_KEY),
        startTime: App.startTime,
        studyId: App.studyConfig?.study_id || null,
        resolvedTaskOrder: App.resolvedTaskOrder.slice(),
    }));
    expect(state.raw).toBe(corruptRaw);
    expect(state.startTime).toBeNull();
    expect(state.studyId).toBe('corrupt-session-guard');
    expect(state.resolvedTaskOrder).toEqual([]);
});

test('an invalid participant link never reveals PII from a stale valid session', async ({ page }) => {
    const participantName = 'STALE-LINK-PRIVATE-NAME';
    const participantId = 'STALE-LINK-PRIVATE-ID';
    await createConfiguredSessionLinks(page, {
        activeConfig: fixedConfig({ study_id: 'stale-link-source' }),
        participantId,
        participantName,
    });

    await page.goto('/?study=not-valid-base64!');
    await waitForApp(page);
    const banner = page.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', 'mismatch');
    await expect(banner).not.toContainText(participantName);
    await expect(banner).not.toContainText(participantId);
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(before);
});

test('rejecting a session on the wrong link preserves it for restoration on the correct link', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'return-to-correct-link-a' });
    const differentConfig = fixedConfig({
        study_id: 'wrong-link-b',
        selected_tests: ['flanker', 'ecorsi'],
        fixed_order: ['flanker', 'ecorsi'],
    });
    const { sameLink, differentLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        differentConfig,
        participantId: 'RETURN-CORRECT-01',
    });

    await openSavedSessionLink(page, differentLink, 'mismatch');
    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(before);

    const banner = await openSavedSessionLink(page, sameLink, 'match');
    await expect(banner.locator('#btn-resume-session')).toBeVisible();
    expect(await page.evaluate(async () => App.restoreSavedSession())).toBe(true);
    expect(await page.evaluate(() => App.participantId)).toBe('RETURN-CORRECT-01');
});

test('a mismatched saved session blocks a new start without overwriting the saved payload', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'saved-session-for-start-guard' });
    const differentConfig = fixedConfig({
        study_id: 'current-config-for-start-guard',
        fixed_order: ['flanker', 'ecorsi'],
        selected_tests: ['flanker', 'ecorsi'],
    });
    const { differentLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        differentConfig,
        participantId: 'ORIGINAL-SAVED-ID',
        participantName: 'Original Saved Name',
    });

    await openSavedSessionLink(page, differentLink, 'mismatch');
    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    await page.locator('#participant-name').fill('Attempted New Participant');
    await page.locator('#privacy-no-persist').check();
    const started = await startSession(page, 'ATTEMPTED-NEW-ID');
    const state = await page.evaluate(() => ({
        stored: localStorage.getItem(App.STORAGE_KEY),
        startTime: App.startTime,
        activeScreen: document.querySelector('.screen.active')?.id || null,
        startError: document.getElementById('start-error')?.textContent || '',
        compatibility: document.getElementById('saved-session')?.dataset.compatibility || null,
    }));

    expect(started).toBe(false);
    expect(state.stored).toBe(before);
    expect(state.startTime).toBeNull();
    expect(state.activeScreen).toBe('screen-start');
    expect(state.startError).toBe(await page.evaluate(() => App.t('common.validation.savedSessionMismatch')));
    expect(state.compatibility).toBe('mismatch');
});

test('explicit discard clears the guard and allows a new session under the current link', async ({ page }) => {
    const activeConfig = fixedConfig({ study_id: 'discard-old-session-a' });
    const differentConfig = fixedConfig({
        study_id: 'discard-current-session-b',
        selected_tests: ['flanker', 'ecorsi'],
        fixed_order: ['flanker', 'ecorsi'],
    });
    const { differentLink } = await createConfiguredSessionLinks(page, {
        activeConfig,
        differentConfig,
        participantId: 'DISCARD-OLD-01',
    });
    const currentHash = decodeStudyPayload(new URL(differentLink).searchParams.get('study')).config_hash;

    const banner = await openSavedSessionLink(page, differentLink, 'mismatch');
    const before = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));

    const unsupportedConfirmation = await page.evaluate(async expectedRaw => {
        const dialog = document.getElementById('discard-session-dialog');
        Object.defineProperty(dialog, 'showModal', { value: undefined, configurable: true });
        const discarded = await App.discardSavedSession({ expectedRaw });
        delete dialog.showModal;
        return {
            discarded,
            raw: localStorage.getItem(App.STORAGE_KEY),
            status: document.getElementById('session-action-status').textContent,
        };
    }, before);
    expect(unsupportedConfirmation.discarded).toBe(false);
    expect(unsupportedConfirmation.raw).toBe(before);
    expect(unsupportedConfirmation.status).toBe(await page.evaluate(() => App.t('common.saved.discardUnavailable')));

    await banner.locator('#btn-discard-session').click();
    const dialog = page.locator('#discard-session-dialog');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(page.locator('#btn-cancel-discard-session')).toBeFocused();
    await page.locator('#btn-cancel-discard-session').click();
    await expect(dialog).not.toHaveAttribute('open', '');
    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(before);
    await expect(banner).toBeVisible();

    await banner.locator('#btn-discard-session').click();
    await page.locator('#btn-confirm-discard-session').click();
    await expect(banner).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBeNull();

    expect(await startSession(page, 'DISCARD-NEW-01')).toBe(true);
    const state = await page.evaluate(() => ({
        participantId: App.participantId,
        studyConfigHash: App.studyConfigHash,
        storedHash: JSON.parse(localStorage.getItem(App.STORAGE_KEY)).studyConfigHash,
    }));
    expect(state.participantId).toBe('DISCARD-NEW-01');
    expect(state.studyConfigHash).toBe(currentHash);
    expect(state.storedHash).toBe(currentHash);
});
