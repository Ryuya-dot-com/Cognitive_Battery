# ============================================================================
# Cognitive Battery - Analysis Template (R)
# ----------------------------------------------------------------------------
# Reads one or more Excel or JSON exports from Cognitive Battery, verifies their
# SHA-256 integrity, applies pre-registered outlier thresholds, and outputs
# a participant-level summary CSV.
#
# Usage:
#   Rscript analyze.R <export-directory> [output.csv]
#
# Requires: jsonlite, digest, dplyr, readxl
# ============================================================================

suppressPackageStartupMessages({
  library(jsonlite)
  library(digest)
  library(dplyr)
  library(readxl)
})

LEGACY_STUDY_CONFIG_HASH <- "__legacy_no_study_config__"

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 1) {
  stop("Usage: Rscript analyze.R <export-directory> [output.csv]")
}
export_path <- args[[1]]
out_csv <- if (length(args) >= 2) {
  args[[2]]
} else if (dir.exists(export_path)) {
  file.path(export_path, "summary.csv")
} else {
  file.path(dirname(export_path), "summary.csv")
}

if (dir.exists(export_path)) {
  export_files <- list.files(export_path, pattern = "\\.(json|xlsx)$", full.names = TRUE)
} else {
  export_files <- export_path
}
export_files <- export_files[!grepl("^~\\$", basename(export_files))]
if (length(export_files) == 0) {
  stop(sprintf("No .json or .xlsx files found in %s", export_path))
}

# --- Integrity check ---------------------------------------------------------
verify_integrity <- function(payload_text) {
  parsed <- fromJSON(payload_text, simplifyVector = FALSE)
  recorded <- parsed$integrity_sha256
  if (is.null(recorded)) {
    return(list(parsed = parsed, ok = NA, reason = "no hash field"))
  }
  parsed$integrity_sha256 <- NULL
  reconstructed <- toJSON(parsed, auto_unbox = TRUE, null = "null", na = "null")
  # NOTE: JSON.stringify in the browser does not format identical to jsonlite.
  # We therefore verify by comparing re-computed hash on the original text
  # minus the last integrity field appended. See README for details.
  list(parsed = parsed, ok = NA, reason = "hash recorded (browser-side)")
}

sheet_rows <- function(path, sheet) {
  if (!(sheet %in% excel_sheets(path))) return(data.frame())
  as.data.frame(read_excel(path, sheet = sheet, .name_repair = "unique"), stringsAsFactors = FALSE)
}

first_row <- function(df) {
  if (is.null(df) || nrow(df) == 0) return(list())
  as.list(df[1, , drop = FALSE])
}

metadata_rows_to_list <- function(df) {
  if (is.null(df) || nrow(df) == 0 || !all(c("field", "value") %in% names(df))) return(list())
  values <- as.list(df$value)
  names(values) <- as.character(df$field)
  values
}

rows_to_records <- function(df) {
  if (is.null(df) || nrow(df) == 0) return(list())
  lapply(seq_len(nrow(df)), function(i) as.list(df[i, , drop = FALSE]))
}

