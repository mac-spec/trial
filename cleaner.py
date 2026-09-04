"""Clean and normalize government MPLADS workbook data for audit ingestion.

Usage:
    python cleaner.py --input "raw_govt_data.xlsx" --output "cleaned_government_upload.csv"

The cleaner deliberately does not invent project-level fields. It maps common
MPLADS export headers and marks imported records PENDING_AUDIT so the backend
can run the real audit pipeline afterwards.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable

import pandas as pd


MAPPING = {
    "work_id": ["work_id", "work_code", "project_id", "serial_no", "sl_no"],
    "title": ["project_/_work_name", "work_name", "project_name", "description"],
    "contractor_name": ["contractor", "vendor_name", "agency_name", "vendor"],
    "total_budget": ["sanctioned_amount", "sanctioned_cost", "amount_sanctioned", "cost"],
    "ward_name": ["ward", "ward_name", "nodal_district", "locality", "location"],
}


def normalize_header(value: object) -> str:
    text = "" if pd.isna(value) else str(value).strip().lower()
    text = re.sub(r"[\n\r]+", " ", text)
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text


def clean_money(value: object) -> float:
    if pd.isna(value) or value == "":
        return 0.0
    text = str(value).replace(",", "").replace("₹", "").strip()
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return float(match.group(0)) if match else 0.0


def find_column(columns: Iterable[str], candidates: list[str]) -> str | None:
    normalized = {normalize_header(c): c for c in columns}
    for candidate in candidates:
        key = normalize_header(candidate)
        if key in normalized:
            return normalized[key]
    return None


def load_workbook(path: Path) -> pd.DataFrame:
    sheets = pd.read_excel(path, sheet_name=None, dtype=object)
    frames: list[pd.DataFrame] = []
    for sheet_name, frame in sheets.items():
        if frame.empty:
            continue
        frame = frame.dropna(how="all").copy()
        if frame.empty:
            continue
        # Some government workbooks put the real header in the first data row.
        first = [normalize_header(v) for v in frame.iloc[0].tolist()]
        known = {normalize_header(c) for values in MAPPING.values() for c in values}
        if any(v in known for v in first):
            frame.columns = frame.iloc[0].tolist()
            frame = frame.iloc[1:].reset_index(drop=True)
        frame["_source_sheet"] = sheet_name
        frames.append(frame)
    if not frames:
        raise ValueError("No usable rows were found in the workbook.")
    return pd.concat(frames, ignore_index=True, sort=False)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    result = pd.DataFrame(index=df.index)
    for target, candidates in MAPPING.items():
        source = find_column(df.columns, candidates)
        if source is None:
            result[target] = ""
        else:
            result[target] = df[source]

    # Preserve source fields for traceability without depending on their names.
    result["source_sheet"] = df.get("_source_sheet", "")
    result["work_id"] = result["work_id"].astype(str).str.strip()
    result["work_id"] = result["work_id"].replace({"nan": "", "None": ""})
    result["title"] = result["title"].fillna("").astype(str).str.strip()
    result["contractor_name"] = result["contractor_name"].fillna("").astype(str).str.strip()
    result["ward_name"] = result["ward_name"].fillna("").astype(str).str.strip()
    result["total_budget"] = result["total_budget"].map(clean_money)

    # Never create fake project IDs. A row must have an identifiable source ID.
    result = result[result["work_id"].ne("")].copy()
    result = result.drop_duplicates(subset=["work_id"], keep="first")

    # Audit lifecycle defaults expected by the ingestion pipeline.
    result["status"] = "PENDING_AUDIT"
    result["risk_score"] = 0.0
    result["risk_level"] = "low"
    result["funds_frozen"] = 0.0

    return result[
        [
            "work_id",
            "title",
            "contractor_name",
            "total_budget",
            "ward_name",
            "status",
            "risk_score",
            "risk_level",
            "funds_frozen",
            "source_sheet",
        ]
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean an MPLADS government Excel export.")
    parser.add_argument("--input", default="raw_govt_data.xlsx")
    parser.add_argument("--output", default="cleaned_government_upload.csv")
    args = parser.parse_args()

    source = Path(args.input)
    if not source.exists():
        raise SystemExit(f"Input workbook not found: {source}")

    cleaned = clean_dataframe(load_workbook(source))
    cleaned.to_csv(args.output, index=False)
    print(f"Wrote {len(cleaned)} rows to {args.output}")


if __name__ == "__main__":
    main()
