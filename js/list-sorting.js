// ==================== List Sorting Working Memory Test ====================

const ListSortingTest = {
    ITEM_DISPLAY_MS: 2000,
    MIN_LENGTH: 2,
    MAX_LENGTH: 7,

    // Items ordered by real-world size (smallest to largest)
    ANIMALS: [
        { emoji: "\uD83D\uDC01", name: "ネズミ", size: 1 },
        { emoji: "\uD83D\uDC08", name: "猫",     size: 2 },
        { emoji: "\uD83D\uDC15", name: "犬",     size: 3 },
        { emoji: "\uD83D\uDC11", name: "羊",     size: 4 },
        { emoji: "\uD83D\uDC04", name: "牛",     size: 5 },
        { emoji: "\uD83D\uDC18", name: "象",     size: 6 },
    ],
    FOODS: [
        { emoji: "\uD83C\uDF53", name: "イチゴ",   size: 1 },
        { emoji: "\uD83C\uDF4B", name: "レモン",   size: 2 },
        { emoji: "\uD83C\uDF4E", name: "リンゴ",   size: 3 },
        { emoji: "\uD83C\uDF48", name: "メロン",   size: 4 },
        { emoji: "\uD83C\uDF83", name: "カボチャ", size: 5 },
        { emoji: "\uD83C\uDF49", name: "スイカ",   size: 6 },
    ],
    VEHICLES: [
        { emoji: "\uD83D\uDEB2", name: "自転車",   size: 1 },
        { emoji: "\uD83C\uDFCD\uFE0F", name: "バイク", size: 2 },
        { emoji: "\uD83D\uDE97", name: "車",       size: 3 },
        { emoji: "\uD83D\uDE8C", name: "バス",     size: 4 },
        { emoji: "\uD83D\uDE9A", name: "トラック", size: 5 },
        { emoji: "\uD83D\uDE82", name: "電車",     size: 6 },
    ],

    trials: [],
    score: 0,
    phase: '',
    currentLength: 0,
    attemptInLength: 0,

    run() {
        this.trials = [];
        this.score = 0;
        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>リストソート課題</h2>
                <p>動物や食べ物が1つずつ画面に表示されます。</p>
                <p>すべてのアイテムが表示された後、それらを<strong>実際の大きさが小さい順</strong>に並べ替えてください。</p>
                <p>例: 「象」「猫」「犬」が表示されたら→ <strong>猫 → 犬 → 象</strong> の順に選んでください。</p>
                <p>後半は動物と食べ物が混ざって表示されます。その場合は「<strong>食べ物を小さい順</strong>」→「<strong>動物を小さい順</strong>」の順で回答してください。</p>
                <p>まず練習から始めます。</p>
                <button class="btn btn-primary" id="btn-ls-start">開始</button>
            </div>
        `;
        document.getElementById('btn-ls-start').addEventListener('click', () => this.startPractice());
    },

    async startPractice() {
        const content = App.getTestContent();
        const items = this.pickItems(this.ANIMALS, 2);
        content.innerHTML = `
            <div class="instructions">
                <h2>練習</h2>
                <p>以下の動物が順番に表示されます。小さい順に並べ替えてください。</p>
                <button class="btn btn-primary" id="btn-ls-practice">練習開始</button>
            </div>
        `;
        document.getElementById('btn-ls-practice').addEventListener('click', async () => {
            await this.presentItems(items);
            const correctOrder = [...items].sort((a, b) => a.size - b.size);
            const response = await this.getResponse(items, 'single');
            const correct = this.checkAnswer(response, correctOrder);

            content.innerHTML = `
                <div class="feedback ${correct ? 'correct' : 'incorrect'}">${correct ? '正解' : '不正解'}</div>
            `;
            await App.wait(1000);

            content.innerHTML = `
                <div class="instructions">
                    <h2>練習完了</h2>
                    <p>本番ではアイテムの数が徐々に増えます。</p>
                    <p>まず「1リスト条件」（単一カテゴリ）から始めます。</p>
                    <button class="btn btn-primary" id="btn-ls-test">本番開始</button>
                </div>
            `;
            App.bindPrimaryAdvance('btn-ls-test', () => this.startSinglePhase());
        });
    },

    pickItems(pool, count) {
        const shuffled = App.shuffle(pool);
        return shuffled.slice(0, count);
    },

    pickMixedItems(count) {
        const numAnimals = Math.max(1, Math.floor(count / 2));
        const numFoods = count - numAnimals;
        const animals = this.pickItems(this.ANIMALS, numAnimals);
        const foods = this.pickItems(this.FOODS, numFoods);
        return App.shuffle([...animals.map(a => ({ ...a, category: 'animal' })),
                            ...foods.map(f => ({ ...f, category: 'food' }))]);
    },

    async presentItems(items) {
        const content = App.getTestContent();
        for (const item of items) {
            content.innerHTML = `
                <div class="ls-stimulus">${item.emoji}</div>
                <div class="ls-label">${item.name}</div>
            `;
            await App.wait(this.ITEM_DISPLAY_MS);
            content.innerHTML = '';
            await App.wait(300);
        }
    },

    getResponse(items, phase) {
        return new Promise(resolve => {
            const content = App.getTestContent();
            const allItems = [...items];
            const displayItems = App.shuffle([...allItems]);
            const selected = [];

            const addItem = (item) => {
                if (!item || selected.includes(item)) return;
                selected.push(item);
                if (selected.length === allItems.length) {
                    if (this._keyboardHandler) {
                        document.removeEventListener('keydown', this._keyboardHandler);
                        this._keyboardHandler = null;
                    }
                    resolve(selected);
                } else {
                    render();
                }
            };

            const undoLast = () => {
                if (selected.length === 0) return;
                selected.pop();
                render();
            };

            const render = () => {
                let instruction = '';
                if (phase === 'dual') {
                    instruction = '<div class="ls-condition-label">食べ物を小さい順 → 動物を小さい順</div>';
                } else {
                    instruction = '<div class="ls-condition-label">小さい順に選んでください</div>';
                }

                let selectedHtml = '<div class="ls-selected-area" aria-live="polite">';
                for (const s of selected) {
                    selectedHtml += `<div class="ls-selected-item"><span class="emoji">${s.emoji}</span>${s.name}</div>`;
                }
                selectedHtml += '</div>';

                let buttonsHtml = '<div class="ls-response-grid" role="group" aria-label="項目候補">';
                for (const item of displayItems) {
                    const disabled = selected.includes(item);
                    buttonsHtml += `
                        <button class="ls-item-btn ${disabled ? 'disabled' : ''}"
                                data-name="${item.name}" ${disabled ? 'disabled' : ''}
                                aria-disabled="${disabled ? 'true' : 'false'}">
                            <span class="emoji">${item.emoji}</span>
                            ${item.name}
                        </button>
                    `;
                }
                buttonsHtml += '</div>';

                const hint = '<p class="field-hint ls-keyboard-hint">キーボード: Tab で移動、Enter / Space で選択、Backspace で取り消し</p>';

                content.innerHTML = `
                    ${instruction}
                    ${selectedHtml}
                    ${buttonsHtml}
                    ${hint}
                    ${selected.length > 0 ? '<button class="btn btn-secondary mt-2" id="btn-ls-undo">取り消し</button>' : ''}
                `;

                content.querySelectorAll('.ls-item-btn:not(.disabled)').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const name = btn.dataset.name;
                        addItem(allItems.find(i => i.name === name && !selected.includes(i)));
                    });
                });

                const undoBtn = document.getElementById('btn-ls-undo');
                if (undoBtn) {
                    undoBtn.addEventListener('click', () => undoLast());
                }

                // Move focus to first non-disabled item so keyboard-only users can proceed
                const firstEnabled = content.querySelector('.ls-item-btn:not(.disabled)');
                if (firstEnabled) firstEnabled.focus();
            };

            if (this._keyboardHandler) {
                document.removeEventListener('keydown', this._keyboardHandler);
            }
            this._keyboardHandler = (e) => {
                if (e.key === 'Backspace' && selected.length > 0) {
                    const active = document.activeElement;
                    if (active && active.tagName === 'INPUT' && active.type === 'text') return;
                    e.preventDefault();
                    undoLast();
                }
            };
            document.addEventListener('keydown', this._keyboardHandler);

            render();
        });
    },

    checkAnswer(response, correctOrder) {
        if (response.length !== correctOrder.length) return false;
        return response.every((item, i) => item.name === correctOrder[i].name);
    },

    async startSinglePhase() {
        this.phase = 'single';
        this.currentLength = this.MIN_LENGTH;
        this.attemptInLength = 1;
        this.testStartTime = performance.now();
        await this.runPhase();
    },

    async startDualPhase() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>2リスト条件</h2>
                <p>次は動物と食べ物が混ざって表示されます。</p>
                <p>「<strong>食べ物を小さい順</strong>」→「<strong>動物を小さい順</strong>」の順で回答してください。</p>
                <button class="btn btn-primary" id="btn-ls-dual">開始</button>
            </div>
        `;
        await new Promise(resolve => {
            document.getElementById('btn-ls-dual').addEventListener('click', resolve);
        });

        this.phase = 'dual';
        this.currentLength = this.MIN_LENGTH;
        this.attemptInLength = 1;
        await this.runPhase();
    },

    async runPhase() {
        if (this.currentLength > this.MAX_LENGTH) {
            if (this.phase === 'single') {
                await this.startDualPhase();
            } else {
                this.endTest();
            }
            return;
        }

        let items;
        let correctOrder;
        let pool = null;
        let poolLabel = null;
        if (this.phase === 'single') {
            const pools = [
                { data: this.ANIMALS, label: 'animals' },
                { data: this.FOODS, label: 'foods' },
                { data: this.VEHICLES, label: 'vehicles' },
            ];
            const pick = pools[Math.floor(App.random() * pools.length)];
            pool = pick.data;
            poolLabel = pick.label;
        }

        if (this.phase === 'single') {
            items = this.pickItems(pool, this.currentLength);
            correctOrder = [...items].sort((a, b) => a.size - b.size);
        } else {
            items = this.pickMixedItems(this.currentLength);
            const foods = items.filter(i => i.category === 'food').sort((a, b) => a.size - b.size);
            const animals = items.filter(i => i.category === 'animal').sort((a, b) => a.size - b.size);
            correctOrder = [...foods, ...animals];
        }

        const content = App.getTestContent();
        const phaseLabel = this.phase === 'single' ? '1リスト' : '2リスト';
        content.innerHTML = `
            <div style="color:#888;margin-bottom:10px;">${phaseLabel}条件 — ${this.currentLength}個のアイテム (${this.attemptInLength}回目)</div>
        `;
        await App.wait(800);

        await this.presentItems(items);

        const tResponseStart = performance.now();
        const response = await this.getResponse(items, this.phase);
        const tResponseEnd = performance.now();
        const correct = this.checkAnswer(response, correctOrder);

        this.trials.push({
            phase: this.phase,
            category: poolLabel,
            length: this.currentLength,
            attempt: this.attemptInLength,
            items: items.map(i => i.name).join(';'),
            correctOrder: correctOrder.map(i => i.name).join(';'),
            response: response.map(i => i.name).join(';'),
            correct: correct ? 1 : 0,
            tOnset: App.sessionElapsedMs(tResponseStart),
            tResponse: App.sessionElapsedMs(tResponseEnd),
            responseTime: Math.round(tResponseEnd - tResponseStart),
        });

        content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}">${correct ? '正解' : '不正解'}</div>`;
        await App.wait(800);

        if (correct && this.attemptInLength === 1) {
            this.score += 2;
            this.currentLength++;
            this.attemptInLength = 1;
        } else if (correct && this.attemptInLength === 2) {
            this.score += 1;
            this.currentLength++;
            this.attemptInLength = 1;
        } else if (!correct && this.attemptInLength === 1) {
            this.attemptInLength = 2;
        } else {
            if (this.phase === 'single') {
                await this.startDualPhase();
                return;
            } else {
                this.endTest();
                return;
            }
        }

        await App.wait(500);
        this.runPhase();
    },

    endTest() {
        const result = {
            score: this.score,
            detail: `合計 ${this.score}点`,
            practiceAttempts: 1,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: 0,
        };
        App.onTestComplete('list-sorting', result, this.trials);
    },
};

App.testRegistry['list-sorting'].module = ListSortingTest;
