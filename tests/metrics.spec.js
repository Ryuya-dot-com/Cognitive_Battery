// Research metrics: IES, d', switch cost, inattention flag.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure quality has outlier thresholds for flag computations
    await page.evaluate(() => {
        App.quality.outlier_thresholds = {
            inattention_easy_acc_threshold: 0.85,
            rt_exclude_below_ms: 100,
        };
    });
});

test('Flanker: IES and congruency_effect computed correctly', async ({ page }) => {
    const metrics = await page.evaluate(() => {
        const trials = [];
        // 10 congruent, all correct, RT=400
        for (let i = 0; i < 10; i++) {
            trials.push({ type: 'congruent', direction: 'left', response: 'left', correct: 1, rt: 400 });
        }
        // 20 incongruent, 18 correct RT=600, 2 incorrect RT=500
        for (let i = 0; i < 18; i++) {
            trials.push({ type: 'incongruent', direction: 'left', response: 'left', correct: 1, rt: 600 });
        }
        for (let i = 0; i < 2; i++) {
            trials.push({ type: 'incongruent', direction: 'left', response: 'right', correct: 0, rt: 500 });
        }
        return App.computeFlankerMetrics(trials);
    });
    expect(metrics.congruent_accuracy).toBe(100);
    expect(metrics.incongruent_accuracy).toBe(90);
    expect(metrics.congruent_mean_rt).toBe(400);
    expect(metrics.incongruent_mean_rt).toBe(600);
    expect(metrics.congruency_effect_ms).toBe(200);
    // IES = mean_rt / accuracy
    expect(metrics.ies_congruent_ms).toBe(400); // 400 / 1.0
    expect(metrics.ies_incongruent_ms).toBe(Math.round(600 / 0.9));
    expect(metrics.inattention_flag).toBe(0);
});

test('Flanker: inattention_flag triggers on low congruent accuracy', async ({ page }) => {
    const metrics = await page.evaluate(() => {
        const trials = [];
        // 10 congruent, only 6 correct (60%)
        for (let i = 0; i < 6; i++) {
            trials.push({ type: 'congruent', direction: 'left', response: 'left', correct: 1, rt: 400 });
        }
        for (let i = 0; i < 4; i++) {
            trials.push({ type: 'congruent', direction: 'left', response: 'right', correct: 0, rt: 500 });
        }
        for (let i = 0; i < 20; i++) {
            trials.push({ type: 'incongruent', direction: 'left', response: 'left', correct: 1, rt: 600 });
        }
        return App.computeFlankerMetrics(trials);
    });
    expect(metrics.inattention_flag).toBe(1);
});

test('DCCS: switch_cost computed correctly', async ({ page }) => {
    const metrics = await page.evaluate(() => {
        const trials = [];
        // 24 dominant, all correct RT=500
        for (let i = 0; i < 24; i++) {
            trials.push({ isDominant: 1, correct: 1, rt: 500 });
        }
        // 6 non-dominant, all correct RT=750
        for (let i = 0; i < 6; i++) {
            trials.push({ isDominant: 0, correct: 1, rt: 750 });
        }
        return App.computeDCCSMetrics(trials);
    });
    expect(metrics.dominant_mean_rt).toBe(500);
    expect(metrics.non_dominant_mean_rt).toBe(750);
    expect(metrics.switch_cost_ms).toBe(250);
    expect(metrics.inattention_flag).toBe(0);
});

test('Pattern Comparison: d_prime computed with standard signal detection math', async ({ page }) => {
    const metrics = await page.evaluate(() => {
        const trials = [];
        // 10 same trials: 9 hits, 1 miss
        for (let i = 0; i < 9; i++) {
            trials.push({ isSame: 1, response: 'same', correct: 1, rt: 400 });
        }
        trials.push({ isSame: 1, response: 'different', correct: 0, rt: 400 });
        // 10 different trials: 8 correct_rejections, 2 false_alarms
        for (let i = 0; i < 8; i++) {
            trials.push({ isSame: 0, response: 'different', correct: 1, rt: 400 });
        }
        for (let i = 0; i < 2; i++) {
            trials.push({ isSame: 0, response: 'same', correct: 0, rt: 400 });
        }
        return App.computePatternComparisonMetrics(trials);
    });
    expect(metrics.hits).toBe(9);
    expect(metrics.false_alarms).toBe(2);
    expect(metrics.hit_rate).toBeCloseTo(0.9, 2);
    expect(metrics.false_alarm_rate).toBeCloseTo(0.2, 2);
    // d' = z(hit) - z(fa) should be positive for above-chance performance
    expect(metrics.d_prime).toBeGreaterThan(1.5);
    expect(metrics.d_prime).toBeLessThan(3.5);
});

