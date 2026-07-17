// Session counter, restart/restore, JSON integrity round-trip.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.clear();
    });
});

test('session_number increments per participant ID independently', async ({ page }) => {
    const result = await page.evaluate(() => {
        localStorage.removeItem(App.HISTORY_STORAGE_KEY);
        return {
            a1: App.bumpSessionNumber('A'),
            a2: App.bumpSessionNumber('A'),
            b1: App.bumpSessionNumber('B'),
            a3: App.bumpSessionNumber('A'),
            b2: App.bumpSessionNumber('B'),
        };
    });
    expect(result.a1).toBe(1);
    expect(result.a2).toBe(2);
    expect(result.b1).toBe(1);
    expect(result.a3).toBe(3);
    expect(result.b2).toBe(2);
});

test('session_number persists across page reload', async ({ page }) => {
    await page.evaluate(() => App.bumpSessionNumber('RELOAD_TEST'));
    await page.evaluate(() => App.bumpSessionNumber('RELOAD_TEST'));
    await page.reload();
    const n = await page.evaluate(() => App.bumpSessionNumber('RELOAD_TEST'));
    expect(n).toBe(3);
});

test('full start flow populates participant fields correctly', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
        document.getElementById('participant-id').value = 'FLOW_TEST';
        document.getElementById('participant-age').value = '40';
        document.getElementById('participant-viewing-distance').value = '60';
    });
    await page.evaluate(async () => {
        await App.start();
    });
    // Wait a bit for preload to finish
    await page.waitForTimeout(400);

    const state = await page.evaluate(() => ({
        participantId: App.participantId,
        age: App.participantAge,
        viewing: App.viewingDistanceCm,
        consent: App.consentAccepted,
        randomSeed: App.randomSeed,
        sessionNumber: App.sessionNumber,
        counterbalanceGroup: App.counterbalanceGroup,
        selectedTests: App.selectedTests,
        activeScreen: document.querySelector('.screen.active')?.id,
    }));

    expect(state.participantId).toBe('FLOW_TEST');
    expect(state.age).toBe(40);
    expect(state.viewing).toBe(60);
    expect(state.consent).toBe(true);
    expect(state.randomSeed).toBeGreaterThan(0);
    expect(state.sessionNumber).toBe(1);
    expect(state.counterbalanceGroup).toBeGreaterThanOrEqual(0);
    expect(state.counterbalanceGroup).toBeLessThan(14);
    expect(state.selectedTests).toHaveLength(7);
    expect(state.activeScreen).toBe('screen-test');
});

test('JSON payload includes integrity_sha256 that verifies round-trip', async ({ page }) => {
    const result = await page.evaluate(async () => {
        // Set up minimal session state for JSON build
        App.participantId = 'HASH_TEST';
        App.participantAge = 30;
        App.viewingDistanceCm = 60;
        App.consentAccepted = true;
        App.randomSeed = 12345;
        App.sessionNumber = 1;
        App.counterbalanceGroup = 0;
        App.selectedTests = ['flanker'];
        App.startTime = new Date();
        App._sessionPerfStart = performance.now();
        App.results = { flanker: { score: 5, detail: 'test' } };
        App.trialData = { flanker: [{ trialNum: 1, rt: 500, correct: 1, tOnset: 0, tResponse: 500 }] };
        App.quality.grayscale_confirmed = 1;
        App.quality.outlier_thresholds = { rt_exclude_below_ms: 100 };
        App.quality.environment = { browser: 'Chrome' };

        const payload = await App.buildJsonPayload();
        const recorded = payload.integrity_sha256;

        const copy = {};
        for (const key of Object.keys(payload)) {
            if (key !== 'integrity_sha256') copy[key] = payload[key];
        }
        const reserialized = JSON.stringify(copy);
        const recomputed = await App.computeSha256(reserialized);
        return {
            recorded,
            recomputed,
            version: payload.version,
            protocol: payload.protocol,
            qualityFlags: payload.quality_flags,
            reviewRows: payload.researcher_review,
            qcMultiverse: payload.qc_multiverse,
            taskMetricsLong: payload.task_metrics_long,
            manifestRows: App.buildExportManifestRows({
                protocolMetadata: payload.protocol,
                qcMultiverseSummary: App.summarizeQcMultiverseRows(payload.qc_multiverse.universes),
                workbookSheets: ['Export Manifest', 'Participant', 'Scores'],
                exportedAt: '2026-05-26T00:00:00.000Z',
            }),
        };
    });
    expect(result.recorded).toBe(result.recomputed);
    expect(result.recorded).toMatch(/^[0-9a-f]{64}$/);
    expect(result.version).toBe('cb-2026-07-research-v8');
    expect(result.protocol.protocol_version).toBe('protocol-2026-07-study-config-v4');
    expect(result.protocol.scoring_version).toBeTruthy();
    expect(result.qualityFlags.review_recommendation).toBe('ok');
    expect(result.reviewRows).toHaveLength(1);
    expect(result.reviewRows[0].app_version).toBe('cb-2026-07-research-v8');
    expect(result.reviewRows[0].qc_multiverse_version).toBe('qc-multiverse-2026-05-v1');
    expect(result.qcMultiverse.version).toBe('qc-multiverse-2026-05-v1');
    expect(result.qcMultiverse.universes).toHaveLength(5);
    expect(result.qcMultiverse.universes[0].universe_id).toBe('qc_u00_all_sessions');
    expect(result.taskMetricsLong.length).toBeGreaterThan(0);
    expect(result.taskMetricsLong.some(row => row.testId === 'flanker' && row.metric === 'score' && row.value_numeric === 5)).toBe(true);
    expect(result.taskMetricsLong.some(row => row.testId === 'flanker' && row.metric === 'overall_accuracy' && row.metric_source === 'computed')).toBe(true);
    expect(result.manifestRows.some(row => row.field === 'export_format' && row.value === 'xlsx')).toBe(true);
    expect(result.manifestRows.some(row => row.field === 'submission_instruction' && String(row.value).includes('single Excel workbook'))).toBe(true);
});

