// ==================== Cognitive Battery — Internationalization ====================

(function initI18n(global) {
    'use strict';

    const SUPPORTED_LOCALES = ['ja', 'en'];
    const FALLBACK_LOCALE = 'ja';
    const dictionaries = Object.create(null);

    const normalizeLocale = (value) => {
        const candidate = String(value || '').trim().toLowerCase().split('-')[0];
        return SUPPORTED_LOCALES.includes(candidate) ? candidate : FALLBACK_LOCALE;
    };

    const queryLocale = (() => {
        try {
            const requested = new URLSearchParams(global.location.search).get('lang');
            return SUPPORTED_LOCALES.includes(String(requested || '').toLowerCase())
                ? String(requested).toLowerCase()
                : null;
        } catch (error) {
            return null;
        }
    })();

    let locale = queryLocale || normalizeLocale(document.documentElement.lang);

    const readPath = (object, path) => path.reduce((value, key) => (
        value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined
    ), object);

    const interpolate = (value, params) => String(value).replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) => (
        Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
    ));

    const I18n = {
        TRANSLATION_VERSION: 'translations-2026-07-ja-en-v3',
        SUPPORTED_LOCALES: Object.freeze(SUPPORTED_LOCALES.slice()),

        register(namespace, translations) {
            if (!namespace || !translations || typeof translations !== 'object') {
                throw new TypeError('I18n.register(namespace, translations) requires a namespace and translation object.');
            }
            const current = dictionaries[namespace] || {};
            for (const supportedLocale of SUPPORTED_LOCALES) {
                current[supportedLocale] = {
                    ...(current[supportedLocale] || {}),
                    ...((translations[supportedLocale] && typeof translations[supportedLocale] === 'object')
                        ? translations[supportedLocale]
                        : {}),
                };
            }
            dictionaries[namespace] = current;
            return this;
        },

        t(key, params = {}) {
            const parts = String(key || '').split('.').filter(Boolean);
            const namespace = parts.shift();
            if (!namespace || !dictionaries[namespace]) return String(key || '');

            const localized = readPath(dictionaries[namespace][locale], parts);
            const fallback = readPath(dictionaries[namespace][FALLBACK_LOCALE], parts);
            const value = localized == null ? fallback : localized;
            return value == null ? String(key || '') : interpolate(value, params);
        },

        setLocale(value) {
            const nextLocale = normalizeLocale(value);
            const changed = nextLocale !== locale;
            locale = nextLocale;
            document.documentElement.lang = locale;
            this.apply(document);
            if (changed) {
                document.dispatchEvent(new CustomEvent('i18n:change', {
                    detail: { locale, translationVersion: this.TRANSLATION_VERSION },
                }));
            }
            return locale;
        },

        getLocale() {
            return locale;
        },

        apply(root = document) {
            document.documentElement.lang = locale;
            const query = (selector) => {
                const matches = [];
                if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) matches.push(root);
                if (typeof root.querySelectorAll === 'function') matches.push(...root.querySelectorAll(selector));
                return matches;
            };

            query('[data-i18n]').forEach((element) => {
                element.textContent = this.t(element.dataset.i18n);
            });
            query('[data-i18n-html]').forEach((element) => {
                element.innerHTML = this.t(element.dataset.i18nHtml);
            });
            for (const [dataAttribute, domAttribute] of [
                ['i18nPlaceholder', 'placeholder'],
                ['i18nAriaLabel', 'aria-label'],
                ['i18nTitle', 'title'],
            ]) {
                query(`[data-${dataAttribute.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}]`).forEach((element) => {
                    element.setAttribute(domAttribute, this.t(element.dataset[dataAttribute]));
                });
            }
            return root;
        },
    };

    global.I18n = I18n;
})(window);