test('_ies helper returns null on zero accuracy', async ({ page }) => {
    const result = await page.evaluate(() => ({
        normal: App._ies(500, 0.8),
        zeroAcc: App._ies(500, 0),
        nullRT: App._ies(null, 0.8),
    }));
    expect(result.normal).toBe(625);
    expect(result.zeroAcc).toBeNull();
    expect(result.nullRT).toBeNull();
});

test('adaptive span metrics keep Forward and Backward scores separate', async ({ page }) => {
    const metrics = await page.evaluate(() => App.computeAdaptiveSpanMetrics([
        { condition: 'forward', set_size: 2, exact_correct: 1, item_onsets_ms: [0, 1000], item_offsets_ms: [500, 1500], recall_duration_ms: 2100 },
        { condition: 'forward', set_size: 2, exact_correct: 0, item_onsets_ms: [3000, 4000], item_offsets_ms: [3500, 4500], recall_duration_ms: 2400 },
        { condition: 'forward', set_size: 3, exact_correct: 1, item_onsets_ms: [6000, 7000, 8000], item_offsets_ms: [6500, 7500, 8500], recall_duration_ms: 2900 },
        { condition: 'forward', set_size: 3, exact_correct: 0, recall_duration_ms: 3000 },
        { condition: 'forward', set_size: 4, exact_correct: 0, recall_duration_ms: 3500 },
        { condition: 'forward', set_size: 4, exact_correct: 0, recall_duration_ms: 3600 },
        { condition: 'backward', set_size: 2, exact_correct: 1, recall_duration_ms: 2500 },
        { condition: 'backward', set_size: 2, exact_correct: 1, recall_duration_ms: 2600 },
        { condition: 'backward', set_size: 3, exact_correct: 0, recall_duration_ms: 3000 },
        { condition: 'backward', set_size: 3, exact_correct: 0, recall_duration_ms: 3100 },
        { phase: 'practice', condition: 'backward', set_size: 3, exact_correct: 1 },
    ], true));

    expect(metrics.forward_span).toBe(3);
    expect(metrics.forward_correct_trials).toBe(2);
    expect(metrics.forward_span_x_correct_trials).toBe(6);
    expect(metrics.backward_span).toBe(2);
    expect(metrics.backward_correct_trials).toBe(2);
    expect(metrics.practice_trials_n).toBe(1);
    expect(metrics.observed_item_visible_ms_mean).toBe(500);
    expect(metrics.observed_item_soa_ms_mean).toBe(1000);
});

test('adaptive recall duration and staircase errors do not trigger generic RT/accuracy QC', async ({ page }) => {
    const flags = await page.evaluate(() => {
        App.participantId = 'SPAN-QC';
        App.selectedTests = ['visual_digit_span'];
        App.results = { visual_digit_span: { score: 4, accuracy: 25, timeoutCount: 0 } };
        App.trialData = {
            visual_digit_span: [
                { condition: 'forward', set_size: 2, exact_correct: 1, responseTime: 12000 },
                { condition: 'forward', set_size: 3, exact_correct: 0, responseTime: 14000 },
            ],
        };
        App.quality.outlier_thresholds = { rt_too_fast_ms: 150, rt_too_slow_ms: 5000 };
        App.quality.environment = { viewportWidth: 1280, viewportHeight: 900, localStorageAvailable: 1 };
        App.quality.warnings = [];
        App.quality.blocks = [];
        return App.buildQualityFlags();
    });
    expect(flags.low_accuracy_flag).toBe(0);
    expect(flags.fast_response_flag).toBe(0);
    expect(flags.slow_response_flag).toBe(0);
});
