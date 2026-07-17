"""Build analysis-ready CSV datasets from Cognitive Battery exports.

Usage:
    python build_dataset.py <export-directory-or-file> [output-directory]

Typical workflow:
    python validate_exports.py exports validation_report.csv
    python build_dataset.py exports dataset --validation-report validation_report.csv

Outputs:
    participants.csv
    task_metrics_long.csv
    trials_long.csv
    qc_multiverse.csv
    session_events.csv
    dataset_manifest.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any

from analyze import (
    collect_export_files,
    load_payload,
    ordered_fieldnames,
    process_file,
    process_qc_multiverse_file,
    study_config_hash_from_payload,
)


def read_validation_report(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None:
        return {}
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return {row["file"]: row for row in csv.DictReader(f) if row.get("file")}


def validation_context(path: Path, validation_rows: dict[str, dict[str, Any]]) -> dict[str, Any]:
    row = validation_rows.get(path.name, {})
    return {
        "validation_status": row.get("status", ""),
        "validation_error_count": row.get("error_count", ""),
        "validation_warning_count": row.get("warning_count", ""),
        "validation_issues": row.get("issues", ""),
    }


def filter_export_files(
    files: list[Path],
    validation_rows: dict[str, dict[str, Any]],
    include_invalid: bool,
) -> tuple[list[Path], list[Path]]:
    if not validation_rows:
        return files, []

    kept = []
    skipped = []
    for path in files:
        status = validation_rows.get(path.name, {}).get("status", "")
        if status == "error" and not include_invalid:
            skipped.append(path)
        else:
            kept.append(path)
    return kept, skipped


def base_context(path: Path, payload: dict[str, Any], integrity_ok: bool | None) -> dict[str, Any]:
    participant = payload.get("participant", {}) if isinstance(payload.get("participant"), dict) else {}
    protocol = payload.get("protocol", {}) if isinstance(payload.get("protocol"), dict) else {}
    manifest = payload.get("export_manifest", {}) if isinstance(payload.get("export_manifest"), dict) else {}
    return {
        "file": path.name,
        "export_type": path.suffix.lower().lstrip("."),
        "integrity_ok": "" if integrity_ok is None else int(bool(integrity_ok)),
        "study_config_hash": study_config_hash_from_payload(payload),
        "participant_id": participant.get("participantId") or manifest.get("participant_id"),
        "session_number": participant.get("session_number") or manifest.get("session_number"),
        "ui_language": participant.get("ui_language") or protocol.get("ui_language"),
        "instruction_language": participant.get("instruction_language") or protocol.get("instruction_language"),
        "stimulus_language": participant.get("stimulus_language") or protocol.get("stimulus_language"),
        "consent_language": participant.get("consent_language") or protocol.get("consent_language"),
        "translation_version": participant.get("translation_version") or protocol.get("translation_version"),
        "app_version": protocol.get("app_version") or manifest.get("app_version") or payload.get("version"),
        "protocol_version": protocol.get("protocol_version"),
        "task_version": protocol.get("task_version"),
        "scoring_version": protocol.get("scoring_version"),
        "stimulus_version": protocol.get("stimulus_version"),
        "qc_multiverse_version": protocol.get("qc_multiverse_version") or manifest.get("qc_multiverse_version"),
        "random_seed": participant.get("random_seed") or manifest.get("random_seed"),
        "counterbalance_group": participant.get("counterbalance_group") or manifest.get("counterbalance_group"),
    }


def encode_value(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def build_task_metric_rows(path: Path, payload: dict[str, Any], integrity_ok: bool | None) -> list[dict[str, Any]]:
    context = base_context(path, payload, integrity_ok)
    rows = []
    for row in payload.get("task_metrics_long", []) or []:
        if not isinstance(row, dict):
            continue
        merged = {**context}
        merged.update({key: encode_value(value) for key, value in row.items()})
        rows.append(merged)
    return rows


def build_trial_rows(path: Path, payload: dict[str, Any], integrity_ok: bool | None) -> list[dict[str, Any]]:
    context = base_context(path, payload, integrity_ok)
    trials = payload.get("trials", {}) if isinstance(payload.get("trials"), dict) else {}
    rows = []
    for test_id, test_trials in trials.items():
        if not isinstance(test_trials, list):
            continue
        for index, trial in enumerate(test_trials, start=1):
            if not isinstance(trial, dict):
                continue
            row = {
                **context,
                "testId": test_id,
                "trial_index": index,
            }
            row.update({key: encode_value(value) for key, value in trial.items()})
            rows.append(row)
    return rows


def build_session_event_rows(path: Path, payload: dict[str, Any], integrity_ok: bool | None) -> list[dict[str, Any]]:
    context = base_context(path, payload, integrity_ok)
    events = payload.get("session_events", []) or []
    rows = []
    for index, event in enumerate(events, start=1):
        if not isinstance(event, dict):
            continue
        row = {
            **context,
            "event_index": index,
        }
        row.update({key: encode_value(value) for key, value in event.items()})
        rows.append(row)
    return rows


def enrich_rows_with_validation(
    rows: list[dict[str, Any]],
    validation_rows: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    if not validation_rows:
        return rows
    enriched = []
    for row in rows:
        context = validation_context(Path(str(row.get("file", ""))), validation_rows)
        enriched.append({**row, **context})
    return enriched


def write_rows(path: Path, rows: list[dict[str, Any]]) -> None:
    fieldnames = ordered_fieldnames(rows) if rows else ["no_rows"]
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        if rows:
            writer.writerows(rows)


def dataset_manifest_rows(
    source_path: Path,
    output_dir: Path,
    input_files: list[Path],
    skipped_files: list[Path],
    participants: list[dict[str, Any]],
    task_metrics: list[dict[str, Any]],
    trials: list[dict[str, Any]],
    qc_rows: list[dict[str, Any]],
    session_events: list[dict[str, Any]],
    validation_report: Path | None,
    include_invalid: bool,
) -> list[dict[str, Any]]:
    return [
        {"field": "source_path", "value": str(source_path)},
        {"field": "output_dir", "value": str(output_dir)},
        {"field": "validation_report", "value": str(validation_report) if validation_report else ""},
        {"field": "include_invalid", "value": int(include_invalid)},
        {"field": "input_file_count", "value": len(input_files) + len(skipped_files)},
        {"field": "processed_file_count", "value": len(input_files)},
        {"field": "skipped_error_file_count", "value": len(skipped_files)},
        {"field": "skipped_error_files", "value": ",".join(path.name for path in skipped_files)},
        {"field": "participant_rows", "value": len(participants)},
        {"field": "task_metric_rows", "value": len(task_metrics)},
        {"field": "trial_rows", "value": len(trials)},
        {"field": "qc_multiverse_rows", "value": len(qc_rows)},
        {"field": "session_event_rows", "value": len(session_events)},
    ]


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build analysis-ready CSV datasets from Cognitive Battery exports.")
    parser.add_argument("export_path", help="Directory or single .xlsx/.json export file")
    parser.add_argument("output_dir", nargs="?", default=None, help="Output directory for generated CSVs")
    parser.add_argument("--validation-report", dest="validation_report", default=None,
                        help="CSV from validate_exports.py. status=error files are skipped by default.")
    parser.add_argument("--include-invalid", action="store_true",
                        help="Include files marked status=error in the validation report.")
    return parser.parse_args(argv[1:])


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    source_path = Path(args.export_path)
    output_dir = Path(args.output_dir) if args.output_dir else (
        source_path / "dataset" if source_path.is_dir() else source_path.with_name("dataset")
    )
    validation_report = Path(args.validation_report) if args.validation_report else None

    files = collect_export_files(source_path)
    if not files:
        print(f"No .xlsx or .json files found in {source_path}", file=sys.stderr)
        return 1

    validation_rows = read_validation_report(validation_report)
    files, skipped_files = filter_export_files(files, validation_rows, args.include_invalid)
    if not files:
        print("No files left to process after applying validation report.", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    participants: list[dict[str, Any]] = []
    task_metrics: list[dict[str, Any]] = []
    trials: list[dict[str, Any]] = []
    qc_rows: list[dict[str, Any]] = []
    session_events: list[dict[str, Any]] = []

    for path in files:
        payload, integrity_ok = load_payload(path)
        participants.append(process_file(path, rt_low=100, rt_high=5000))
        task_metrics.extend(build_task_metric_rows(path, payload, integrity_ok))
        trials.extend(build_trial_rows(path, payload, integrity_ok))
        qc_rows.extend(process_qc_multiverse_file(path))
        session_events.extend(build_session_event_rows(path, payload, integrity_ok))

    participants = enrich_rows_with_validation(participants, validation_rows)
    task_metrics = enrich_rows_with_validation(task_metrics, validation_rows)
    trials = enrich_rows_with_validation(trials, validation_rows)
    qc_rows = enrich_rows_with_validation(qc_rows, validation_rows)
    session_events = enrich_rows_with_validation(session_events, validation_rows)

    write_rows(output_dir / "participants.csv", participants)
    write_rows(output_dir / "task_metrics_long.csv", task_metrics)
    write_rows(output_dir / "trials_long.csv", trials)
    write_rows(output_dir / "qc_multiverse.csv", qc_rows)
    write_rows(output_dir / "session_events.csv", session_events)
    write_rows(output_dir / "dataset_manifest.csv", dataset_manifest_rows(
        source_path=source_path,
        output_dir=output_dir,
        input_files=files,
        skipped_files=skipped_files,
        participants=participants,
        task_metrics=task_metrics,
        trials=trials,
        qc_rows=qc_rows,
        session_events=session_events,
        validation_report=validation_report,
        include_invalid=args.include_invalid,
    ))

    print(f"Wrote dataset CSVs to {output_dir}")
    print(f"Processed {len(files)} files; skipped {len(skipped_files)} validation-error files.")
    print(f"Rows: participants={len(participants)}, task_metrics={len(task_metrics)}, trials={len(trials)}, qc={len(qc_rows)}, events={len(session_events)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
