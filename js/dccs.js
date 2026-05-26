// ==================== Dimensional Change Card Sort (DCCS) Test ====================

const DCCSTest = {
    PRACTICE_TRIALS: 5,
    PRACTICE_PASS: 4,
    MAX_PRACTICE_SETS: 3,
    MIXED_TRIALS: 30,
    DOMINANT_COUNT: 24,
    NON_DOMINANT_COUNT: 6,
    RULE_DISPLAY_MS: 1000,
    PRACTICE_ITI_MS: 1000,
    MAX_RT_MS: 10000,
    PRE_POST_AUTO_POINTS: 10, // 5 + 5 for adults

    // Bivalent card stimulus sets. Each set is self-consistent:
    //   - 2 target cards that differ on BOTH color and shape.
    //   - 2 test cards, each sharing color with one target and shape with the other.
    // One set is randomly selected per session to avoid long-term memorization.
    CARD_SETS: [
        {
            id: 'blue-star_red-circle',
            targets: [
                { color: '#3498db', shape: 'star', label: '青い星' },
                { color: '#e74c3c', shape: 'circle', label: '赤い丸' },
            ],
            testCards: [
                { color: '#e74c3c', shape: 'star', colorMatch: 1, shapeMatch: 0 },
                { color: '#3498db', shape: 'circle', colorMatch: 0, shapeMatch: 1 },
            ],
        },
        {
            id: 'green-triangle_yellow-square',
            targets: [
                { color: '#2ecc71', shape: 'triangle', label: '緑の三角' },
                { color: '#f1c40f', shape: 'square', label: '黄色の四角' },
            ],
            testCards: [
                { color: '#f1c40f', shape: 'triangle', colorMatch: 1, shapeMatch: 0 },
                { color: '#2ecc71', shape: 'square', colorMatch: 0, shapeMatch: 1 },
            ],
        },
        {
            id: 'purple-star_orange-triangle',
            targets: [
                { color: '#9b59b6', shape: 'star', label: '紫の星' },
                { color: '#e67e22', shape: 'triangle', label: 'オレンジの三角' },
            ],
            testCards: [
                { color: '#e67e22', shape: 'star', colorMatch: 1, shapeMatch: 0 },
                { color: '#9b59b6', shape: 'triangle', colorMatch: 0, shapeMatch: 1 },
            ],
        },
    ],

    TARGETS: null,
    TEST_CARDS: null,
    activeSetId: null,

    trials: [],
    currentTrial: 0,
    isPractice: false,
    practiceAttempt: 0,
    dominantDimension: 'color', // or 'shape'
    stimulusOnset: 0,
    keyHandler: null,
    responded: false,

    run() {
        this.trials = [];
        this.currentTrial = 0;
        this.practiceAttempt = 0;
        this.dominantDimension = App.random() < 0.5 ? 'color' : 'shape';

        const setIdx = Math.floor(App.random() * this.CARD_SETS.length);
        const chosen = this.CARD_SETS[setIdx];
        this.activeSetId = chosen.id;
        this.TARGETS = chosen.targets;
        this.TEST_CARDS = chosen.testCards;

        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>カード分類課題</h2>
                <p>画面上部に2枚のカードが表示されています。</p>
                <p>画面中央にカードが1枚表示されるので、指示されたルール（<strong>色</strong>または<strong>形</strong>）に従って、上のどちらのカードに合うか選んでください。</p>
                <p>左のカードに合う場合: <span class="key-hint">F キー</span></p>
                <p>右のカードに合う場合: <span class="key-hint">J キー</span></p>
                <p>ルールは途中で変わることがあります。画面に表示されるルールをよく見てください。</p>
                <p>まず練習から始めます。</p>
                <button class="btn btn-primary" id="btn-dccs-start">開始</button>
            </div>
        `;
        document.getElementById('btn-dccs-start').addEventListener('click', () => this.startPractice());
    },

    drawShape(container, color, shape, size) {
        const el = document.createElement('div');
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 100 100');

        let shapeEl;
        if (shape === 'star') {
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            // 5-pointed star
            const points = [];
            for (let i = 0; i < 10; i++) {
                const angle = (i * 36 - 90) * Math.PI / 180;
                const r = i % 2 === 0 ? 45 : 20;
                points.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`);
            }
            shapeEl.setAttribute('points', points.join(' '));
        } else if (shape === 'circle') {
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shapeEl.setAttribute('cx', '50');
            shapeEl.setAttribute('cy', '50');
            shapeEl.setAttribute('r', '40');
        } else if (shape === 'square') {
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapeEl.setAttribute('x', '10');
            shapeEl.setAttribute('y', '10');
            shapeEl.setAttribute('width', '80');
            shapeEl.setAttribute('height', '80');
        } else if (shape === 'triangle') {
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shapeEl.setAttribute('points', '50,10 90,90 10,90');
        }

        shapeEl.setAttribute('fill', color);
        svg.appendChild(shapeEl);
        el.appendChild(svg);
        container.appendChild(el);
        return el;
    },

    generateMixedTrials() {
        const trials = [];
        const nonDom = this.dominantDimension === 'color' ? 'shape' : 'color';

        for (let i = 0; i < this.DOMINANT_COUNT; i++) {
            const cardIdx = Math.floor(App.random() * this.TEST_CARDS.length);
            trials.push({ dimension: this.dominantDimension, cardIndex: cardIdx });
        }
        for (let i = 0; i < this.NON_DOMINANT_COUNT; i++) {
            const cardIdx = Math.floor(App.random() * this.TEST_CARDS.length);
            trials.push({ dimension: nonDom, cardIndex: cardIdx });
        }

        // Shuffle with constraint: no more than 3 consecutive same-dimension trials
        let shuffled = App.shuffle(trials);
        // Simple re-shuffle if constraint violated (try a few times)
        for (let attempt = 0; attempt < 10; attempt++) {
            let valid = true;
            for (let i = 2; i < shuffled.length; i++) {
                if (shuffled[i].dimension === shuffled[i-1].dimension &&
                    shuffled[i].dimension === shuffled[i-2].dimension &&
                    i >= 3 && shuffled[i].dimension === shuffled[i-3].dimension) {
                    valid = false;
                    break;
                }
            }
            if (valid) break;
            shuffled = App.shuffle(trials);
        }

        return shuffled;
    },

    getRandomITI() {
        return App.random() < 0.5 ? 300 : 1000;
    },

    getCorrectSide(dimension, cardIndex) {
        const card = this.TEST_CARDS[cardIndex];
        if (dimension === 'color') {
            return card.colorMatch; // 0=left (blue star), 1=right (red circle)
        } else {
            return card.shapeMatch; // 0=left (star), 1=right (circle)
        }
    },

    startPractice() {
        this.isPractice = true;
        this.practiceAttempt++;
        this.currentTrial = 0;
        this.practiceCorrect = 0;

        // Practice uses alternating color/shape rules (5 trials)
        this.practiceTrials = [];
        const dims = ['color', 'shape', 'color', 'shape', 'color'];
        for (let i = 0; i < this.PRACTICE_TRIALS; i++) {
            const cardIdx = Math.floor(App.random() * this.TEST_CARDS.length);
            this.practiceTrials.push({ dimension: dims[i], cardIndex: cardIdx });
        }
        this.runTrial();
    },

    startTest() {
        this.isPractice = false;
        this.currentTrial = 0;
        this.trials = [];
        this.testStartTime = performance.now();
        this.mixedTrialList = this.generateMixedTrials();
        this.runTrial();
    },

    async runTrial() {
        const content = App.getTestContent();
        const trialList = this.isPractice ? this.practiceTrials : this.mixedTrialList;
        const totalTrials = this.isPractice ? this.PRACTICE_TRIALS : this.MIXED_TRIALS;

        if (this.currentTrial >= totalTrials) {
            if (this.isPractice) {
                this.endPractice();
            } else {
                this.endTest();
            }
            return;
        }

        const trial = trialList[this.currentTrial];
        const card = this.TEST_CARDS[trial.cardIndex];
        const ruleText = trial.dimension === 'color' ? '色' : '形';

        const progressHtml = this.isPractice
            ? App.practiceProgressHtml(this.currentTrial, this.PRACTICE_TRIALS)
            : App.mainTrialProgressHtml(this.currentTrial, this.MIXED_TRIALS);

        // Show rule
        content.innerHTML = `${progressHtml}<div class="dccs-rule">${ruleText}</div>`;
        await App.wait(this.RULE_DISPLAY_MS);

        // Show targets and test card
        const correctSide = this.getCorrectSide(trial.dimension, trial.cardIndex);
        const keyGuide = this.isPractice ? '<div class="flanker-key-guide" style="margin-top:12px;"><span>F ← 左</span><span>右 → J</span></div>' : '';

        content.innerHTML = `
            ${progressHtml}
            <div class="dccs-rule" aria-live="polite">${ruleText}</div>
            <div class="dccs-targets">
                <div class="dccs-card" id="dccs-left" data-side="0" role="button" aria-label="左のカード"></div>
                <div class="dccs-card" id="dccs-right" data-side="1" role="button" aria-label="右のカード"></div>
            </div>
            <div class="dccs-test-card" id="dccs-test"></div>
            ${keyGuide}
        `;

        // Draw target shapes
        this.drawShape(document.getElementById('dccs-left'), this.TARGETS[0].color, this.TARGETS[0].shape, 60);
        this.drawShape(document.getElementById('dccs-right'), this.TARGETS[1].color, this.TARGETS[1].shape, 60);

        // Draw test card shape
        this.drawShape(document.getElementById('dccs-test'), card.color, card.shape, 80);

        this.stimulusOnset = await App.waitForStimulusOnset();
        this.stimulusOnsetSessionMs = App.sessionElapsedMs(this.stimulusOnset);
        this.responded = false;

        // Click handlers for cards
        document.getElementById('dccs-left').addEventListener('click', (e) => this.handleCardClick(0, trial, correctSide, e));
        document.getElementById('dccs-right').addEventListener('click', (e) => this.handleCardClick(1, trial, correctSide, e));

        // Keyboard handler
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        this.keyHandler = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'f') { e.preventDefault(); this.handleCardClick(0, trial, correctSide, e); }
            if (key === 'j') { e.preventDefault(); this.handleCardClick(1, trial, correctSide, e); }
        };
        document.addEventListener('keydown', this.keyHandler);

        // Timeout
        this.responseTimeout = setTimeout(() => {
            if (!this.responded) {
                this.responded = true;
                if (this.keyHandler) {
                    document.removeEventListener('keydown', this.keyHandler);
                    this.keyHandler = null;
                }
                this.processResponse(trial, -1, correctSide, false, this.MAX_RT_MS, performance.now());
            }
        }, this.MAX_RT_MS);
    },

    handleCardClick(side, trial, correctSide, event) {
        if (this.responded) return;
        this.responded = true;

        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        clearTimeout(this.responseTimeout);

        const tResponse = event ? App.eventTime(event) : performance.now();
        const rt = tResponse - this.stimulusOnset;
        const correct = side === correctSide;

        this.processResponse(trial, side, correctSide, correct, rt, tResponse);
    },

    async processResponse(trial, side, correctSide, correct, rt, tResponse) {
        if (this.isPractice) {
            if (correct) this.practiceCorrect++;
            const content = App.getTestContent();
            content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}" role="status" aria-live="assertive">${correct ? '正解' : '不正解'}</div>`;
            await App.wait(800);
        } else {
            this.trials.push({
                trialNum: this.currentTrial + 1,
                setId: this.activeSetId,
                dimension: trial.dimension,
                cardIndex: trial.cardIndex,
                correctSide: correctSide,
                response: side,
                correct: correct ? 1 : 0,
                rt: Math.round(rt),
                isDominant: trial.dimension === this.dominantDimension ? 1 : 0,
                tOnset: this.stimulusOnsetSessionMs,
                tResponse: App.sessionElapsedMs(tResponse),
            });
        }

        this.currentTrial++;
        const iti = this.isPractice ? this.PRACTICE_ITI_MS : this.getRandomITI();
        await App.wait(iti);
        this.runTrial();
    },

    endPractice() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        const content = App.getTestContent();

        if (this.practiceCorrect >= this.PRACTICE_PASS) {
            content.innerHTML = `
                <div class="instructions">
                    <h2>練習完了</h2>
                    <p>練習の結果: ${this.practiceCorrect} / ${this.PRACTICE_TRIALS} 正解</p>
                    <p>本番では、ルールが「色」と「形」の間で切り替わります。画面のルール表示に注意してください。</p>
                    <p style="color:#888;">※ 本番では正誤のフィードバックは表示されません。</p>
                    <button class="btn btn-primary" id="btn-dccs-test">本番開始</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-dccs-test', () => this.startTest());
        } else if (this.practiceAttempt < this.MAX_PRACTICE_SETS) {
            content.innerHTML = `
                <div class="instructions">
                    <h2>もう一度練習しましょう</h2>
                    <p>結果: ${this.practiceCorrect} / ${this.PRACTICE_TRIALS} 正解（${this.PRACTICE_PASS}問以上で通過）</p>
                    <p>画面上部のルール（色 or 形）に従って分類してください。</p>
                    <button class="btn btn-primary" id="btn-dccs-retry">再練習</button>
                </div>
            `;
            document.getElementById('btn-dccs-retry').addEventListener('click', () => this.startPractice());
        } else {
            content.innerHTML = `
                <div class="instructions">
                    <h2>練習終了</h2>
                    <p>本番に進みます。</p>
                    <p style="color:#888;">※ 本番では正誤のフィードバックは表示されません。</p>
                    <button class="btn btn-primary" id="btn-dccs-test">本番開始</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-dccs-test', () => this.startTest());
        }
    },

    endTest() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        // Scoring: pre/post auto 10 points + mixed block correct
        const mixedCorrect = this.trials.filter(t => t.correct).length;
        const totalPoints = this.PRE_POST_AUTO_POINTS + mixedCorrect; // out of 40
        const accuracy = totalPoints / 40;

        // RT from correct non-dominant trials
        const nonDomCorrectRTs = this.trials
            .filter(t => !t.isDominant && t.correct && t.rt >= 100)
            .map(t => t.rt);

        const saa = App.computeSAAScore(accuracy, nonDomCorrectRTs);
        const timeoutCount = this.trials.filter(t => t.response === -1).length;

        const result = {
            score: saa.total,
            detail: `正答率: ${(accuracy * 100).toFixed(1)}%`,
            accuracy: parseFloat((accuracy * 100).toFixed(1)),
            accScore: saa.accScore,
            rtScore: saa.rtScore,
            mixedCorrect: mixedCorrect,
            dominantDimension: this.dominantDimension,
            setId: this.activeSetId,
            practiceAttempts: this.practiceAttempt,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: timeoutCount,
        };

        App.onTestComplete('dccs', result, this.trials);
    },
};

App.testRegistry['dccs'].module = DCCSTest;
