# Cognitive Battery

日本語または英語で、Web 上から実施できる成人向け認知機能テストバッテリーです。

GitHub Pages での公開を想定しており、参加者は自宅から PC で実施します。

このアプリは、`Flanker`、`DCCS`、`List Sorting`、`Visual Digit Span`、`eCorsi`、`Pattern Comparison`、`Picture Sequence` の先行研究に基づく手続きを実装していますが、**NIH Toolbox、WAIS、その他の市販検査の厳密再現ではありません**。

位置づけとしては、先行研究を参考にした **独自 Web 版バッテリー** です。

## 想定用途

- 日本語話者・英語話者の成人参加者に対する遠隔実施
- サンプル内での相対比較
- 受験者提出用の Excel 1 ファイル保存
- GitHub Pages での静的配信

## 特徴

- 7つの課題を 1 つの画面で連続実施
- 同意前に選択する日本語／英語表示（URL の `?lang=ja` / `?lang=en` でも指定可能）
- `?mode=researcher` で開く専用の Study Configuration 画面
- 研究者による実施言語の固定、課題選択、Williams design／固定カスタム順序の指定
- 研究設定プリセットの端末内保存・読込と、設定を埋め込んだ参加者リンクの生成
- 正規化した研究設定の SHA-256、設定 ID、実際の課題順を Excel／JSON に記録
- 参加前の説明と同意確認（Informed consent チェック、`CONSENT_VERSION` 追跡）
- 開始前の環境チェックと 8 段階グレースケール確認
- 刺激のプリロードとセッション開始時のウォームアップ
- `requestAnimationFrame` 同期 + `KeyboardEvent.timeStamp` による反応時間計測
- `PerformanceObserver('longtask')` でテスト中のフレーム逸脱を自動記録
- 試行順を再現可能にする seedable PRNG（mulberry32）
- 参加者 ID を FNV-1a ハッシュし、14順序の Williams design で7課題をカウンターバランス
- 適応的スパン課題には独立した task seed を導出し、早期中止が後続課題の刺激に影響しない設計
- セッションの自動保存と復元（乱数状態・セッション番号を含む）
- 複数タブの同時開始・上書きを排他制御し、古い画面からの保存データ破棄を比較更新で防止
- 同一参加者 ID のセッション番号を自動採番（リテスト対応）
- フルスクリーン試行
- タブ離脱、フォーカス離脱、画面サイズ変更などの品質ログ取得
- プロトコル・課題・採点・刺激プール・翻訳の版数と実施言語を出力に固定記録
- 研究者レビュー用の品質フラグ（低正答率、極端 RT、環境警告、フォーカス離脱など）を自動集計
- Quality Control を Multiverse Analysis として扱う `QC Multiverse` 出力
- 課題ごとのスコア、研究用メトリクス（IES、d′、congruency effect、switch cost、inattention flag 等）、試行別データを Excel に集約
- 研究者向け詳細として JSON 出力も可能（通常の受験者提出は Excel のみ）
- 出力ファイルに同梱された Codebook シートで列の意味・単位を明示
- Playwright による自動テストスイート
- Python / R の解析テンプレートと提出Excel検証ツール（ex-Gaussian フィット対応）

## 含まれる課題

1. フランカー課題（抑制制御・注意）
2. カード分類課題（認知的柔軟性）
3. リストソート課題（ワーキングメモリ）
4. 視覚数字スパン課題（Forward / Backward、ワーキングメモリ）
5. eCorsi課題（Forward / Backward、視空間ワーキングメモリ）
6. パターン比較課題（処理速度）
7. 系列記憶課題（エピソード記憶）

## 日本語／英語の切り替え

開始画面の言語セレクター、または URL の `?lang=ja` / `?lang=en` で実施言語を指定できます。同意後に課題を開始すると言語は固定され、セッション途中では変更できません。言語を切り替えた場合は、切り替え後の同意文を確認できるよう同意チェックが解除されます。

