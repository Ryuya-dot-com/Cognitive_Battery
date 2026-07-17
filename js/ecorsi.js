// ==================== eCorsi Block-Tapping Task ====================
//
// Independent web implementation informed by the timing and adaptive structure
// described by Brunetti et al. (2014) and the scoring approach described by
// Kessels et al. (2000). The layout and item sequences below were authored for
// this application; they do not reproduce a protected standardized item set.

I18n.register('ecorsi', {
    ja: {
        name: 'eCorsi ブロック課題',
        domain: '視空間ワーキングメモリ',
        statusInstructions: '課題説明',
        statusConditionIntro: '{condition}・説明',
        statusPractice: '{condition}・練習',
        statusTest: '{condition}・本番',
        statusBankError: '刺激設定エラー',
        forwardLabel: 'Forward（順方向）',
        backwardLabel: 'Backward（逆方向）',
        title: 'eCorsi ブロック課題',
        overviewBlocks: '画面上の9個のブロックが、1個ずつ黄色く光ります。光った位置と順序を覚えてください。',
        overviewConditions: '<strong>Forward（順方向）</strong>では光った順に、<strong>Backward（逆方向）</strong>では光った順序を逆にしてブロックを選びます。',
        overviewPractice: '各条件の最初に、3ブロックの練習を3回行います。本番では2ブロックから始まり、正答に応じて長くなります。',
        overviewEditing: '回答中は「1つ戻す」で最後の選択を修正できます。必要数を選んだ後、「回答を確定」を押してください。',
        overviewTiming: 'ブロックは500 ms点灯し、点灯開始の間隔は1000 msです。',
        start: '開始',
        forwardInstruction: 'ブロックが光った順番と同じ順番で選んでください。',
        backwardInstruction: 'ブロックが光った順番を逆にして、最後に光ったブロックから選んでください。',
        conditionPractice: 'まず、3ブロックの練習を3回行います。練習中は正誤が表示されます。',
        waitForResponse: 'ブロックが光っている間は画面に触れず、回答画面が出てから選んでください。',
        startPractice: '練習開始',
        correct: '正解',
        incorrect: '不正解',
        testHeading: '{condition}：本番',
        adaptiveRule: '各系列長を2回行います。少なくとも1回正解すると次の長さへ進み、2回とも不正解の場合はこの条件を終了します。',
        noFeedback: '本番中は正誤を表示しません。',
        startTest: '本番開始',
        responseRecorded: '回答を記録しました',
        conditionComplete: '{condition} 完了',
        takeBreak: 'この条件は終了です。短い休憩を取ってください。',
        nextCondition: '次は <strong>{condition}</strong> です。',
        recordedLevels: '記録済み系列長: {levels}',
        listSeparator: '、',
        nextConditionButton: '次の条件へ',
        practicePhase: '練習',
        testPhase: '本番',
        cueProgress: '{phase} {attempt} / {total}',
        rememberLocations: '位置を覚えてください',
        presentationHeading: '{condition}・{phase}',
        selectedCount: '{selected} / {total} 個選択',
        blockLabel: '空間ブロック {id}',
        noninteractiveBlockLabel: '空間ブロック',
        boardLabel: 'eCorsi 9ブロック盤',
        undo: '1つ戻す',
        submit: '回答を確定',
        keyboardHint: 'Tabで位置を移動し、Enter / Spaceで選択できます。Backspace / Deleteで1つ戻せます。',
        watchHint: '光る位置を見て覚えてください',
        bankErrorHeading: '刺激設定を確認できませんでした',
        bankErrorBody: '研究用のeCorsi系列に不整合があります。実施を中止し、研究担当者に連絡してください。',
        resultDetail: 'Forward span {forwardSpan} / Total {forwardTotal}、Backward span {backwardSpan} / Total {backwardTotal}',
    },
    en: {
        name: 'eCorsi Block Task',
        domain: 'Visuospatial Working Memory',
        statusInstructions: 'Instructions',
        statusConditionIntro: '{condition} / Instructions',
        statusPractice: '{condition} / Practice',
        statusTest: '{condition} / Test',
        statusBankError: 'Stimulus Configuration Error',
        forwardLabel: 'Forward',
        backwardLabel: 'Backward',
        title: 'eCorsi Block Task',
        overviewBlocks: 'The nine blocks on the screen will light up yellow one at a time. Remember their locations and order.',
        overviewConditions: 'In the <strong>Forward</strong> condition, select the blocks in the order they lit up. In the <strong>Backward</strong> condition, select them in reverse order.',
        overviewPractice: 'At the beginning of each condition, you will complete three practice trials with three blocks. The test begins with two blocks and becomes longer based on your answers.',
        overviewEditing: 'While responding, use Undo to remove your last selection. After selecting the required number of blocks, select Submit Response.',
        overviewTiming: 'Each block lights up for 500 ms, with 1,000 ms between the start of each highlight.',
        start: 'Start',
        forwardInstruction: 'Select the blocks in the same order in which they lit up.',
        backwardInstruction: 'Select the blocks in reverse order, beginning with the last block that lit up.',
        conditionPractice: 'You will first complete three practice trials with three blocks. Correctness feedback is shown during practice.',
        waitForResponse: 'Do not touch the screen while the blocks are lighting up. Wait until the response screen appears before making your selections.',
        startPractice: 'Start Practice',
        correct: 'Correct',
        incorrect: 'Incorrect',
        testHeading: '{condition}: Test',
        adaptiveRule: 'There are two trials at each sequence length. At least one correct response advances you to the next length; if both are incorrect, the condition ends.',
        noFeedback: 'Correctness feedback will not be shown during the test.',
        startTest: 'Start Test',
        responseRecorded: 'Response recorded',
        conditionComplete: '{condition} Complete',
        takeBreak: 'This condition is complete. Please take a short break.',
        nextCondition: 'Next: <strong>{condition}</strong>.',
        recordedLevels: 'Sequence lengths administered: {levels}',
        listSeparator: ', ',
        nextConditionButton: 'Continue to Next Condition',
        practicePhase: 'Practice',
        testPhase: 'Test',
        cueProgress: '{phase} {attempt} / {total}',
        rememberLocations: 'Remember the locations',
        presentationHeading: '{condition} / {phase}',
        selectedCount: '{selected} / {total} selected',
        blockLabel: 'Spatial block {id}',
        noninteractiveBlockLabel: 'Spatial block',
        boardLabel: 'eCorsi nine-block board',
        undo: 'Undo',
        submit: 'Submit Response',
        keyboardHint: 'Use Tab to move between blocks and Enter or Space to select. Use Backspace or Delete to undo.',
        watchHint: 'Watch and remember the locations that light up',
        bankErrorHeading: 'The stimulus configuration could not be verified',
        bankErrorBody: 'The research eCorsi sequences are inconsistent. Stop the session and contact the research team.',
        resultDetail: 'Forward span {forwardSpan} / Total {forwardTotal}, Backward span {backwardSpan} / Total {backwardTotal}',
    },
});

