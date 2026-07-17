const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
});

test('language selector updates the document and changing consent language clears consent', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('#consent-heading')).toHaveText('実施の説明と同意');

    await page.locator('#consent-agree').check();
    await page.locator('.language-option[data-locale="en"]').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#consent-heading')).toHaveText('Study information and consent');
    await expect(page.locator('#consent-agree')).not.toBeChecked();
    await expect(page.locator('.language-option[data-locale="en"]')).toHaveAttribute('aria-pressed', 'true');
});

test('lang query parameter selects English for a new session', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#participant-heading')).toHaveText('Participant information');
    await expect(page.locator('.language-option[data-locale="en"]')).toHaveAttribute('aria-pressed', 'true');
});

test('task registry names follow the active locale without changing task IDs', async ({ page }) => {
    const result = await page.evaluate(() => {
        App.setLanguage('en');
        const english = App.ALL_TEST_IDS.map(id => ({ id, name: App.testRegistry[id].name }));
        App.setLanguage('ja');
        const japanese = App.ALL_TEST_IDS.map(id => ({ id, name: App.testRegistry[id].name }));
        return { english, japanese };
    });

    expect(result.english.map(row => row.id)).toEqual(result.japanese.map(row => row.id));
    expect(result.english.find(row => row.id === 'flanker').name).toBe('Flanker Task');
    expect(result.japanese.find(row => row.id === 'flanker').name).toBe('フランカー課題');
});

test('all seven task instruction screens have English participant copy', async ({ page }) => {
    const screens = await page.evaluate(() => {
        App.setLanguage('en');
        App.showScreen('screen-test');
        const capture = (id, callback) => {
            callback();
            return [id, document.getElementById('test-content').innerText];
        };

        PictureSequenceTest.currentThemeKey = 'morning';
        PictureSequenceTest.currentTheme = PictureSequenceTest.THEMES.morning;

        return Object.fromEntries([
            capture('flanker', () => FlankerTest.showInstructions()),
            capture('dccs', () => DCCSTest.showInstructions()),
            capture('list-sorting', () => ListSortingTest.showInstructions()),
            capture('visual_digit_span', () => VisualDigitSpanTest.showInstructions()),
            capture('ecorsi', () => ECorsiTest.showInstructions()),
            capture('pattern-comparison', () => PatternComparisonTest.showInstructions()),
            capture('picture-sequence', () => PictureSequenceTest.showInstructions()),
        ]);
    });

    const japaneseCharacters = /[ぁ-んァ-ヶ一-龠]/;
    for (const [taskId, text] of Object.entries(screens)) {
        expect(text, `${taskId} should not contain untranslated Japanese`).not.toMatch(japaneseCharacters);
        expect(text.length, `${taskId} should have non-empty instructions`).toBeGreaterThan(20);
    }
});

test('language metadata is present in protocol and JSON participant data', async ({ page }) => {
    const metadata = await page.evaluate(async () => {
        App.setLanguage('en');
        App.participantId = 'LANG01';
        App.participantAge = 30;
        App.startTime = new Date('2026-07-17T00:00:00.000Z');
        App._sessionPerfStart = performance.now();
        App.selectedTests = [];
        App.results = {};
        App.trialData = {};
        App.quality = App.createQualityState();
        App.quality.environment = App.collectEnvironmentSnapshot();
        App.quality.outlier_thresholds = {};
        const protocol = App.buildProtocolMetadata();
        const payload = await App.buildJsonPayload();
        return { protocol, participant: payload.participant };
    });

    for (const section of [metadata.protocol, metadata.participant]) {
        expect(section.ui_language).toBe('en');
        expect(section.instruction_language).toBe('en');
        expect(section.stimulus_language).toBe('en');
        expect(section.consent_language).toBe('en');
        expect(section.translation_version).toBe('translations-2026-07-ja-en-v3');
    }
    expect(metadata.participant.consent_version).toContain('-en');
});

test('a restored session owns and locks its saved language', async ({ page }) => {
    const result = await page.evaluate(async () => {
        App.setLanguage('en');
        App.participantId = 'RESTORE-LANG';
        App.participantAge = 30;
        App.consentAccepted = true;
        App.selectedTests = ['flanker'];
        App.currentTestIndex = 0;
        App.results = {};
        App.trialData = {};
        App.startTime = new Date();
        App._sessionPerfStart = performance.now();
        App.sessionStage = 'test';
        App.inProgressTestId = 'flanker';
        App.quality = App.createQualityState();
        App.quality.environment = App.collectEnvironmentSnapshot();
        App.persistSession();

        // Simulate the fresh in-memory state after a reload while retaining
        // the legacy-v2 payload that restoreSavedSession() should recover.
        App.startTime = null;
        App.sessionStage = 'idle';
        App.inProgressTestId = null;
        App.unlockLanguage();
        App.setLanguage('ja');
        await App.restoreSavedSession();
        const attemptedChange = App.setLanguage('ja');
        return {
            locale: I18n.getLocale(),
            locked: App.languageLocked,
            attemptedChange,
            buttonsDisabled: Array.from(document.querySelectorAll('.language-option')).every(button => button.disabled),
        };
    });

    expect(result.locale).toBe('en');
    expect(result.locked).toBe(true);
    expect(result.attemptedChange).toBe(false);
    expect(result.buttonsDisabled).toBe(true);
});

test('semantic-task scoring uses stable IDs rather than localized labels', async ({ page }) => {
    const result = await page.evaluate(() => {
        const listCorrect = ListSortingTest.checkAnswer(
            [{ id: 'animal_mouse', name: 'Mouse' }, { id: 'animal_cat', name: 'Cat' }],
            [{ id: 'animal_mouse', name: 'ネズミ' }, { id: 'animal_cat', name: '猫' }],
        );
        const picturePairs = PictureSequenceTest.countAdjacentPairs(
            [{ id: 'morning_wake', label: 'Wake up' }, { id: 'morning_brush', label: 'Brush teeth' }],
            [{ id: 'morning_wake', label: '起きる' }, { id: 'morning_brush', label: '歯を磨く' }],
        );
        return { listCorrect, picturePairs };
    });

    expect(result.listCorrect).toBe(true);
    expect(result.picturePairs).toBe(1);
});
