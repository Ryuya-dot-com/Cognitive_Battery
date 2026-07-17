const { test, expect } = require('@playwright/test');

const FIXED_TASK_ORDER = ['flanker', 'visual_digit_span', 'ecorsi'];

function fixedConfig(overrides = {}) {
    return {
        study_id: 'session-ownership-study',
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

async function waitForApp(page) {
    await page.waitForFunction(() => (
        typeof App !== 'undefined'
        && typeof App.start === 'function'
        && typeof App.applyStudyConfig === 'function'
        && typeof StudyConfig !== 'undefined'
    ));
}

async function prepareStart(page, participantId, participantName = '', { privacyMode = false } = {}) {
    await page.evaluate(({ id, name, privateSession }) => {
        document.getElementById('participant-name').value = name;
        document.getElementById('participant-id').value = id;
        document.getElementById('participant-age').value = '40';
        document.getElementById('participant-viewing-distance').value = '60';
        document.getElementById('consent-agree').checked = true;
        document.getElementById('privacy-no-persist').checked = privateSession;
        document.querySelectorAll('.readiness-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });

        // Keep ownership tests focused on the atomic session claim rather
        // than stimulus preloading, display sampling, or fullscreen behavior.
        App.captureDisplayTiming = async () => {};
        App.preloadStimuli = async () => {};
        App.requestFullscreenIfPossible = async () => {};
        App.runCurrentTest = () => {};
    }, { id: participantId, name: participantName, privateSession: privacyMode });
}

async function disableWebLocksForFutureDocuments(context) {
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'locks', {
            configurable: true,
            value: undefined,
        });
    });
}

async function createConfiguredSession(page, {
    config,
    participantId,
    participantName = '',
}) {
    const configured = await page.evaluate(async rawConfig => {
        const applied = await App.applyStudyConfig(rawConfig);
        const link = await App.buildParticipantLink(rawConfig);
        return { link, hash: applied.config_hash };
    }, config);

    await prepareStart(page, participantId, participantName);
    expect(await page.evaluate(() => App.start())).toBe(true);
    return configured;
}

async function waitForSavedSession(page, compatibility) {
    const banner = page.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', compatibility);
    return banner;
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await page.evaluate(() => localStorage.clear());
});

test('two tabs starting from empty storage atomically create exactly one owned session', async ({ page, context }) => {
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await waitForApp(secondPage);

    const participantIds = ['RACE-PAGE-ONE', 'RACE-PAGE-TWO'];
    await Promise.all([
        prepareStart(page, participantIds[0]),
        prepareStart(secondPage, participantIds[1]),
    ]);

    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBeNull();

    const started = await Promise.all([
        page.evaluate(() => App.start()),
        secondPage.evaluate(() => App.start()),
    ]);
    expect(started.filter(Boolean)).toHaveLength(1);

    const pages = [page, secondPage];
    const winnerIndex = started.findIndex(Boolean);
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    const states = await Promise.all(pages.map(currentPage => currentPage.evaluate(() => ({
        participantId: App.participantId,
        sessionInstanceId: App.sessionInstanceId,
        sessionWriterId: App.sessionWriterId,
        startTime: App.startTime ? App.startTime.toISOString() : null,
    }))));
    const storedRaw = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    const stored = JSON.parse(storedRaw);

    expect(states[winnerIndex].startTime).not.toBeNull();
    expect(stored.participantId).toBe(participantIds[winnerIndex]);
    expect(stored.participantId).toBe(states[winnerIndex].participantId);
    expect(stored.sessionInstanceId).toBe(states[winnerIndex].sessionInstanceId);
    expect(stored.sessionWriterId).toBe(states[winnerIndex].sessionWriterId);
    expect(stored.sessionInstanceId).toMatch(/^session-/);
    expect(stored.sessionWriterId).toMatch(/^writer-/);

    expect(states[loserIndex].startTime).toBeNull();
    expect(states[loserIndex].sessionInstanceId).toBeNull();
    expect(states[loserIndex].sessionWriterId).toBeNull();
    expect(await pages[loserIndex].evaluate(() => App.persistSession())).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(storedRaw);
});

