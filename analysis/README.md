# Cognitive Battery - 解析テンプレート

Excel / JSON 出力を一貫した方法で参加者レベルに集約するためのスクリプト群です。通常運用では、参加者から受け取った Excel ファイルだけを入力にします。

## ファイル

- `validate_exports.py` — 受験者提出 Excel / JSON の事前検証。必須シート、版数、QC universe、raw データ、重複を CSV に出力
- `build_dataset.py` — 検証済み提出ファイルから解析用 CSV 群（participants, task metrics, trials, QC）を一括生成
- `analyze.R` — R 版。`jsonlite`, `digest`, `dplyr`, `readxl` に依存
- `analyze.py` — Python 版。Excel 入力には `openpyxl`、ex-Gaussian フィットには `numpy` / `scipy` を使用

## 使い方

参加者から受け取った Excel ファイル（または研究者向け JSON）をすべて同じディレクトリに置いて実行します。

```bash
# 1. 提出ファイルの検証
python validate_exports.py /path/to/exports validation_report.csv

# 2. 解析用データセットを一括生成
python build_dataset.py /path/to/exports dataset --validation-report validation_report.csv

# 3. 参加者レベル summary だけを生成したい場合
python analyze.py /path/to/exports summary.csv

# R で参加者レベル summary を生成したい場合
Rscript analyze.R /path/to/exports summary.csv
```

`validation_report.csv` で `status = error` のファイルは、解析前に参加者 ID、セッション番号、必須シート、raw データ、版数を確認してください。`status = warning` は古い版数や補助情報の不足を示すため、解析に含める場合は理由を記録してください。

`build_dataset.py` は `validation_report.csv` を渡すと、`status = error` のファイルを既定で除外します。除外せずに全ファイルを確認用に出したい場合だけ `--include-invalid` を付けてください。

`dataset/` には以下が出力されます。

- `participants.csv`: 参加者・セッション単位の基本情報、品質指標、主要研究メトリクス
- `task_metrics_long.csv`: Excel の `Task Metrics Long` を全参加者で結合した長形式表
- `trials_long.csv`: 全 raw 試行データを `testId` 付きで結合した長形式表
- `qc_multiverse.csv`: 参加者 × QC universe の長形式表
- `session_events.csv`: タブ離脱、フォーカス離脱、long task などの時系列イベント
- `dataset_manifest.csv`: 入力ファイル数、除外ファイル数、各CSVの行数

出力される CSV には、各参加者・各課題について以下を含みます。

- 基本情報: `participant_id`, `session_number`, `age`, `random_seed`
- 版数: `app_version`, `protocol_version`, `task_version`, `scoring_version`, `stimulus_version`
- 環境: `browser`, `viewport_width`, `viewport_height`, `device_pixel_ratio`, `refresh_rate_hz_estimate`
- 品質: `tab_hidden`, `blur_count`, `long_task_count`, `grayscale_confirmed`, `viewing_distance_cm`, `review_recommendation`, `review_notes`, `*_flag`
- QC multiverse: `qc_universe_count`, `qc_include_candidate_universes`, `qc_exclude_candidate_universes`, `qc_exclude_candidate_count`
- Flanker: 正答率、平均 RT（正答試行のみ、RT 除外後）、`congruency_effect_ms`, `ies_incongruent_ms`, `inattention_flag`
- DCCS: 正答率、`switch_cost_ms`, `inattention_flag`
- Pattern Comparison: 正答率、`d_prime`, `ies_correct_ms`

## 外れ値除外の方針

スクリプトは、各 JSON の `outlier_thresholds` セクションに記録された値を優先的に使用します（既定: `rt_exclude_below_ms = 100`, `rt_too_slow_ms = 5000`）。閾値は Web アプリ側で固定されており、解析時に上書きしたい場合はスクリプト内の `rt_low` / `rt_high` を編集してください。

アプリ側は **自動除外を行いません**。不注意フラグ（`inattention_flag`）、`quality_flags`、`Researcher Review` の `review_recommendation` / `review_notes` を確認してください。除外判断は `QC Multiverse` による感度分析として扱い、主要解析と複数の QC universe の結果を並べて報告することを推奨します。

## Researcher Review

JSON の `quality_flags` と Excel の `Researcher Review` は、除外候補を一目で確認するための監査ビューです。低正答率、極端 RT、タイムアウト、タブ離脱、フォーカス離脱、環境警告、画面サイズ不足、ストレージ利用不可などを `*_flag` として 1/0 で出力します。

`review_recommendation = review` は「研究者確認が必要」という意味であり、自動除外ではありません。最終的な除外基準は、事前登録した解析計画に従ってください。

## QC Multiverse

`analyze.py` / `analyze.R` は通常の `summary.csv` に加えて、JSON に `qc_multiverse` が含まれる場合は次の CSV も出力します。

- `<summary名>_qc_multiverse.csv`: 参加者 × QC universe の長形式表
- `<summary名>_by_qc_universe.csv`: 参加者レベル summary を QC universe ごとに展開した感度分析用表

- `universe_id`: QC universe の識別子
- `analysis_role`: 記述統計、最小 QC、緩い behavioral QC、標準 behavioral QC、厳格 QC などの役割
- `include_candidate` / `exclude_candidate`: その universe での含入候補 / 除外候補
- `reasons`: 除外候補になった理由
- `*_rule`: その universe で使った閾値
- `observed_*`: 実際に観測された品質指標

これは研究者自由度を隠さず表に出すための仕組みです。単一の QC ルールだけを採用する場合でも、`*_by_qc_universe.csv` を使って他の universe で結論が変わらないかを確認してください。

## 改ざん検出

`integrity_sha256` は、ブラウザ側で JSON 本体の SHA-256 を 16 進表記で記録したものです。Python 版は `JSON.stringify` の挙動（空白なし・キー挿入順保持）に合わせて再計算し、`integrity_ok` 列に真偽を出力します。R 版は注記のみで厳密な再計算はスキップしています（`digest` と `jsonlite::toJSON` の出力形式が一致しないため）。

ファイルの改ざん検出が本質的な要件である場合は、Python 版での整合性チェックを正とし、対象ファイルを `integrity_ok=False` なら除外する運用を推奨します。

## 拡張例

- Ex-Gaussian フィット: `retimes` (R) または `scipy.optimize` で各参加者の RT に μ, σ, τ をフィット
- DDM: `HDDM`（Python）を使ってドリフト率・境界・非決定時間を推定
- 混合効果モデル: `lme4::lmer` で trial-by-trial の congruency × condition 交互作用

これらは本テンプレートのスコープ外ですが、`*_raw` 試行データにすべての原材料が揃っています。
