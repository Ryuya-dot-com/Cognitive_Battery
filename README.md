# Cognitive Battery

A web-based cognitive test battery for adults that can be administered in either Japanese or English.

It is designed for static deployment on GitHub Pages so that participants can complete it remotely on a computer.

- **Participant page:** [https://ryuya-dot-com.github.io/Cognitive_Battery/](https://ryuya-dot-com.github.io/Cognitive_Battery/)
- **Researcher Study Configuration:** [https://ryuya-dot-com.github.io/Cognitive_Battery/?mode=researcher](https://ryuya-dot-com.github.io/Cognitive_Battery/?mode=researcher)

This application implements literature-informed procedures for `Flanker`, `DCCS`, `List Sorting`, `Visual Digit Span`, `eCorsi`, `Pattern Comparison`, and `Picture Sequence`, but it is **not an exact reproduction of the NIH Toolbox, WAIS, or any other commercial assessment**.

It should be regarded as an **independent web-based battery informed by prior research**.

## Intended Use

- Remote administration to adult Japanese- and English-speaking participants
- Relative comparisons within a sample
- A single Excel file for each participant to submit
- Static deployment through GitHub Pages

## Features

- Seven tasks administered consecutively in one interface
- Japanese/English selection before consent (also configurable with `?lang=ja` / `?lang=en` in the URL)
- A dedicated Study Configuration screen opened with `?mode=researcher`
- Researcher controls for fixed administration language, task selection, and Williams design or fixed custom task order
- Local saving and loading of study-configuration presets, plus generation of participant links that embed the configuration
- The normalized study configuration SHA-256, configuration ID, and actual task order recorded in Excel/JSON output
- Pre-administration information and confirmation of consent (Informed consent checkbox with `CONSENT_VERSION` tracking)
- Pre-session environment checks and an eight-step grayscale check
- Stimulus preloading and session-start warm-up
- Response-time measurement using `requestAnimationFrame` synchronization and `KeyboardEvent.timeStamp`
- Automatic logging of frame deviations during testing with `PerformanceObserver('longtask')`
- Seedable PRNG (mulberry32) for reproducible trial order
- Participant IDs hashed with FNV-1a to counterbalance the seven tasks across a 14-sequence Williams design
- Independent task seeds for adaptive span tasks, ensuring that early termination does not affect stimuli in later tasks
- Automatic session saving and restoration, including random-number state and session number
- Exclusive control of simultaneous starts and overwrites across tabs, with compare-and-update protection against deletion of saved data by a stale page
- Automatic assignment of session numbers for each participant ID to support retesting
- Fullscreen trials
- Quality logs for tab changes, focus loss, viewport resizing, and related events
- Fixed recording of protocol, task, scoring, stimulus-pool, and translation versions, together with administration language
- Automatic aggregation of researcher-review quality flags, including low accuracy, extreme RT, environment warnings, and focus loss
- `QC Multiverse` output that treats Quality Control as Multiverse Analysis
- Task scores, research metrics (IES, d′, congruency effect, switch cost, inattention flag, etc.), and trial-level data consolidated in Excel
- Optional JSON output for detailed researcher use (standard participant submission requires only the Excel file)
- A Codebook sheet bundled with each output file to define column meanings and units
- An automated Playwright test suite
- Python/R analysis templates and a submitted-Excel validation tool, including ex-Gaussian fitting support

## Included Tasks

1. Flanker task (inhibitory control and attention)
2. Card-sorting task (cognitive flexibility)
3. List-sorting task (working memory)
4. Visual digit span task (Forward / Backward; working memory)
5. eCorsi task (Forward / Backward; visuospatial working memory)
6. Pattern-comparison task (processing speed)
7. Picture-sequence task (episodic memory)

## Switching Between Japanese and English

The administration language can be selected with the language control on the start screen or with `?lang=ja` / `?lang=en` in the URL. Once the participant gives consent and starts the tasks, the language is locked and cannot be changed during the session. Changing the language before the session clears the consent checkbox so that the participant can review the consent text in the newly selected language.

The display language is recorded as `ui_language`, the instruction language as `instruction_language`, the language of verbal stimuli as `stimulus_language`, and the consent-text language as `consent_language`. The translation-dictionary version is stored as `translation_version`, and the language-specific consent-text version as `consent_version`. Task IDs, Excel sheet names, column names, and response codes do not change when the language changes.

For Flanker, DCCS, Pattern Comparison, Visual Digit Span, and eCorsi, the instructions and interface text change without altering stimulus structure. Because displayed words are part of the stimuli in List Sorting and Picture Sequence, stable stimulus IDs are separated from Japanese and English labels, and the stimuli are versioned as language-specific banks. Measurement equivalence and normative values across the Japanese and English versions are not guaranteed. Pilot-test each language separately and treat administration language as a stratification variable or covariate in analysis.

## Researcher Study Configuration

The researcher settings are separate from the standard participant page and are available at the following public URL:

[https://ryuya-dot-com.github.io/Cognitive_Battery/?mode=researcher](https://ryuya-dot-com.github.io/Cognitive_Battery/?mode=researcher)

The settings include study ID, default administration language, whether participants may change the language, included tasks, and task order. The default participant language for a new study configuration is English and can be changed to Japanese when needed. Language settings in existing links, saved presets, and saved sessions are not modified. The task order can be specified in either of the following ways. The language of the researcher interface itself can be switched between Japanese and English in the upper-right corner, independently of the participant's default administration language.

- **Williams design** — Requires all seven tasks and assigns participants deterministically to one of 14 sequences based on participant ID
- **Fixed custom order** — Allows any partial battery and uses up/down controls to specify one common order for all participants

Selecting “Apply on this device” saves the configuration on the current device and locks the participant-page language and task selection. If language changes are permitted by the configuration, participants may switch between Japanese and English before starting. Configuration presets do not contain participant information or results.

The “Distribute to participants” section generates a participant link from the current settings. It supports reviewing the URL, copying it to the clipboard, and previewing the participant page in a new tab. Changing any setting invalidates the displayed link, so generate it again to avoid distributing an outdated configuration. The link embeds the configuration JSON in the URL; the destination recomputes and verifies the same configuration before applying it. The link contains no participant information or results. However, because this is a static application, this mechanism is intended for configuration transfer and interface-level locking; it is not authentication or a tamper-proof digital signature.

The stimulus banks, presentation durations, trial counts, stopping rules, and scoring methods are versioned as the fixed `literature-aligned-2026-07-v1` preset, an independent web implementation informed by prior research. They cannot be changed from the researcher screen. After normalization, the configuration is hashed with SHA-256 and exported together with `study_config_id`, `study_config_hash`, `task_order_policy`, `configured_tasks`, and `resolved_task_order`.

### Fixed Visual Digit Span / eCorsi Protocol

Both tasks preserve Forward and Backward as separate conditions and begin at sequence length 2. Each sequence length has two scored trials. The participant advances after at least one completely correct trial; the condition ends after both trials at the same sequence length are incorrect, with a maximum length of 9. Partial credit does not advance the procedure, and the longest completely correct sequence in each condition is the span.

- **Visual Digit Span**: Digits 1–9 are presented one at a time in black. Illumination is 500 ms with an SOA of 1000 ms. Forward is followed by Backward, and responses can be entered with the on-screen digit keys or the keyboard.
- **eCorsi**: Nine irregularly arranged blocks are illuminated for 500 ms with an SOA of 1000 ms. Before each condition, participants complete three practice trials of length 3. They respond by selecting blocks and can undo or confirm their response.
- **Recorded data**: Presented sequence, correct reversed sequence for Backward, all responses, measured onset and offset times for each stimulus, time to response confirmation, and—for eCorsi—first-tap latency and input method

The supporting sources are Ebaid & Crewther (2018), Kemtes & Allen (2008), Brunetti et al. (2014), and Kessels et al. (2000). The stimulus sequences and eCorsi layout were created independently; commercial test items or normative values from assessments such as WAIS, and published standard sequence lists, are not reproduced. Because visually presented digit span has different performance characteristics from auditory versions, do not apply norms from auditory digit-span tests.

## Administration Environment

Recommended:

- A Windows or macOS computer
- A keyboard
- The latest version of Chrome or Edge

Not recommended:

- Smartphones
- Tablets
- Touch-only environments

Using the browser's Back function or reloading during testing displays a warning.

Session information is saved in `localStorage` and can be restored after a page reload. However, **the task that was in progress restarts from its beginning** (the random-number state is restored correctly at that point). When a study-configuration link or local device configuration is active, restoration is allowed only if the hash recomputed from the configuration body, every hash record in the session, and the current study configuration all match. If saved data are mismatched, missing, modified, or corrupt, participant information is not displayed; restoration and new-session start are blocked; and the participant is asked either to discard the data explicitly or to verify the original study link. Discarding requires a confirmation dialog, and data are not deleted if another tab updates them while confirmation is pending.

Saving uses the browser's Web Locks API and `session_instance_id`. If multiple tabs on the same device and browser attempt to start simultaneously, only one acquires the saved-session area and the others stop. Because atomic saving cannot be guaranteed without the Web Locks API, administrations that save progress fail closed in unsupported environments. Participants may still proceed by choosing “Do not save progress on this device,” intended for shared computers. If another tab replaces the saved data during an administration, responses, progression, and Excel/JSON export in the stale tab are blocked to prevent data from different sessions being mixed.

## Participant Information and Privacy

- Only participant ID and age are required
- Name is optional and may be left blank (identification by ID alone is recommended for research use)
- Viewing distance (cm) is optional and is recorded as a reference for visual-angle conversion
- Before starting, participants must read the “Study information and consent” section and select the consent checkbox
- Data are not sent to a server; they remain only in `localStorage` on the participant's device and in downloaded Excel or optional JSON files

## Data Storage

No data are stored on a server.

Results are saved as an Excel file on the participant's device. This single Excel file is the only file participants need to submit to the researcher.

### Excel Output Sheets

- `Export Manifest` — Submission-file versions, save time, participant ID, session number, and included-sheet list
- `Participant` — Session-specific ID, participant metadata (ID, age, consent, viewing distance, and administration language), random seed, administration environment, and outlier thresholds
- `Scores` — Overall task scores, accuracy, SAA component scores, and timeout counts
- `Research Metrics` — Detailed task-level measures in a one-row wide format
- `Task Metrics Long` — Task metrics in long format, where one row represents one metric
- `Protocol Metadata` — Session-specific ID and versions for the application, protocol, tasks, scoring, stimulus pools, translations, administration language, and timing procedures
- `Study Configuration` — Study-configuration ID and SHA-256, language policy, configured tasks, order policy, fixed order, and actual assigned order
- `Researcher Review` — Quality flags, review notes, task scores, and stimulus conditions consolidated into one row
- `QC Multiverse` — Multiple QC universes and the candidate inclusion/exclusion status under each universe, in long format
- `Session Quality` — Session-quality measures such as tab changes, focus loss, and fullscreen exits
- `Session Events` — Time-series log of quality events (included when at least one event is recorded)
- `Codebook` — Column names, units, and descriptions for every sheet
- `<test>_raw` — Trial-level data (`trialNum`, `rt`, `tOnset`, `tResponse`, `correct`, etc.)

### JSON Output for Researchers

- Not intended for standard participant submission
- A single JSON file can be saved from the detailed researcher menu when needed
- Can be loaded directly for analysis in R or Python
- Keys correspond to Excel sheet content (`participant`, `protocol`, `study_configuration`, `quality_flags`, `researcher_review`, `qc_multiverse`, `environment`, `research_metrics`, `task_metrics_long`, `trials`, `codebook`, etc.)

### Primary Research Metrics

- **Flanker**: Accuracy (congruent / incongruent / overall), mean/median/SD response time, `congruency_effect_ms`, and IES (Inverse Efficiency Score)
- **DCCS**: Accuracy (dominant / non-dominant / overall), response-time measures, `switch_cost_ms`, and IES
- **Pattern Comparison**: Hit rate, false alarm rate, d′, criterion c, mean RT, and IES
- **List Sorting**: Accuracy by condition (single / dual) and maximum correct span
- **Visual Digit Span**: Longest completely correct sequence by Forward / Backward condition, number of completely correct trials, span × completely correct trials, and measured presentation timing
- **eCorsi**: Block span by Forward / Backward condition, number of completely correct trials, Kessels-style Total Score, first-tap latency, and measured presentation timing
- **Picture Sequence**: Number of adjacent pairs, learning slope, and mean response time

### Timestamps in Trial-Level Data

- `rt` — Difference in `performance.now()` between the stimulus-presentation frame synchronized with `requestAnimationFrame` and the response (ms)
- `tOnset` — Stimulus-presentation time from session start (ms)
- `tResponse` — Response time from session start (ms)

### Session Quality

The following administration logs are saved:

- Number of tab changes
- Number of focus-loss events
- Number of fullscreen exits
- Number of viewport-size changes
- Number of timeouts
- Number of extremely fast responses (default RT < 150 ms) / slow responses (RT > 5000 ms)
- Researcher-review flags (`review_recommendation`, `review_notes`, `*_flag`)

These are **logs for review during analysis**.

The application does not automatically exclude sessions. The `Researcher Review` sheet is an audit view designed to make potential review cases easier to identify.

### Quality Control as Multiverse Analysis

Exclusion decisions are treated as a source of researcher degrees of freedom rather than as a single fixed rule. The output includes `QC Multiverse`, which records the following universes for each participant in long format:

- `qc_u00_all_sessions` — A descriptive universe that includes all sessions without flagging any as exclusion candidates based on QC
- `qc_u01_protocol_deviation_only` — Flags only clear protocol deviations, such as an environment in which administration could not be completed
- `qc_u02_behavioral_lenient` — Lenient behavioral QC that flags only clear inattention or response anomalies
- `qc_u03_behavioral_standard` — Flags low accuracy, extreme RT, timeouts, and repeated practice at standard thresholds
- `qc_u04_full_strict` — A conservative universe that treats both behavioral measures and administration environment strictly

The `include_candidate` / `exclude_candidate` value in each row is **a code for sensitivity analysis**, not an automatic exclusion decision. Compare results from the primary analysis, lenient QC, and strict QC to assess the robustness of conclusions to QC decisions.

In addition to the standard participant-level `summary.csv` and the long-format `QC Multiverse` CSV, the analysis template writes `<summary-name>_by_qc_universe.csv`, which expands participant rows for each QC universe. This makes it possible to compare the primary analysis and sensitivity analyses across multiple universes using the same table structure.

## Reproducibility

Trial order is generated with a seedable PRNG (mulberry32), and the seed is recorded in the `random_seed` column of the `Participant` sheet. Providing the same seed reproduces the same trial order. Application, protocol, task, scoring, and stimulus-pool versions are recorded in `Protocol Metadata` and in the JSON `protocol` object.

## Directory Structure

```text
Cognitive_Battery/
├─ index.html
├─ README.md
├─ css/
│  └─ style.css
├─ js/
│  ├─ main.js            # Screen flow, PRNG, RAF synchronization, preloading, Excel output
│  ├─ study-config.js     # Researcher settings, presets, participant links, configuration hashes
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

Local reference PDFs, submitted Excel files, analysis-output CSV files, Playwright reports, and personal editor settings are excluded from public deployment through `.gitignore`.

## Running Locally

No build step is required. Serve the application over HTTPS, or over `http://localhost` for local verification; direct use through a `file://` URL is unsupported. The SHA-256 study-configuration checks and Web Locks session-safety features require a secure browser context. HTTPS and loopback origins such as `http://localhost` provide the supported environment, and the public GitHub Pages deployment is recommended.

For example:

```bash
python3 -m http.server 8000
```

Keep that command running, then open:

```text
http://localhost:8000/
```

The `localhost:8000` URL works **only while a local server is running on your own computer**. It is not a public link and should not be distributed to participants. Use the GitHub Pages links at the top of this README for public access.

## Publishing with GitHub Pages

Deployment is automated by GitHub Actions in `.github/workflows/pages.yml`. Every push to `main` triggers the workflow, which uploads the static site artifact and deploys it to GitHub Pages. No build step or backend service is required.

After merging or pushing to `main`, check the repository's Actions page and confirm that the Pages deployment has completed successfully. Then use the public participant and researcher links shown at the top of this README.

## Operational Considerations

- Tell participants in advance that they must use a computer and keyboard
- Complete behavioral control is not possible during remote administration; plan analyses around the quality logs and viewing-distance input
- The participant ID is used in the Excel filename but is automatically converted to safe filename characters when saved
- Use the battery for within-sample comparisons, not for strictly standardized scores
- For research use, preserve the `random_seed` and the thresholds recorded in the `Participant` sheet when conducting analyses
- Name is optional; unless required by the study design, participants should leave it blank

### Researcher Checks Before Analysis

Validate the Excel files collected from participants before analysis:

```bash
python analysis/validate_exports.py /path/to/exports validation_report.csv
python analysis/build_dataset.py /path/to/exports dataset --validation-report validation_report.csv
```

`validation_report.csv` lists required sheets, `Export Manifest`, versions, participant ID, session number, raw data, number of QC universes, and duplicate sessions. Files with `status = error` are excluded by default by `build_dataset.py`. Add `--include-invalid` only when you need invalid files to be included for inspection.

The `dataset/` directory contains `participants.csv`, `task_metrics_long.csv`, `trials_long.csv`, `qc_multiverse.csv`, `session_events.csv`, and `dataset_manifest.csv`. Before analysis, review the number of processed and excluded files in `dataset_manifest.csv`. If files with `status = warning` are included, document the rationale.

## Counterbalancing

When all seven tasks are administered, the participant ID's FNV-1a hash selects a row from a 14-sequence Williams design consisting of seven base rows and their reversals. This gives each participant the following properties:

- **Determinism**: The same ID is always assigned to the same sequence
- **Balance**: With a sufficiently large sample, participants are distributed approximately evenly across the 14 sequence groups
- **Position balance**: Each task occurs equally often in every position (first through seventh)
- **First-order carryover balance**: Including reversed sequences balances combinations of immediately preceding tasks

The order is recorded as `counterbalance_group` (0–13) and `counterbalance_order` (comma-separated) in the `Participant` sheet and JSON. Counterbalancing is not applied when only a subset of tasks is selected.

## Stimulus Pools

- **Picture Sequence**: One of four themes (morning routine, making a meal, preparing for a trip, or a day at the office) is selected randomly. The selected theme, language-independent stimulus ID, displayed label, stimulus language, and stimulus-bank version are recorded in trial data.
- **List Sorting Single condition**: One of three domains (animals, foods, or vehicles) is selected randomly. The category, language-independent stimulus ID, displayed label, stimulus language, and stimulus-bank version are recorded in trial data.
- **List Sorting Dual condition**: Fixed to an animals + foods combination (NIH-aligned)
- **DCCS**: One of three bivalent card sets (blue star/red circle, green triangle/yellow square, or purple star/orange triangle) is selected randomly for the session. `setId` is recorded in trial data.
- **Visual Digit Span**: Independently created, versioned sequences using digits 1–9 with no repetition within a sequence. No commercial assessment items or normative values are included.
- **eCorsi**: An independently created nine-block layout and versioned sequences. Published standard sequences are not reproduced verbatim.

## Keyboard-Only Operation

The battery can be completed without a mouse.

- **Flanker / DCCS / Pattern Comparison**: Respond with F / J
- **List Sorting**: Use Tab to move between items, Enter / Space to select, and Backspace to undo the previous selection
- **Visual Digit Span**: Use 1–9 to enter digits, Backspace to undo the previous digit, and Enter to confirm
- **eCorsi**: Use Tab to move between blocks, Enter / Space to select, Backspace / Delete to undo, and the confirmation button to submit the response
- **Picture Sequence**: Use Tab to move, Enter / Space to select an item, and Enter again on an empty slot to place it; use Backspace / Delete on a slot to remove the item

Custom task-response controls use button semantics, keyboard focus, and accessible labels where applicable. A `focus-visible` outline appears during keyboard operation.

## Privacy Mode

This option is intended for administration on a shared computer. When “Do not save progress on this device” is selected on the consent screen:

- No session data are written to `localStorage`
- Retest-count history for the participant ID is deleted and is not saved again during the current administration
- If an existing saved session is present, the participant cannot start until it is restored or explicitly discarded, preventing unintended deletion or overwriting
- The session cannot be restored after interruption, and participant data from the current administration are not saved on the device
- The setting is recorded as 1/0 in the `privacy_mode` column of the `Participant` sheet

## Automated Tests

```bash
npm install                       # First run only
npx playwright install chromium  # First run only
npm test                          # Run the complete automated test suite
npm run test:ui                   # Run interactively in Playwright UI mode
```

GitHub Actions (`.github/workflows/test.yml`) automatically runs the full test suite on pushes to `main` or `master` and on pull requests targeting either branch.

The tests cover:

- PRNG determinism and task-order counterbalancing stability
- Consent gate, form validation, and optional fields
- `requestAnimationFrame` synchronization, `event.timeStamp`, and SHA-256
- Session-number persistence and reload resilience
- Full flows such as `results.flanker.score`
- Round-trip verification of JSON `integrity_sha256`
- Calculation of IES, switch cost, d′, and inattention flag

## Analysis Templates

The `analysis/` directory includes Python and R scripts.

- `analyze.py`: Uses the standard library; also calculates ex-Gaussian (μ, σ, τ) when scipy is available
- `analyze.R`: Depends on jsonlite + digest + dplyr
- See `analysis/README.md` for details

## Potential Future Improvements

- Incrementally split the growing JavaScript into modules and migrate to TypeScript
- Conduct testing with real screen readers and make follow-up accessibility corrections
- Add opt-in encryption for `localStorage` using a passphrase
- Add language banks beyond Japanese and English, such as Chinese
- Add an adaptive staircase procedure to Pattern Comparison
- Add guidance for display calibration (gamma / luminance)