const ECorsiTest = {
    TASK_VERSION: 'ecorsi-2026-07-v1',
    STIMULUS_BANK_VERSION: 'ecorsi-independent-2026-07-v1',
    SCORING_VERSION: 'ecorsi-exact-adaptive-2026-07-v1',
    HIGHLIGHT_MS: 500,
    INTER_ONSET_MS: 1000,
    MIN_SET_SIZE: 2,
    MAX_SET_SIZE: 9,
    TRIALS_PER_LEVEL: 2,
    PRACTICE_TRIALS: 3,
    PRACTICE_SET_SIZE: 3,
    CUE_MS: 650,

    // Percent coordinates within a fixed-aspect-ratio board. This intentionally
    // irregular layout is original to this application and is held constant
    // across participants and stimulus forms.
    BLOCK_LAYOUT: [
        { id: 1, x: 12, y: 18 },
        { id: 2, x: 43, y: 11 },
        { id: 3, x: 79, y: 17 },
        { id: 4, x: 25, y: 42 },
        { id: 5, x: 61, y: 35 },
        { id: 6, x: 87, y: 51 },
        { id: 7, x: 11, y: 78 },
        { id: 8, x: 45, y: 70 },
        { id: 9, x: 74, y: 84 },
    ],

    // Two fixed, versioned parallel forms. Forward and backward conditions use
    // distinct item sets so that the second condition does not simply repeat the
    // first. Each scored sequence visits a block at most once.
    STIMULUS_FORMS: {
        A: {
            practice: {
                forward: [[1, 5, 8], [7, 3, 4], [2, 9, 6]],
                backward: [[4, 2, 7], [9, 5, 1], [3, 8, 6]],
            },
            test: {
                forward: {
                    2: [[2, 7], [6, 1]],
                    3: [[8, 3, 5], [1, 6, 9]],
                    4: [[4, 9, 2, 7], [6, 3, 8, 1]],
                    5: [[2, 8, 5, 1, 7], [9, 4, 6, 3, 1]],
                    6: [[7, 3, 9, 5, 2, 8], [1, 6, 4, 8, 3, 9]],
                    7: [[5, 1, 8, 4, 9, 2, 6], [3, 7, 2, 9, 5, 1, 8]],
                    8: [[8, 2, 6, 1, 7, 4, 9, 3], [4, 9, 1, 5, 8, 3, 7, 2]],
                    9: [[6, 1, 8, 3, 9, 4, 7, 2, 5], [2, 7, 4, 9, 1, 6, 3, 8, 5]],
                },
                backward: {
                    2: [[3, 8], [7, 1]],
                    3: [[6, 2, 9], [4, 8, 1]],
                    4: [[9, 5, 2, 7], [1, 4, 8, 6]],
                    5: [[8, 3, 6, 1, 9], [2, 7, 4, 9, 5]],
                    6: [[5, 9, 2, 8, 4, 1], [7, 3, 6, 1, 8, 5]],
                    7: [[1, 6, 9, 3, 7, 4, 8], [8, 2, 5, 9, 1, 6, 3]],
                    8: [[3, 7, 1, 6, 9, 2, 5, 8], [9, 4, 8, 2, 6, 1, 7, 5]],
                    9: [[5, 2, 8, 4, 1, 7, 3, 9, 6], [7, 1, 6, 9, 3, 8, 2, 5, 4]],
                },
            },
        },
        B: {
            practice: {
                forward: [[6, 4, 9], [2, 8, 3], [7, 5, 1]],
                backward: [[8, 1, 5], [3, 7, 9], [6, 2, 4]],
            },
            test: {
                forward: {
                    2: [[5, 3], [1, 8]],
                    3: [[7, 2, 6], [9, 4, 1]],
                    4: [[3, 8, 5, 2], [7, 1, 6, 9]],
                    5: [[4, 9, 3, 7, 1], [6, 2, 8, 5, 9]],
                    6: [[9, 1, 5, 8, 2, 6], [3, 7, 4, 1, 9, 5]],
                    7: [[2, 6, 9, 4, 8, 1, 7], [8, 3, 7, 5, 1, 6, 4]],
                    8: [[1, 7, 3, 9, 5, 2, 8, 4], [6, 4, 9, 2, 7, 3, 5, 1]],
                    9: [[4, 8, 1, 6, 3, 9, 5, 2, 7], [9, 3, 7, 2, 6, 1, 8, 4, 5]],
                },
                backward: {
                    2: [[4, 6], [9, 2]],
                    3: [[1, 7, 5], [8, 4, 2]],
                    4: [[6, 9, 3, 1], [2, 5, 8, 4]],
                    5: [[7, 1, 4, 9, 3], [5, 8, 2, 6, 1]],
                    6: [[2, 9, 5, 1, 7, 4], [8, 3, 6, 9, 2, 5]],
                    7: [[4, 1, 8, 5, 2, 9, 6], [9, 6, 3, 7, 1, 5, 8]],
                    8: [[7, 2, 9, 4, 1, 6, 3, 8], [3, 8, 5, 1, 7, 4, 9, 2]],
                    9: [[8, 5, 2, 7, 4, 9, 1, 6, 3], [1, 6, 9, 3, 8, 2, 5, 7, 4]],
                },
            },
        },
    },

    trials: [],
    conditionSummaries: {},
    conditionOrder: [],
    conditionIndex: 0,
    taskSeed: 0,
    stimulusForm: 'A',
    conditionOrderGroup: 0,
    testStartTime: null,
    scoredTrialCounter: 0,
    _ended: false,
    _responseKeyHandler: null,

    t(key, params) {
        return App.t(`ecorsi.${key}`, params);
    },

    run() {
        this.cleanupResponseHandler();
        this.trials = [];
        this.conditionSummaries = {};
        this.conditionIndex = 0;
        this.scoredTrialCounter = 0;
        this.testStartTime = null;
        this._ended = false;
        this.configureSession();
        try {
            this.validateStimulusForm(this.STIMULUS_FORMS[this.stimulusForm]);
        } catch (error) {
            console.error('Invalid eCorsi stimulus bank.', error);
            this.showBankError();
            return;
        }
        this.showInstructions();
    },

    configureSession() {
        const participant = String(App.participantId || 'anonymous');
        const sessionNumber = Number.isFinite(App.sessionNumber) ? App.sessionNumber : 1;
        const appSeed = Number.isFinite(App.randomSeed) ? App.randomSeed : 0;

        // A task-specific seed is derived without consuming or advancing App's
        // shared PRNG stream, so adaptive stopping cannot alter another task.
        this.taskSeed = typeof App.deriveTaskSeed === 'function'
            ? App.deriveTaskSeed('ecorsi')
            : App.simpleHash(
                `${participant}|${sessionNumber}|${appSeed}|ecorsi|${this.STIMULUS_BANK_VERSION}`
            ) >>> 0;

        const formKeys = Object.keys(this.STIMULUS_FORMS);
        const formIndex = this.taskSeed % formKeys.length;
        this.stimulusForm = formKeys[formIndex];

        // Participant IDs distribute the first-session order; later sessions
        // alternate the order for the same participant.
        const orderBase = App.simpleHash(`${participant}|ecorsi-condition-order-v1`);
        this.conditionOrderGroup = (orderBase + Math.max(0, sessionNumber - 1)) % 2;
        this.conditionOrder = this.conditionOrderGroup === 0
            ? ['forward', 'backward']
            : ['backward', 'forward'];
    },

    validateStimulusForm(form) {
        if (!form || !form.practice || !form.test) {
            throw new Error('eCorsi stimulus form is missing.');
        }
        for (const condition of ['forward', 'backward']) {
            const practice = form.practice[condition];
            if (!Array.isArray(practice) || practice.length !== this.PRACTICE_TRIALS) {
                throw new Error(`Invalid eCorsi ${condition} practice bank.`);
            }
            for (const sequence of practice) {
                this.validateSequence(sequence, this.PRACTICE_SET_SIZE);
            }
            for (let size = this.MIN_SET_SIZE; size <= this.MAX_SET_SIZE; size++) {
                const sequences = form.test[condition][size];
                if (!Array.isArray(sequences) || sequences.length !== this.TRIALS_PER_LEVEL) {
                    throw new Error(`Invalid eCorsi ${condition} level ${size}.`);
                }
                for (const sequence of sequences) this.validateSequence(sequence, size);
            }
        }
    },

    validateSequence(sequence, expectedLength) {
        const valid = Array.isArray(sequence)
            && sequence.length === expectedLength
            && new Set(sequence).size === sequence.length
            && sequence.every(id => Number.isInteger(id) && id >= 1 && id <= 9);
        if (!valid) throw new Error(`Invalid eCorsi sequence at length ${expectedLength}.`);
    },

    showInstructions() {
        if (typeof App.updateTestStatus === 'function') App.updateTestStatus(this.t('statusInstructions'));
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('title')}</h2>
                <p>${this.t('overviewBlocks')}</p>
                <p>${this.t('overviewConditions')}</p>
                <p>${this.t('overviewPractice')}</p>
                <p>${this.t('overviewEditing')}</p>
                <p style="color:#888;">${this.t('overviewTiming')}</p>
                <button class="btn btn-primary" id="btn-ecorsi-start">${this.t('start')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ecorsi-start', () => this.startTask());
    },

    startTask() {
        this.testStartTime = performance.now();
        this.conditionIndex = 0;
        this.showConditionIntro();
    },

    conditionLabel(condition) {
        return this.t(condition === 'forward' ? 'forwardLabel' : 'backwardLabel');
    },

    conditionInstruction(condition) {
        return condition === 'forward'
            ? this.t('forwardInstruction')
            : this.t('backwardInstruction');
    },

    showConditionIntro() {
        if (this.conditionIndex >= this.conditionOrder.length) {
            this.endTest();
            return;
        }

        const condition = this.conditionOrder[this.conditionIndex];
        const content = App.getTestContent();
        if (typeof App.updateTestStatus === 'function') {
            App.updateTestStatus(this.t('statusConditionIntro', { condition: this.conditionLabel(condition) }));
        }
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.conditionLabel(condition)}</h2>
                <p>${this.conditionInstruction(condition)}</p>
                <p>${this.t('conditionPractice')}</p>
                <p>${this.t('waitForResponse')}</p>
                <button class="btn btn-primary" id="btn-ecorsi-condition">${this.t('startPractice')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ecorsi-condition', () => this.runPractice(condition));
    },

    async runPractice(condition) {
        if (typeof App.updateTestStatus === 'function') {
            App.updateTestStatus(this.t('statusPractice', { condition: this.conditionLabel(condition) }));
        }
        const sequences = this.STIMULUS_FORMS[this.stimulusForm].practice[condition];
        for (let i = 0; i < sequences.length; i++) {
            await this.showTrialCue(condition, 'practice', i + 1, sequences.length);
            const trial = await this.administerTrial({
                condition,
                phase: 'practice',
                setSize: this.PRACTICE_SET_SIZE,
                attempt: i + 1,
                presentedSequence: sequences[i],
            });
            this.trials.push(trial);

            const content = App.getTestContent();
            content.innerHTML = `
                <div class="feedback ${trial.exact_correct ? 'correct' : 'incorrect'}" role="status" aria-live="assertive">
                    ${this.t(trial.exact_correct ? 'correct' : 'incorrect')}
                </div>
            `;
            await App.wait(700);
        }

        this.showTestReady(condition);
    },

    showTestReady(condition) {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('testHeading', { condition: this.conditionLabel(condition) })}</h2>
                <p>${this.conditionInstruction(condition)}</p>
                <p>${this.t('adaptiveRule')}</p>
                <p style="color:#888;">${this.t('noFeedback')}</p>
                <button class="btn btn-primary" id="btn-ecorsi-test">${this.t('startTest')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ecorsi-test', () => this.runScoredCondition(condition));
    },

    async runScoredCondition(condition) {
        if (typeof App.updateTestStatus === 'function') {
            App.updateTestStatus(this.t('statusTest', { condition: this.conditionLabel(condition) }));
        }

        let blockSpan = 0;
        let correctTrialCount = 0;
        const levelsAdministered = [];
        const bank = this.STIMULUS_FORMS[this.stimulusForm].test[condition];

        for (let setSize = this.MIN_SET_SIZE; setSize <= this.MAX_SET_SIZE; setSize++) {
            let correctAtLevel = 0;
            levelsAdministered.push(setSize);

            for (let attempt = 1; attempt <= this.TRIALS_PER_LEVEL; attempt++) {
                await this.showTrialCue(condition, 'test', attempt, this.TRIALS_PER_LEVEL);
                const trial = await this.administerTrial({
                    condition,
                    phase: 'test',
                    setSize,
                    attempt,
                    presentedSequence: bank[setSize][attempt - 1],
                });
                this.scoredTrialCounter++;
                trial.scored_trial_num = this.scoredTrialCounter;
                this.trials.push(trial);

                if (trial.exact_correct) {
                    correctAtLevel++;
                    correctTrialCount++;
                }

                const content = App.getTestContent();
                content.innerHTML = `<div class="ecorsi-recorded" role="status">${this.t('responseRecorded')}</div>`;
                await App.wait(350);
            }

            if (correctAtLevel >= 1) {
                blockSpan = setSize;
            } else {
                break;
            }
        }

        this.conditionSummaries[condition] = {
            block_span: blockSpan,
            correct_trial_count: correctTrialCount,
            total_score: blockSpan * correctTrialCount,
            levels_administered: levelsAdministered.join(';'),
        };

        this.conditionIndex++;
        if (this.conditionIndex < this.conditionOrder.length) {
            this.showConditionTransition(condition);
        } else {
            this.endTest();
        }
    },

    showConditionTransition(completedCondition) {
        const nextCondition = this.conditionOrder[this.conditionIndex];
        const completed = this.conditionSummaries[completedCondition];
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('conditionComplete', { condition: this.conditionLabel(completedCondition) })}</h2>
                <p>${this.t('takeBreak')}</p>
                <p>${this.t('nextCondition', { condition: this.conditionLabel(nextCondition) })}</p>
                <p style="color:#888;">${this.t('recordedLevels', {
                    levels: completed.levels_administered.split(';').join(this.t('listSeparator')),
                })}</p>
                <button class="btn btn-primary" id="btn-ecorsi-next-condition">${this.t('nextConditionButton')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ecorsi-next-condition', () => this.showConditionIntro());
    },

    async showTrialCue(condition, phase, attempt, totalAttempts) {
        const content = App.getTestContent();
        const phaseLabel = this.t(phase === 'practice' ? 'practicePhase' : 'testPhase');
        content.innerHTML = `
            <div class="ecorsi-cue" role="status">
                <div>${this.conditionLabel(condition)}</div>
                <strong>${this.t('cueProgress', { phase: phaseLabel, attempt, total: totalAttempts })}</strong>
                <span>${this.t('rememberLocations')}</span>
            </div>
        `;
        await App.wait(this.CUE_MS);
    },

    async administerTrial({ condition, phase, setSize, attempt, presentedSequence }) {
        const presented = [...presentedSequence];
        const expected = condition === 'backward' ? [...presented].reverse() : [...presented];
        const presentation = await this.presentSequence(presented, condition, phase);
        const recall = await this.collectResponse(setSize, condition, phase);
        const exactCorrect = this.sequencesEqual(recall.response, expected);
        const serialPositionsCorrect = recall.response.reduce(
            (sum, id, index) => sum + (id === expected[index] ? 1 : 0),
            0
        );

        const sessionOnsets = presentation.onsets.map(t => App.sessionElapsedMs(t));
        const sessionOffsets = presentation.offsets.map(t => App.sessionElapsedMs(t));
        const taskOnsets = presentation.onsets.map(t => this.round1(t - this.testStartTime));
        const taskOffsets = presentation.offsets.map(t => this.round1(t - this.testStartTime));
        const highlightDurations = presentation.offsets.map(
            (offset, index) => this.round1(offset - presentation.onsets[index])
        );
        const interOnsetIntervals = presentation.onsets.slice(1).map(
            (onset, index) => this.round1(onset - presentation.onsets[index])
        );

        return {
            trialNum: this.trials.length + 1,
            task_version: this.TASK_VERSION,
            scoring_version: this.SCORING_VERSION,
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            stimulus_form: this.stimulusForm,
            task_seed: this.taskSeed,
            condition_order_group: this.conditionOrderGroup,
            condition_order: this.conditionOrder.join(';'),
            phase,
            is_practice: phase === 'practice' ? 1 : 0,
            condition,
            set_size: setSize,
            attempt,
            presented_sequence: presented.join(';'),
            correct_sequence: expected.join(';'),
            expected_sequence: expected.join(';'),
            response_sequence: recall.response.join(';'),
            exact_correct: exactCorrect ? 1 : 0,
            correct: exactCorrect ? 1 : 0,
            serial_positions_correct: serialPositionsCorrect,
            item_onsets_ms: sessionOnsets.join(';'),
            item_offsets_ms: sessionOffsets.join(';'),
            item_onsets_task_ms: taskOnsets.join(';'),
            item_offsets_task_ms: taskOffsets.join(';'),
            item_highlight_durations_ms: highlightDurations.join(';'),
            item_inter_onset_intervals_ms: interOnsetIntervals.join(';'),
            intended_highlight_ms: this.HIGHLIGHT_MS,
            intended_inter_onset_ms: this.INTER_ONSET_MS,
            recall_onset_ms: App.sessionElapsedMs(recall.recallOnset),
            input_timestamps_ms: recall.finalInputTimes.map(t => App.sessionElapsedMs(t)).join(';'),
            input_event_log: JSON.stringify(recall.inputEvents.map(event => ({
                action: event.action,
                block: event.block,
                session_ms: App.sessionElapsedMs(event.time),
                method: event.method,
                pointer_type: event.pointerType,
            }))),
            first_tap_latency_ms: recall.firstTapTime == null
                ? null
                : Math.round(recall.firstTapTime - recall.recallOnset),
            recall_duration_ms: Math.round(recall.submitTime - recall.recallOnset),
            response_edit_count: recall.editCount,
            input_method: recall.inputMethod,
            input_pointer_types: recall.pointerTypes.join(';'),
            tOnset: sessionOnsets[0] ?? null,
            tRecallOnset: App.sessionElapsedMs(recall.recallOnset),
            tResponse: App.sessionElapsedMs(recall.submitTime),
        };
    },

    async presentSequence(sequence, condition, phase) {
        const content = App.getTestContent();
        content.innerHTML = this.boardHtml({
            responseMode: false,
            heading: this.t('presentationHeading', {
                condition: this.conditionLabel(condition),
                phase: this.t(phase === 'practice' ? 'practicePhase' : 'testPhase'),
            }),
        });
        await App.waitForStimulusOnset();

        const onsets = [];
        const offsets = [];
        let nextOnsetTarget = performance.now();

        for (const blockId of sequence) {
            const block = content.querySelector(`[data-ecorsi-block="${blockId}"]`);
            const onset = await this.paintMutationAtOrAfter(nextOnsetTarget, () => {
                block.classList.add('is-active');
            });
            onsets.push(onset);

            const offset = await this.paintMutationAtOrAfter(onset + this.HIGHLIGHT_MS, () => {
                block.classList.remove('is-active');
            });
            offsets.push(offset);
            nextOnsetTarget = onset + this.INTER_ONSET_MS;
        }

        return { onsets, offsets };
    },

    paintMutationAtOrAfter(targetTime, mutation) {
        return new Promise(resolve => {
            const tick = () => {
                if (performance.now() + 0.25 < targetTime) {
                    requestAnimationFrame(tick);
                    return;
                }
                mutation();
                // A mutation performed inside rAF is painted immediately after
                // this callback; this timestamp therefore marks the realized
                // frame-aligned onset or offset.
                resolve(performance.now());
            };
            requestAnimationFrame(tick);
        });
    },

    async collectResponse(setSize, condition, phase) {
        const content = App.getTestContent();
        content.innerHTML = this.boardHtml({
            responseMode: true,
            heading: this.conditionInstruction(condition),
            setSize,
            phase,
        });

        const recallOnset = await App.waitForStimulusOnset();

        return new Promise(resolve => {
            const response = [];
            const finalInputTimes = [];
            const inputEvents = [];
            const inputMethods = new Set();
            const pointerTypes = new Set();
            let firstTapTime = null;
            let editCount = 0;
            let resolved = false;

            const countEl = document.getElementById('ecorsi-response-count');
            const undoButton = document.getElementById('btn-ecorsi-undo');
            const submitButton = document.getElementById('btn-ecorsi-submit');
            const blockButtons = [...content.querySelectorAll('.ecorsi-response .ecorsi-block')];

            const updateControls = () => {
                countEl.textContent = this.t('selectedCount', { selected: response.length, total: setSize });
                undoButton.disabled = response.length === 0;
                submitButton.disabled = response.length !== setSize;
                const full = response.length >= setSize;
                for (const button of blockButtons) button.disabled = full;
            };

            const eventTime = event => (
                typeof App.eventTime === 'function' ? App.eventTime(event) : performance.now()
            );

            const selectBlock = (blockId, event, button) => {
                if (resolved || response.length >= setSize) return;
                const time = eventTime(event);
                const method = this.inputMethodForEvent(event);
                const pointerType = this.pointerTypeForEvent(event);
                if (firstTapTime == null) firstTapTime = time;
                inputMethods.add(method);
                if (pointerType) pointerTypes.add(pointerType);
                response.push(blockId);
                finalInputTimes.push(time);
                inputEvents.push({ action: 'select', block: blockId, time, method, pointerType });

                button.classList.add('is-tapped');
                window.setTimeout(() => button.classList.remove('is-tapped'), 150);
                updateControls();
            };

            const undo = event => {
                if (resolved || response.length === 0) return;
                const method = this.inputMethodForEvent(event);
                const pointerType = this.pointerTypeForEvent(event);
                const removed = response.pop();
                finalInputTimes.pop();
                editCount++;
                inputMethods.add(method);
                if (pointerType) pointerTypes.add(pointerType);
                inputEvents.push({
                    action: 'undo',
                    block: removed,
                    time: eventTime(event),
                    method,
                    pointerType,
                });
                updateControls();
                const firstEnabled = blockButtons.find(button => !button.disabled);
                if (firstEnabled && event.type === 'keydown') firstEnabled.focus();
            };

            const submit = event => {
                if (resolved || response.length !== setSize) return;
                resolved = true;
                const submitTime = eventTime(event);
                this.cleanupResponseHandler();
                const methods = [...inputMethods];
                resolve({
                    response: [...response],
                    finalInputTimes: [...finalInputTimes],
                    inputEvents: [...inputEvents],
                    firstTapTime,
                    submitTime,
                    recallOnset,
                    editCount,
                    pointerTypes: [...pointerTypes],
                    inputMethod: methods.length === 0
                        ? 'none'
                        : (methods.length === 1 ? methods[0] : 'mixed'),
                });
            };

            for (const button of blockButtons) {
                button.addEventListener('click', event => {
                    selectBlock(Number(button.dataset.ecorsiBlock), event, button);
                });
            }
            undoButton.addEventListener('click', undo);
            submitButton.addEventListener('click', submit);

            this.cleanupResponseHandler();
            this._responseKeyHandler = event => {
                if (event.key !== 'Backspace' && event.key !== 'Delete') return;
                if (response.length === 0) return;
                event.preventDefault();
                undo(event);
            };
            document.addEventListener('keydown', this._responseKeyHandler);
            updateControls();
            blockButtons[0]?.focus({ preventScroll: true });
        });
    },

    cleanupResponseHandler() {
        if (this._responseKeyHandler) {
            document.removeEventListener('keydown', this._responseKeyHandler);
            this._responseKeyHandler = null;
        }
    },

    inputMethodForEvent(event) {
        if (event && (event.type === 'keydown' || event.detail === 0)) return 'keyboard';
        return 'pointer';
    },

    pointerTypeForEvent(event) {
        if (event && typeof event.pointerType === 'string' && event.pointerType) {
            return event.pointerType;
        }
        if (event && event.sourceCapabilities && event.sourceCapabilities.firesTouchEvents) {
            return 'touch';
        }
        if (event && (event.type === 'keydown' || event.detail === 0)) return null;
        return 'mouse';
    },

    boardHtml({ responseMode, heading, setSize = null }) {
        const blocks = this.BLOCK_LAYOUT.map(block => {
            const position = `left:${block.x}%;top:${block.y}%;`;
            if (responseMode) {
                return `
                    <button type="button" class="ecorsi-block" data-ecorsi-block="${block.id}"
                        style="${position}" aria-label="${this.t('blockLabel', { id: block.id })}"></button>
                `;
            }
            return `
                <div class="ecorsi-block" data-ecorsi-block="${block.id}" style="${position}"
                    role="img" aria-label="${this.t('noninteractiveBlockLabel')}"></div>
            `;
        }).join('');

        const controls = responseMode ? `
            <div class="ecorsi-response-status" id="ecorsi-response-count" aria-live="polite">${this.t('selectedCount', { selected: 0, total: setSize })}</div>
            <div class="ecorsi-controls">
                <button type="button" class="btn ecorsi-secondary" id="btn-ecorsi-undo" disabled>${this.t('undo')}</button>
                <button type="button" class="btn btn-primary" id="btn-ecorsi-submit" disabled>${this.t('submit')}</button>
            </div>
            <p class="ecorsi-key-hint">${this.t('keyboardHint')}</p>
        ` : `<p class="ecorsi-watch-hint">${this.t('watchHint')}</p>`;

        return `
            ${this.styleHtml()}
            <div class="ecorsi-wrap">
                <div class="ecorsi-heading">${heading}</div>
                <div class="ecorsi-board ${responseMode ? 'ecorsi-response' : 'ecorsi-presentation'}"
                    role="group" aria-label="${this.t('boardLabel')}">
                    ${blocks}
                </div>
                ${controls}
            </div>
        `;
    },

    styleHtml() {
        return `
            <style>
                .ecorsi-wrap { width:100%; max-width:780px; display:flex; flex-direction:column; align-items:center; gap:14px; }
                .ecorsi-heading { min-height:1.7em; color:#334155; font-size:1rem; font-weight:700; text-align:center; }
                .ecorsi-board { position:relative; width:min(92vw, 720px); aspect-ratio:1.43 / 1; background:#070b11; border:2px solid #334155; border-radius:12px; box-shadow:inset 0 1px 12px rgba(0,0,0,.45); touch-action:manipulation; user-select:none; }
                .ecorsi-block { position:absolute; width:clamp(44px, 8vw, 66px); height:clamp(44px, 8vw, 66px); transform:translate(-50%, -50%); border:3px solid #facc15; border-radius:7px; background:#111827; box-shadow:0 3px 7px rgba(0,0,0,.42); padding:0; }
                .ecorsi-block.is-active { background:#facc15; border-color:#a16207; box-shadow:0 0 0 7px rgba(250,204,21,.23), 0 5px 12px rgba(15,23,42,.25); }
                .ecorsi-response .ecorsi-block { cursor:pointer; }
                .ecorsi-response .ecorsi-block:hover:not(:disabled), .ecorsi-response .ecorsi-block:focus-visible { border-color:#2563eb; outline:3px solid rgba(37,99,235,.28); outline-offset:3px; }
                .ecorsi-response .ecorsi-block.is-tapped { background:#60a5fa; border-color:#1d4ed8; }
                .ecorsi-response .ecorsi-block:disabled { cursor:default; opacity:.82; }
                .ecorsi-response-status { min-height:1.5em; color:#1e293b; font-weight:700; }
                .ecorsi-controls { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
                .ecorsi-secondary { color:#1e293b; background:#e2e8f0; border:1px solid #cbd5e1; box-shadow:none; }
                .ecorsi-controls .btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
                .ecorsi-key-hint, .ecorsi-watch-hint { color:#64748b; font-size:.84rem; text-align:center; margin:0; }
                .ecorsi-cue { display:flex; flex-direction:column; gap:10px; color:#64748b; font-size:1.05rem; }
                .ecorsi-cue strong { color:#1e293b; font-size:1.35rem; }
                .ecorsi-cue span { font-size:.92rem; }
                .ecorsi-recorded { color:#475569; font-size:1.2rem; font-weight:700; }
                @media (max-width:560px) {
                    .ecorsi-board { width:100%; border-radius:8px; }
                    .ecorsi-block { width:42px; height:42px; }
                    .ecorsi-heading { padding:0 12px; font-size:.9rem; }
                }
                @media (prefers-reduced-motion:reduce) {
                    .ecorsi-block, .ecorsi-controls .btn { transition:none !important; }
                }
            </style>
        `;
    },

    sequencesEqual(a, b) {
        return a.length === b.length && a.every((value, index) => value === b[index]);
    },

    round1(value) {
        return Math.round(value * 10) / 10;
    },

    showBankError() {
        if (typeof App.updateTestStatus === 'function') App.updateTestStatus(this.t('statusBankError'));
        App.getTestContent().innerHTML = `
            <div class="instructions">
                <h2>${this.t('bankErrorHeading')}</h2>
                <p>${this.t('bankErrorBody')}</p>
            </div>
        `;
    },

    endTest() {
        if (this._ended) return;
        this._ended = true;
        this.cleanupResponseHandler();

        const forward = this.conditionSummaries.forward || {
            block_span: 0,
            correct_trial_count: 0,
            total_score: 0,
            levels_administered: '',
        };
        const backward = this.conditionSummaries.backward || {
            block_span: 0,
            correct_trial_count: 0,
            total_score: 0,
            levels_administered: '',
        };

        const result = {
            // The combined value is only the summary-table display score. The
            // condition-specific fields below are the intended analysis scores.
            score: forward.block_span + backward.block_span,
            detail: this.t('resultDetail', {
                forwardSpan: forward.block_span,
                forwardTotal: forward.total_score,
                backwardSpan: backward.block_span,
                backwardTotal: backward.total_score,
            }),
            score_definition: 'display only: forward_block_span + backward_block_span; analyse conditions separately',
            task_version: this.TASK_VERSION,
            scoring_version: this.SCORING_VERSION,
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            stimulus_version: this.STIMULUS_BANK_VERSION,
            stimulus_form: this.stimulusForm,
            task_seed: this.taskSeed,
            condition_order_group: this.conditionOrderGroup,
            condition_order: this.conditionOrder.join(';'),
            forward_span: forward.block_span,
            backward_span: backward.block_span,
            combined_span: forward.block_span + backward.block_span,
            forward_correct_trials: forward.correct_trial_count,
            backward_correct_trials: backward.correct_trial_count,
            forward_span_x_correct_trials: forward.total_score,
            backward_span_x_correct_trials: backward.total_score,
            forward_block_span: forward.block_span,
            forward_correct_trial_count: forward.correct_trial_count,
            forward_total_score: forward.total_score,
            forward_levels_administered: forward.levels_administered,
            backward_block_span: backward.block_span,
            backward_correct_trial_count: backward.correct_trial_count,
            backward_total_score: backward.total_score,
            backward_levels_administered: backward.levels_administered,
            total_scored_trials: this.scoredTrialCounter,
            practiceAttempts: 1,
            practice_trial_count: this.PRACTICE_TRIALS * 2,
            testDurationMs: this.testStartTime == null
                ? 0
                : Math.round(performance.now() - this.testStartTime),
            timeoutCount: 0,
        };

        App.onTestComplete('ecorsi', result, this.trials);
    },
};

if (!App.testRegistry.ecorsi) {
    App.testRegistry.ecorsi = {
        name: 'eCorsi ブロック課題',
        domain: '視空間ワーキングメモリ',
        module: null,
    };
}
App.testRegistry.ecorsi.module = ECorsiTest;
App.testRegistry.ecorsi.nameKey = 'ecorsi.name';
App.testRegistry.ecorsi.domainKey = 'ecorsi.domain';