表示言語は `ui_language`、教示言語は `instruction_language`、刺激語の言語は `stimulus_language`、同意文の言語は `consent_language` として記録されます。翻訳辞書の版は `translation_version`、言語別同意文の版は `consent_version` に保存されます。課題 ID、Excel シート名、列名、回答コードは言語を切り替えても変わりません。

Flanker、DCCS、Pattern Comparison、Visual Digit Span、eCorsiは、刺激の構造を変えずに教示・画面文言を切り替えます。List SortingとPicture Sequenceは表示語が刺激の一部であるため、安定した刺激 ID と日英ラベルを分離し、言語別刺激バンクとして版管理します。日英版の測定等価性や規準値は保証されないため、言語別にパイロット検証し、実施言語を解析時の層別変数または共変量として扱ってください。

## 研究者用 Study Configuration

研究者設定は、通常の参加者画面とは別の次のURLから開きます。

```text
http://localhost:8000/?mode=researcher
```

設定できる項目は、研究ID、既定の実施言語、参加者による言語変更の可否、実施課題、課題順序です。新しい研究設定では参加者の既定実施言語が英語になり、必要に応じて日本語へ変更できます。既存リンク、保存済みプリセット、保存済みセッションの言語設定は変更されません。課題順序は次の2方式から選べます。
研究者画面自体の日本語／英語は画面右上で切り替えられ、参加者の既定実施言語とは独立しています。

- **Williams design** — 全7課題を必須とし、参加者IDに基づいて14順序へ決定論的に割り当てます
- **固定カスタム順序** — 任意の部分バッテリーを選び、選択済み課題の上下ボタンで全参加者共通の順序を指定します

「この端末に設定を適用」を選ぶと設定はこの端末に保存され、参加者画面の言語・課題選択が固定されます。言語変更を許可した設定では、参加者が開始前に日本語／英語を変更できます。設定プリセットには参加者情報や結果は含まれません。

画面内の「参加者へ配布」セクションでは、現在の設定から参加者リンクを作成し、URLの確認、クリップボードへのコピー、新しいタブでの参加者画面プレビューができます。設定を変更すると表示中のリンクは無効化されるため、古い設定を誤配布しないよう再作成してください。リンクは設定JSONをURLに埋め込み、リンク先で同じ設定を再計算・検証して適用します。リンクに参加者情報や結果は含まれません。ただし本アプリは静的アプリであり、この機能は設定伝達と操作上のロックを目的とするもので、認証や改ざん防止の電子署名ではありません。

刺激バンク、提示時間、試行数、停止規則、採点方法は、先行研究を参照した独自Web実装の `literature-aligned-2026-07-v1` 固定プリセットとして版管理され、研究者画面からは変更できません。設定本体は正規化後に SHA-256 を計算し、`study_config_id`、`study_config_hash`、`task_order_policy`、`configured_tasks`、`resolved_task_order` とともに出力されます。

### Visual Digit Span / eCorsi の固定プロトコル

両課題とも Forward と Backward を別条件として保持し、系列長2から開始します。本番は各系列長2試行で、1試行以上を完全正答すると次の系列長へ進み、同じ系列長の2試行を両方誤るとその条件を終了します（上限9）。部分点では進行せず、条件別の最長完全正答系列を span とします。

- **Visual Digit Span**: 数字1–9を黒色で1つずつ提示。点灯500 ms、SOA 1000 ms。Forward の後に Backward を実施し、画面上の数字キーまたはキーボードで回答
- **eCorsi**: 不規則に配置した9ブロックを500 ms点灯、SOA 1000 msで提示。各条件の前に長さ3の練習を3試行実施。回答はブロックを選び、取り消し・確定が可能
- **記録**: 提示系列、Backward用の正解系列、全回答、各刺激の実測点灯・消灯時刻、回答確定までの時間、eCorsiの初回タップ潜時と入力方法

