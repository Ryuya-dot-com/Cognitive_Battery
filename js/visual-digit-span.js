// ==================== Visual Digit Span (Forward / Backward) ====================

I18n.register('visual_digit_span', {
    ja: {
        name: '視覚的数字スパン課題',
        domain: 'ワーキングメモリ',
        statusInstructions: '課題説明',
        statusConditionIntro: '{condition}／説明',
        statusPractice: '{condition}／練習',
        statusTrial: '{condition}／{length}桁 {attempt}/{total}',
        statusForwardComplete: 'Forward 完了',
        statusBankError: '刺激設定エラー',
        forwardLabel: 'Forward（順方向）',
        backwardLabel: 'Backward（逆方向）',
        title: '視覚的数字スパン課題',
        overviewDisplay: '数字が1つずつ画面に表示されます。すべて表示された後、画面の数字キーまたはキーボードで回答してください。',
        overviewOrder: '最初は表示された<strong>同じ順番</strong>で答える Forward 条件、続いて<strong>逆の順番</strong>で答える Backward 条件を行います。',
        overviewPractice: '各条件の前に短い練習があります。数字の表示中は入力せず、回答画面が出るまで中央を見てください。',
        independentStimuli: 'この課題は本研究用に作成した独自の数字系列を使用し、既存検査の項目や換算規準は使用しません。',
        toForward: 'Forward 条件へ',
        conditionHeading: '{condition} 条件',
        forwardInstruction: '表示された数字を、表示されたのと同じ順番で入力してください。',
        backwardInstruction: '表示された数字を、表示された順番とは逆向きに入力してください。',
        editInstruction: 'Backspace または「1つ戻す」で最後の入力を取り消し、Enter または「回答する」で確定できます。',
        onePractice: 'まず3桁の練習を1回行います。',
        startPractice: '練習開始',
        correctFeedback: '正解です',
        incorrectFeedback: '練習の正答を確認してください',
        correctAnswer: '正しい回答: <strong style="letter-spacing:.3em;">{answer}</strong>',
        scoredRule: '本番は2桁から始まり、同じ桁数を2回行います。2回とも不正解になると、その条件は終了します。',
        noFeedback: '本番では正誤のフィードバックは表示されません。',
        startTest: '本番開始',
        preparingTrial: '次の試行を準備しています（{length}桁・{attempt}/{total}）',
        forwardCompleteHeading: 'Forward 条件が終了しました',
        backwardNext: '次は Backward 条件です。少し休んでから進んでください。',
        backwardPractice: 'Backward 条件の前にも練習を1回行います。',
        toBackward: 'Backward 条件へ',
        fixationHint: '中央を見てください',
        responseHeading: '数字を入力してください',
        responseHelp: '画面のキー、またはキーボードの 1〜9 を使用できます。',
        enteredDigitsLabel: '入力した数字',
        keypadLabel: '数字入力キー',
        digitLabel: '数字 {digit}',
        undo: '1つ戻す',
        submit: '回答する',
        keyboardHint: 'キーボード: 1〜9 で入力、Backspace で取り消し、Enter で回答',
        enteredDigits: '入力した数字 {digits}',
        noDigitsEntered: '数字はまだ入力されていません',
        digitAriaSeparator: '、',
        bankErrorHeading: '刺激設定を確認できませんでした',
        bankErrorBody: '研究用の数字系列に不整合があります。実施を中止し、研究担当者に連絡してください。',
        resultDetail: 'Forward span: {forward} ／ Backward span: {backward}',
    },
    en: {
        name: 'Visual Digit Span Task',
        domain: 'Working Memory',
        statusInstructions: 'Instructions',
        statusConditionIntro: '{condition} / Instructions',
        statusPractice: '{condition} / Practice',
        statusTrial: '{condition} / {length} digits {attempt}/{total}',
        statusForwardComplete: 'Forward Complete',
        statusBankError: 'Stimulus Configuration Error',
        forwardLabel: 'Forward',
        backwardLabel: 'Backward',
        title: 'Visual Digit Span Task',
        overviewDisplay: 'Digits will appear one at a time. After all digits have been shown, enter your response using the on-screen number pad or your keyboard.',
        overviewOrder: 'First, you will complete the Forward condition by entering the digits in the <strong>same order</strong>. Then, you will complete the Backward condition by entering them in <strong>reverse order</strong>.',
        overviewPractice: 'There is a short practice before each condition. Do not enter anything while the digits are displayed; keep looking at the center until the response screen appears.',
        independentStimuli: 'This research task uses independently developed digit sequences. It does not use items or conversion norms from an existing standardized test.',
        toForward: 'Continue to Forward',
        conditionHeading: '{condition} Condition',
        forwardInstruction: 'Enter the digits in the same order in which they appeared.',
        backwardInstruction: 'Enter the digits in reverse order, beginning with the last digit shown.',
        editInstruction: 'Use Backspace or Undo to remove the last digit. Use Enter or Submit Response to confirm your answer.',
        onePractice: 'You will first complete one 3-digit practice trial.',
        startPractice: 'Start Practice',
        correctFeedback: 'Correct',
        incorrectFeedback: 'Please review the correct practice response',
        correctAnswer: 'Correct response: <strong style="letter-spacing:.3em;">{answer}</strong>',
        scoredRule: 'The test begins with 2 digits, with two trials at each length. If both trials at a length are incorrect, that condition ends.',
        noFeedback: 'Correctness feedback will not be shown during the test.',
        startTest: 'Start Test',
        preparingTrial: 'Preparing the next trial ({length} digits, {attempt}/{total})',
        forwardCompleteHeading: 'Forward Condition Complete',
        backwardNext: 'The Backward condition is next. Take a short break before continuing.',
        backwardPractice: 'There will also be one practice trial before the Backward condition.',
        toBackward: 'Continue to Backward',
        fixationHint: 'Keep looking at the center',
        responseHeading: 'Enter the digits',
        responseHelp: 'Use the on-screen keys or the 1–9 keys on your keyboard.',
        enteredDigitsLabel: 'Entered digits',
        keypadLabel: 'Digit entry keys',
        digitLabel: 'Digit {digit}',
        undo: 'Undo',
        submit: 'Submit Response',
        keyboardHint: 'Keyboard: 1–9 to enter digits, Backspace to undo, and Enter to submit',
        enteredDigits: 'Entered digits: {digits}',
        noDigitsEntered: 'No digits have been entered',
        digitAriaSeparator: ', ',
        bankErrorHeading: 'The stimulus configuration could not be verified',
        bankErrorBody: 'The research digit sequences are inconsistent. Stop the session and contact the research team.',
        resultDetail: 'Forward span: {forward} / Backward span: {backward}',
    },
});