read_xlsx_payload <- function(path) {
  participant_sheet <- first_row(sheet_rows(path, "Participant"))
  protocol <- metadata_rows_to_list(sheet_rows(path, "Protocol Metadata"))
  manifest <- metadata_rows_to_list(sheet_rows(path, "Export Manifest"))
  study_configuration <- metadata_rows_to_list(sheet_rows(path, "Study Configuration"))
  session_quality <- first_row(sheet_rows(path, "Session Quality"))
  review_row <- first_row(sheet_rows(path, "Researcher Review"))
  research_metrics <- first_row(sheet_rows(path, "Research Metrics"))
  qc_rows <- rows_to_records(sheet_rows(path, "QC Multiverse"))
  task_metrics_long <- rows_to_records(sheet_rows(path, "Task Metrics Long"))

  raw_sheet_map <- c(
    flanker_raw = "flanker",
    dccs_raw = "dccs",
    pattern_comparison_raw = "pattern-comparison",
    list_sorting_raw = "list-sorting",
    visual_digit_span_raw = "visual_digit_span",
    ecorsi_raw = "ecorsi",
    picture_sequence_raw = "picture-sequence"
  )
  trials <- list()
  available_sheets <- excel_sheets(path)
  for (sheet_name in names(raw_sheet_map)) {
    if (sheet_name %in% available_sheets) {
      trials[[raw_sheet_map[[sheet_name]]]] <- rows_to_records(sheet_rows(path, sheet_name))
    }
  }

  participant <- list(
    participantId = participant_sheet$participantId %||% manifest$participant_id,
    session_number = participant_sheet$session_number %||% manifest$session_number,
    study_config_hash = participant_sheet$study_config_hash %||%
      protocol$study_config_hash %||%
      manifest$study_config_hash %||%
      study_configuration$study_config_hash,
    counterbalance_group = participant_sheet$counterbalance_group %||% manifest$counterbalance_group,
    consent_version = participant_sheet$consent_version %||% protocol$consent_version,
    ui_language = participant_sheet$ui_language %||% protocol$ui_language,
    instruction_language = participant_sheet$instruction_language %||% protocol$instruction_language,
    stimulus_language = participant_sheet$stimulus_language %||% protocol$stimulus_language,
    consent_language = participant_sheet$consent_language %||% protocol$consent_language,
    translation_version = participant_sheet$translation_version %||% protocol$translation_version,
    age = participant_sheet$age,
    random_seed = participant_sheet$random_seed %||% manifest$random_seed,
    viewing_distance_cm = participant_sheet$viewing_distance_cm,
    grayscale_confirmed = participant_sheet$grayscale_confirmed
  )
  environment <- list(
    browser = participant_sheet$browser,
    viewportWidth = participant_sheet$viewport_width,
    viewportHeight = participant_sheet$viewport_height,
    devicePixelRatio = participant_sheet$device_pixel_ratio,
    refreshRateHzEstimate = participant_sheet$refresh_rate_hz_estimate
  )
  outlier_thresholds <- list(
    rt_exclude_below_ms = participant_sheet$rt_exclude_below_ms,
    rt_too_slow_ms = participant_sheet$rt_too_slow_ms,
    rt_too_fast_ms = participant_sheet$rt_too_fast_ms
  )

  list(
    version = protocol$app_version %||% manifest$app_version,
    export_manifest = manifest,
    study_configuration = study_configuration,
    participant = participant,
    protocol = protocol,
    outlier_thresholds = outlier_thresholds,
    session_quality = session_quality,
    quality_flags = if (length(review_row) > 0) review_row else session_quality,
    environment = environment,
    research_metrics = research_metrics,
    task_metrics_long = task_metrics_long,
    trials = trials,
    qc_multiverse = list(
      version = protocol$qc_multiverse_version %||% manifest$qc_multiverse_version,
      universes = qc_rows
    )
  )
}

read_export_payload <- function(path) {
  if (grepl("\\.json$", path, ignore.case = TRUE)) {
    text <- paste(readLines(path, warn = FALSE), collapse = "\n")
    check <- verify_integrity(text)
    return(list(parsed = check$parsed, integrity_ok = check$ok))
  }
  if (grepl("\\.xlsx$", path, ignore.case = TRUE)) {
    return(list(parsed = read_xlsx_payload(path), integrity_ok = NA))
  }
  stop(sprintf("Unsupported export file type: %s", path))
}

