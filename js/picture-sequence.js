// ==================== Picture Sequence Memory Test ====================

const PictureSequenceTest = {
    ITEM_DISPLAY_MS: 2200,
    MOVE_ANIM_MS: 1500,
    FULL_SEQ_DISPLAY_MS: 3000,
    LEARNING_TRIALS: 3,

    THEMES: {
        morning: {
            name: "朝の準備",
            items15: [
                { emoji: "\u23F0",           label: "目覚ましが鳴る" },
                { emoji: "\uD83D\uDECF\uFE0F", label: "ベッドから起きる" },
                { emoji: "\uD83E\uDEA5",    label: "歯を磨く" },
                { emoji: "\uD83D\uDEBF",    label: "シャワーを浴びる" },
                { emoji: "\uD83E\uDDF4",    label: "髪を乾かす" },
                { emoji: "\uD83D\uDC55",    label: "服を着る" },
                { emoji: "\uD83C\uDF73",    label: "朝食を作る" },
                { emoji: "\u2615",           label: "コーヒーを飲む" },
                { emoji: "\uD83D\uDCF1",    label: "スマホを確認する" },
                { emoji: "\uD83D\uDC5F",    label: "靴を履く" },
                { emoji: "\uD83D\uDCBC",    label: "カバンを持つ" },
                { emoji: "\uD83D\uDEAA",    label: "玄関を出る" },
                { emoji: "\uD83D\uDEB6",    label: "駅まで歩く" },
                { emoji: "\uD83D\uDE83",    label: "電車に乗る" },
                { emoji: "\uD83C\uDFE2",    label: "会社に着く" },
            ],
            items9: [
                { emoji: "\u23F0",           label: "目覚ましが鳴る" },
                { emoji: "\uD83D\uDECF\uFE0F", label: "ベッドから起きる" },
                { emoji: "\uD83E\uDEA5",    label: "歯を磨く" },
                { emoji: "\uD83D\uDC55",    label: "服を着る" },
                { emoji: "\uD83C\uDF73",    label: "朝食を作る" },
                { emoji: "\u2615",           label: "コーヒーを飲む" },
                { emoji: "\uD83D\uDC5F",    label: "靴を履く" },
                { emoji: "\uD83D\uDEAA",    label: "玄関を出る" },
                { emoji: "\uD83D\uDE83",    label: "電車に乗る" },
            ],
            practice: [
                { emoji: "\uD83C\uDF19",    label: "夜になる" },
                { emoji: "\uD83D\uDECB\uFE0F", label: "ソファに座る" },
                { emoji: "\uD83D\uDCFA",    label: "テレビを見る" },
                { emoji: "\uD83D\uDCA4",    label: "寝る" },
            ],
        },
        cooking: {
            name: "料理を作る",
            items15: [
                { emoji: "\uD83D\uDCD6",    label: "レシピを見る" },
                { emoji: "\uD83D\uDED2",    label: "買い物に行く" },
                { emoji: "\uD83E\uDD6C",    label: "野菜を買う" },
                { emoji: "\uD83C\uDF56",    label: "肉を買う" },
                { emoji: "\uD83C\uDFE0",    label: "家に帰る" },
                { emoji: "\uD83E\uDDF4",    label: "手を洗う" },
                { emoji: "\uD83E\uDD55",    label: "野菜を洗う" },
                { emoji: "\uD83D\uDD2A",    label: "野菜を切る" },
                { emoji: "\uD83E\uDDC5",    label: "玉ねぎを炒める" },
                { emoji: "\uD83E\uDD69",    label: "肉を焼く" },
                { emoji: "\uD83E\uDDC2",    label: "調味料を加える" },
                { emoji: "\uD83C\uDF72",    label: "煮込む" },
                { emoji: "\uD83C\uDF5A",    label: "ごはんを盛る" },
                { emoji: "\uD83C\uDF7D\uFE0F", label: "お皿に盛る" },
                { emoji: "\uD83D\uDE0B",    label: "食べる" },
            ],
            items9: [
                { emoji: "\uD83D\uDCD6",    label: "レシピを見る" },
                { emoji: "\uD83D\uDED2",    label: "買い物に行く" },
                { emoji: "\uD83E\uDD6C",    label: "野菜を買う" },
                { emoji: "\uD83D\uDD2A",    label: "野菜を切る" },
                { emoji: "\uD83E\uDDC5",    label: "玉ねぎを炒める" },
                { emoji: "\uD83C\uDF72",    label: "煮込む" },
                { emoji: "\uD83C\uDF5A",    label: "ごはんを盛る" },
                { emoji: "\uD83C\uDF7D\uFE0F", label: "お皿に盛る" },
                { emoji: "\uD83D\uDE0B",    label: "食べる" },
            ],
            practice: [
                { emoji: "\uD83C\uDF1E",    label: "朝になる" },
                { emoji: "\uD83E\uDDD1\u200D\uD83C\uDF73", label: "キッチンに行く" },
                { emoji: "\u2615",           label: "お茶を入れる" },
                { emoji: "\uD83C\uDF6A",    label: "お菓子を食べる" },
            ],
        },
        travel: {
            name: "旅行の準備",
            items15: [
                { emoji: "\uD83D\uDCC5",    label: "カレンダーを確認する" },
                { emoji: "\uD83D\uDCBB",    label: "航空券を予約する" },
                { emoji: "\uD83C\uDFE8",    label: "ホテルを予約する" },
                { emoji: "\uD83E\uDDF3",    label: "スーツケースを出す" },
                { emoji: "\uD83E\uDDFA",    label: "洗濯をする" },
                { emoji: "\uD83D\uDC55",    label: "衣類をたたむ" },
                { emoji: "\uD83D\uDD0C",    label: "充電器を入れる" },
                { emoji: "\uD83D\uDC8A",    label: "常備薬をまとめる" },
                { emoji: "\uD83D\uDCB0",    label: "現金を用意する" },
                { emoji: "\uD83D\uDCD6",    label: "ガイドブックを読む" },
                { emoji: "\uD83D\uDDFA\uFE0F", label: "地図を確認する" },
                { emoji: "\uD83D\uDD10",    label: "家の鍵をかける" },
                { emoji: "\uD83D\uDE95",    label: "タクシーに乗る" },
                { emoji: "\u2708\uFE0F",    label: "飛行機に搭乗する" },
                { emoji: "\uD83C\uDFDD\uFE0F", label: "目的地に到着する" },
            ],
            items9: [
                { emoji: "\uD83D\uDCC5",    label: "カレンダーを確認する" },
                { emoji: "\uD83D\uDCBB",    label: "航空券を予約する" },
                { emoji: "\uD83E\uDDF3",    label: "スーツケースを出す" },
                { emoji: "\uD83D\uDC55",    label: "衣類をたたむ" },
                { emoji: "\uD83D\uDCB0",    label: "現金を用意する" },
                { emoji: "\uD83D\uDD10",    label: "家の鍵をかける" },
                { emoji: "\uD83D\uDE95",    label: "タクシーに乗る" },
                { emoji: "\u2708\uFE0F",    label: "飛行機に搭乗する" },
                { emoji: "\uD83C\uDFDD\uFE0F", label: "目的地に到着する" },
            ],
            practice: [
                { emoji: "\uD83D\uDCE8",    label: "手紙を出す" },
                { emoji: "\uD83D\uDCEC",    label: "返事が届く" },
                { emoji: "\uD83D\uDCDD",    label: "返信を書く" },
                { emoji: "\uD83D\uDCE7",    label: "メールを送る" },
            ],
        },
        office: {
            name: "オフィスの一日",
            items15: [
                { emoji: "\uD83C\uDFE2",    label: "会社に到着する" },
                { emoji: "\uD83D\uDEAA",    label: "入口を通る" },
                { emoji: "\u2615",           label: "コーヒーを淹れる" },
                { emoji: "\uD83D\uDCBB",    label: "パソコンを起動する" },
                { emoji: "\uD83D\uDCE7",    label: "メールを確認する" },
                { emoji: "\uD83D\uDCC5",    label: "予定を確認する" },
                { emoji: "\uD83E\uDD1D",    label: "朝会に出る" },
                { emoji: "\uD83D\uDCDD",    label: "報告書を書く" },
                { emoji: "\uD83D\uDCDE",    label: "電話をかける" },
                { emoji: "\uD83C\uDF71",    label: "昼食を食べる" },
                { emoji: "\uD83D\uDCCA",    label: "資料を作成する" },
                { emoji: "\uD83D\uDC65",    label: "会議に出る" },
                { emoji: "\uD83D\uDDA8\uFE0F", label: "書類を印刷する" },
                { emoji: "\uD83D\uDCBE",    label: "ファイルを保存する" },
                { emoji: "\uD83C\uDFE0",    label: "退勤する" },
            ],
            items9: [
                { emoji: "\uD83C\uDFE2",    label: "会社に到着する" },
                { emoji: "\uD83D\uDCBB",    label: "パソコンを起動する" },
                { emoji: "\uD83D\uDCE7",    label: "メールを確認する" },
                { emoji: "\uD83E\uDD1D",    label: "朝会に出る" },
                { emoji: "\uD83C\uDF71",    label: "昼食を食べる" },
                { emoji: "\uD83D\uDC65",    label: "会議に出る" },
                { emoji: "\uD83D\uDCCA",    label: "資料を作成する" },
                { emoji: "\uD83D\uDCBE",    label: "ファイルを保存する" },
                { emoji: "\uD83C\uDFE0",    label: "退勤する" },
            ],
            practice: [
                { emoji: "\uD83D\uDED2",    label: "スーパーに行く" },
                { emoji: "\uD83D\uDED2",    label: "カゴを取る" },
                { emoji: "\uD83D\uDCB3",    label: "レジで払う" },
                { emoji: "\uD83C\uDFE0",    label: "家に帰る" },
            ],
        },
    },

    trials: [],
    currentTheme: null,
    sequenceItems: [],
    currentLearningTrial: 0,

    run() {
        this.trials = [];
        this.currentLearningTrial = 0;
        const themeKeys = Object.keys(this.THEMES);
        this.currentThemeKey = themeKeys[Math.floor(App.random() * themeKeys.length)];
        this.currentTheme = this.THEMES[this.currentThemeKey];

        const seqLength = App.participantAge <= 60 ? 15 : 9;
        this.sequenceItems = seqLength === 15
            ? this.currentTheme.items15
            : this.currentTheme.items9;

        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>系列記憶課題</h2>
                <p>「${this.currentTheme.name}」をテーマにした絵が順番に表示されます。</p>
                <p>すべての絵が表示された後、それらがシャッフル（並び替え）されます。</p>
                <p>元の正しい順序に並べ直してください。</p>
                <p>この作業を<strong>3回</strong>繰り返します（同じ系列）。</p>
                <p>まず短い系列で練習します。</p>
                <button class="btn btn-primary" id="btn-ps-start">練習開始</button>
            </div>
        `;
        document.getElementById('btn-ps-start').addEventListener('click', () => this.startPractice());
    },

    async startPractice() {
        const practiceItems = this.currentTheme.practice;
        await this.presentSequence(practiceItems);
        const result = await this.reorderPhase(practiceItems);
        const adjPairs = this.countAdjacentPairs(result, practiceItems);

        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>練習完了</h2>
                <p>隣接ペア正答数: ${adjPairs} / ${practiceItems.length - 1}</p>
                <p>本番では ${this.sequenceItems.length} 枚の絵を正しい順序に並べます。</p>
                <button class="btn btn-primary" id="btn-ps-test">本番開始</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ps-test', () => this.startTest());
    },

    async startTest() {
        this.currentLearningTrial = 0;
        this.testStartTime = performance.now();
        await this.runLearningTrial();
    },

    async runLearningTrial() {
        if (this.currentLearningTrial >= this.LEARNING_TRIALS) {
            this.endTest();
            return;
        }

        const content = App.getTestContent();
        content.innerHTML = `
            <div style="color:#888; font-size:1.1rem;">学習試行 ${this.currentLearningTrial + 1} / ${this.LEARNING_TRIALS}</div>
        `;
        await App.wait(1000);

        await this.presentSequence(this.sequenceItems);

        const startTime = performance.now();
        const result = await this.reorderPhase(this.sequenceItems);
        const endTime = performance.now();
        const elapsed = endTime - startTime;

        const adjPairs = this.countAdjacentPairs(result, this.sequenceItems);

        this.trials.push({
            trialNum: this.currentLearningTrial + 1,
            theme: this.currentThemeKey,
            sequenceLength: this.sequenceItems.length,
            adjacentPairs: adjPairs,
            maxPairs: this.sequenceItems.length - 1,
            responseTime: Math.round(elapsed),
            responseOrder: result.map(i => i.label).join(';'),
            correctOrder: this.sequenceItems.map(i => i.label).join(';'),
            tOnset: App.sessionElapsedMs(startTime),
            tResponse: App.sessionElapsedMs(endTime),
        });

        content.innerHTML = `
            <div style="color:#4a90d9; font-size:1.3rem; font-weight:700;">
                隣接ペア: ${adjPairs} / ${this.sequenceItems.length - 1}
            </div>
        `;
        await App.wait(1500);

        this.currentLearningTrial++;
        this.runLearningTrial();
    },

    async presentSequence(items) {
        const content = App.getTestContent();
        const shownSlots = [];

        for (let i = 0; i < items.length; i++) {
            content.innerHTML = `
                <div class="ps-presentation">
                    <div class="ps-current-item">${items[i].emoji}</div>
                    <div class="ps-current-label">${items[i].label}</div>
                    <div class="ps-sequence-display">
                        ${shownSlots.map(s => `<div class="ps-seq-slot">${s}</div>`).join('')}
                        <div class="ps-seq-slot" style="border-color:#4a90d9;"></div>
                    </div>
                </div>
            `;
            await App.wait(this.ITEM_DISPLAY_MS);

            shownSlots.push(items[i].emoji);
            content.innerHTML = `
                <div class="ps-presentation">
                    <div class="ps-current-item" style="opacity:0.3;font-size:2rem;">${items[i].emoji}</div>
                    <div class="ps-sequence-display">
                        ${shownSlots.map(s => `<div class="ps-seq-slot">${s}</div>`).join('')}
                    </div>
                </div>
            `;
            await App.wait(this.MOVE_ANIM_MS);
        }

        content.innerHTML = `
            <div class="ps-presentation">
                <div style="color:#888;margin-bottom:10px;">全体を確認してください</div>
                <div class="ps-sequence-display">
                    ${items.map(item => `<div class="ps-seq-slot">${item.emoji}</div>`).join('')}
                </div>
            </div>
        `;
        await App.wait(this.FULL_SEQ_DISPLAY_MS);
    },

    reorderPhase(correctItems) {
        return new Promise(resolve => {
            const content = App.getTestContent();
            const shuffled = App.shuffle([...correctItems]);
            const sourceItems = shuffled.map((item, i) => ({ ...item, id: i }));
            const slots = new Array(correctItems.length).fill(null);
            let dragItem = null;

            const activateFocus = (selector) => {
                const el = content.querySelector(selector);
                if (el) el.focus();
            };

            const handleSourceActivate = (id) => {
                dragItem = sourceItems.find(si => si.id === id);
                render({ focus: 'first-empty-slot' });
            };

            const handlePlaceAt = (slotIdx) => {
                if (!dragItem) return;
                slots[slotIdx] = dragItem;
                dragItem = null;
                const allPlaced = slots.every(s => s !== null);
                render({ focus: allPlaced ? 'confirm' : 'first-source' });
            };

            const handleRemoveAt = (slotIdx) => {
                if (slots[slotIdx] == null) return;
                slots[slotIdx] = null;
                render({ focus: 'first-source' });
            };

            const render = (opts = {}) => {
                let slotsHtml = '<div class="ps-subheading">正しい順序に並べてください（左から右へ）</div>';
                slotsHtml += '<div class="ps-drop-zone" role="list">';
                for (let i = 0; i < slots.length; i++) {
                    if (slots[i] !== null) {
                        slotsHtml += `<div class="ps-drop-slot occupied" data-slot="${i}" data-action="remove" role="button" tabindex="0" aria-label="${i + 1}番目: ${slots[i].label}（押すと取り消し）">${slots[i].emoji}</div>`;
                    } else {
                        slotsHtml += `<div class="ps-drop-slot" data-slot="${i}" data-action="place" role="button" tabindex="0" aria-label="${i + 1}番目のスロット（空）${dragItem ? ' — Enter で配置' : ''}">${i + 1}</div>`;
                    }
                }
                slotsHtml += '</div>';

                const availableItems = sourceItems.filter(si =>
                    !slots.some(s => s !== null && s.id === si.id)
                );

                let sourceHtml = '<div class="ps-subheading">アイテムを選んで上のスロットに配置してください</div>';
                sourceHtml += '<div class="ps-source-area" role="group" aria-label="配置候補アイテム">';
                for (const item of availableItems) {
                    const selected = dragItem && dragItem.id === item.id;
                    sourceHtml += `<div class="ps-draggable ${selected ? 'dragging' : ''}" data-id="${item.id}" role="button" tabindex="0" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${item.label}">${item.emoji}</div>`;
                }
                sourceHtml += '</div>';

                const allPlaced = slots.every(s => s !== null);
                const btnHtml = allPlaced
                    ? '<button class="btn btn-primary mt-2" id="btn-ps-confirm">確定</button>'
                    : '';

                const hint = '<p class="field-hint ps-keyboard-hint">キーボード: Tab で移動、Enter / Space で選択・配置・取り消し</p>';
                const currentSelection = dragItem
                    ? `<div class="ps-current-selection" aria-live="polite">選択中: ${dragItem.emoji} ${dragItem.label}</div>`
                    : '';

                content.innerHTML = slotsHtml + sourceHtml + btnHtml + hint + currentSelection;

                content.querySelectorAll('.ps-draggable').forEach(el => {
                    el.addEventListener('click', () => handleSourceActivate(parseInt(el.dataset.id)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSourceActivate(parseInt(el.dataset.id));
                        }
                    });
                });

                content.querySelectorAll('.ps-drop-slot[data-action="place"]').forEach(el => {
                    el.addEventListener('click', () => handlePlaceAt(parseInt(el.dataset.slot)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePlaceAt(parseInt(el.dataset.slot));
                        }
                    });
                });

                content.querySelectorAll('.ps-drop-slot[data-action="remove"]').forEach(el => {
                    el.addEventListener('click', () => handleRemoveAt(parseInt(el.dataset.slot)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            handleRemoveAt(parseInt(el.dataset.slot));
                        }
                    });
                });

                const confirmBtn = document.getElementById('btn-ps-confirm');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => resolve(slots));
                }

                // Focus management for keyboard-only users.
                switch (opts.focus) {
                    case 'first-source':
                        activateFocus('.ps-draggable');
                        break;
                    case 'first-empty-slot':
                        activateFocus('.ps-drop-slot[data-action="place"]');
                        break;
                    case 'confirm':
                        activateFocus('#btn-ps-confirm');
                        break;
                    default:
                        activateFocus('.ps-draggable');
                }
            };

            render({ focus: 'first-source' });
        });
    },

    countAdjacentPairs(response, correct) {
        let count = 0;
        for (let i = 0; i < correct.length - 1; i++) {
            const label1 = correct[i].label;
            const label2 = correct[i + 1].label;
            const pos1 = response.findIndex(r => r.label === label1);
            const pos2 = response.findIndex(r => r.label === label2);
            if (pos1 >= 0 && pos2 >= 0 && pos2 === pos1 + 1) {
                count++;
            }
        }
        return count;
    },

    endTest() {
        const totalPairs = this.trials.reduce((sum, t) => sum + t.adjacentPairs, 0);
        const maxTotal = this.trials.reduce((sum, t) => sum + t.maxPairs, 0);

        const result = {
            score: totalPairs,
            detail: `${totalPairs} / ${maxTotal} 隣接ペア`,
            theme: this.currentThemeKey,
            practiceAttempts: 1,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: 0,
        };

        App.onTestComplete('picture-sequence', result, this.trials);
    },
};

App.testRegistry['picture-sequence'].module = PictureSequenceTest;
