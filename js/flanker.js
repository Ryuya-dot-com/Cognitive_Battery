// ==================== Flanker Inhibitory Control and Attention Test ====================

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

    run() {
        this.trials = [];
        this.currentTrial = 0;
        this.practiceAttempt = 0;
        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>フランカー課題</h2>
                <p>画面の中央に5つの矢印が表示されます。</p>
                <p><strong>真ん中の矢印の向き</strong>に注目し、できるだけ速く正確に回答してください。</p>
                <p>真ん中の矢印が左 (←) を向いている場合:<br>
                   <span class="key-hint">F キー</span> を押してください。</p>
                <p>真ん中の矢印が右 (→) を向いている場合:<br>
                   <span class="key-hint">J キー</span> を押してください。</p>
                <p style="color:#888;">例: ←←→←← → 正解は <span class="key-hint">J</span></p>
                <p style="color:#888;">例: →→→→→ → 正解は <span class="key-hint">J</span></p>
                <p>まず練習から始めます。</p>
                <button class="btn btn-primary" id="btn-flanker-start">開始</button>
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
        this.isPractice = true;
        this.practiceAttempt++;
        this.currentTrial = 0;
        this.practiceTrials = this.generateTrialList(3, 2);
        this.practiceCorrect = 0;
        this.runTrial();
    },

    startTest() {
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
        const keyGuide = this.isPractice ? '<div class="flanker-key-guide"><span>F ← 左</span><span>右 → J</span></div>' : '';
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
            content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}" role="status" aria-live="assertive">${correct ? '正解' : '不正解'}</div>`;
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
                    <h2>練習完了</h2>
                    <p>練習の結果: ${this.practiceCorrect} / ${this.PRACTICE_TRIALS} 正解</p>
                    <p>本番を開始します。できるだけ速く正確に回答してください。</p>
                    <p style="color:#888;">※ 本番では正誤のフィードバックは表示されません。</p>
                    <button class="btn btn-primary" id="btn-flanker-test">本番開始</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-flanker-test', () => this.startTest());
        } else if (this.practiceAttempt < this.MAX_PRACTICE_SETS) {
            content.innerHTML = `
                <div class="instructions">
                    <h2>もう一度練習しましょう</h2>
                    <p>結果: ${this.practiceCorrect} / ${this.PRACTICE_TRIALS} 正解（${this.PRACTICE_PASS}問以上で通過）</p>
                    <p>真ん中の矢印の向きに注目してください。</p>
                    <button class="btn btn-primary" id="btn-flanker-retry">再練習</button>
                </div>
            `;
            document.getElementById('btn-flanker-retry').addEventListener('click', () => this.startPractice());
        } else {
            content.innerHTML = `
                <div class="instructions">
                    <h2>練習終了</h2>
                    <p>本番に進みます。真ん中の矢印の向きに注目してください。</p>
                    <p style="color:#888;">※ 本番では正誤のフィードバックは表示されません。</p>
                    <button class="btn btn-primary" id="btn-flanker-test">本番開始</button>
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
            detail: `正答率: ${(accuracy * 100).toFixed(1)}%`,
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
App.testRegistry['flanker'].module = FlankerTest;
