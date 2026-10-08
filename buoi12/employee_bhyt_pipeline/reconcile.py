"""Merge and reconcile employee PDF data with BHYT data."""

from __future__ import annotations

import pandas as pd

from .constants import BHYT_RECONCILE_FIELDS, SHEET_COLUMNS
from .utils import normalize_for_compare


def reconcile_records(
    employee_rows: list[dict[str, str]],
    bhyt_rows: list[dict[str, str]],
) -> pd.DataFrame:
    employee_by_id = {row.get("Ma_nhan_vien", ""): row for row in employee_rows}
    bhyt_by_id = {row.get("Ma_nhan_vien", ""): row for row in bhyt_rows}
    all_employee_ids = sorted(set(employee_by_id) | set(bhyt_by_id))

    output_rows = []
    for employee_id in all_employee_ids:
        employee = employee_by_id.get(employee_id, {})
        bhyt = bhyt_by_id.get(employee_id, {})
        row = _merge_one(employee_id, employee, bhyt)
        output_rows.append(row)

    return pd.DataFrame(output_rows, columns=SHEET_COLUMNS)


def _merge_one(
    employee_id: str,
    employee: dict[str, str],
    bhyt: dict[str, str],
) -> dict[str, str]:
    row = {column: "" for column in SHEET_COLUMNS}
    row.update(employee)

    for column in [
        "Ma_the_BHYT",
        "Noi_DK_KCB",
        "Gia_tri_BHYT_tu",
        "Gia_tri_BHYT_den",
        "Nguon_BHYT_file",
    ]:
        if bhyt.get(column):
            row[column] = bhyt[column]

    row["Ma_nhan_vien"] = employee.get("Ma_nhan_vien") or bhyt.get("Ma_nhan_vien") or employee_id
    row["Nguon_PDF_file"] = employee.get("Nguon_PDF_file", "")
    row["Nguon_BHYT_file"] = bhyt.get("Nguon_BHYT_file", "")

    mismatches = _find_mismatches(employee, bhyt)
    missing_sources = []
    if not employee:
        missing_sources.append("employee_pdf")
    if not bhyt:
        missing_sources.append("bhyt_image")

    if missing_sources:
        row["Trang_thai_doi_soat"] = "THIEU_NGUON_DU_LIEU"
    elif mismatches:
        row["Trang_thai_doi_soat"] = "CAN_KIEM_TRA"
    else:
        row["Trang_thai_doi_soat"] = "DA_DOI_SOAT"
    return {column: row.get(column, "") for column in SHEET_COLUMNS}


def _find_mismatches(employee: dict[str, str], bhyt: dict[str, str]) -> list[str]:
    mismatches = []
    for field in BHYT_RECONCILE_FIELDS:
        employee_value = employee.get(field, "")
        bhyt_value = bhyt.get(field, "")
        if employee_value and bhyt_value:
            if normalize_for_compare(employee_value) != normalize_for_compare(bhyt_value):
                mismatches.append(field)
    return mismatches