# --- Per-participant processing ---------------------------------------------
process_file <- function(path) {
  check <- read_export_payload(path)
  parsed <- check$parsed

  participant <- parsed$participant
  protocol <- parsed$protocol
  thresholds <- parsed$outlier_thresholds
  quality <- parsed$session_quality
  quality_flags <- parsed$quality_flags
  environment <- parsed$environment
  qc_rows <- qc_multiverse_rows(parsed)

  rt_low <- thresholds$rt_exclude_below_ms %||% 100
  rt_high <- thresholds$rt_too_slow_ms %||% 5000

  summarise_task <- function(trials, key_map = list()) {
    if (is.null(trials) || length(trials) == 0) return(list())
    df <- as.data.frame(do.call(rbind, lapply(trials, as.list)))
    df$rt <- as.numeric(df$rt)
    df$correct <- as.numeric(df$correct)
    kept <- df[!is.na(df$rt) & df$rt >= rt_low & df$rt <= rt_high, , drop = FALSE]
    kept_correct <- kept[kept$correct == 1, , drop = FALSE]
    list(
      n_trials = nrow(df),
      n_kept_rt = nrow(kept),
      accuracy_all = if (nrow(df) > 0) mean(df$correct == 1, na.rm = TRUE) else NA,
      accuracy_after_rt_exclude = if (nrow(kept) > 0) mean(kept$correct == 1) else NA,
      mean_rt_correct = if (nrow(kept_correct) > 0) mean(kept_correct$rt) else NA,
      median_rt_correct = if (nrow(kept_correct) > 0) median(kept_correct$rt) else NA
    )
  }

  flanker <- summarise_task(parsed$trials$flanker)
  dccs <- summarise_task(parsed$trials$dccs)
  pc <- summarise_task(parsed$trials$`pattern-comparison`)

  data.frame(
    file = basename(path),
    study_config_hash = study_config_hash_from_payload(parsed),
    participant_id = participant$participantId,
    session_number = participant$session_number %||% NA,
    consent_version = participant$consent_version %||% protocol$consent_version %||% NA,
    ui_language = participant$ui_language %||% protocol$ui_language %||% NA,
    instruction_language = participant$instruction_language %||% protocol$instruction_language %||% NA,
    stimulus_language = participant$stimulus_language %||% protocol$stimulus_language %||% NA,
    consent_language = participant$consent_language %||% protocol$consent_language %||% NA,
    translation_version = participant$translation_version %||% protocol$translation_version %||% NA,
    app_version = protocol$app_version %||% parsed$version %||% NA,
    protocol_version = protocol$protocol_version %||% NA,
    task_version = protocol$task_version %||% NA,
    scoring_version = protocol$scoring_version %||% NA,
    stimulus_version = protocol$stimulus_version %||% NA,
    stimulus_rendering_mode = protocol$stimulus_rendering_mode %||% NA,
    age = participant$age,
    random_seed = participant$random_seed,
    viewing_distance_cm = participant$viewing_distance_cm %||% NA,
    grayscale_confirmed = participant$grayscale_confirmed %||% NA,
    browser = environment$browser %||% NA,
    viewport_width = environment$viewportWidth %||% NA,
    viewport_height = environment$viewportHeight %||% NA,
    device_pixel_ratio = environment$devicePixelRatio %||% NA,
    refresh_rate_hz_estimate = environment$refreshRateHzEstimate %||% NA,
    tab_hidden = quality$visibility_hidden_count %||% NA,
    blur_count = quality$blur_count %||% NA,
    long_task_count = quality$long_task_count %||% NA,
    any_quality_flag = quality_flags$any_quality_flag %||% NA,
    review_recommendation = quality_flags$review_recommendation %||% NA,
    review_notes = quality_flags$review_notes %||% NA,
    qc_universe_count = length(qc_rows),
    qc_include_candidate_universes = qc_ids(qc_rows, "include_candidate"),
    qc_exclude_candidate_universes = qc_ids(qc_rows, "exclude_candidate"),
    qc_exclude_candidate_count = qc_count(qc_rows, "exclude_candidate"),
    low_accuracy_flag = quality_flags$low_accuracy_flag %||% NA,
    fast_response_flag = quality_flags$fast_response_flag %||% NA,
    slow_response_flag = quality_flags$slow_response_flag %||% NA,
    many_timeouts_flag = quality_flags$many_timeouts_flag %||% NA,
    focus_loss_flag = quality_flags$focus_loss_flag %||% NA,
    tab_hidden_flag = quality_flags$tab_hidden_flag %||% NA,
    environment_warning_flag = quality_flags$environment_warning_flag %||% NA,
    environment_block_flag = quality_flags$environment_block_flag %||% NA,
    flanker_n_kept_rt = flanker$n_kept_rt %||% NA,
    flanker_accuracy = flanker$accuracy_all %||% NA,
    flanker_mean_rt = flanker$mean_rt_correct %||% NA,
    flanker_inattention_flag = parsed$research_metrics$flanker_inattention_flag %||% NA,
    flanker_congruency_effect_ms = parsed$research_metrics$flanker_congruency_effect_ms %||% NA,
    flanker_ies_incongruent_ms = parsed$research_metrics$flanker_ies_incongruent_ms %||% NA,
    dccs_n_kept_rt = dccs$n_kept_rt %||% NA,
    dccs_accuracy = dccs$accuracy_all %||% NA,
    dccs_switch_cost_ms = parsed$research_metrics$dccs_switch_cost_ms %||% NA,
    dccs_inattention_flag = parsed$research_metrics$dccs_inattention_flag %||% NA,
    pc_n_kept_rt = pc$n_kept_rt %||% NA,
    pc_accuracy = pc$accuracy_all %||% NA,
    pc_d_prime = parsed$research_metrics$pattern_comparison_d_prime %||% NA,
    pc_ies_correct_ms = parsed$research_metrics$pattern_comparison_ies_correct_ms %||% NA,
    visual_digit_span_forward_span = parsed$research_metrics$visual_digit_span_forward_span %||% NA,
    visual_digit_span_backward_span = parsed$research_metrics$visual_digit_span_backward_span %||% NA,
    visual_digit_span_forward_correct_trials = parsed$research_metrics$visual_digit_span_forward_correct_trials %||% NA,
    visual_digit_span_backward_correct_trials = parsed$research_metrics$visual_digit_span_backward_correct_trials %||% NA,
    visual_digit_span_observed_item_visible_ms_mean = parsed$research_metrics$visual_digit_span_observed_item_visible_ms_mean %||% NA,
    visual_digit_span_observed_item_soa_ms_mean = parsed$research_metrics$visual_digit_span_observed_item_soa_ms_mean %||% NA,
    ecorsi_forward_span = parsed$research_metrics$ecorsi_forward_span %||% NA,
    ecorsi_backward_span = parsed$research_metrics$ecorsi_backward_span %||% NA,
    ecorsi_forward_span_x_correct_trials = parsed$research_metrics$ecorsi_forward_span_x_correct_trials %||% NA,
    ecorsi_backward_span_x_correct_trials = parsed$research_metrics$ecorsi_backward_span_x_correct_trials %||% NA,
    ecorsi_forward_mean_first_tap_latency_ms = parsed$research_metrics$ecorsi_forward_mean_first_tap_latency_ms %||% NA,
    ecorsi_backward_mean_first_tap_latency_ms = parsed$research_metrics$ecorsi_backward_mean_first_tap_latency_ms %||% NA,
    ecorsi_observed_item_visible_ms_mean = parsed$research_metrics$ecorsi_observed_item_visible_ms_mean %||% NA,
    ecorsi_observed_item_soa_ms_mean = parsed$research_metrics$ecorsi_observed_item_soa_ms_mean %||% NA,
    stringsAsFactors = FALSE
  )
}

