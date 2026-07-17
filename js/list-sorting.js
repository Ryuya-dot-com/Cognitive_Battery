// ==================== List Sorting Working Memory Test ====================

I18n.register('listSorting', {
    ja: {
        name: 'リストソート課題',
        domain: 'ワーキングメモリ',
        instructions: {
            title: 'リストソート課題',
            intro: '動物や食べ物が1つずつ画面に表示されます。',
            sortBySize: 'すべてのアイテムが表示された後、それらを<strong>実際の大きさが小さい順</strong>に並べ替えてください。',
            example: '例: 「象」「猫」「犬」が表示されたら→ <strong>猫 → 犬 → 象</strong> の順に選んでください。',
            dual: '後半は動物と食べ物が混ざって表示されます。その場合は「<strong>食べ物を小さい順</strong>」→「<strong>動物を小さい順</strong>」の順で回答してください。',
            practiceFirst: 'まず練習から始めます。',
            start: '開始',
        },
        practice: {
            title: '練習',
            instruction: '以下の動物が順番に表示されます。小さい順に並べ替えてください。',
            start: '練習開始',
            completeTitle: '練習完了',
            completeBody: '本番ではアイテムの数が徐々に増えます。',
            singleNext: 'まず「1リスト条件」（単一カテゴリ）から始めます。',
            startTest: '本番開始',
        },
        feedback: {
            correct: '正解',
            incorrect: '不正解',
        },
        response: {
            singleInstruction: '小さい順に選んでください',
            dualInstruction: '食べ物を小さい順 → 動物を小さい順',
            candidatesAria: '項目候補',
            keyboardHint: 'キーボード: Tab で移動、Enter / Space で選択、Backspace で取り消し',
            undo: '取り消し',
        },
        dual: {
            title: '2リスト条件',
            intro: '次は動物と食べ物が混ざって表示されます。',
            instruction: '「<strong>食べ物を小さい順</strong>」→「<strong>動物を小さい順</strong>」の順で回答してください。',
            start: '開始',
        },
        phase: {
            single: '1リスト',
            dual: '2リスト',
            status: '{phase}条件 — {count}個のアイテム ({attempt}回目)',
        },
        result: {
            detail: '合計 {score}点',
        },
        items: {
            animal_mouse: 'ネズミ',
            animal_cat: '猫',
            animal_dog: '犬',
            animal_sheep: '羊',
            animal_cow: '牛',
            animal_elephant: '象',
            food_strawberry: 'イチゴ',
            food_lemon: 'レモン',
            food_apple: 'リンゴ',
            food_melon: 'メロン',
            food_pumpkin: 'カボチャ',
            food_watermelon: 'スイカ',
            vehicle_bicycle: '自転車',
            vehicle_motorcycle: 'バイク',
            vehicle_car: '車',
            vehicle_bus: 'バス',
            vehicle_truck: 'トラック',
            vehicle_train: '電車',
        },
    },
    en: {
        name: 'List Sorting Task',
        domain: 'Working Memory',
        instructions: {
            title: 'List Sorting Task',
            intro: 'Animals or foods will appear on the screen one at a time.',
            sortBySize: 'After all items have appeared, arrange them from <strong>smallest to largest in real life</strong>.',
            example: 'Example: If “elephant,” “cat,” and “dog” appear, select <strong>cat → dog → elephant</strong>.',
            dual: 'Later, animals and foods will be mixed. In that condition, answer in this order: <strong>foods from smallest to largest</strong>, then <strong>animals from smallest to largest</strong>.',
            practiceFirst: 'You will begin with a practice trial.',
            start: 'Start',
        },
        practice: {
            title: 'Practice',
            instruction: 'The following animals will appear one at a time. Arrange them from smallest to largest.',
            start: 'Start practice',
            completeTitle: 'Practice complete',
            completeBody: 'In the test, the number of items will gradually increase.',
            singleNext: 'You will begin with the single-list condition (one category).',
            startTest: 'Start test',
        },
        feedback: {
            correct: 'Correct',
            incorrect: 'Incorrect',
        },
        response: {
            singleInstruction: 'Select from smallest to largest',
            dualInstruction: 'Foods from smallest to largest → Animals from smallest to largest',
            candidatesAria: 'Item choices',
            keyboardHint: 'Keyboard: Tab to move, Enter / Space to select, Backspace to undo',
            undo: 'Undo',
        },
        dual: {
            title: 'Two-list condition',
            intro: 'Animals and foods will now appear in a mixed sequence.',
            instruction: 'Answer in this order: <strong>foods from smallest to largest</strong>, then <strong>animals from smallest to largest</strong>.',
            start: 'Start',
        },
        phase: {
            single: 'Single-list',
            dual: 'Two-list',
            status: '{phase} condition — {count} items (attempt {attempt})',
        },
        result: {
            detail: 'Total: {score} points',
        },
        items: {
            animal_mouse: 'Mouse',
            animal_cat: 'Cat',
            animal_dog: 'Dog',
            animal_sheep: 'Sheep',
            animal_cow: 'Cow',
            animal_elephant: 'Elephant',
            food_strawberry: 'Strawberry',
            food_lemon: 'Lemon',
            food_apple: 'Apple',
            food_melon: 'Melon',
            food_pumpkin: 'Pumpkin',
            food_watermelon: 'Watermelon',
            vehicle_bicycle: 'Bicycle',
            vehicle_motorcycle: 'Motorcycle',
            vehicle_car: 'Car',
            vehicle_bus: 'Bus',
            vehicle_truck: 'Truck',
            vehicle_train: 'Train',
        },
    },
});