/**
 * Independent browser implementation of a visual digit-span paradigm.
 *
 * The stimulus lists below were authored for this project. They are not WAIS/WISC
 * item lists and must not be interpreted with proprietary or auditory digit-span
 * norms. Four parallel forms are produced by bijective digit remapping, preserving
 * the no-repeat-within-sequence constraint without consuming App's shared PRNG.
 */
const VisualDigitSpanTest = {
    TASK_ID: 'visual_digit_span',
    TASK_VERSION: 'visual-digit-span-2026-07-v1',
    STIMULUS_VERSION: 'vds-independent-bank-2026-07-v1',
    SCORING_VERSION: 'vds-exact-adaptive-2026-07-v1',
    DIGIT_VISIBLE_MS: 500,
    DIGIT_SOA_MS: 1000,
    MIN_LENGTH: 2,
    MAX_LENGTH: 9,
    TRIALS_PER_LENGTH: 2,
    CONDITIONS: ['forward', 'backward'],

    // Independently authored base sequences. Each scored trial contains unique 1-9 digits.
    BASE_BANK: {
        forward: {
            2: [[4, 1], [7, 2]],
            3: [[6, 2, 9], [3, 8, 5]],
            4: [[7, 1, 9, 4], [2, 8, 5, 3]],
            5: [[4, 9, 2, 7, 5], [8, 1, 6, 3, 7]],
            6: [[3, 8, 1, 6, 9, 4], [7, 2, 5, 9, 1, 6]],
            7: [[9, 3, 7, 1, 6, 2, 8], [5, 8, 2, 9, 4, 1, 7]],
            8: [[6, 1, 8, 3, 9, 2, 7, 4], [2, 9, 5, 1, 7, 4, 8, 3]],
            9: [[8, 3, 1, 6, 9, 2, 5, 7, 4], [4, 7, 2, 9, 5, 1, 8, 3, 6]],
        },
        backward: {
            2: [[5, 2], [9, 4]],
            3: [[1, 7, 4], [8, 3, 6]],
            4: [[2, 9, 4, 7], [6, 1, 8, 5]],
            5: [[7, 3, 9, 2, 6], [4, 8, 1, 5, 9]],
            6: [[9, 2, 7, 4, 1, 8], [5, 1, 6, 3, 8, 2]],
            7: [[3, 9, 5, 1, 7, 4, 8], [8, 2, 6, 9, 3, 1, 5]],
            8: [[1, 6, 3, 8, 2, 9, 4, 7], [7, 4, 9, 2, 5, 8, 1, 6]],
            9: [[6, 2, 8, 4, 1, 9, 5, 3, 7], [3, 7, 1, 8, 5, 2, 9, 6, 4]],
        },
    },

    PRACTICE_BANK: {
        forward: [5, 1, 8],
        backward: [2, 7, 4],
    },

    // Index 0 is unused so a digit can be mapped with FORM_DIGIT_MAPS[i][digit].
    FORM_DIGIT_MAPS: [
        [null, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [null, 4, 8, 2, 7, 1, 9, 3, 6, 5],
        [null, 7, 3, 9, 1, 6, 2, 8, 5, 4],
        [null, 2, 9, 5, 3, 8, 4, 1, 7, 6],
    ],
    FORM_LABELS: ['A', 'B', 'C', 'D'],

    trials: [],
    conditionScores: null,
    conditionIndex: 0,
    taskSeed: 0,
    formIndex: 0,
    formLabel: 'A',
    testStartTime: null,
    taskStartTime: null,
    _responseKeyHandler: null,

    t(key, params) {
        return App.t(`visual_digit_span.${key}`, params);
    },

    run() {
        this.cleanupResponseHandler();
        this.trials = [];
        this.conditionScores = {};
        this.conditionIndex = 0;
        this.testStartTime = null;
        this.taskStartTime = performance.now();
        this.selectTaskForm();

        if (!this.validateStimulusBank()) {
            this.showBankError();
            return;
        }

        this.showInstructions();
    },

    localHash(value) {
        let hash = 2166136261 >>> 0;
        const text = String(value || '');
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619) >>> 0;
        }
        return hash >>> 0;
    },

    selectTaskForm() {
        if (typeof App.deriveTaskSeed === 'function') {
            this.taskSeed = App.deriveTaskSeed(this.TASK_ID) >>> 0;
            this.formIndex = this.taskSeed % this.FORM_DIGIT_MAPS.length;
            this.formLabel = this.FORM_LABELS[this.formIndex];
            return;
        }

        const seedMaterial = [
            Number.isFinite(App.randomSeed) ? App.randomSeed >>> 0 : 0,
            Number.isFinite(App.sessionNumber) ? App.sessionNumber : 1,
            App.participantId || '',
            this.TASK_ID,
            this.STIMULUS_VERSION,
        ].join('|');
        this.taskSeed = typeof App.simpleHash === 'function'
            ? App.simpleHash(seedMaterial) >>> 0
            : this.localHash(seedMaterial);
        this.formIndex = this.taskSeed % this.FORM_DIGIT_MAPS.length;
        this.formLabel = this.FORM_LABELS[this.formIndex];
    },

    validateStimulusBank() {
        const isValidSequence = (sequence, expectedLength) => (
            Array.isArray(sequence)
            && sequence.length === expectedLength
            && sequence.every(digit => Number.isInteger(digit) && digit >= 1 && digit <= 9)
            && new Set(sequence).size === sequence.length
        );

        for (const condition of this.CONDITIONS) {
            if (!isValidSequence(this.PRACTICE_BANK[condition], 3)) return false;
            for (let length = this.MIN_LENGTH; length <= this.MAX_LENGTH; length++) {
                const sequences = this.BASE_BANK[condition][length];
                if (!Array.isArray(sequences) || sequences.length !== this.TRIALS_PER_LENGTH) return false;
                if (!sequences.every(sequence => isValidSequence(sequence, length))) return false;
            }
        }

        return this.FORM_DIGIT_MAPS.every(map => {
            const mappedDigits = map.slice(1);
            return mappedDigits.length === 9
                && mappedDigits.every(digit => Number.isInteger(digit) && digit >= 1 && digit <= 9)
                && new Set(mappedDigits).size === 9;
        });
    },

    transformSequence(sequence) {
        const digitMap = this.FORM_DIGIT_MAPS[this.formIndex];
        return sequence.map(digit => digitMap[digit]);
    },

    scoredSequence(condition, length, attempt) {
        return this.transformSequence(this.BASE_BANK[condition][length][attempt - 1]);
    },

    practiceSequence(condition) {
        return this.transformSequence(this.PRACTICE_BANK[condition]);
    },

    showInstructions() {
        App.updateTestStatus(this.t('statusInstructions'));
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('title')}</h2>
                <p>${this.t('overviewDisplay')}</p>
                <p>${this.t('overviewOrder')}</p>
                <p>${this.t('overviewPractice')}</p>
                <p style="color:#666;">${this.t('independentStimuli')}</p>
                <button class="btn btn-primary" id="btn-vds-overview">${this.t('toForward')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-vds-overview', () => this.startCondition('forward'));
    },

    conditionLabel(condition) {
        return this.t(condition === 'forward' ? 'forwardLabel' : 'backwardLabel');
    },

    async startCondition(condition) {
        if (this.testStartTime == null) this.testStartTime = performance.now();
        this.conditionIndex = this.CONDITIONS.indexOf(condition);
        const label = this.conditionLabel(condition);
        const content = App.getTestContent();
        App.updateTestStatus(this.t('statusConditionIntro', { condition: label }));
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('conditionHeading', { condition: label })}</h2>
                <p>${condition === 'forward'
                    ? this.t('forwardInstruction')
                    : this.t('backwardInstruction')}</p>
                <p>${this.t('editInstruction')}</p>
                <p>${this.t('onePractice')}</p>
                <button class="btn btn-primary" id="btn-vds-condition">${this.t('startPractice')}</button>
            </div>
        `;
        await new Promise(resolve => App.bindPrimaryAdvance('btn-vds-condition', resolve));
        await this.runPractice(condition);
    },

    async runPractice(condition) {
        const sequence = this.practiceSequence(condition);
        App.updateTestStatus(this.t('statusPractice', { condition: this.conditionLabel(condition) }));
        const trial = await this.executeTrial({
            condition,
            sequence,
            length: sequence.length,
            attempt: 1,
            trialKind: 'practice',
        });
        this.trials.push(trial);

        const content = App.getTestContent();
        const expectedText = trial.expected_sequence.split(';').join(' ');
        content.innerHTML = `
            <div class="instructions">
                <div class="feedback ${trial.exact_correct ? 'correct' : 'incorrect'}">
                    ${this.t(trial.exact_correct ? 'correctFeedback' : 'incorrectFeedback')}
                </div>
                <p>${this.t('correctAnswer', { answer: expectedText })}</p>
                <p>${this.t('scoredRule')}</p>
                <p style="color:#666;">${this.t('noFeedback')}</p>
                <button class="btn btn-primary" id="btn-vds-scored">${this.t('startTest')}</button>
            </div>
        `;
        await new Promise(resolve => App.bindPrimaryAdvance('btn-vds-scored', resolve));
        await this.runScoredCondition(condition);
    },

    async runScoredCondition(condition) {
        let span = 0;
        let correctTrials = 0;
        let administeredTrials = 0;
        let stopLength = null;

        for (let length = this.MIN_LENGTH; length <= this.MAX_LENGTH; length++) {
            let correctAtLength = 0;

            for (let attempt = 1; attempt <= this.TRIALS_PER_LENGTH; attempt++) {
                const sequence = this.scoredSequence(condition, length, attempt);
                App.updateTestStatus(this.t('statusTrial', {
                    condition: this.conditionLabel(condition),
                    length,
                    attempt,
                    total: this.TRIALS_PER_LENGTH,
                }));
                const trial = await this.executeTrial({
                    condition,
                    sequence,
                    length,
                    attempt,
                    trialKind: 'scored',
                });
                this.trials.push(trial);
                administeredTrials++;

                if (trial.exact_correct) {
                    correctAtLength++;
                    correctTrials++;
                }

                if (attempt < this.TRIALS_PER_LENGTH) {
                    await this.showInterTrialPause(condition, length, attempt + 1);
                }
            }

            if (correctAtLength === 0) {
                stopLength = length;
                break;
            }

            span = length;
            if (length < this.MAX_LENGTH) {
                await this.showInterTrialPause(condition, length + 1, 1);
            }
        }

        this.conditionScores[condition] = {
            span,
            correct_trials: correctTrials,
            administered_trials: administeredTrials,
            span_x_correct_trials: span * correctTrials,
            stop_length: stopLength,
        };

        if (condition === 'forward') {
            await this.showBackwardTransition();
        } else {
            this.endTest();
        }
    },

    async showInterTrialPause(condition, length, attempt) {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions" role="status" aria-live="polite">
                <p>${this.t('conditionHeading', { condition: this.conditionLabel(condition) })}</p>
                <p style="color:#666;">${this.t('preparingTrial', { length, attempt, total: this.TRIALS_PER_LENGTH })}</p>
            </div>
        `;
        await App.wait(650);
    },

    async showBackwardTransition() {
        const content = App.getTestContent();
        App.updateTestStatus(this.t('statusForwardComplete'));
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('forwardCompleteHeading')}</h2>
                <p>${this.t('backwardNext')}</p>
                <p>${this.t('backwardPractice')}</p>
                <button class="btn btn-primary" id="btn-vds-backward">${this.t('toBackward')}</button>
            </div>
        `;
        await new Promise(resolve => App.bindPrimaryAdvance('btn-vds-backward', resolve));
        await this.startCondition('backward');
    },

    async executeTrial({ condition, sequence, length, attempt, trialKind }) {
        const content = App.getTestContent();
        content.innerHTML = `
            <div style="min-height:340px;display:flex;align-items:center;justify-content:center;background:#fff;color:#000;" aria-hidden="true">
                <div style="font-size:4.5rem;font-weight:400;">+</div>
            </div>
            <p class="field-hint" style="text-align:center;">${this.t('fixationHint')}</p>
        `;
        await App.wait(650);

        const timing = await this.presentDigits(sequence);
        const expected = condition === 'forward' ? sequence.slice() : sequence.slice().reverse();
        const response = await this.collectResponse(length, timing.recallTargetPerf);
        const exactCorrect = response.sequence.length === expected.length
            && response.sequence.every((digit, index) => digit === expected[index]);

        const onsetSession = timing.onsetsPerf.map(value => App.sessionElapsedMs(value));
        const offsetSession = timing.offsetsPerf.map(value => App.sessionElapsedMs(value));
        const visibleDurations = timing.offsetsPerf.map((value, index) => Math.round(value - timing.onsetsPerf[index]));
        const observedSoas = timing.onsetsPerf.slice(1).map((value, index) => Math.round(value - timing.onsetsPerf[index]));
        const inputEvents = response.inputEvents.map(event => ({
            action: event.action,
            value: event.value,
            method: event.method,
            session_ms: App.sessionElapsedMs(event.tPerf),
            latency_ms: Math.round(event.tPerf - response.recallOnsetPerf),
        }));

        return {
            trialNum: this.trials.length + 1,
            trial_number: this.trials.length + 1,
            condition_trial_number: this.trials.filter(trial => (
                trial.condition === condition && trial.trial_kind === trialKind
            )).length + 1,
            trial_kind: trialKind,
            phase: trialKind,
            is_practice: trialKind === 'practice' ? 1 : 0,
            condition,
            condition_order: 'forward;backward',
            set_size: length,
            attempt,
            stimulus_form: this.formLabel,
            stimulus_version: this.STIMULUS_VERSION,
            stimulus_bank_version: this.STIMULUS_VERSION,
            task_version: this.TASK_VERSION,
            scoring_version: this.SCORING_VERSION,
            task_seed: this.taskSeed,
            presented_sequence: sequence.join(';'),
            correct_sequence: expected.join(';'),
            expected_sequence: expected.join(';'),
            response_sequence: response.sequence.join(';'),
            exact_correct: exactCorrect ? 1 : 0,
            correct: exactCorrect ? 1 : 0,
            item_onsets_ms: onsetSession.join(';'),
            item_offsets_ms: offsetSession.join(';'),
            item_visible_durations_ms: visibleDurations.join(';'),
            item_inter_onset_intervals_ms: observedSoas.join(';'),
            digit_visible_durations_ms: visibleDurations.join(';'),
            digit_observed_soa_ms: observedSoas.join(';'),
            target_visible_ms: this.DIGIT_VISIBLE_MS,
            target_soa_ms: this.DIGIT_SOA_MS,
            timing_frame_estimate_ms: Number(timing.frameMs.toFixed(3)),
            recall_onset_ms: App.sessionElapsedMs(response.recallOnsetPerf),
            input_timestamps_ms: inputEvents
                .filter(event => event.action === 'digit')
                .map(event => event.session_ms)
                .join(';'),
            first_input_latency_ms: response.firstInputPerf == null
                ? null
                : Math.round(response.firstInputPerf - response.recallOnsetPerf),
            recall_duration_ms: Math.round(response.submitPerf - response.recallOnsetPerf),
            response_submitted_ms: App.sessionElapsedMs(response.submitPerf),
            accepted_digit_count: response.inputEvents.filter(event => event.action === 'digit').length,
            final_response_length: response.sequence.length,
            correction_count: response.inputEvents.filter(event => event.action === 'backspace').length,
            input_methods: [...new Set(response.inputEvents.map(event => event.method))].join(';'),
            input_events_json: JSON.stringify(inputEvents),
            tOnset: onsetSession[0] ?? null,
            tRecallOnset: App.sessionElapsedMs(response.recallOnsetPerf),
            tResponse: App.sessionElapsedMs(response.submitPerf),
        };
    },

    estimatedFrameMs() {
        const measuredHz = App.quality
            && App.quality.environment
            && Number(App.quality.environment.refreshRateHzEstimate);
        const hz = Number.isFinite(measuredHz) && measuredHz >= 30 && measuredHz <= 240
            ? measuredHz
            : 60;
        return 1000 / hz;
    },

    digitFrameHtml(digit) {
        return `
            <div style="min-height:390px;display:flex;align-items:center;justify-content:center;background:#fff;color:#000;" aria-hidden="true">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:92pt;font-weight:400;line-height:1;">${digit}</div>
            </div>
        `;
    },

    blankFrameHtml() {
        return '<div style="min-height:390px;background:#fff;color:#000;" aria-hidden="true">&nbsp;</div>';
    },

    paintHtmlAtOrAfter(targetPerf, html) {
        return new Promise(resolve => {
            const tick = () => {
                if (performance.now() + 0.25 < targetPerf) {
                    requestAnimationFrame(tick);
                    return;
                }
                App.getTestContent().innerHTML = html;
                // Mutation occurs inside rAF and is painted immediately after this
                // callback, so this is the realized frame-aligned onset/offset.
                resolve(performance.now());
            };
            requestAnimationFrame(tick);
        });
    },

    async presentDigits(sequence) {
        const onsetsPerf = [];
        const offsetsPerf = [];
        const frameMs = this.estimatedFrameMs();
        let nextOnsetTarget = performance.now();

        for (let index = 0; index < sequence.length; index++) {
            const onset = await this.paintHtmlAtOrAfter(nextOnsetTarget, this.digitFrameHtml(sequence[index]));
            onsetsPerf.push(onset);

            const offset = await this.paintHtmlAtOrAfter(
                onset + this.DIGIT_VISIBLE_MS,
                this.blankFrameHtml(),
            );
            offsetsPerf.push(offset);
            nextOnsetTarget = onset + this.DIGIT_SOA_MS;
        }

        return {
            onsetsPerf,
            offsetsPerf,
            frameMs,
            recallTargetPerf: onsetsPerf[onsetsPerf.length - 1] + this.DIGIT_SOA_MS,
        };
    },

    async collectResponse(setSize, targetMeasuredPerf) {
        const responseHtml = `
            <div id="vds-response-root" tabindex="-1" style="max-width:520px;margin:0 auto;text-align:center;outline:none;">
                <h2 style="margin-bottom:.35em;">${this.t('responseHeading')}</h2>
                <p style="color:#666;margin-top:0;">${this.t('responseHelp')}</p>
                <div id="vds-response-display" role="status" aria-live="polite" aria-label="${this.t('enteredDigitsLabel')}"
                     style="min-height:76px;border:2px solid #bbb;border-radius:10px;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:2.4rem;letter-spacing:.25em;padding:12px;margin:18px 0;display:flex;align-items:center;justify-content:center;"></div>
                <div role="group" aria-label="${this.t('keypadLabel')}" style="display:grid;grid-template-columns:repeat(3,minmax(72px,1fr));gap:10px;max-width:340px;margin:0 auto;">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => `
                        <button type="button" class="btn btn-secondary vds-digit-key" data-digit="${digit}"
                                aria-label="${this.t('digitLabel', { digit })}" style="font-size:1.55rem;min-height:58px;">${digit}</button>
                    `).join('')}
                </div>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                    <button type="button" class="btn btn-secondary" id="btn-vds-backspace">${this.t('undo')}</button>
                    <button type="button" class="btn btn-primary" id="btn-vds-submit" disabled>${this.t('submit')}</button>
                </div>
                <p class="field-hint">${this.t('keyboardHint')}</p>
            </div>
        `;
        const recallOnsetPerf = await this.paintHtmlAtOrAfter(targetMeasuredPerf, responseHtml);

        const content = App.getTestContent();
        const display = document.getElementById('vds-response-display');
        const responseRoot = document.getElementById('vds-response-root');
        const submitButton = document.getElementById('btn-vds-submit');
        const backspaceButton = document.getElementById('btn-vds-backspace');
        const sequence = [];
        const inputEvents = [];

        return new Promise(resolve => {
            let finished = false;

            const updateDisplay = () => {
                display.textContent = sequence.join(' ');
                display.setAttribute('aria-label', sequence.length > 0
                    ? this.t('enteredDigits', { digits: sequence.join(this.t('digitAriaSeparator')) })
                    : this.t('noDigitsEntered'));
                submitButton.disabled = sequence.length === 0;
            };

            const record = (action, value, method, tPerf) => {
                inputEvents.push({ action, value, method, tPerf });
            };

            const addDigit = (digit, method, tPerf) => {
                if (finished || sequence.length >= setSize) return;
                sequence.push(digit);
                record('digit', digit, method, tPerf);
                updateDisplay();
            };

            const backspace = (method, tPerf) => {
                if (finished || sequence.length === 0) return;
                const removed = sequence.pop();
                record('backspace', removed, method, tPerf);
                updateDisplay();
            };

            const submit = (method, tPerf) => {
                if (finished || sequence.length === 0) return;
                finished = true;
                record('submit', null, method, tPerf);
                this.cleanupResponseHandler();
                const digitInputEvents = inputEvents.filter(event => event.action === 'digit');
                resolve({
                    sequence: sequence.slice(),
                    inputEvents: inputEvents.slice(),
                    recallOnsetPerf,
                    firstInputPerf: digitInputEvents.length > 0 ? digitInputEvents[0].tPerf : null,
                    submitPerf: tPerf,
                });
            };

            content.querySelectorAll('.vds-digit-key').forEach(button => {
                button.addEventListener('click', event => {
                    const method = event.detail === 0 ? 'onscreen_keypad_keyboard' : 'onscreen_keypad';
                    addDigit(Number(button.dataset.digit), method, App.eventTime(event));
                    if (event.detail > 0) responseRoot.focus({ preventScroll: true });
                });
            });
            backspaceButton.addEventListener('click', event => {
                const method = event.detail === 0 ? 'onscreen_control_keyboard' : 'onscreen_control';
                backspace(method, App.eventTime(event));
                if (event.detail > 0) responseRoot.focus({ preventScroll: true });
            });
            submitButton.addEventListener('click', event => {
                const method = event.detail === 0 ? 'onscreen_control_keyboard' : 'onscreen_control';
                submit(method, App.eventTime(event));
            });

            this.cleanupResponseHandler();
            this._responseKeyHandler = event => {
                if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
                const activeButton = document.activeElement && document.activeElement.tagName === 'BUTTON';

                if (/^[1-9]$/.test(event.key)) {
                    if (event.repeat) return;
                    event.preventDefault();
                    addDigit(Number(event.key), 'keyboard', App.eventTime(event));
                } else if (event.key === 'Backspace') {
                    if (event.repeat) return;
                    event.preventDefault();
                    backspace('keyboard', App.eventTime(event));
                } else if (event.key === 'Enter' && !activeButton) {
                    if (event.repeat) return;
                    event.preventDefault();
                    submit('keyboard', App.eventTime(event));
                }
            };
            document.addEventListener('keydown', this._responseKeyHandler);
            updateDisplay();
            responseRoot.focus({ preventScroll: true });
        });
    },

    cleanupResponseHandler() {
        if (this._responseKeyHandler) {
            document.removeEventListener('keydown', this._responseKeyHandler);
            this._responseKeyHandler = null;
        }
    },

    showBankError() {
        App.updateTestStatus(this.t('statusBankError'));
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('bankErrorHeading')}</h2>
                <p>${this.t('bankErrorBody')}</p>
            </div>
        `;
    },

    endTest() {
        this.cleanupResponseHandler();
        const forward = this.conditionScores.forward || {
            span: 0,
            correct_trials: 0,
            administered_trials: 0,
            span_x_correct_trials: 0,
            stop_length: null,
        };
        const backward = this.conditionScores.backward || {
            span: 0,
            correct_trials: 0,
            administered_trials: 0,
            span_x_correct_trials: 0,
            stop_length: null,
        };
        const scoredTrials = this.trials.filter(trial => trial.trial_kind === 'scored');
        const combinedSpan = forward.span + backward.span;
        const durationStart = this.testStartTime == null ? this.taskStartTime : this.testStartTime;

        const result = {
            score: combinedSpan,
            detail: this.t('resultDetail', { forward: forward.span, backward: backward.span }),
            forward_span: forward.span,
            backward_span: backward.span,
            combined_span: combinedSpan,
            forward_correct_trials: forward.correct_trials,
            backward_correct_trials: backward.correct_trials,
            forward_administered_trials: forward.administered_trials,
            backward_administered_trials: backward.administered_trials,
            forward_span_x_correct_trials: forward.span_x_correct_trials,
            backward_span_x_correct_trials: backward.span_x_correct_trials,
            forward_stop_length: forward.stop_length,
            backward_stop_length: backward.stop_length,
            total_scored_trials: scoredTrials.length,
            stimulus_form: this.formLabel,
            stimulus_version: this.STIMULUS_VERSION,
            task_version: this.TASK_VERSION,
            scoring_version: this.SCORING_VERSION,
            task_seed: this.taskSeed,
            condition_order: 'forward;backward',
            score_definition: 'combined_span = forward_span + backward_span; conditions should also be analysed separately',
            supplementary_score_definition: 'span_x_correct_trials is descriptive (span multiplied by exact-correct scored trials)',
            practiceAttempts: 1,
            practice_trial_count: this.trials.filter(trial => trial.trial_kind === 'practice').length,
            testDurationMs: Math.round(performance.now() - durationStart),
            timeoutCount: 0,
        };

        App.onTestComplete(this.TASK_ID, result, this.trials);
    },
};

if (!App.testRegistry[VisualDigitSpanTest.TASK_ID]) {
    App.testRegistry[VisualDigitSpanTest.TASK_ID] = {
        name: '視覚的数字スパン課題',
        domain: 'ワーキングメモリ',
        module: null,
    };
}
App.testRegistry[VisualDigitSpanTest.TASK_ID].module = VisualDigitSpanTest;
App.testRegistry[VisualDigitSpanTest.TASK_ID].nameKey = 'visual_digit_span.name';
App.testRegistry[VisualDigitSpanTest.TASK_ID].domainKey = 'visual_digit_span.domain';