test('confirming a stale discard dialog does not delete a newer payload from another tab', async ({ page, context }) => {
    const config = fixedConfig({ study_id: 'discard-cas-study' });
    const { link, hash } = await createConfiguredSession(page, {
        config,
        participantId: 'ORIGINAL-PARTICIPANT',
        participantName: 'Original Private Name',
    });

    const secondPage = await context.newPage();
    await secondPage.goto(link);
    await waitForApp(secondPage);
    const banner = await waitForSavedSession(secondPage, 'match');
    await expect(banner.locator('#saved-session-participant')).toContainText('ORIGINAL-PARTICIPANT');

    const originalRaw = await secondPage.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    await banner.locator('#btn-discard-session').click();
    const dialog = secondPage.locator('#discard-session-dialog');
    await expect(dialog).toHaveAttribute('open', '');

    const replacement = await page.evaluate(() => {
        const previousRaw = localStorage.getItem(App.STORAGE_KEY);
        const previous = JSON.parse(previousRaw);
        const next = {
            ...previous,
            participantName: 'Replacement Private Name',
            participantId: 'REPLACEMENT-PARTICIPANT',
            sessionInstanceId: 'session-replacement-instance',
            sessionWriterId: 'writer-replacement-owner',
            startTime: new Date(Date.parse(previous.startTime) + 1000).toISOString(),
        };
        const raw = JSON.stringify(next);
        localStorage.setItem(App.STORAGE_KEY, raw);
        return {
            previousRaw,
            raw,
            studyConfigHash: next.studyConfigHash,
            sessionInstanceId: next.sessionInstanceId,
            sessionWriterId: next.sessionWriterId,
            participantId: next.participantId,
        };
    });

    expect(replacement.previousRaw).toBe(originalRaw);
    expect(replacement.raw).not.toBe(originalRaw);
    expect(replacement.studyConfigHash).toBe(hash);
    await expect(dialog).toHaveAttribute('open', '');
    await expect(secondPage.locator('#saved-session-participant')).toContainText(replacement.participantId);

    await secondPage.locator('#btn-confirm-discard-session').click();
    await expect(dialog).not.toHaveAttribute('open', '');
    const discardChanged = await secondPage.evaluate(() => App.t('common.saved.discardChanged'));
    await expect(secondPage.locator('#session-action-status')).toHaveText(discardChanged);

    const finalRaw = await secondPage.evaluate(() => localStorage.getItem(App.STORAGE_KEY));
    const finalPayload = JSON.parse(finalRaw);
    expect(finalRaw).toBe(replacement.raw);
    expect(finalPayload.studyConfigHash).toBe(hash);
    expect(finalPayload.participantId).toBe(replacement.participantId);
    expect(finalPayload.sessionInstanceId).toBe(replacement.sessionInstanceId);
    expect(finalPayload.sessionWriterId).toBe(replacement.sessionWriterId);
});

test('saved-session actions and PII remain hidden until compatibility verification finishes', async ({ page, context }) => {
    const privateName = 'Verification Private Name';
    const participantId = 'VERIFY-DELAYED-PARTICIPANT';
    const { link } = await createConfiguredSession(page, {
        config: fixedConfig({ study_id: 'delayed-verification-study' }),
        participantId,
        participantName: privateName,
    });

    const secondPage = await context.newPage();
    await secondPage.addInitScript(() => {
        let releaseVerification;
        window.__savedSessionVerificationGate = new Promise(resolve => {
            releaseVerification = resolve;
        });
        window.__releaseSavedSessionVerification = () => releaseVerification();
        window.__savedSessionVerificationEntered = false;

        document.addEventListener('DOMContentLoaded', () => {
            const originalVerify = StudyConfig.verifySavedSession.bind(StudyConfig);
            StudyConfig.verifySavedSession = async (...args) => {
                window.__savedSessionVerificationEntered = true;
                await window.__savedSessionVerificationGate;
                return originalVerify(...args);
            };
        }, { once: true });
    });
    await secondPage.goto(link);
    await secondPage.waitForFunction(() => window.__savedSessionVerificationEntered === true);

    const banner = secondPage.locator('#saved-session');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('data-compatibility', 'verifying');
    await expect(banner).toHaveAttribute('aria-busy', 'true');
    await expect(banner).not.toContainText(privateName);
    await expect(banner).not.toContainText(participantId);
    await expect(banner.locator('#saved-session-participant')).toHaveCount(0);
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    await expect(banner.locator('#btn-discard-session')).toHaveCount(0);

    await secondPage.evaluate(() => window.__releaseSavedSessionVerification());
    await expect(banner).toHaveAttribute('data-compatibility', 'match');
    await expect(banner).not.toHaveAttribute('aria-busy', 'true');
    await expect(banner.locator('#saved-session-participant')).toContainText(privateName);
    await expect(banner.locator('#saved-session-participant')).toContainText(participantId);
    await expect(banner.locator('#btn-resume-session')).toBeVisible();
    await expect(banner.locator('#btn-discard-session')).toBeVisible();
});