const ListSortingTest = {
    STIMULUS_BANK_VERSION: 'list-sorting-semantic-bank-2026-07-i18n-v1',
    ITEM_DISPLAY_MS: 2000,
    MIN_LENGTH: 2,
    MAX_LENGTH: 7,

    // Items ordered by real-world size (smallest to largest)
    ANIMALS: [
        { id: 'animal_mouse', emoji: "\uD83D\uDC01", name: "ネズミ", size: 1 },
        { id: 'animal_cat', emoji: "\uD83D\uDC08", name: "猫", size: 2 },
        { id: 'animal_dog', emoji: "\uD83D\uDC15", name: "犬", size: 3 },
        { id: 'animal_sheep', emoji: "\uD83D\uDC11", name: "羊", size: 4 },
        { id: 'animal_cow', emoji: "\uD83D\uDC04", name: "牛", size: 5 },
        { id: 'animal_elephant', emoji: "\uD83D\uDC18", name: "象", size: 6 },
    ],
    FOODS: [
        { id: 'food_strawberry', emoji: "\uD83C\uDF53", name: "イチゴ", size: 1 },
        { id: 'food_lemon', emoji: "\uD83C\uDF4B", name: "レモン", size: 2 },
        { id: 'food_apple', emoji: "\uD83C\uDF4E", name: "リンゴ", size: 3 },
        { id: 'food_melon', emoji: "\uD83C\uDF48", name: "メロン", size: 4 },
        { id: 'food_pumpkin', emoji: "\uD83C\uDF83", name: "カボチャ", size: 5 },
        { id: 'food_watermelon', emoji: "\uD83C\uDF49", name: "スイカ", size: 6 },
    ],
    VEHICLES: [
        { id: 'vehicle_bicycle', emoji: "\uD83D\uDEB2", name: "自転車", size: 1 },
        { id: 'vehicle_motorcycle', emoji: "\uD83C\uDFCD\uFE0F", name: "バイク", size: 2 },
        { id: 'vehicle_car', emoji: "\uD83D\uDE97", name: "車", size: 3 },
        { id: 'vehicle_bus', emoji: "\uD83D\uDE8C", name: "バス", size: 4 },
        { id: 'vehicle_truck', emoji: "\uD83D\uDE9A", name: "トラック", size: 5 },
        { id: 'vehicle_train', emoji: "\uD83D\uDE82", name: "電車", size: 6 },
    ],

    trials: [],
    score: 0,
    phase: '',
    currentLength: 0,
    attemptInLength: 0,

    stimulusLanguage() {
        const locale = (window.I18n && I18n.getLocale)
            ? I18n.getLocale()
            : (document.documentElement.lang || 'ja');
        return locale;
    },

    itemIdentity(item) {
        return item && (item.id || item.name || item.label);
    },

    itemLabel(item) {
        if (!item) return '';
        return item.id ? App.t(`listSorting.items.${item.id}`) : (item.name || item.label || '');
    },

    itemLabels(items) {
        return items.map(item => this.itemLabel(item)).join(';');
    },

    itemIds(items) {
        return items.map(item => this.itemIdentity(item)).join(';');
    },

    run() {
        this.trials = [];
        this.score = 0;
        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${App.t('listSorting.instructions.title')}</h2>
                <p>${App.t('listSorting.instructions.intro')}</p>
                <p>${App.t('listSorting.instructions.sortBySize')}</p>
                <p>${App.t('listSorting.instructions.example')}</p>
                <p>${App.t('listSorting.instructions.dual')}</p>
                <p>${App.t('listSorting.instructions.practiceFirst')}</p>
                <button class="btn btn-primary" id="btn-ls-start">${App.t('listSorting.instructions.start')}</button>
            </div>
        `;
        document.getElementById('btn-ls-start').addEventListener('click', () => this.startPractice());
    },

    async startPractice() {
        const content = App.getTestContent();
        const items = this.pickItems(this.ANIMALS, 2);
        content.innerHTML = `
            <div class="instructions">
                <h2>${App.t('listSorting.practice.title')}</h2>
                <p>${App.t('listSorting.practice.instruction')}</p>
                <button class="btn btn-primary" id="btn-ls-practice">${App.t('listSorting.practice.start')}</button>
            </div>
        `;
        document.getElementById('btn-ls-practice').addEventListener('click', async () => {
            await this.presentItems(items);
            const correctOrder = [...items].sort((a, b) => a.size - b.size);
            const response = await this.getResponse(items, 'single');
            const correct = this.checkAnswer(response, correctOrder);

            content.innerHTML = `
                <div class="feedback ${correct ? 'correct' : 'incorrect'}">${correct ? App.t('listSorting.feedback.correct') : App.t('listSorting.feedback.incorrect')}</div>
            `;
            await App.wait(1000);

            content.innerHTML = `
                <div class="instructions">
                    <h2>${App.t('listSorting.practice.completeTitle')}</h2>
                    <p>${App.t('listSorting.practice.completeBody')}</p>
                    <p>${App.t('listSorting.practice.singleNext')}</p>
                    <button class="btn btn-primary" id="btn-ls-test">${App.t('listSorting.practice.startTest')}</button>
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
                <div class="ls-label">${this.itemLabel(item)}</div>
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
                    instruction = `<div class="ls-condition-label">${App.t('listSorting.response.dualInstruction')}</div>`;
                } else {
                    instruction = `<div class="ls-condition-label">${App.t('listSorting.response.singleInstruction')}</div>`;
                }

                let selectedHtml = '<div class="ls-selected-area" aria-live="polite">';
                for (const s of selected) {
                    selectedHtml += `<div class="ls-selected-item"><span class="emoji">${s.emoji}</span>${this.itemLabel(s)}</div>`;
                }
                selectedHtml += '</div>';

                let buttonsHtml = `<div class="ls-response-grid" role="group" aria-label="${App.t('listSorting.response.candidatesAria')}">`;
                for (const item of displayItems) {
                    const disabled = selected.includes(item);
                    buttonsHtml += `
                        <button class="ls-item-btn ${disabled ? 'disabled' : ''}"
                                data-item-id="${this.itemIdentity(item)}" ${disabled ? 'disabled' : ''}
                                aria-disabled="${disabled ? 'true' : 'false'}">
                            <span class="emoji">${item.emoji}</span>
                            ${this.itemLabel(item)}
                        </button>
                    `;
                }
                buttonsHtml += '</div>';

                const hint = `<p class="field-hint ls-keyboard-hint">${App.t('listSorting.response.keyboardHint')}</p>`;

                content.innerHTML = `
                    ${instruction}
                    ${selectedHtml}
                    ${buttonsHtml}
                    ${hint}
                    ${selected.length > 0 ? `<button class="btn btn-secondary mt-2" id="btn-ls-undo">${App.t('listSorting.response.undo')}</button>` : ''}
                `;

                content.querySelectorAll('.ls-item-btn:not(.disabled)').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const itemId = btn.dataset.itemId;
                        addItem(allItems.find(i => this.itemIdentity(i) === itemId && !selected.includes(i)));
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
        return response.every((item, i) => this.itemIdentity(item) === this.itemIdentity(correctOrder[i]));
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
                <h2>${App.t('listSorting.dual.title')}</h2>
                <p>${App.t('listSorting.dual.intro')}</p>
                <p>${App.t('listSorting.dual.instruction')}</p>
                <button class="btn btn-primary" id="btn-ls-dual">${App.t('listSorting.dual.start')}</button>
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
        const phaseLabel = App.t(`listSorting.phase.${this.phase}`);
        content.innerHTML = `
            <div style="color:#888;margin-bottom:10px;">${App.t('listSorting.phase.status', {
                phase: phaseLabel,
                count: this.currentLength,
                attempt: this.attemptInLength,
            })}</div>
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
            items: this.itemLabels(items),
            correctOrder: this.itemLabels(correctOrder),
            response: this.itemLabels(response),
            itemIds: this.itemIds(items),
            correctOrderIds: this.itemIds(correctOrder),
            responseIds: this.itemIds(response),
            stimulus_language: this.stimulusLanguage(),
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            correct: correct ? 1 : 0,
            tOnset: App.sessionElapsedMs(tResponseStart),
            tResponse: App.sessionElapsedMs(tResponseEnd),
            responseTime: Math.round(tResponseEnd - tResponseStart),
        });

        content.innerHTML = `<div class="feedback ${correct ? 'correct' : 'incorrect'}">${correct ? App.t('listSorting.feedback.correct') : App.t('listSorting.feedback.incorrect')}</div>`;
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
            detail: App.t('listSorting.result.detail', { score: this.score }),
            stimulus_language: this.stimulusLanguage(),
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            practiceAttempts: 1,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: 0,
        };
        App.onTestComplete('list-sorting', result, this.trials);
    },
};

App.testRegistry['list-sorting'].module = ListSortingTest;
App.testRegistry['list-sorting'].nameKey = 'listSorting.name';
App.testRegistry['list-sorting'].domainKey = 'listSorting.domain';
