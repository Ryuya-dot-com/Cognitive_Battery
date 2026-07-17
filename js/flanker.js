// ==================== Flanker Inhibitory Control and Attention Test ====================

I18n.register('flanker', {
    ja: {
        name: 'フランカー課題',
        domain: '抑制制御・注意',
        statusInstructions: '課題説明',
        statusPractice: '練習',
        statusTest: '本番',
        title: 'フランカー課題',
        introArrows: '画面の中央に5つの矢印が表示されます。',
        introFocus: '<strong>真ん中の矢印の向き</strong>に注目し、できるだけ速く正確に回答してください。',
        introLeft: '真ん中の矢印が左 (←) を向いている場合:<br><span class="key-hint">F キー</span> を押してください。',
        introRight: '真ん中の矢印が右 (→) を向いている場合:<br><span class="key-hint">J キー</span> を押してください。',
        exampleIncongruent: '例: ←←→←← → 正解は <span class="key-hint">J</span>',
        exampleCongruent: '例: →→→→→ → 正解は <span class="key-hint">J</span>',
        practiceFirst: 'まず練習から始めます。',
        start: '開始',
        keyGuideLeft: 'F ← 左',
        keyGuideRight: '右 → J',
        correct: '正解',
        incorrect: '不正解',
        practiceComplete: '練習完了',
        practiceResult: '練習の結果: {correct} / {total} 正解',
        testPrompt: '本番を開始します。できるだけ速く正確に回答してください。',
        noFeedback: '※ 本番では正誤のフィードバックは表示されません。',
        startTest: '本番開始',
        practiceAgain: 'もう一度練習しましょう',
        practiceRetryResult: '結果: {correct} / {total} 正解（{pass}問以上で通過）',
        focusReminder: '真ん中の矢印の向きに注目してください。',
        retryPractice: '再練習',
        practiceEnded: '練習終了',
        proceedToTest: '本番に進みます。真ん中の矢印の向きに注目してください。',
        resultDetail: '正答率: {accuracy}%',
    },
    en: {
        name: 'Flanker Task',
        domain: 'Inhibitory Control and Attention',
        statusInstructions: 'Instructions',
        statusPractice: 'Practice',
        statusTest: 'Test',
        title: 'Flanker Task',
        introArrows: 'Five arrows will appear in the center of the screen.',
        introFocus: 'Focus on the <strong>direction of the middle arrow</strong> and respond as quickly and accurately as you can.',
        introLeft: 'If the middle arrow points left (←), press the <span class="key-hint">F key</span>.',
        introRight: 'If the middle arrow points right (→), press the <span class="key-hint">J key</span>.',
        exampleIncongruent: 'Example: ←←→←← → Correct answer: <span class="key-hint">J</span>',
        exampleCongruent: 'Example: →→→→→ → Correct answer: <span class="key-hint">J</span>',
        practiceFirst: 'You will begin with practice.',
        start: 'Start',
        keyGuideLeft: 'F ← Left',
        keyGuideRight: 'Right → J',
        correct: 'Correct',
        incorrect: 'Incorrect',
        practiceComplete: 'Practice Complete',
        practiceResult: 'Practice result: {correct} / {total} correct',
        testPrompt: 'The test will now begin. Respond as quickly and accurately as you can.',
        noFeedback: 'Correctness feedback will not be shown during the test.',
        startTest: 'Start Test',
        practiceAgain: "Let's Practice Again",
        practiceRetryResult: 'Result: {correct} / {total} correct (at least {pass} required to pass)',
        focusReminder: 'Focus on the direction of the middle arrow.',
        retryPractice: 'Practice Again',
        practiceEnded: 'Practice Finished',
        proceedToTest: 'You will now proceed to the test. Focus on the direction of the middle arrow.',
        resultDetail: 'Accuracy: {accuracy}%',
    },
});