test('without Web Locks persisted starts fail closed while a privacy-mode start remains available', async ({ page, context }) => {
    await disableWebLocksForFutureDocuments(context);
    await page.reload();
    await waitForApp(page);

    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await waitForApp(secondPage);
    expect(await page.evaluate(() => Boolean(navigator.locks?.request))).toBe(false);
    expect(await secondPage.evaluate(() => Boolean(navigator.locks?.request))).toBe(false);

    await Promise.all([
        prepareStart(page, 'NO-LOCK-PERSISTED-ONE'),
        prepareStart(secondPage, 'NO-LOCK-PERSISTED-TWO'),
    ]);
    const persistedStarts = await Promise.all([
        page.evaluate(() => App.start()),
        secondPage.evaluate(() => App.start()),
    ]);

    expect(persistedStarts).toEqual([false, false]);
    const failedStates = await Promise.all([page, secondPage].map(currentPage => currentPage.evaluate(() => ({
        startTime: App.startTime ? App.startTime.toISOString() : null,
        sessionInstanceId: App.sessionInstanceId,
        sessionWriterId: App.sessionWriterId,
        raw: localStorage.getItem(App.STORAGE_KEY),
        startError: document.getElementById('start-error')?.textContent || '',
    }))));
    for (const state of failedStates) {
        expect(state.startTime).toBeNull();
        expect(state.sessionInstanceId).toBeNull();
        expect(state.sessionWriterId).toBeNull();
        expect(state.raw).toBeNull();
        expect(state.startError).not.toBe('');
    }

    await prepareStart(page, 'NO-LOCK-PRIVACY', '', { privacyMode: true });
    expect(await page.evaluate(() => App.start())).toBe(true);
    const privateState = await page.evaluate(async () => ({
        startTime: App.startTime ? App.startTime.toISOString() : null,
        privacyMode: App.privacyMode,
        persistResult: await App.persistSession(),
        raw: localStorage.getItem(App.STORAGE_KEY),
    }));
    expect(privateState.startTime).not.toBeNull();
    expect(privateState.privacyMode).toBe(true);
    expect(privateState.persistResult).toBe(true);
    expect(privateState.raw).toBeNull();
    expect(await secondPage.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBeNull();
});

test('without Web Locks a saved session stays private and exposes no unsafe actions', async ({ page, context }) => {
    const privateName = 'NO-LOCK-HIDDEN-NAME';
    const participantId = 'NO-LOCK-HIDDEN-ID';
    const { link } = await createConfiguredSession(page, {
        config: fixedConfig({ study_id: 'no-lock-saved-session' }),
        participantId,
        participantName: privateName,
    });
    const rawBefore = await page.evaluate(() => localStorage.getItem(App.STORAGE_KEY));

    await disableWebLocksForFutureDocuments(context);
    const unsupportedPage = await context.newPage();
    await unsupportedPage.goto(link);
    await waitForApp(unsupportedPage);
    const banner = await waitForSavedSession(unsupportedPage, 'unsupported');
    await expect(banner).not.toContainText(privateName);
    await expect(banner).not.toContainText(participantId);
    await expect(banner.locator('#btn-resume-session')).toHaveCount(0);
    await expect(banner.locator('#btn-discard-session')).toHaveCount(0);

    expect(await unsupportedPage.evaluate(() => App.restoreSavedSession())).toBe(false);
    expect(await unsupportedPage.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(rawBefore);
});

test('a writer takeover blocks the former tab from task progress and all exports', async ({ page, context }) => {
    await page.evaluate(() => {
        window.__ownershipTestRunCurrentTest = App.runCurrentTest;
    });
    const { link } = await createConfiguredSession(page, {
        config: fixedConfig({ study_id: 'writer-takeover-study' }),
        participantId: 'WRITER-OWNER-PARTICIPANT',
        participantName: 'Writer Owner',
    });
    const originalOwner = await page.evaluate(() => {
        App.runCurrentTest = window.__ownershipTestRunCurrentTest;
        return {
            sessionInstanceId: App.sessionInstanceId,
            sessionWriterId: App.sessionWriterId,
        };
    });

    const secondPage = await context.newPage();
    await secondPage.goto(link);
    await waitForApp(secondPage);
    const banner = await waitForSavedSession(secondPage, 'match');
    await expect(banner.locator('#btn-resume-session')).toBeVisible();
    expect(await secondPage.evaluate(() => App.restoreSavedSession())).toBe(true);

    const newOwner = await secondPage.evaluate(() => ({
        sessionInstanceId: App.sessionInstanceId,
        sessionWriterId: App.sessionWriterId,
        raw: localStorage.getItem(App.STORAGE_KEY),
    }));
    expect(newOwner.sessionInstanceId).toBe(originalOwner.sessionInstanceId);
    expect(newOwner.sessionWriterId).not.toBe(originalOwner.sessionWriterId);
    const storedAfterRestore = JSON.parse(newOwner.raw);
    expect(storedAfterRestore.sessionInstanceId).toBe(newOwner.sessionInstanceId);
    expect(storedAfterRestore.sessionWriterId).toBe(newOwner.sessionWriterId);

    await page.waitForFunction(() => App.sessionStorageOwnershipLost === true);
    const overlay = page.locator('#session-ownership-lost-overlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('#session-ownership-lost-heading')).toBeFocused();
    await expect(page.locator('#app')).toHaveAttribute('inert', '');
    await expect(page.locator('#app')).toHaveAttribute('aria-hidden', 'true');

    const blocked = await page.evaluate(async () => {
        const rawBefore = localStorage.getItem(App.STORAGE_KEY);
        const currentTestIndexBefore = App.currentTestIndex;
        const sessionStageBefore = App.sessionStage;
        const inProgressTestIdBefore = App.inProgressTestId;
        const resultsBefore = JSON.stringify(App.results);
        const trialDataBefore = JSON.stringify(App.trialData);
        const modules = new Map();
        let taskRunCalls = 0;
        for (const [testId, testInfo] of Object.entries(App.testRegistry)) {
            modules.set(testId, testInfo.module);
            testInfo.module = { run: () => { taskRunCalls++; } };
        }

        let advanceRunCalls = 0;
        let excelWriteCalls = 0;
        let jsonAnchorClicks = 0;
        let runCurrentTestResult;
        let onTestCompleteResult;
        let advanceFromBreakResult;
        let downloadExcelResult;
        let downloadJsonResult;
        const originalRunCurrentTest = App.runCurrentTest;
        const originalWriteFile = XLSX.writeFile;
        const originalAnchorClick = HTMLAnchorElement.prototype.click;
        try {
            runCurrentTestResult = await App.runCurrentTest();
            onTestCompleteResult = await App.onTestComplete(
                App.selectedTests[App.currentTestIndex],
                { score: 999, accuracy: 100 },
                [{ trialNum: 1, correct: 1, rt: 1 }],
            );

            App.runCurrentTest = (...args) => {
                advanceRunCalls++;
                return originalRunCurrentTest.apply(App, args);
            };
            advanceFromBreakResult = await App.advanceFromBreak();
            App.runCurrentTest = originalRunCurrentTest;

            XLSX.writeFile = () => { excelWriteCalls++; };
            downloadExcelResult = await App.downloadExcel();
            HTMLAnchorElement.prototype.click = function ownershipTestClick() {
                jsonAnchorClicks++;
            };
            downloadJsonResult = await App.downloadJson();
        } finally {
            App.runCurrentTest = originalRunCurrentTest;
            XLSX.writeFile = originalWriteFile;
            HTMLAnchorElement.prototype.click = originalAnchorClick;
            for (const [testId, module] of modules) App.testRegistry[testId].module = module;
        }

        return {
            rawBefore,
            rawAfter: localStorage.getItem(App.STORAGE_KEY),
            persistResult: await App.persistSession(),
            currentTestIndexBefore,
            currentTestIndexAfter: App.currentTestIndex,
            sessionStageBefore,
            sessionStageAfter: App.sessionStage,
            inProgressTestIdBefore,
            inProgressTestIdAfter: App.inProgressTestId,
            resultsBefore,
            resultsAfter: JSON.stringify(App.results),
            trialDataBefore,
            trialDataAfter: JSON.stringify(App.trialData),
            taskRunCalls,
            advanceRunCalls,
            excelWriteCalls,
            jsonAnchorClicks,
            runCurrentTestResult,
            onTestCompleteResult,
            advanceFromBreakResult,
            downloadExcelResult,
            downloadJsonResult,
        };
    });

    expect(blocked.rawBefore).toBe(newOwner.raw);
    expect(blocked.rawAfter).toBe(newOwner.raw);
    expect(blocked.persistResult).toBe(false);
    expect(blocked.currentTestIndexAfter).toBe(blocked.currentTestIndexBefore);
    expect(blocked.sessionStageAfter).toBe(blocked.sessionStageBefore);
    expect(blocked.inProgressTestIdAfter).toBe(blocked.inProgressTestIdBefore);
    expect(blocked.resultsAfter).toBe(blocked.resultsBefore);
    expect(blocked.trialDataAfter).toBe(blocked.trialDataBefore);
    expect(blocked.taskRunCalls).toBe(0);
    expect(blocked.advanceRunCalls).toBe(0);
    expect(blocked.excelWriteCalls).toBe(0);
    expect(blocked.jsonAnchorClicks).toBe(0);
    expect(blocked.runCurrentTestResult).toBe(false);
    expect(blocked.onTestCompleteResult).toBe(false);
    expect(blocked.advanceFromBreakResult).toBe(false);
    expect(blocked.downloadExcelResult).toBe(false);
    expect(blocked.downloadJsonResult).toBe(false);
    expect(await secondPage.evaluate(() => localStorage.getItem(App.STORAGE_KEY))).toBe(newOwner.raw);
});

test('JSON export rechecks ownership after asynchronous payload generation', async ({ page }) => {
    await createConfiguredSession(page, {
        config: fixedConfig({ study_id: 'json-export-takeover-study' }),
        participantId: 'JSON-EXPORT-OWNER',
    });

    const outcome = await page.evaluate(async () => {
        const originalBuildJsonPayload = App.buildJsonPayload;
        const originalAnchorClick = HTMLAnchorElement.prototype.click;
        let anchorClicks = 0;
        App.buildJsonPayload = async function ownershipTestBuildJsonPayload(...args) {
            const payload = await originalBuildJsonPayload.apply(this, args);
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            saved.sessionWriterId = 'writer-json-mid-export-takeover';
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
            return payload;
        };
        HTMLAnchorElement.prototype.click = function ownershipTestAnchorClick() {
            anchorClicks++;
        };

        try {
            const result = await App.downloadJson();
            return {
                result,
                anchorClicks,
                ownershipLost: App.sessionStorageOwnershipLost,
                overlayHidden: document.getElementById('session-ownership-lost-overlay').hidden,
            };
        } finally {
            App.buildJsonPayload = originalBuildJsonPayload;
            HTMLAnchorElement.prototype.click = originalAnchorClick;
        }
    });

    expect(outcome.result).toBe(false);
    expect(outcome.anchorClicks).toBe(0);
    expect(outcome.ownershipLost).toBe(true);
    expect(outcome.overlayHidden).toBe(false);
});

test('Excel export rechecks ownership after workbook generation', async ({ page }) => {
    await createConfiguredSession(page, {
        config: fixedConfig({ study_id: 'excel-export-takeover-study' }),
        participantId: 'EXCEL-EXPORT-OWNER',
    });

    const outcome = await page.evaluate(async () => {
        const originalBookNew = XLSX.utils.book_new;
        const originalWriteFile = XLSX.writeFile;
        let writeFileCalls = 0;
        XLSX.utils.book_new = function ownershipTestBookNew(...args) {
            const workbook = originalBookNew.apply(this, args);
            const saved = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
            saved.sessionWriterId = 'writer-excel-mid-export-takeover';
            localStorage.setItem(App.STORAGE_KEY, JSON.stringify(saved));
            return workbook;
        };
        XLSX.writeFile = () => {
            writeFileCalls++;
        };

        try {
            const result = await App.downloadExcel();
            return {
                result,
                writeFileCalls,
                ownershipLost: App.sessionStorageOwnershipLost,
                overlayHidden: document.getElementById('session-ownership-lost-overlay').hidden,
            };
        } finally {
            XLSX.utils.book_new = originalBookNew;
            XLSX.writeFile = originalWriteFile;
        }
    });

    expect(outcome.result).toBe(false);
    expect(outcome.writeFileCalls).toBe(0);
    expect(outcome.ownershipLost).toBe(true);
    expect(outcome.overlayHidden).toBe(false);
});