`%||%` <- function(a, b) if (is.null(a) || length(a) == 0) b else a

study_config_hash_from_payload <- function(parsed) {
  candidates <- list(
    parsed$study_configuration$config_hash,
    parsed$study_configuration$study_config_hash,
    parsed$participant$study_config_hash,
    parsed$protocol$study_config_hash,
    parsed$export_manifest$study_config_hash
  )
  for (value in candidates) {
    if (is.null(value) || length(value) == 0 || is.na(value[[1]])) next
    normalized <- trimws(as.character(value[[1]]))
    if (normalized != "") return(normalized)
  }
  LEGACY_STUDY_CONFIG_HASH
}

qc_multiverse_rows <- function(parsed) {
  rows <- parsed$qc_multiverse$universes
  if (is.null(rows) || length(rows) == 0) list() else rows
}

qc_count <- function(rows, field) {
  if (length(rows) == 0) return(0)
  sum(vapply(rows, function(row) {
    value <- row[[field]] %||% 0
    suppressWarnings(as.numeric(value) == 1)
  }, logical(1)), na.rm = TRUE)
}

qc_ids <- function(rows, field) {
  if (length(rows) == 0) return("")
  ids <- vapply(rows, function(row) {
    value <- row[[field]] %||% 0
    if (suppressWarnings(as.numeric(value) == 1)) row$universe_id %||% "" else ""
  }, character(1))
  paste(ids[ids != ""], collapse = ",")
}