const FlankerTest = {
    PRACTICE_TRIALS: 5,
    PRACTICE_PASS: 4,
    MAX_PRACTICE_SETS: 3,
    TEST_TRIALS: 30,
    CONGRUENT_COUNT: 10,
    INCONGRUENT_COUNT: 20,
    FIXATION_MS: 300,
    BLANK_MS: 800,
    MAX_RT_MS: 10000,

    trials: [],
    currentTrial: 0,
    isPractice: false,
    practiceAttempt: 0,
    stimulusOnset: 0,
    keyHandler: null,

    t(key, params) {
        return App.t(`flanker.${key}`, params);
    },

    updateStatus(key) {
        if (typeof App.updateTestStatus === 'function') App.updateTestStatus(this.t(key));
    },

    run() {
        this.trials = [];
        this.currentTrial = 0;
        this.practiceAttempt = 0;
        this.showInstructions();
    },

    showInstructions() {
        this.updateStatus('statusInstructions');
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('title')}</h2>
                <p>${this.t('introArrows')}</p>
                <p>${this.t('introFocus')}</p>
                <p>${this.t('introLeft')}</p>
                <p>${this.t('introRight')}</p>
                <p style="color:#888;">${this.t('exampleIncongruent')}</p>
                <p style="color:#888;">${this.t('exampleCongruent')}</p>
                <p>${this.t('practiceFirst')}</p>
                <button class="btn btn-primary" id="btn-flanker-start">${this.t('start')}</button>
            </div>
        `;
        document.getElementById('btn-flanker-start').addEventListener('click', () => this.startPractice());
    },

    generateTrialList(congruent, incongruent) {
        const list = [];
        for (let i = 0; i < congruent; i++) {
            const dir = App.random() < 0.5 ? 'left' : 'right';
            list.push({ type: 'congruent', direction: dir });
        }
        for (let i = 0; i < incongruent; i++) {
            const dir = App.random() < 0.5 ? 'left' : 'right';
            list.push({ type: 'incongruent', direction: dir });
        }
        return App.shuffle(list);
    },

    getRandomITI() {
        return App.random() < 0.5 ? 300 : 1000;
    },

    getStimulusText(trial) {
        const center = trial.direction === 'left' ? '←' : '→';
        if (trial.type === 'congruent') {
            return `${center}${center}${center}${center}${center}`;
        } else {
            const flanker = trial.direction === 'left' ? '→' : '←';
            return `${flanker}${flanker}${center}${flanker}${flanker}`;
        }
    },

    startPractice() {
        this.updateStatus('statusPractice');
        this.isPractice = true;
        this.practiceAttempt++;
        this.currentTrial = 0;
        this.practiceTrials = this.generateTrialList(3, 2);
        this.practiceCorrect = 0;
        this.runTrial();
    },

    startTest() {
        this.updateStatus('statusTest');
        this.isPractice = false;
        this.currentTrial = 0;
        this.trials = [];
        this.testStartTime = performance.now();
        this.testTrialList = this.generateTrialList(this.CONGRUENT_COUNT, this.INCONGRUENT_COUNT);
        this.runTrial();
    },

    async runTrial() {
        const content = App.getTestContent();
        const trialList = this.isPractice ? this.practiceTrials : this.testTrialList;
        const totalTrials = this.isPractice ? this.PRACTICE_TRIALS : this.TEST_TRIALS;

        if (this.currentTrial >= totalTrials) {
            if (this.isPractice) {
                this.endPractice();
            } else {
                this.endTest();
            }
            return;
        }

        const trial = trialList[this.currentTrial];

        const progressHtml = this.isPractice
            ? App.practiceProgressHtml(this.currentTrial, this.PRACTICE_TRIALS)
            : App.mainTrialProgressHtml(this.currentTrial, this.TEST_TRIALS);

        // Fixation
        content.innerHTML = `${progressHtml}<div class="fixation">+</div>`;
        await App.wait(this.FIXATION_MS);

        // Blank screen
        content.innerHTML = `${progressHtml}<div class="fixation">&nbsp;</div>`;
        await App.wait(this.BLANK_MS);

        // Stimulus
        const stimText = this.getStimulusText(trial);
        const keyGuide = this.isPractice
            ? `<div class="flanker-key-guide"><span>${this.t('keyGuideLeft')}</span><span>${this.t('keyGuideRight')}</span></div>`
            : '';
        content.innerHTML = `${progressHtml}<div class="flanker-stimulus" aria-live="polite">${stimText}</div>${keyGuide}`;
        this.stimulusOnset = await App.waitForStimulusOnset();
        this.stimulusOnsetSessionMs = App.sessionElapsedMs(this.stimulusOnset);

        // Listen for response
        this.listenForResponse(trial);
    },

    listenForResponse(trial) {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }

        this.keyHandler = (e) => {
            const key = e.key.toLowerCase();
            if (key !== 'f' && key !== 'j') return;
            e.preventDefault();

            const tResponse = App.eventTime(e);
            const rt = tResponse - this.stimulusOnset;
            if (rt > this.MAX_RT_MS) return;

            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
            clearTimeout(this.responseTimeout);

            const response = key === 'f' ? 'left' : 'right';
            const correct = response === trial.direction;

            this.handleResponse(trial, response, correct, rt, tResponse);
        };

        document.addEventListener('keydown', this.keyHandler);

        // Timeout
        this.responseTimeout = setTimeout(() => {
            if (this.keyHandler) {
                document.removeEventListener('keydown', this.keyHandler);
                this.keyHandler = null;
                this.handleResponse(trial, 'timeout', false, this.MAX_RT_MS, performance.now());
            }
        }, this.MAX_RT_MS);
    },

    async handleResponse(trial, response, correct, rt, tResponse) {
        if (this.isPractice) {
            if (correct) this.practiceCorrect++;
            // Show feedback for practice
            const content = App.getTestContent();
            content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}" role="status" aria-live="assertive">${this.t(correct ? 'correct' : 'incorrect')}</div>`;
            await App.wait(800);
        } else {
            this.trials.push({
                trialNum: this.currentTrial + 1,
                type: trial.type,
                direction: trial.direction,
                response: response,
                correct: correct ? 1 : 0,
                rt: Math.round(rt),
                tOnset: this.stimulusOnsetSessionMs,
                tResponse: App.sessionElapsedMs(tResponse),
            });
        }

        this.currentTrial++;
        await App.wait(this.getRandomITI());
        this.runTrial();
    },

    endPractice() {
        const content = App.getTestContent();

        if (this.practiceCorrect >= this.PRACTICE_PASS) {
            content.innerHTML = `
                <div class="instructions">
                    <h2>${this.t('practiceComplete')}</h2>
                    <p>${this.t('practiceResult', { correct: this.practiceCorrect, total: this.PRACTICE_TRIALS })}</p>
                    <p>${this.t('testPrompt')}</p>
                    <p style="color:#888;">${this.t('noFeedback')}</p>
                    <button class="btn btn-primary" id="btn-flanker-test">${this.t('startTest')}</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-flanker-test', () => this.startTest());
        } else if (this.practiceAttempt < this.MAX_PRACTICE_SETS) {
            content.innerHTML = `
                <div class="instructions">
                    <h2>${this.t('practiceAgain')}</h2>
                    <p>${this.t('practiceRetryResult', { correct: this.practiceCorrect, total: this.PRACTICE_TRIALS, pass: this.PRACTICE_PASS })}</p>
                    <p>${this.t('focusReminder')}</p>
                    <button class="btn btn-primary" id="btn-flanker-retry">${this.t('retryPractice')}</button>
                </div>
            `;
            document.getElementById('btn-flanker-retry').addEventListener('click', () => this.startPractice());
        } else {
            content.innerHTML = `
                <div class="instructions">
                    <h2>${this.t('practiceEnded')}</h2>
                    <p>${this.t('proceedToTest')}</p>
                    <p style="color:#888;">${this.t('noFeedback')}</p>
                    <button class="btn btn-primary" id="btn-flanker-test">${this.t('startTest')}</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-flanker-test', () => this.startTest());
        }
    },

    endTest() {
        // Clean up
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        // Calculate score
        const totalCorrect = this.trials.filter(t => t.correct).length;
        const accuracy = totalCorrect / this.trials.length;

        // Get RTs from correct incongruent trials
        const incongruentCorrectRTs = this.trials
            .filter(t => t.type === 'incongruent' && t.correct && t.rt >= 100)
            .map(t => t.rt);

        const saa = App.computeSAAScore(accuracy, incongruentCorrectRTs);

        const timeoutCount = this.trials.filter(t => t.response === 'timeout').length;

        const result = {
            score: saa.total,
            detail: this.t('resultDetail', { accuracy: (accuracy * 100).toFixed(1) }),
            accuracy: parseFloat((accuracy * 100).toFixed(1)),
            accScore: saa.accScore,
            rtScore: saa.rtScore,
            totalCorrect: totalCorrect,
            totalTrials: this.trials.length,
            practiceAttempts: this.practiceAttempt,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: timeoutCount,
        };

        App.onTestComplete('flanker', result, this.trials);
    },
};

// Register with App
if (!App.testRegistry.flanker) {
    App.testRegistry.flanker = {
        name: 'フランカー課題',
        domain: '抑制制御・注意',
        module: null,
    };
}
App.testRegistry.flanker.nameKey = 'flanker.name';
App.testRegistry.flanker.domainKey = 'flanker.domain';
App.testRegistry.flanker.module = FlankerTest;