根拠資料は Ebaid & Crewther (2018)、Kemtes & Allen (2008)、Brunetti et al. (2014)、Kessels et al. (2000) です。刺激系列とeCorsi配置は独自に作成しており、WAIS等の市販検査項目・規準値や、論文掲載の標準系列リストは複製していません。視覚提示の数字スパンは聴覚提示版と成績特性が異なるため、聴覚版の規準値を流用しないでください。

## 実施環境

推奨:

- Windows / macOS の PC
- キーボードあり
- Chrome または Edge の最新版

非推奨:

- スマートフォン
- タブレット
- タッチ操作のみの環境

テスト中にブラウザバックや再読み込みを行うと、警告が表示されます。  
セッション情報は `localStorage` に保存され、ページ再読込後に復元できます。ただし、**進行中の課題は最初から再開** されます（ここで再度乱数状態が正しく復元されます）。研究設定リンクまたは端末設定が有効な場合は、設定本文から再計算したハッシュ、セッション内の全ハッシュ記録、現在の研究設定がすべて一致するときだけ復元できます。不一致、欠落、改変、破損がある保存データは参加者情報を表示せず、復元と新規開始を停止して、明示的な破棄または元の研究リンクの確認を求めます。破棄には確認画面を挟み、確認中に別タブでデータが更新された場合は削除しません。

保存処理にはブラウザの Web Locks API と `session_instance_id` を使用します。同じ端末・ブラウザで複数タブから同時に開始した場合は1つだけが保存領域を取得し、他のタブは開始を中止します。Web Locks API 非対応環境では原子的な保存を保証できないため、進行状況を保存する実施は安全側に停止します。その場合でも共有PC用の「この端末に保存しない」を選べば実施できます。実施中の保存データが別タブで置き換わった場合は、データ混在を防ぐため旧タブの回答・進行・Excel／JSON出力を停止します。

## 参加者情報とプライバシー

- 参加者ID と 年齢 のみ必須です
- 氏名は任意であり、空欄のまま進められます（研究利用時は ID のみでの識別を推奨）
- 画面までの距離 (cm) は任意入力で、視覚度換算の参考値として記録されます
- 開始前に「実施の説明と同意」を読み、同意チェックを入れる必要があります
- データはサーバに送信されず、参加者端末内の `localStorage` と、ダウンロードした Excel ファイルにのみ保持されます

## データ保存

サーバ保存は行いません。  
結果は参加者の端末上で Excel ファイルとして保存されます。受験者が研究者へ提出するファイルは、この Excel 1 つだけです。

### Excel 出力のシート構成

- `Export Manifest` — 提出ファイルの版数、保存時刻、参加者 ID、セッション番号、含まれるシート一覧
- `Participant` — セッション固有ID、参加者メタデータ（ID・年齢・同意・視距離・実施言語）、乱数シード、実施環境、外れ値閾値
- `Scores` — 各課題の総合スコア、正答率、SAA の成分スコア、タイムアウト件数
- `Research Metrics` — 課題別詳細指標（全試行を 1 行のワイド形式）
- `Task Metrics Long` — 課題別メトリクスを「1 行 = 1 指標」の long 形式で記録
- `Protocol Metadata` — セッション固有ID、アプリ、プロトコル、課題、採点、刺激プール、翻訳、実施言語、タイミング手続きの版数
- `Study Configuration` — 研究設定ID・SHA-256、言語ポリシー、設定課題、順序方式、固定順と実際の割当順
- `Researcher Review` — 品質フラグ、確認メモ、課題別スコア・刺激条件を 1 行で集約
- `QC Multiverse` — 複数の QC universe と、その universe での含入候補 / 除外候補を長形式で記録
- `Session Quality` — タブ離脱、フォーカス離脱、フルスクリーン解除等のセッション品質指標
- `Session Events` — 品質イベントの時系列ログ
- `Codebook` — 各シートの列名・単位・説明
- `<test>_raw` — 試行レベルデータ（`trialNum`, `rt`, `tOnset`, `tResponse`, `correct`, など）

### 研究者向け JSON 出力