I18n.register('common', {
    ja: {
        app: {
            subtitle: '認知機能テストバッテリー',
        },
        language: {
            heading: '表示言語',
            hint: '教示と画面に使用する言語を選択してください。開始後は変更できません。',
            lockedHint: '実施言語は研究者設定で固定されています。',
            ja: '日本語',
            en: 'English',
        },
        researcherConfig: {
            eyebrow: '研究者向け設定',
            title: '研究者用の研究設定',
            uiLanguage: '研究者画面の言語',
            subtitle: '参加者に適用する実施条件を設定し、配布用リンクを作成します。参加者情報や結果はプリセットに保存されません。',
            identity: {
                heading: '研究設定', studyId: '研究ID', studyIdPlaceholder: '例: wm-study-2026',
                studyIdHint: '研究計画内で一意の、個人情報を含まないIDを指定してください。',
            },
            language: {
                heading: '実施言語', default: '参加者の既定言語', lock: '参加者による言語変更を禁止する',
                fixed: '研究者設定により固定', selectable: '参加者が開始前に変更可能',
            },
            tasks: {
                heading: '実施課題と順序', hint: '固定順序では課題の選択と並べ替えができます。選択済み課題の上下ボタンを使用してください。',
                selectedCount: '{count}課題',
            },
            order: {
                heading: '順序方式', williams: 'Williams design（推奨）',
                williamsHint: '全7課題を参加者IDに基づく14順序へ自動割当します。',
                fixed: '固定カスタム順序', fixedHint: '選択した課題をすべての参加者に同じ順序で実施します。',
                moveUp: '{task}を上へ', moveDown: '{task}を下へ',
                moved: '{task}を{position}番目へ移動しました。',
            },
            protocol: {
                preset: 'プロトコルプリセット', presetLiterature: '先行研究参照・固定版 2026-07 v1',
                immutable: '刺激、時間、試行数、採点条件はこのプリセットで固定されます。',
                heading: '固定プロトコル概要', lockedHeading: '測定条件は固定',
                lockedBody: '刺激バンク、提示時間、試行数、停止規則、採点方法は先行研究を参照した独自Web実装の固定版です。ここでは変更できません。',
                version: 'プロトコル版', configuredLanguage: '既定言語', languagePolicy: '言語ポリシー',
                orderPolicy: '順序方式', selectedTasks: '選択課題', configPreview: '設定プレビュー',
                williamsPreview: '全7課題を、参加者IDに基づく14順序のいずれかへ割り当てます。',
            },
            preset: {
                heading: '設定プリセット', name: 'プリセット名', namePlaceholder: '例: Main study EN',
                saved: '保存済みプリセット', none: '保存済みプリセットなし', save: '保存', load: '読込', delete: '削除',
                savedStatus: 'プリセット「{name}」を保存しました。', loadedStatus: 'プリセット「{name}」を読み込みました。',
                deletedStatus: 'プリセット「{name}」を削除しました。', nameRequired: 'プリセット名を入力してください。',
                selectRequired: '保存済みプリセットを選択してください。', invalid: 'このプリセットを読み込めません。',
                overwriteConfirm: 'プリセット「{name}」を上書きしますか？', deleteConfirm: 'プリセット「{name}」を削除しますか？',
            },
            link: {
                heading: '参加者へ配布', description: '現在の研究設定を埋め込んだ参加者専用リンクを作成します。',
                urlLabel: '参加者用リンク', placeholder: '「参加者リンクを作成」を押すと、ここにURLが表示されます。',
                privacy: 'リンクには研究設定だけが含まれ、参加者情報や結果は含まれません。設定を変更した場合はリンクを作り直してください。',
                generate: '参加者リンクを作成', generated: '参加者リンクを作成しました。内容を確認してコピーまたはプレビューしてください。',
                generateFailed: '参加者リンクを作成できませんでした。', copy: 'リンクをコピー',
                copied: '参加者リンクをコピーしました。', copyFailed: '参加者リンクをコピーできませんでした。',
                preview: '参加者画面をプレビュー',
            },
            validation: {
                studyId: '研究IDを入力してください。', noTasks: '実施課題を1つ以上選択してください。',
                williamsAll: 'Williams designには全7課題が必要です。', hashUnavailable: 'このブラウザでは設定ハッシュを生成できません。HTTPSまたはlocalhostで開いてください。',
                integrity: '保存された研究設定の整合性を確認できませんでした。研究者に確認してください。', invalid: '研究設定の形式が正しくありません。',
                sessionVersion: '保存されたセッションは別のアプリ／プロトコル版で開始されています。混在を避けるため復元できません。研究者に確認してください。',
                sessionActive: '実施中は研究設定を変更できません。新しい参加者用に再開始してから設定してください。',
            },
            summary: {
                heading: '研究者設定が適用されています', id: '設定ID', language: '既定言語',
                order: '順序', tasks: '課題', locked: '固定', selectable: '参加者選択可',
                williams: 'Williams design', fixed: '固定順序', edit: '設定を編集',
            },
            cancel: 'キャンセル', clear: '研究者設定を解除', clearConfirm: '現在の研究者設定を解除しますか？', apply: 'この端末に設定を適用',
            applied: 'この端末に研究者設定を適用しました。', cleared: '研究者設定を解除しました。参加者が開始画面で選択できます。',
        },
        consent: {
            heading: '実施の説明と同意',
            purpose: '<strong>目的:</strong> 研究者または開始画面で選択された認知課題に参加いただきます。所要時間は課題構成により異なり、全7課題の場合は約30〜45分です。',
            data: '<strong>データ:</strong> 回答、反応時間、画面操作ログ（タブ離脱・フォーカス離脱などの品質ログ）、ブラウザ環境情報を記録します。データは<strong>参加者の端末内にのみ保存</strong>され、結果の Excel ファイルは参加者自身がダウンロード・共有する形式です。サーバには送信されません。',
            privacy: '<strong>個人情報:</strong> 参加者IDと年齢のみ必須です。氏名欄は任意であり、記入しないまま進めることもできます。研究利用時は ID のみでの識別を推奨します。',
            voluntary: '<strong>任意性:</strong> 参加は任意であり、途中でページを閉じて中断できます。中断時点までの未保存データは破棄されます。',
            contact: '<strong>連絡先:</strong> 試験の趣旨や結果について質問がある場合は、試験実施者にお問い合わせください。',
            agree: '上記を読み、理解した上で参加に同意します',
            noPersist: '共有 PC で実施するため、この端末に進行状況を保存しない（途中復元できなくなります）',
        },
        participant: {
            heading: '参加者情報',
            id: '参加者ID',
            age: '年齢',
            distance: '画面までの目の距離 (cm)',
            distanceHint: '視覚度換算の参考値として記録されます。',
            name: '氏名',
            nameHint: '研究データとしては参加者IDのみを利用します。',
            required: '必須',
            optional: '任意',
            tests: '実施するテスト',
            selectAll: 'すべてのテストを実施',
            idPlaceholder: '例: P001',
            agePlaceholder: '18-85',
            distancePlaceholder: '例: 60',
            namePlaceholder: '記入しなくても進められます',
        },
        preflight: {
            heading: '実施前チェック',
            display: 'ディスプレイ確認',
            grayscaleHint: '8段階のグレー（黒〜白）がすべて区別できることを確認してください。',
            desktop: 'PC とキーボードを使える環境です',
            quiet: '静かな場所で、途中離席せずに実施できます',
            fullscreen: 'テスト中はタブ切替や画面縮小をしません',
            grayscale: '上の 8 段階のグレーがすべて区別できる',
            note: 'PC とキーボードで実施してください。テスト中にブラウザバックや再読み込みをすると警告が表示されます。',
        },
        start: {
            note: '準備が整ったら開始してください。課題中は画面中央の刺激に集中してください。',
            button: '開始',
        },
        results: {
            heading: 'テスト結果',
            saveExcel: 'Excelファイルを保存',
            researcher: '研究者向け詳細',
            saveJson: 'JSONを保存',
            restart: '最初に戻る',
        },
        tasks: {
            flanker: { name: 'フランカー課題', domain: '抑制制御・注意', list: '1. フランカー課題（抑制制御・注意）' },
            dccs: { name: 'カード分類課題', domain: '認知的柔軟性', list: '2. カード分類課題（認知的柔軟性）' },
            listSorting: { name: 'リストソート課題', domain: 'ワーキングメモリ', list: '3. リストソート課題（ワーキングメモリ）' },
            visualDigitSpan: { name: '視覚的数字スパン課題', domain: 'ワーキングメモリ', list: '4. 視覚的数字スパン課題（ワーキングメモリ）' },
            ecorsi: { name: 'eCorsi ブロック課題', domain: '視空間ワーキングメモリ', list: '5. eCorsi ブロック課題（視空間ワーキングメモリ）' },
            patternComparison: { name: 'パターン比較課題', domain: '処理速度', list: '6. パターン比較課題（処理速度）' },
            pictureSequence: { name: '系列記憶課題', domain: 'エピソード記憶', list: '7. 系列記憶課題（エピソード記憶）' },
        },
        navigationWarning: 'テスト中です。ブラウザバックや再読み込みをすると、現在の課題は最初から再開になります。',
        status: {
            preparing: '準備中',
            taskPreparing: '課題準備',
            break: '休憩',
            practice: '練習',
            test: '本番',
            progress: '進捗 {current} / {total}',
            taskCount: '課題 {current} / {total}',
            taskAndDomain: '{task}（{domain}）',
        },
        environment: {
            mobile: 'モバイル端末が検出されました', pc: 'PC 環境が検出されました',
            mobileDetail: 'スマートフォンやタブレットでの実施は推奨しません。',
            viewport: '表示領域 {width} × {height}', viewportDetail: '推奨は {width} × {height} 以上です。',
            browser: 'ブラウザ: {browser}', browserDetail: 'ブラウザバックや再読み込みをすると警告が表示されます。',
            touch: 'タッチ入力対応端末です', keyboard: 'キーボード中心の端末です', touchDetail: '本テストはキーボード操作を前提に設計されています。',
            fullscreenYes: 'フルスクリーンに対応しています', fullscreenNo: 'フルスクリーン未対応です', fullscreenDetail: '実施中はフルスクリーンを推奨します。',
            storageYes: '安全なセッション復元に対応しています', storageNo: '安全なセッション復元を利用できません', storageDetail: 'localStorage または Web Locks API が利用できない場合、進行状況を保存する実施はできません。「この端末に保存しない」での実施と Excel 保存は利用できます。',
            statusPass: 'OK', statusWarn: '注意', statusFail: '不可',
        },
        saved: {
            complete: '完了済み', found: '前回のセッションが見つかりました', unnamed: '未入力', noId: 'IDなし',
            resumePoint: '再開地点: {task}', resume: '復元する', discard: '破棄する',
            verifyingHeading: '保存済みセッションを確認しています',
            verifyingBody: '研究設定と保存データの完全性を確認しています。しばらくお待ちください。',
            mismatchHeading: '保存済みセッションをこのリンクで確認できません',
            mismatchBody: '現在の研究設定と異なるか、設定の完全性を確認できないため復元できません。参加者情報は表示していません。正しい参加者リンクを開くか、研究実施者の指示に従って保存データを破棄してください。',
            unsupportedHeading: 'このブラウザでは保存済みセッションを安全に扱えません',
            unsupportedBody: '複数タブ間の排他制御に必要な Web Locks API を利用できません。参加者情報は表示していません。対応する最新版の Chrome または Edge で正しい参加者リンクを開いてください。',
            discardDialogHeading: '保存済みセッションを破棄しますか？',
            discardDialogBody: '破棄すると、この端末にある中断データは復元できません。研究実施者から指示された場合、または不要だと確認できた場合だけ実行してください。',
            discardCancel: 'キャンセル', discardConfirm: '保存データを破棄',
            discarded: '保存済みセッションを破棄しました。',
            discardChanged: '確認中に保存データが更新されたため、破棄しませんでした。もう一度内容を確認してください。',
            discardUnavailable: 'このブラウザでは安全な破棄確認を利用できないため、保存データを削除しませんでした。研究実施者に連絡してください。',
            ownershipLost: '別のタブで保存データが更新されました。このタブからは進行状況を保存しません。研究実施者に連絡してください。',
            ownershipLostHeading: 'このタブでの実施を停止しました',
            ownershipLostBody: '別のタブが同じ保存済みセッションを復元したため、このタブの回答は保存・出力できません。データの重複や混在を防ぐため、ここから先へは進めません。',
            ownershipLostInstruction: 'このタブを閉じ、セッションを復元した方のタブだけを使用してください。不明な場合は研究実施者に連絡してください。',
            restoredHeading: 'セッションを復元しました', restored: '前回の途中状態を読み込みました。',
            currentTask: '現在の課題は「{task}」です。', restartTask: 'この課題は最初から再開されます。完了済みの課題結果は保持されています。',
            restartButton: '現在の課題を再開',
        },
        validation: {
            consent: '実施の説明を読み、同意チェックを入れてください。', id: '参加者IDを入力してください。',
            age: '年齢を18〜85の範囲で入力してください。', distance: '画面までの距離は空欄、または 30〜150 cm の範囲で入力してください。',
            tests: '少なくとも1つのテストを選択してください。', environment: '実施できない環境です: {details}', readiness: '実施前チェックの確認項目をすべて確認してください。',
            savedSessionPending: '保存済みセッションを復元または破棄してから、新しいセッションを開始してください。',
            savedSessionMismatch: 'このリンクでは保存済みセッションを復元できません。正しい参加者リンクを開くか、研究実施者の指示に従って保存データを破棄してください。',
            savedSessionUnsupported: 'このブラウザでは保存済みセッションを安全に復元・破棄できません。最新版の Chrome または Edge で正しい参加者リンクを開いてください。',
            savedSessionVerifying: '保存済みセッションを確認中です。確認が完了してから操作してください。',
            storageUnavailable: 'この端末でセッションの保存領域を安全に確保できませんでした。別のタブを閉じて再試行するか、共有PC用の「保存しない」を選択してください。',
        },
        loading: { heading: '準備中', body: '刺激を読み込んでいます。数秒お待ちください。' },
        error: { heading: '読み込みエラー', task: '「{task}」を開始できませんでした。', recovery: 'ページを再読み込みするか、セッションを破棄して最初からやり直してください。', return: '開始画面へ戻る' },
        breakScreen: { heading: '休憩', complete: '{completed} / {total} のテストが完了しました。', next: '次は「{task}」（{domain}）です。', instruction: '準備ができたら、下のボタンかスペースキーで進んでください。', nextButton: '次へ進む' },
        resultScreen: {
            participant: '参加者: {participant} ／ 年齢: {age}歳 ／ {date}{seed}', seed: ' ／ シード: {seed}',
            test: 'テスト', domain: '認知ドメイン', score: 'スコア', detail: '詳細', qualityHeading: '品質ログ',
            tab: 'タブ離脱', focus: 'フォーカス離脱', fullscreen: 'フルスクリーン解除', resize: '画面サイズ変更', fast: '極端に速い反応', timeout: 'タイムアウト総数',
            countTimes: '{count}回', countItems: '{count}件', review: '研究者確認: {notes}', reviewFallback: '品質ログに確認候補があります。',
            clear: '品質フラグは検出されませんでした。解析時には事前登録した基準に従って最終判断してください。',
            qcNote: 'QC は単一の除外判定ではなく、Excel の QC Multiverse に複数 universe として保存されます。',
            downloadNote: '研究者に提出するファイルは Excel 1 つです。下のボタンから保存してください。',
        },
        qualityFlags: {
            tab: 'タブ離脱 {count}回', focus: 'フォーカス離脱 {count}回', fullscreen: 'フルスクリーン解除 {count}回', resize: '画面サイズ変更 {count}回',
            timeout: 'タイムアウト {count}件', fast: '極端に速い反応 {count}件', slow: '極端に遅い反応 {count}件', longTask: 'long task {count}件',
            viewport: '表示領域 {width}x{height}', block: '環境ブロック {count}件', warning: '環境注意 {count}件', storage: 'localStorage 利用不可',
            practiceItem: '{task} {count}回', lowAccuracy: '低正答率: {items}', practice: '練習反復: {items}',
        },
        alerts: { xlsxMissing: 'Excel ライブラリを読み込めませんでした。ページを再読み込みしてから、もう一度試してください。', noSession: '保存できるセッションがありません。', excelFailed: 'Excel の保存に失敗しました。参加者IDに使えない記号が入っていないか確認してください。' },
    },
    en: {
        app: { subtitle: 'Cognitive Assessment Battery' },
        language: { heading: 'Display language', hint: 'Choose the language used for instructions and screens. It cannot be changed after the session starts.', lockedHint: 'The session language is locked by the researcher configuration.', ja: '日本語', en: 'English' },
        researcherConfig: {
            eyebrow: 'Researcher setup',
            title: 'Researcher Study Configuration',
            uiLanguage: 'Researcher interface language',
            subtitle: 'Configure the conditions applied to participants and create a distribution link. Presets never contain participant information or results.',
            identity: {
                heading: 'Study settings', studyId: 'Study ID', studyIdPlaceholder: 'e.g., wm-study-2026',
                studyIdHint: 'Use an identifier that is unique within the study plan and contains no personal information.',
            },
            language: {
                heading: 'Session language', default: 'Participant default language', lock: 'Prevent participants from changing the language',
                fixed: 'Locked by the study configuration', selectable: 'Participant may change it before starting',
            },
            tasks: {
                heading: 'Tasks and order', hint: 'With a fixed order, select tasks and reorder the selected tasks using the move buttons.',
                selectedCount: '{count} tasks',
            },
            order: {
                heading: 'Order policy', williams: 'Williams design (recommended)',
                williamsHint: 'Assign all seven tasks to one of 14 orders based on participant ID.',
                fixed: 'Fixed custom order', fixedHint: 'Use the selected tasks in the same order for every participant.',
                moveUp: 'Move {task} up', moveDown: 'Move {task} down',
                moved: 'Moved {task} to position {position}.',
            },
            protocol: {
                preset: 'Protocol preset', presetLiterature: 'Literature-informed fixed version 2026-07 v1',
                immutable: 'Stimuli, timing, trial counts, and scoring rules are fixed by this preset.',
                heading: 'Fixed protocol summary', lockedHeading: 'Measurement conditions are locked',
                lockedBody: 'Stimulus banks, presentation timing, trial counts, stopping rules, and scoring are fixed in this independently implemented, literature-informed web protocol and cannot be edited here.',
                version: 'Protocol version', configuredLanguage: 'Default language', languagePolicy: 'Language policy',
                orderPolicy: 'Order policy', selectedTasks: 'Selected tasks', configPreview: 'Configuration preview',
                williamsPreview: 'All seven tasks are assigned to one of 14 orders based on the participant ID.',
            },
            preset: {
                heading: 'Configuration presets', name: 'Preset name', namePlaceholder: 'e.g., Main study EN',
                saved: 'Saved preset', none: 'No saved presets', save: 'Save', load: 'Load', delete: 'Delete',
                savedStatus: 'Saved preset “{name}”.', loadedStatus: 'Loaded preset “{name}”.',
                deletedStatus: 'Deleted preset “{name}”.', nameRequired: 'Enter a preset name.',
                selectRequired: 'Select a saved preset.', invalid: 'This preset could not be loaded.',
                overwriteConfirm: 'Overwrite preset “{name}”?', deleteConfirm: 'Delete preset “{name}”?',
            },
            link: {
                heading: 'Distribute to participants', description: 'Create a participant-facing link containing the current study configuration.',
                urlLabel: 'Participant link', placeholder: 'Select “Create participant link” to display the URL here.',
                privacy: 'The link contains only the study configuration, never participant information or results. Create a new link after changing any setting.',
                generate: 'Create participant link', generated: 'Participant link created. Review it, then copy it or open the participant preview.',
                generateFailed: 'The participant link could not be created.', copy: 'Copy link',
                copied: 'Participant link copied.', copyFailed: 'The participant link could not be copied.',
                preview: 'Preview participant screen',
            },
            validation: {
                studyId: 'Enter a study ID.', noTasks: 'Select at least one task.',
                williamsAll: 'Williams design requires all seven tasks.', hashUnavailable: 'This browser cannot generate a configuration hash. Open the app over HTTPS or localhost.',
                integrity: 'The saved study configuration could not be verified. Contact the researcher.', invalid: 'The study configuration is invalid.',
                sessionVersion: 'This session was started with a different app or protocol version and cannot be restored without mixing versions. Contact the researcher.',
                sessionActive: 'The researcher configuration cannot be changed during a session. Restart for a new participant before editing it.',
            },
            summary: {
                heading: 'A researcher configuration is active', id: 'Configuration ID', language: 'Default language',
                order: 'Order', tasks: 'Tasks', locked: 'Locked', selectable: 'Participant-selectable',
                williams: 'Williams design', fixed: 'Fixed order', edit: 'Edit configuration',
            },
            cancel: 'Cancel', clear: 'Clear researcher configuration', clearConfirm: 'Clear the current researcher configuration?', apply: 'Apply on this device',
            applied: 'The researcher configuration has been applied on this device.', cleared: 'The researcher configuration was cleared. Participants can choose on the start screen.',
        },
        consent: {
            heading: 'Study information and consent',
            purpose: '<strong>Purpose:</strong> You will complete the cognitive tasks selected by the researcher or on the start screen. Duration depends on the task set; the full seven-task battery takes approximately 30–45 minutes.',
            data: '<strong>Data:</strong> We record responses, response times, screen-interaction quality logs (such as tab or focus changes), and browser environment information. Data are <strong>stored only on your device</strong>. You download and share the resulting Excel file yourself; no data are sent to a server.',
            privacy: '<strong>Personal information:</strong> Only participant ID and age are required. Name is optional and may be left blank. For research use, identification by ID only is recommended.',
            voluntary: '<strong>Voluntary participation:</strong> Participation is voluntary, and you may stop by closing the page. Any unsaved data collected up to that point will be discarded.',
            contact: '<strong>Contact:</strong> If you have questions about the study or your results, please contact the study administrator.',
            agree: 'I have read and understood the information above and consent to participate',
            noPersist: 'This is a shared computer; do not save progress on this device (the session cannot be resumed)',
        },
        participant: {
            heading: 'Participant information', id: 'Participant ID', age: 'Age', distance: 'Eye-to-screen distance (cm)',
            distanceHint: 'Recorded as a reference for converting visual angle.', name: 'Name', nameHint: 'Only the participant ID should be used in research data.',
            required: 'Required', optional: 'Optional', tests: 'Tests to administer', selectAll: 'Administer all tests',
            idPlaceholder: 'e.g., P001', agePlaceholder: '18–85', distancePlaceholder: 'e.g., 60', namePlaceholder: 'You may leave this blank',
        },
        preflight: {
            heading: 'Pre-session check', display: 'Display check', grayscaleHint: 'Confirm that you can distinguish all eight gray levels, from black to white.',
            desktop: 'I am using a computer with a keyboard', quiet: 'I am in a quiet place and can remain seated throughout',
            fullscreen: 'I will not switch tabs or resize the window during the tests', grayscale: 'I can distinguish all eight gray levels above',
            note: 'Use a computer and keyboard. Browser Back or reloading the page during a test will display a warning.',
        },
        start: { note: 'When you are ready, start the session. Keep your attention on the stimulus in the center of the screen.', button: 'Start' },
        results: { heading: 'Test results', saveExcel: 'Save Excel file', researcher: 'Researcher details', saveJson: 'Save JSON', restart: 'Return to start' },
        tasks: {
            flanker: { name: 'Flanker Task', domain: 'Inhibitory Control and Attention', list: '1. Flanker Task (Inhibitory Control and Attention)' },
            dccs: { name: 'Card Sorting Task', domain: 'Cognitive Flexibility', list: '2. Card Sorting Task (Cognitive Flexibility)' },
            listSorting: { name: 'List Sorting Task', domain: 'Working Memory', list: '3. List Sorting Task (Working Memory)' },
            visualDigitSpan: { name: 'Visual Digit Span Task', domain: 'Working Memory', list: '4. Visual Digit Span Task (Working Memory)' },
            ecorsi: { name: 'eCorsi Block Task', domain: 'Visuospatial Working Memory', list: '5. eCorsi Block Task (Visuospatial Working Memory)' },
            patternComparison: { name: 'Pattern Comparison Task', domain: 'Processing Speed', list: '6. Pattern Comparison Task (Processing Speed)' },
            pictureSequence: { name: 'Picture Sequence Memory Task', domain: 'Episodic Memory', list: '7. Picture Sequence Memory Task (Episodic Memory)' },
        },
        navigationWarning: 'A test is in progress. Using Browser Back or reloading will restart the current test from the beginning.',
        status: { preparing: 'Preparing', taskPreparing: 'Preparing task', break: 'Break', practice: 'Practice', test: 'Test', progress: 'Progress {current} / {total}', taskCount: 'Task {current} / {total}', taskAndDomain: '{task} ({domain})' },
        environment: {
            mobile: 'A mobile device was detected', pc: 'A computer environment was detected', mobileDetail: 'Smartphones and tablets are not recommended.',
            viewport: 'Viewport {width} × {height}', viewportDetail: 'Recommended: at least {width} × {height}.', browser: 'Browser: {browser}', browserDetail: 'Using Browser Back or reloading will display a warning.',
            touch: 'This device supports touch input', keyboard: 'This device is primarily keyboard-based', touchDetail: 'This battery is designed primarily for keyboard use.',
            fullscreenYes: 'Fullscreen is supported', fullscreenNo: 'Fullscreen is not supported', fullscreenDetail: 'Fullscreen is recommended during testing.',
            storageYes: 'Safe session recovery is available', storageNo: 'Safe session recovery is unavailable', storageDetail: 'If localStorage or the Web Locks API is unavailable, testing with progress saving is disabled. Testing without device storage and Excel export remain available.',
            statusPass: 'OK', statusWarn: 'Caution', statusFail: 'Unavailable',
        },
        saved: {
            complete: 'Completed', found: 'A previous session was found', unnamed: 'Not entered', noId: 'No ID', resumePoint: 'Resume point: {task}', resume: 'Restore', discard: 'Discard',
            verifyingHeading: 'Checking the saved session',
            verifyingBody: 'Checking its study configuration and saved-data integrity. Please wait.',
            mismatchHeading: 'The saved session cannot be verified for this link',
            mismatchBody: 'It cannot be restored because its study configuration differs or its integrity cannot be verified. Participant information is hidden. Open the correct participant link, or discard the saved data only when instructed by the study administrator.',
            unsupportedHeading: 'This browser cannot safely handle the saved session',
            unsupportedBody: 'The Web Locks API required for safe cross-tab coordination is unavailable. Participant information is hidden. Open the correct participant link in the latest Chrome or Edge.',
            discardDialogHeading: 'Discard the saved session?',
            discardDialogBody: 'Discarding permanently removes the interrupted session from this device. Continue only when instructed by the study administrator or when you have confirmed that it is no longer needed.',
            discardCancel: 'Cancel', discardConfirm: 'Discard saved data',
            discarded: 'The saved session was discarded.',
            discardChanged: 'The saved data changed while you were reviewing it, so it was not discarded. Review it again before continuing.',
            discardUnavailable: 'The saved data was not deleted because this browser cannot provide a safe discard confirmation. Contact the study administrator.',
            ownershipLost: 'Saved data was updated in another tab. This tab will no longer save progress. Contact the study administrator.',
            ownershipLostHeading: 'Testing has stopped in this tab',
            ownershipLostBody: 'Another tab restored the same saved session, so answers from this tab cannot be saved or exported. To prevent duplicate or mixed data, you cannot continue here.',
            ownershipLostInstruction: 'Close this tab and use only the tab that restored the session. Contact the study administrator if you are unsure which tab to use.',
            restoredHeading: 'Session restored', restored: 'The previous session state has been loaded.', currentTask: 'The current task is “{task}.”',
            restartTask: 'This task will restart from the beginning. Results from completed tasks have been retained.', restartButton: 'Restart current task',
        },
        validation: {
            consent: 'Read the study information and check the consent box.', id: 'Enter a participant ID.', age: 'Enter an age from 18 to 85.',
            distance: 'Leave the screen distance blank or enter a value from 30 to 150 cm.', tests: 'Select at least one test.',
            environment: 'This environment cannot be used: {details}', readiness: 'Confirm every item in the pre-session checklist.',
            savedSessionPending: 'Restore or discard the saved session before starting a new session.',
            savedSessionMismatch: 'This link cannot restore the saved session. Open the correct participant link, or discard the saved data only when instructed by the study administrator.',
            savedSessionUnsupported: 'This browser cannot safely restore or discard the saved session. Open the correct participant link in the latest Chrome or Edge.',
            savedSessionVerifying: 'The saved session is still being checked. Wait for verification to finish before continuing.',
            storageUnavailable: 'A safe session-storage slot could not be reserved on this device. Close other tabs and try again, or select the shared-computer option to continue without saving.',
        },
        loading: { heading: 'Preparing', body: 'Loading the stimuli. Please wait a few seconds.' },
        error: { heading: 'Loading error', task: '“{task}” could not be started.', recovery: 'Reload the page, or discard the session and start again.', return: 'Return to start' },
        breakScreen: { heading: 'Break', complete: '{completed} / {total} tests completed.', next: 'Next: “{task}” ({domain}).', instruction: 'When you are ready, use the button below or press the Space bar.', nextButton: 'Continue' },
        resultScreen: {
            participant: 'Participant: {participant} / Age: {age} / {date}{seed}', seed: ' / Seed: {seed}', test: 'Test', domain: 'Cognitive domain', score: 'Score', detail: 'Details', qualityHeading: 'Quality log',
            tab: 'Tab changes', focus: 'Focus changes', fullscreen: 'Fullscreen exits', resize: 'Window resizes', fast: 'Extremely fast responses', timeout: 'Total timeouts',
            countTimes: '{count}', countItems: '{count}', review: 'Researcher review: {notes}', reviewFallback: 'The quality log contains items to review.',
            clear: 'No quality flags were detected. Apply the preregistered criteria when making the final analytic decision.',
            qcNote: 'QC is not a single exclusion decision; the Excel file stores multiple universes in the QC Multiverse sheet.',
            downloadNote: 'Submit one Excel file to the researcher. Save it using the button below.',
        },
        qualityFlags: {
            tab: 'Tab changes: {count}', focus: 'Focus changes: {count}', fullscreen: 'Fullscreen exits: {count}', resize: 'Window resizes: {count}',
            timeout: 'Timeouts: {count}', fast: 'Extremely fast responses: {count}', slow: 'Extremely slow responses: {count}', longTask: 'Long tasks: {count}',
            viewport: 'Viewport {width}x{height}', block: 'Environment blocks: {count}', warning: 'Environment cautions: {count}', storage: 'localStorage unavailable',
            practiceItem: '{task}: {count} attempts', lowAccuracy: 'Low accuracy: {items}', practice: 'Repeated practice: {items}',
        },
        alerts: { xlsxMissing: 'The Excel library could not be loaded. Reload the page and try again.', noSession: 'There is no session to save.', excelFailed: 'The Excel file could not be saved. Check the participant ID for unsupported symbols.' },
    },
});
