"""Validate Cognitive Battery participant export files before analysis.

Usage:
    python validate_exports.py <export-directory-or-file> [validation_report.csv]

The validator accepts participant-submitted Excel workbooks (.xlsx) and the
researcher-diagnostic JSON exports. It writes one row per file with status,
version metadata, QC multiverse counts, task/raw-data counts, and issues.

Exit status is 1 when any file has an error, otherwise 0. Warnings do not fail
the run because older protocol versions may still be useful for exploratory
inspection when handled explicitly.
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path
from typing import Any

from analyze import (
    _OPENPYXL_AVAILABLE,
    collect_export_files,
    load_payload,
    qc_multiverse_rows,
    sheet_to_records,
    summarize_qc_multiverse,
)

if _OPENPYXL_AVAILABLE:
    from analyze import load_workbook
else:  # pragma: no cover - only reached when dependency is absent
    load_workbook = None


EXPECTED_APP_VERSION = "cb-2026-05-research-v5"
EXPECTED_PROTOCOL_VERSION = "protocol-2026-05-remote-adult-v1"
EXPECTED_TASK_VERSION = "tasks-2026-05-v1"
EXPECTED_SCORING_VERSION = "scoring-2026-05-v1"
EXPECTED_QC_MULTIVERSE_VERSION = "qc-multiverse-2026-05-v1"
EXPECTED_QC_UNIVERSE_COUNT = 5

REQUIRED_XLSX_SHEETS = [
    "Export Manifest",
    "Participant",
    "Scores",
    "Research Metrics",
    "Task Metrics Long",
    "Protocol Metadata",
    "Researcher Review",
    "QC Multiverse",
    "Session Quality",
    "Codebook",
]

RAW_SHEET_TO_TEST_ID = {
    "flanker_raw": "flanker",
    "dccs_raw": "dccs",
    "pattern_comparison_raw": "pattern-comparison",
    "list_sorting_raw": "list-sorting",
    "picture_sequence_raw": "picture-sequence",
}

REQUIRED_JSON_KEYS = [
    "participant",
    "protocol",
    "results",
    "research_metrics",
    "task_metrics_long",
    "trials",
    "qc_multiverse",
]

REPORT_FIELDS = [
    "file",
    "status",
    "error_count",
    "warning_count",
    "participant_id",
    "session_number",
    "app_version",
    "protocol_version",
    "task_version",
    "scoring_version",
    "stimulus_version",
    "qc_multiverse_version",
    "export_format",
    "export_manifest_version",
    "selected_tests",
    "completed_task_count",
    "score_row_count",
    "task_metrics_long_count",
    "raw_sheet_count",
    "raw_trial_count",
    "qc_universe_count",
    "qc_include_candidate_universes",
    "qc_exclude_candidate_universes",
    "qc_exclude_candidate_count",
    "integrity_ok",
    "missing_required_sheets",
    "missing_raw_tests",
    "issues",
]


def present(value: Any) -> bool:
    return value is not None and str(value).strip() != ""


def split_csv(value: Any) -> list[str]:
    if not present(value):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if present(item)]
    return [part.strip() for part in str(value).split(",") if part.strip()]


def issue(row: dict[str, Any], severity: str, message: str) -> None:
    row.setdefault("_issues", []).append(f"{severity}:{message}")
    key = "_errors" if severity == "error" else "_warnings"
    row[key] = int(row.get(key, 0)) + 1


def finalize_row(row: dict[str, Any]) -> dict[str, Any]:
    errors = int(row.get("_errors", 0))
    warnings = int(row.get("_warnings", 0))
    row["error_count"] = errors
    row["warning_count"] = warnings
    row["status"] = "error" if errors else ("warning" if warnings else "ok")
    row["issues"] = " ; ".join(row.get("_issues", []))
    for private_key in ["_errors", "_warnings", "_issues", "_duplicate_key"]:
        row.pop(private_key, None)
    for field in REPORT_FIELDS:
        row.setdefault(field, "")
    return {field: row.get(field, "") for field in REPORT_FIELDS}


def sheet_names(path: Path) -> list[str]:
    if path.suffix.lower() != ".xlsx":
        return []
    if not _OPENPYXL_AVAILABLE:
        raise RuntimeError("Excel validation requires openpyxl. Install it with: python -m pip install openpyxl")
    workbook = load_workbook(path, read_only=True, data_only=True)
    return list(workbook.sheetnames)


def xlsx_sheet_counts(path: Path, names: list[str]) -> dict[str, Any]:
    workbook = load_workbook(path, read_only=True, data_only=True)
    score_rows = sheet_to_records(workbook, "Scores")
    task_metric_rows = sheet_to_records(workbook, "Task Metrics Long")
    raw_counts = {}
    for sheet, test_id in RAW_SHEET_TO_TEST_ID.items():
        if sheet in names:
            raw_counts[test_id] = len(sheet_to_records(workbook, sheet))
    return {
        "score_row_count": len(score_rows),
        "task_metrics_long_count": len(task_metric_rows),
        "raw_counts": raw_counts,
    }


def version_checks(row: dict[str, Any], protocol: dict[str, Any], manifest: dict[str, Any]) -> None:
    app_version = protocol.get("app_version") or manifest.get("app_version")
    protocol_version = protocol.get("protocol_version")
    task_version = protocol.get("task_version")
    scoring_version = protocol.get("scoring_version")
    qc_version = protocol.get("qc_multiverse_version") or manifest.get("qc_multiverse_version")

    row["app_version"] = app_version or ""
    row["protocol_version"] = protocol_version or ""
    row["task_version"] = task_version or ""
    row["scoring_version"] = scoring_version or ""
    row["stimulus_version"] = protocol.get("stimulus_version") or ""
    row["qc_multiverse_version"] = qc_version or ""

    required_versions = {
        "app_version": app_version,
        "protocol_version": protocol_version,
        "task_version": task_version,
        "scoring_version": scoring_version,
        "qc_multiverse_version": qc_version,
    }
    for name, value in required_versions.items():
        if not present(value):
            issue(row, "error", f"missing {name}")

    expected = {
        "app_version": EXPECTED_APP_VERSION,
        "protocol_version": EXPECTED_PROTOCOL_VERSION,
        "task_version": EXPECTED_TASK_VERSION,
        "scoring_version": EXPECTED_SCORING_VERSION,
        "qc_multiverse_version": EXPECTED_QC_MULTIVERSE_VERSION,
    }
    for name, expected_value in expected.items():
        value = required_versions[name]
        if present(value) and value != expected_value:
            issue(row, "warning", f"{name} is {value}, expected {expected_value}")


def validate_payload(path: Path, payload: dict[str, Any], integrity_ok: bool | None, row: dict[str, Any]) -> None:
    participant = payload.get("participant", {}) if isinstance(payload.get("participant"), dict) else {}
    protocol = payload.get("protocol", {}) if isinstance(payload.get("protocol"), dict) else {}
    manifest = payload.get("export_manifest", {}) if isinstance(payload.get("export_manifest"), dict) else {}
    trials = payload.get("trials", {}) if isinstance(payload.get("trials"), dict) else {}

    participant_id = participant.get("participantId") or manifest.get("participant_id")
    session_number = participant.get("session_number") or manifest.get("session_number")
    row["participant_id"] = participant_id or ""
    row["session_number"] = session_number or ""
    row["integrity_ok"] = "" if integrity_ok is None else int(bool(integrity_ok))

    if not present(participant_id):
        issue(row, "error", "missing participant_id")
    if not present(session_number):
        issue(row, "warning", "missing session_number")

    version_checks(row, protocol, manifest)

    if path.suffix.lower() == ".json":
        if integrity_ok is False:
            issue(row, "error", "integrity_sha256 mismatch")
        if integrity_ok is None:
            issue(row, "warning", "integrity_sha256 missing or not verifiable")
        for key in REQUIRED_JSON_KEYS:
            if key not in payload:
                issue(row, "error", f"missing JSON key {key}")

    row["export_format"] = manifest.get("export_format") or ("json" if path.suffix.lower() == ".json" else "")
    row["export_manifest_version"] = manifest.get("export_manifest_version") or ""
    if path.suffix.lower() == ".xlsx":
        if row["export_format"] and row["export_format"] != "xlsx":
            issue(row, "warning", f"export_format is {row['export_format']}, expected xlsx")
        if not row["export_manifest_version"]:
            issue(row, "error", "missing export_manifest_version")

    selected_tests = split_csv(manifest.get("selected_tests"))
    if not selected_tests:
        selected_tests = [test_id for test_id, task_trials in trials.items() if task_trials]
        if path.suffix.lower() == ".xlsx":
            issue(row, "warning", "selected_tests missing in Export Manifest; inferred from raw sheets")
    row["selected_tests"] = ",".join(selected_tests)

    completed_tests = [test_id for test_id, task_trials in trials.items() if task_trials]
    row["completed_task_count"] = len(completed_tests)
    row["raw_sheet_count"] = len(completed_tests)
    row["raw_trial_count"] = sum(len(task_trials) for task_trials in trials.values() if isinstance(task_trials, list))

    if len(completed_tests) == 0:
        issue(row, "error", "no raw trial data found")

    missing_raw = sorted(set(selected_tests) - set(completed_tests)) if selected_tests else []
    row["missing_raw_tests"] = ",".join(missing_raw)
    if missing_raw:
        issue(row, "error", f"missing raw data for selected tests: {','.join(missing_raw)}")

    qc_rows = qc_multiverse_rows(payload)
    qc_summary = summarize_qc_multiverse(qc_rows)
    row.update(qc_summary)
    if len(qc_rows) == 0:
        issue(row, "error", "QC Multiverse rows missing")
    elif len(qc_rows) != EXPECTED_QC_UNIVERSE_COUNT:
        issue(row, "warning", f"QC universe count is {len(qc_rows)}, expected {EXPECTED_QC_UNIVERSE_COUNT}")


def validate_file(path: Path) -> dict[str, Any]:
    row: dict[str, Any] = {"file": path.name}
    suffix = path.suffix.lower()

    if suffix not in {".xlsx", ".json"}:
        issue(row, "error", f"unsupported file type {suffix}")
        return row

    try:
        if suffix == ".xlsx":
            names = sheet_names(path)
            missing = [sheet for sheet in REQUIRED_XLSX_SHEETS if sheet not in names]
            row["missing_required_sheets"] = ",".join(missing)
            for sheet in missing:
                issue(row, "error", f"missing required sheet {sheet}")

            counts = xlsx_sheet_counts(path, names)
            row["score_row_count"] = counts["score_row_count"]
            row["task_metrics_long_count"] = counts["task_metrics_long_count"]
            if counts["score_row_count"] == 0:
                issue(row, "error", "Scores sheet has no rows")
            if counts["task_metrics_long_count"] == 0:
                issue(row, "warning", "Task Metrics Long has no rows")

        payload, integrity_ok = load_payload(path)
        validate_payload(path, payload, integrity_ok, row)
    except Exception as exc:  # pragma: no cover - exercised by corrupt files
        issue(row, "error", f"load failed: {type(exc).__name__}: {exc}")

    return row


def mark_duplicates(rows: list[dict[str, Any]]) -> None:
    seen: dict[tuple[str, str], str] = {}
    for row in rows:
        participant_id = str(row.get("participant_id", "")).strip()
        session_number = str(row.get("session_number", "")).strip()
        if not participant_id or not session_number:
            continue
        key = (participant_id, session_number)
        if key in seen:
            issue(row, "error", f"duplicate participant_id/session_number also in {seen[key]}")
        else:
            seen[key] = str(row.get("file", ""))


def write_report(rows: list[dict[str, Any]], out_csv: Path) -> None:
    with out_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=REPORT_FIELDS)
        writer.writeheader()
        writer.writerows(finalize_row(row) for row in rows)


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 1

    export_path = Path(argv[1])
    out_csv = Path(argv[2]) if len(argv) >= 3 else (
        export_path / "validation_report.csv" if export_path.is_dir()
        else export_path.with_name("validation_report.csv")
    )

    files = collect_export_files(export_path)
    if not files:
        print(f"No .xlsx or .json files found in {export_path}", file=sys.stderr)
        return 1

    rows = [validate_file(path) for path in files]
    mark_duplicates(rows)
    error_files = sum(1 for row in rows if int(row.get("_errors", 0)) > 0)
    warning_files = sum(1 for row in rows if int(row.get("_warnings", 0)) > 0 and int(row.get("_errors", 0)) == 0)
    write_report(rows, out_csv)

    print(f"Wrote validation report for {len(rows)} files to {out_csv}")
    print(f"Status: {len(rows) - error_files - warning_files} ok, {warning_files} warning, {error_files} error")
    return 1 if error_files else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
