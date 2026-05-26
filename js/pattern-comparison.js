// ==================== Pattern Comparison Processing Speed Test ====================

const PatternComparisonTest = {
    PRACTICE_TRIALS: 6,
    TIME_LIMIT_MS: 80000,
    MAX_ITEMS: 130,
    ITI_MS: 300,
    CANVAS_SIZE: 150,
    GRID: 3,

    trials: [],
    currentTrial: 0,
    isPractice: false,
    timerStart: 0,
    timerInterval: null,
    totalCorrect: 0,
    patternPool: [],
    responded: false,
    testEnded: false,

    // Shape types and colors
    SHAPES: ['circle', 'square', 'triangle', 'diamond', 'cross'],
    COLORS: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],

    run() {
        this.trials = [];
        this.currentTrial = 0;
        this.totalCorrect = 0;
        this.testEnded = false;
        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>パターン比較課題</h2>
                <p>2つの図形パターンが左右に表示されます。</p>
                <p>2つのパターンが<strong>同じ</strong>か<strong>違う</strong>かを、できるだけ速く判断してください。</p>
                <p>同じ場合: <span class="key-hint">F キー</span> または「同じ」ボタン</p>
                <p>違う場合: <span class="key-hint">J キー</span> または「違う」ボタン</p>
                <p>制限時間は <strong>80秒</strong> です。時間内にできるだけ多くの問題に正確に答えてください。</p>
                <p>まず練習から始めます（練習は時間制限なし）。</p>
                <button class="btn btn-primary" id="btn-pc-start">開始</button>
            </div>
        `;
        document.getElementById('btn-pc-start').addEventListener('click', () => this.startPractice());
    },

    generatePattern() {
        const cells = [];
        const numShapes = 3 + Math.floor(App.random() * 3); // 3-5 shapes
        const usedPositions = new Set();

        for (let i = 0; i < numShapes; i++) {
            let pos;
            do {
                pos = Math.floor(App.random() * (this.GRID * this.GRID));
            } while (usedPositions.has(pos));
            usedPositions.add(pos);

            cells.push({
                row: Math.floor(pos / this.GRID),
                col: pos % this.GRID,
                shape: this.SHAPES[Math.floor(App.random() * this.SHAPES.length)],
                color: this.COLORS[Math.floor(App.random() * this.COLORS.length)],
            });
        }
        return cells;
    },

    clonePattern(pattern) {
        return pattern.map(c => ({ ...c }));
    },

    makeDifferent(pattern) {
        const diff = this.clonePattern(pattern);
        const changeType = App.random() < 0.5 ? 'color' : 'element';

        if (changeType === 'color') {
            const idx = Math.floor(App.random() * diff.length);
            let newColor;
            do {
                newColor = this.COLORS[Math.floor(App.random() * this.COLORS.length)];
            } while (newColor === diff[idx].color);
            diff[idx].color = newColor;
        } else {
            if (App.random() < 0.5 && diff.length > 2) {
                // Remove an element
                diff.splice(Math.floor(App.random() * diff.length), 1);
            } else {
                // Add an element
                const usedPositions = new Set(diff.map(c => c.row * this.GRID + c.col));
                const available = [];
                for (let i = 0; i < this.GRID * this.GRID; i++) {
                    if (!usedPositions.has(i)) available.push(i);
                }
                if (available.length > 0) {
                    const pos = available[Math.floor(App.random() * available.length)];
                    diff.push({
                        row: Math.floor(pos / this.GRID),
                        col: pos % this.GRID,
                        shape: this.SHAPES[Math.floor(App.random() * this.SHAPES.length)],
                        color: this.COLORS[Math.floor(App.random() * this.COLORS.length)],
                    });
                }
            }
        }
        return diff;
    },

    drawPattern(canvas, pattern) {
        const ctx = canvas.getContext('2d');
        const size = this.CANVAS_SIZE;
        const cellSize = size / this.GRID;
        const padding = 6;

        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw grid lines (subtle)
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < this.GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(size, i * cellSize);
            ctx.stroke();
        }

        for (const cell of pattern) {
            const x = cell.col * cellSize + padding;
            const y = cell.row * cellSize + padding;
            const w = cellSize - padding * 2;
            const h = cellSize - padding * 2;
            const cx = x + w / 2;
            const cy = y + h / 2;
            const r = Math.min(w, h) / 2;

            ctx.fillStyle = cell.color;
            ctx.strokeStyle = cell.color;
            ctx.lineWidth = 2;

            switch (cell.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(x, y, w, h);
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(cx, y);
                    ctx.lineTo(x + w, y + h);
                    ctx.lineTo(x, y + h);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'diamond':
                    ctx.beginPath();
                    ctx.moveTo(cx, y);
                    ctx.lineTo(x + w, cy);
                    ctx.lineTo(cx, y + h);
                    ctx.lineTo(x, cy);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'cross':
                    const t = w * 0.25;
                    ctx.fillRect(cx - t, y, t * 2, h);
                    ctx.fillRect(x, cy - t, w, t * 2);
                    break;
            }
        }
    },

    generateTrialItem() {
        const base = this.generatePattern();
        const isSame = App.random() < 0.5;
        const second = isSame ? this.clonePattern(base) : this.makeDifferent(base);
        return { left: base, right: second, isSame };
    },

    startPractice() {
        this.isPractice = true;
        this.currentTrial = 0;
        this.practiceItems = [];
        for (let i = 0; i < this.PRACTICE_TRIALS; i++) {
            this.practiceItems.push(this.generateTrialItem());
        }
        this.showTrial();
    },

    startTest() {
        this.isPractice = false;
        this.currentTrial = 0;
        this.trials = [];
        this.totalCorrect = 0;
        this.timerStart = performance.now();
        this.testEnded = false;

        // Start timer display
        this.startTimer();
        this.showTrial();
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.testEnded) return;
            const elapsed = performance.now() - this.timerStart;
            const remaining = Math.max(0, this.TIME_LIMIT_MS - elapsed);
            const seconds = (remaining / 1000).toFixed(1);
            const pct = (remaining / this.TIME_LIMIT_MS) * 100;

            const timerText = document.getElementById('pc-timer-text');
            const timerFill = document.getElementById('pc-timer-fill');
            if (timerText) timerText.textContent = `残り ${seconds} 秒`;
            if (timerFill) timerFill.style.width = `${pct}%`;

            if (remaining <= 0) {
                this.endTest();
            }
        }, 100);
    },

    async showTrial() {
        if (this.testEnded) return;
        if (this.isPractice && this.currentTrial >= this.PRACTICE_TRIALS) {
            this.endPractice();
            return;
        }
        if (!this.isPractice && this.currentTrial >= this.MAX_ITEMS) {
            this.endTest();
            return;
        }
        if (!this.isPractice) {
            const elapsed = performance.now() - this.timerStart;
            if (elapsed >= this.TIME_LIMIT_MS) {
                this.endTest();
                return;
            }
        }

        const item = this.isPractice ? this.practiceItems[this.currentTrial] : this.generateTrialItem();
        this.currentItem = item;

        const content = App.getTestContent();
        let topHtml = '';
        if (this.isPractice) {
            topHtml = App.practiceProgressHtml(this.currentTrial, this.PRACTICE_TRIALS);
        } else {
            topHtml = `
                <div class="timer-text" id="pc-timer-text" aria-live="off">残り 80.0 秒</div>
                <div class="timer-bar"><div class="timer-bar-fill" id="pc-timer-fill" style="width:100%"></div></div>
            `;
        }

        content.innerHTML = `
            ${topHtml}
            <div class="pattern-container">
                <canvas id="pc-canvas-left" width="${this.CANVAS_SIZE}" height="${this.CANVAS_SIZE}" aria-label="左のパターン"></canvas>
                <canvas id="pc-canvas-right" width="${this.CANVAS_SIZE}" height="${this.CANVAS_SIZE}" aria-label="右のパターン"></canvas>
            </div>
            <div class="pattern-response">
                <button class="btn btn-success" id="btn-same">同じ (F)</button>
                <button class="btn btn-danger" id="btn-diff">違う (J)</button>
            </div>
            ${this.isPractice ? '<div class="pc-key-guide"><span class="key-guide-left">← F: 同じ</span><span class="key-guide-right">J: 違う →</span></div>' : ''}
        `;

        this.drawPattern(document.getElementById('pc-canvas-left'), item.left);
        this.drawPattern(document.getElementById('pc-canvas-right'), item.right);

        this.stimulusOnset = await App.waitForStimulusOnset();
        if (this.testEnded) return;
        this.stimulusOnsetSessionMs = App.sessionElapsedMs(this.stimulusOnset);
        this.responded = false;

        // Button handlers
        document.getElementById('btn-same').addEventListener('click', (e) => this.respond(true, e));
        document.getElementById('btn-diff').addEventListener('click', (e) => this.respond(false, e));

        // Keyboard handler
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        this.keyHandler = (e) => {
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); this.respond(true, e); }
            if (e.key === 'j' || e.key === 'J') { e.preventDefault(); this.respond(false, e); }
        };
        document.addEventListener('keydown', this.keyHandler);
    },

    async respond(answeredSame, event) {
        // Prevent double response
        if (this.responded || this.testEnded) return;
        this.responded = true;

        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        const tResponse = event ? App.eventTime(event) : performance.now();
        const rt = tResponse - this.stimulusOnset;
        const correct = answeredSame === this.currentItem.isSame;

        if (this.isPractice) {
            const content = App.getTestContent();
            content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}" role="status" aria-live="assertive">${correct ? '正解' : '不正解'}</div>`;
            await App.wait(600);
            if (this.testEnded) return;
            this.currentTrial++;
            await App.wait(this.ITI_MS);
            if (this.testEnded) return;
            this.showTrial();
        } else {
            if (correct) this.totalCorrect++;
            this.trials.push({
                trialNum: this.currentTrial + 1,
                isSame: this.currentItem.isSame ? 1 : 0,
                response: answeredSame ? 'same' : 'different',
                correct: correct ? 1 : 0,
                rt: Math.round(rt),
                tOnset: this.stimulusOnsetSessionMs,
                tResponse: App.sessionElapsedMs(tResponse),
            });
            this.currentTrial++;
            await App.wait(this.ITI_MS);
            if (this.testEnded) return;
            this.showTrial();
        }
    },

    endPractice() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>練習完了</h2>
                <p>本番は <strong>80秒</strong> の制限時間内に、できるだけ多くの問題に正確に答えてください。</p>
                <p style="color:#888;">※ 本番では正誤のフィードバックは表示されません。</p>
                <p>準備ができたら「本番開始」を押してください。</p>
                <button class="btn btn-primary" id="btn-pc-test">本番開始</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-pc-test', () => this.startTest());
    },

    endTest() {
        if (this.testEnded) return;
        this.testEnded = true;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        const elapsedMs = Math.round(performance.now() - this.timerStart);

        const result = {
            score: this.totalCorrect,
            detail: `${this.totalCorrect}問正解 / ${this.trials.length}問回答`,
            totalCorrect: this.totalCorrect,
            totalAttempted: this.trials.length,
            practiceAttempts: 1,
            testDurationMs: elapsedMs,
            timeoutCount: 0,
        };

        App.onTestComplete('pattern-comparison', result, this.trials);
    },
};

App.testRegistry['pattern-comparison'].module = PatternComparisonTest;