- 通常の受験者提出には使いません
- 研究者向け詳細メニューから、必要な場合だけ JSON 1 ファイルを保存できます
- R / Python での解析にも直接読み込めます
- キーは Excel のシート名に対応（`participant`, `protocol`, `study_configuration`, `quality_flags`, `researcher_review`, `qc_multiverse`, `environment`, `research_metrics`, `task_metrics_long`, `trials`, `codebook` など）

### 計算される主な研究用メトリクス

- **Flanker**: 正答率（congruent / incongruent / overall）、平均・中央・SD 反応時間、`congruency_effect_ms`、IES（Inverse Efficiency Score）
- **DCCS**: 正答率（dominant / non-dominant / overall）、反応時間各種、`switch_cost_ms`、IES
- **Pattern Comparison**: hit rate, false alarm rate, d′, criterion c, mean RT, IES
- **List Sorting**: 条件別（single / dual）正答率、正答最大スパン
- **Visual Digit Span**: Forward / Backward 別の最長完全正答系列、完全正答試行数、span × 完全正答試行数、実測提示時間
- **eCorsi**: Forward / Backward 別の block span、完全正答試行数、Kessels 型 Total Score、初回タップ潜時、実測提示時間
- **Picture Sequence**: 隣接ペア数、学習勾配、平均応答時間

### 試行レベルデータのタイムスタンプ

- `rt` — 刺激呈示フレーム（`requestAnimationFrame` 同期）から応答までの `performance.now()` 差（ms）
- `tOnset` — セッション開始時点からの刺激呈示時刻（ms）
- `tResponse` — セッション開始時点からの反応時刻（ms）

### Session Quality

以下のような実施ログを保存します。

- タブ離脱回数
- フォーカス離脱回数
- フルスクリーン解除回数
- 画面サイズ変更回数
- タイムアウト数
- 極端に速い反応数（既定 RT < 150ms）／ 遅い反応数（RT > 5000ms）
- 研究者レビュー用フラグ（`review_recommendation`, `review_notes`, `*_flag`）

これらは **分析時に確認するためのログ** です。  
アプリ側で自動除外判定は行いません。`Researcher Review` シートは確認候補を見つけやすくするための監査ビューです。

### Quality Control as Multiverse Analysis

除外判断は単一の固定ルールではなく、研究者自由度のひとつとして扱います。出力には `QC Multiverse` が含まれ、各参加者について以下の universe を長形式で記録します。

- `qc_u00_all_sessions` — QC による除外候補化を行わず、全セッションを含める記述的 universe
- `qc_u01_protocol_deviation_only` — 実施不能環境など明確なプロトコル逸脱のみを候補化
- `qc_u02_behavioral_lenient` — 明確な不注意・反応異常のみを候補化する緩い behavioral QC
- `qc_u03_behavioral_standard` — 低正答率、極端 RT、タイムアウト、練習反復を標準閾値で候補化
- `qc_u04_full_strict` — 行動指標と実施環境を厳格に扱う保守的 universe

各行の `include_candidate` / `exclude_candidate` は **感度分析用の符号化** であり、自動除外ではありません。主要解析、緩い QC、厳格 QC の結果を並べ、QC 判断に対する結論の頑健性を確認してください。

解析テンプレートは、通常の参加者レベル `summary.csv` と `QC Multiverse` 長形式CSVに加えて、参加者行を QC universe ごとに展開した `<summary名>_by_qc_universe.csv` も出力します。主要解析と複数 universe の感度分析を同じ表構造で比較できます。

## 再現可能性（Reproducibility）

試行順は seedable PRNG（mulberry32）で生成され、シード値は `Participant` シートの `random_seed` 列に記録されます。同じシードを与えれば同じ試行順を再現できます。アプリ版数、プロトコル版数、課題版数、採点版数、刺激プール版数は `Protocol Metadata` と JSON の `protocol` に記録されます。

## ディレクトリ構成