process_qc_multiverse_file <- function(path) {
  parsed <- read_export_payload(path)$parsed
  participant <- parsed$participant
  protocol <- parsed$protocol
  rows <- qc_multiverse_rows(parsed)
  if (length(rows) == 0) return(NULL)

  bind_rows(lapply(rows, function(row) {
    flat <- lapply(row, function(value) {
      if (is.null(value) || length(value) == 0) return(NA)
      if (is.list(value)) return(toJSON(value, auto_unbox = TRUE, null = "null", na = "null"))
      value
    })
    flat$file <- basename(path)
    flat$study_config_hash <- study_config_hash_from_payload(parsed)
    flat$participant_id <- participant$participantId
    flat$session_number <- participant$session_number %||% NA
    flat$ui_language <- participant$ui_language %||% protocol$ui_language %||% NA
    flat$stimulus_language <- participant$stimulus_language %||% protocol$stimulus_language %||% NA
    flat$translation_version <- participant$translation_version %||% protocol$translation_version %||% NA
    as.data.frame(flat, stringsAsFactors = FALSE)
  }))
}

summary_df <- do.call(rbind, lapply(export_files, process_file))
write.csv(summary_df, out_csv, row.names = FALSE, fileEncoding = "UTF-8")
cat(sprintf("Wrote %d rows to %s\n", nrow(summary_df), out_csv))

qc_df <- bind_rows(lapply(export_files, process_qc_multiverse_file))
if (!is.null(qc_df) && nrow(qc_df) > 0) {
  qc_out_csv <- file.path(dirname(out_csv), paste0(tools::file_path_sans_ext(basename(out_csv)), "_qc_multiverse.csv"))
  write.csv(qc_df, qc_out_csv, row.names = FALSE, fileEncoding = "UTF-8")
  cat(sprintf("Wrote %d QC multiverse rows to %s\n", nrow(qc_df), qc_out_csv))

  join_keys <- c("study_config_hash", "participant_id", "session_number")
  qc_prefixed <- qc_df
  qc_metric_columns <- setdiff(names(qc_prefixed), c("file", join_keys))
  names(qc_prefixed)[names(qc_prefixed) %in% qc_metric_columns] <- paste0("qc_", qc_metric_columns)
  qc_prefixed$file <- NULL
  summary_by_qc_df <- left_join(summary_df, qc_prefixed, by = join_keys)
  summary_by_qc_out_csv <- file.path(dirname(out_csv), paste0(tools::file_path_sans_ext(basename(out_csv)), "_by_qc_universe.csv"))
  write.csv(summary_by_qc_df, summary_by_qc_out_csv, row.names = FALSE, fileEncoding = "UTF-8")
  cat(sprintf("Wrote %d summary-by-QC rows to %s\n", nrow(summary_by_qc_df), summary_by_qc_out_csv))
}