test('quality flags summarize review-worthy session issues', async ({ page }) => {
    const flags = await page.evaluate(() => {
        App.participantId = 'FLAG_TEST';
        App.participantAge = 30;
        App.selectedTests = ['flanker'];
        App.startTime = new Date();
        App.results = {
            flanker: {
                score: 1,
                accuracy: 50,
                timeoutCount: 3,
                practiceAttempts: 2,
            },
        };
        App.trialData = {
            flanker: [
                { type: 'congruent', correct: 1, rt: 90 },
                { type: 'congruent', correct: 0, rt: 5100 },
                { type: 'incongruent', correct: 0, rt: 600 },
            ],
        };
        App.quality.visibility_hidden_count = 1;
        App.quality.blur_count = 1;
        App.quality.resize_count = 1;
        App.quality.long_task_count = 1;
        App.quality.outlier_thresholds = {
            rt_too_fast_ms: 150,
            rt_too_slow_ms: 5000,
            rt_exclude_below_ms: 100,
            inattention_easy_acc_threshold: 0.85,
        };
        App.quality.environment = {
            browser: 'Chrome',
            viewportWidth: 900,
            viewportHeight: 650,
            localStorageAvailable: 1,
        };
        App.quality.warnings = [];
        App.quality.blocks = [];
        return App.buildQualityFlags();
    });

    expect(flags.any_quality_flag).toBe(1);
    expect(flags.review_recommendation).toBe('review');
    expect(flags.low_accuracy_flag).toBe(1);
    expect(flags.fast_response_flag).toBe(1);
    expect(flags.slow_response_flag).toBe(1);
    expect(flags.many_timeouts_flag).toBe(1);
    expect(flags.tab_hidden_flag).toBe(1);
    expect(flags.focus_loss_flag).toBe(1);
    expect(flags.practice_repeat_flag).toBe(1);
    expect(flags.small_viewport_flag).toBe(1);
    expect(flags.review_notes).toContain('低正答率');
});

test('QC multiverse encodes exclusion as researcher degrees of freedom', async ({ page }) => {
    const result = await page.evaluate(() => {
        App.participantId = 'QC_MULTI';
        App.participantAge = 30;
        App.sessionNumber = 1;
        App.selectedTests = ['flanker'];
        App.startTime = new Date();
        App.results = {
            flanker: {
                score: 1,
                accuracy: 45,
                timeoutCount: 4,
                practiceAttempts: 3,
            },
        };
        App.trialData = {
            flanker: [
                { type: 'congruent', correct: 0, rt: 120 },
                { type: 'congruent', correct: 0, rt: 5200 },
                { type: 'incongruent', correct: 1, rt: 700 },
            ],
        };
        App.quality.visibility_hidden_count = 0;
        App.quality.blur_count = 0;
        App.quality.resize_count = 0;
        App.quality.long_task_count = 0;
        App.quality.fullscreen_exit_count = 0;
        App.quality.outlier_thresholds = {
            rt_too_fast_ms: 150,
            rt_too_slow_ms: 5000,
            rt_exclude_below_ms: 100,
            inattention_easy_acc_threshold: 0.85,
        };
        App.quality.environment = {
            browser: 'Chrome',
            viewportWidth: 1280,
            viewportHeight: 720,
            localStorageAvailable: 1,
        };
        App.quality.warnings = [];
        App.quality.blocks = [];

        const rows = App.buildQcMultiverseRows();
        const byId = Object.fromEntries(rows.map(row => [row.universe_id, row]));
        return {
            rows,
            summary: App.summarizeQcMultiverseRows(rows),
            all: byId.qc_u00_all_sessions,
            protocolOnly: byId.qc_u01_protocol_deviation_only,
            lenient: byId.qc_u02_behavioral_lenient,
            standard: byId.qc_u03_behavioral_standard,
            strict: byId.qc_u04_full_strict,
        };
    });

    expect(result.rows).toHaveLength(5);
    expect(result.all.include_candidate).toBe(1);
    expect(result.protocolOnly.include_candidate).toBe(1);
    expect(result.lenient.exclude_candidate).toBe(1);
    expect(result.standard.exclude_candidate).toBe(1);
    expect(result.strict.exclude_candidate).toBe(1);
    expect(result.standard.reasons).toContain('result_accuracy');
    expect(result.summary.qc_universe_count).toBe(5);
    expect(result.summary.qc_exclude_candidate_universes).toContain('qc_u03_behavioral_standard');
});

test('restart clears participant state and re-renders start screen', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
        document.getElementById('participant-id').value = 'RESTART';
        document.getElementById('participant-age').value = '30';
    });
    await page.evaluate(async () => { await App.start(); });
    await page.waitForTimeout(300);
    await page.evaluate(() => App.restart());

    const state = await page.evaluate(() => ({
        participantId: App.participantId,
        randomSeed: App.randomSeed,
        sessionStage: App.sessionStage,
        activeScreen: document.querySelector('.screen.active')?.id,
    }));
    expect(state.participantId).toBe('');
    expect(state.randomSeed).toBeNull();
    expect(state.sessionStage).toBe('idle');
    expect(state.activeScreen).toBe('screen-start');
});