```text
Cognitive_Battery/
├─ index.html
├─ README.md
├─ css/
│  └─ style.css
├─ js/
│  ├─ main.js            # 画面遷移、PRNG、RAF 同期、プリロード、Excel 出力
│  ├─ study-config.js     # 研究者設定、プリセット、参加者リンク、設定ハッシュ
│  ├─ flanker.js
│  ├─ dccs.js
│  ├─ list-sorting.js
│  ├─ visual-digit-span.js
│  ├─ ecorsi.js
│  ├─ pattern-comparison.js
│  └─ picture-sequence.js
├─ analysis/
│  ├─ analyze.py
│  ├─ analyze.R
│  ├─ validate_exports.py
│  └─ build_dataset.py
├─ tests/
│  └─ *.spec.js
├─ vendor/
│  └─ xlsx.full.min.js
├─ package.json
├─ package-lock.json
└─ playwright.config.js
```

ローカルの文献PDF、提出Excel、解析出力CSV、Playwrightレポート、個人のエディタ設定は `.gitignore` で公開対象から除外しています。

## ローカルでの確認

ビルドは不要です。  
そのまま `index.html` をブラウザで開くか、簡易ローカルサーバで確認できます。

例:

```powershell
python -m http.server 8000
```

その後、ブラウザで以下を開きます。

```text
http://localhost:8000/
```

## GitHub Pages での公開

1. このディレクトリを GitHub リポジトリに配置する
2. GitHub の `Settings > Pages` を開く
3. 公開元の Branch を選ぶ
4. ルートディレクトリを公開対象にする

このアプリは静的ファイルだけで動作します。  
追加のバックエンドは不要です。

## 運用上の注意

- 参加者には事前に「PC とキーボードで実施する」ことを案内してください
- 遠隔実施では完全な行動統制はできないため、品質ログと視距離入力を前提に分析してください
- Excel ファイル名には参加者 ID が使われますが、保存時に安全な文字へ自動変換されます
- 厳密な標準化得点ではなく、サンプル内比較を前提に運用してください
- 研究利用時は、`random_seed` と `Participant` シートの閾値を記録した上で解析してください
- 氏名は任意欄です。研究デザイン上の必要がなければ空欄での進行を推奨します

### 研究者側の解析前チェック

参加者から集めた Excel ファイルは、解析前に検証してください。

```bash
python analysis/validate_exports.py /path/to/exports validation_report.csv
python analysis/build_dataset.py /path/to/exports dataset --validation-report validation_report.csv
```

`validation_report.csv` は、必須シート、`Export Manifest`、版数、参加者 ID、セッション番号、raw データ、QC universe 数、重複セッションを一覧化します。`status = error` のファイルは `build_dataset.py` で既定除外されます。除外せず確認用に出力したい場合だけ `--include-invalid` を付けてください。

`dataset/` には `participants.csv`、`task_metrics_long.csv`、`trials_long.csv`、`qc_multiverse.csv`、`session_events.csv`、`dataset_manifest.csv` が出力されます。解析前に `dataset_manifest.csv` で処理件数と除外件数を確認し、`status = warning` のファイルを含める場合は理由を記録してください。

## カウンターバランス

全 7 課題を実施する場合、実施順は参加者 ID の FNV-1a ハッシュから14順序の Williams design（7つの基本行と各逆順）の行を決定します。これにより、参加者ごとに以下の性質が保証されます。

- **決定論性**: 同じ ID は常に同じ順序に割り当てられる
- **均衡**: 十分なサンプルで14の順序グループにほぼ均等に分散
- **位置均衡**: 各課題が各位置（1 番目〜7 番目）に等頻度で現れる
- **一次持越し均衡**: 逆順を含めることで、直前課題の組み合わせを均衡化

順序は `counterbalance_group`（0–13）と `counterbalance_order`（カンマ区切り）として `Participant` シートおよび JSON に記録されます。一部のテストのみを選択した場合、カウンターバランスは適用されません。

## 刺激プール

