const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
        App.participantId = 'SPAN_TEST';
        App.sessionNumber = 1;
        App.seedRandom(24680);
        App._sessionPerfStart = performance.now();
        App.quality.environment.refreshRateHzEstimate = 60;
        App.showScreen('screen-test');
    });
});

test('span modules register with the seven-task battery and expose fixed protocol constants', async ({ page }) => {
    const state = await page.evaluate(() => ({
        allTests: App.ALL_TEST_IDS,
        digitRegistered: App.testRegistry.visual_digit_span.module === VisualDigitSpanTest,
        corsiRegistered: App.testRegistry.ecorsi.module === ECorsiTest,
        digit: {
            visible: VisualDigitSpanTest.DIGIT_VISIBLE_MS,
            soa: VisualDigitSpanTest.DIGIT_SOA_MS,
            min: VisualDigitSpanTest.MIN_LENGTH,
            max: VisualDigitSpanTest.MAX_LENGTH,
            attempts: VisualDigitSpanTest.TRIALS_PER_LENGTH,
        },
        corsi: {
            blocks: ECorsiTest.BLOCK_LAYOUT.length,
            visible: ECorsiTest.HIGHLIGHT_MS,
            soa: ECorsiTest.INTER_ONSET_MS,
            min: ECorsiTest.MIN_SET_SIZE,
            max: ECorsiTest.MAX_SET_SIZE,
            attempts: ECorsiTest.TRIALS_PER_LEVEL,
            practice: ECorsiTest.PRACTICE_TRIALS,
        },
    }));

    expect(state.allTests).toHaveLength(7);
    expect(state.allTests).toContain('visual_digit_span');
    expect(state.allTests).toContain('ecorsi');
    expect(state.digitRegistered).toBe(true);
    expect(state.corsiRegistered).toBe(true);
    expect(state.digit).toEqual({ visible: 500, soa: 1000, min: 2, max: 9, attempts: 2 });
    expect(state.corsi).toEqual({ blocks: 9, visible: 500, soa: 1000, min: 2, max: 9, attempts: 2, practice: 3 });
});

test('versioned digit and eCorsi stimulus banks satisfy length and uniqueness constraints', async ({ page }) => {
    const result = await page.evaluate(() => {
        const digitValid = VisualDigitSpanTest.validateStimulusBank();
        const corsiForms = Object.values(ECorsiTest.STIMULUS_FORMS);
        corsiForms.forEach(form => ECorsiTest.validateStimulusForm(form));
        return {
            digitValid,
            digitForms: VisualDigitSpanTest.FORM_DIGIT_MAPS.length,
            corsiForms: corsiForms.length,
        };
    });
    expect(result).toEqual({ digitValid: true, digitForms: 4, corsiForms: 2 });
});

test('task-specific form selection does not consume the shared PRNG and eCorsi order alternates on retest', async ({ page }) => {
    const result = await page.evaluate(() => {
        const before = App._randomState;
        VisualDigitSpanTest.selectTaskForm();
        const afterDigit = App._randomState;
        ECorsiTest.configureSession();
        const firstOrder = ECorsiTest.conditionOrder.slice();
        const afterCorsi = App._randomState;
        App.sessionNumber = 2;
        ECorsiTest.configureSession();
        const secondOrder = ECorsiTest.conditionOrder.slice();
        return { before, afterDigit, afterCorsi, firstOrder, secondOrder };
    });
    expect(result.afterDigit).toBe(result.before);
    expect(result.afterCorsi).toBe(result.before);
    expect(result.secondOrder).toEqual(result.firstOrder.slice().reverse());
});

test('visual digit response supports keyboard entry, correction, and explicit submit', async ({ page }) => {
    await page.evaluate(() => {
        window.__vdsResponse = VisualDigitSpanTest.collectResponse(3, performance.now() + 80);
    });
    await page.waitForSelector('#vds-response-root');
    await page.keyboard.press('4');
    await page.keyboard.press('5');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('6');
    await page.keyboard.press('7');
    await page.keyboard.press('Enter');
    const response = await page.evaluate(() => window.__vdsResponse);
    expect(response.sequence).toEqual([4, 6, 7]);
    expect(response.inputEvents.some(event => event.action === 'backspace')).toBe(true);
    expect(response.submitPerf).toBeGreaterThanOrEqual(response.recallOnsetPerf);
});

test('eCorsi response supports pointer selection, undo, and confirmation', async ({ page }) => {
    await page.evaluate(() => {
        ECorsiTest.testStartTime = performance.now();
        window.__corsiResponse = ECorsiTest.collectResponse(2, 'forward', 'test');
    });
    await page.waitForSelector('.ecorsi-response');
    await page.click('[data-ecorsi-block="1"]');
    await page.click('[data-ecorsi-block="2"]');
    await page.click('#btn-ecorsi-undo');
    await page.click('[data-ecorsi-block="3"]');
    await page.click('#btn-ecorsi-submit');
    const response = await page.evaluate(() => window.__corsiResponse);
    expect(response.response).toEqual([1, 3]);
    expect(response.editCount).toBe(1);
    expect(response.inputMethod).toBe('pointer');
    expect(response.submitTime).toBeGreaterThanOrEqual(response.recallOnset);
});

test('visual digit presentation records realized 500 ms visibility and 1000 ms SOA', async ({ page }) => {
    const timing = await page.evaluate(async () => {
        const measured = await VisualDigitSpanTest.presentDigits([4, 8]);
        return {
            visible: measured.offsetsPerf.map((offset, index) => offset - measured.onsetsPerf[index]),
            soa: measured.onsetsPerf[1] - measured.onsetsPerf[0],
        };
    });
    for (const duration of timing.visible) {
        expect(duration).toBeGreaterThanOrEqual(450);
        expect(duration).toBeLessThanOrEqual(570);
    }
    expect(timing.soa).toBeGreaterThanOrEqual(950);
    expect(timing.soa).toBeLessThanOrEqual(1050);
});