- **Picture Sequence**: 4 テーマ（朝の準備・料理を作る・旅行の準備・オフィスの一日）からランダムに 1 つ選択。選ばれたテーマ、言語に依存しない刺激 ID、表示ラベル、刺激言語、刺激バンク版を試行データに記録
- **List Sorting Single 条件**: 3 ドメイン（動物・食べ物・乗り物）からランダム選択。カテゴリ、言語に依存しない刺激 ID、表示ラベル、刺激言語、刺激バンク版を試行データに記録
- **List Sorting Dual 条件**: 動物 + 食べ物の組み合わせに固定（NIH 準拠）
- **DCCS**: 3 つの bivalent カードセット（青星/赤丸、緑三角/黄四角、紫星/橙三角）からセッション単位でランダム選択。`setId` が試行データに記録される
- **Visual Digit Span**: 独自に作成した版管理済み系列（数字1–9、系列内重複なし）。市販検査の項目・規準値は含まない
- **eCorsi**: 独自の9ブロック配置と版管理済み系列。公開論文の標準系列そのものは複製しない

## キーボード完結操作

マウスなしでも完走できる設計になっています。

- **Flanker / DCCS / Pattern Comparison**: F / J キーで応答
- **List Sorting**: Tab で項目間を移動、Enter / Space で選択、Backspace で直前の選択を取り消し
- **Visual Digit Span**: 1〜9 で入力、Backspace で直前の数字を取り消し、Enter で確定
- **eCorsi**: Tab でブロック間を移動、Enter / Space で選択、Backspace / Delete で取り消し、確定ボタンで回答
- **Picture Sequence**: Tab で移動、Enter / Space でアイテムを選択 → 空きスロットで再度 Enter で配置、スロット上で Backspace / Delete で取り消し

各入力可能要素は `role="button"`・`tabindex="0"`・`aria-label` を持ち、キー操作時には `focus-visible` アウトラインが表示されます。

## プライバシーモード

共有 PC での実施時に使えるオプションです。同意画面のチェックボックス「この端末に進行状況を保存しない」をオンにすると、

- `localStorage` へのセッション保存を一切行いません
- 参加者ID別の再検査回数履歴も消去し、この実施では新たに保存しません
- 既存の保存済みセッションがある場合は、意図しない削除や上書きを防ぐため、復元または明示的な破棄を行うまで開始できません
- 開始後の途中復元はできず、この実施の参加者データは端末に保存されません
- 設定は `Participant` シートの `privacy_mode` 列（1/0）に記録されます

## 自動テスト

```bash
npm install                   # 初回のみ
npx playwright install chromium  # 初回のみ
npm test                      # 自動テスト一式を実行
npm run test:ui               # Playwright UI モードで対話的に実行
```

GitHub Actions（`.github/workflows/test.yml`）が push / PR ごとに全テストを自動実行します。

テストは以下をカバーします。

- PRNG 決定論性 / 順序カウンターバランスの安定性
- Consent ゲート / フォームバリデーション / 任意フィールド
- `requestAnimationFrame` 同期 / `event.timeStamp` / SHA-256
- セッション番号の永続化 / リロード耐性
- `results.flanker.score` などのフルフロー
- JSON `integrity_sha256` の往復検証
- IES、switch cost、d′、inattention flag の計算

## 解析テンプレート

`analysis/` ディレクトリに Python と R のスクリプトを同梱しています。

- `analyze.py`: 標準ライブラリ。scipy が利用可能なら ex-Gaussian（μ, σ, τ）も算出
- `analyze.R`: jsonlite + digest + dplyr 依存
- `analysis/README.md` に詳細あり

## 今後の改善候補

- 大きくなった JavaScript の段階的なモジュール分割と TypeScript 移行
- スクリーンリーダーでの実機動作確認と修正
- localStorage の opt-in 暗号化（passphrase ベース）
- 中国語など、日英以外の言語バンク追加
- アダプティブ手続き（staircase）を Pattern Comparison に
- ディスプレイ較正（gamma / luminance）のガイド追加
