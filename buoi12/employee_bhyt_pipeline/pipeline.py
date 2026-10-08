"""End-to-end stage 1 extraction pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from .bhyt_image import BHYTImageExtractor, BHYTMode
from .constants import SHEET_COLUMNS, SHEET_NAME
from .employee_pdf import EmployeePDFExtractor
from .reconcile import reconcile_records
from .sheets import GoogleSheetWriter
from .utils import ensure_parent_dir


@dataclass(frozen=True)
class PipelineConfig:
    employee_dir: Path = Path("employee_info")
    bhyt_dir: Path = Path("bhyt")
    output_csv: Path | None = Path("outputs/du_lieu_da_nhap.csv")
    output_xlsx: Path | None = Path("outputs/du_lieu_da_nhap.xlsx")
    bhyt_mode: BHYTMode = "auto"


def run_pipeline(config: PipelineConfig) -> pd.DataFrame:
    employee_extractor = EmployeePDFExtractor()
    employee_rows = employee_extractor.extract_dir(config.employee_dir)
    employee_by_id = {row.get("Ma_nhan_vien", ""): row for row in employee_rows}

    bhyt_extractor = BHYTImageExtractor(mode=config.bhyt_mode)
    bhyt_rows = bhyt_extractor.extract_dir(config.bhyt_dir, employee_by_id=employee_by_id)

    df = reconcile_records(employee_rows, bhyt_rows)
    if config.output_csv:
        export_csv(df, config.output_csv)
    if config.output_xlsx:
        export_xlsx(df, config.output_xlsx)
    return df


def export_csv(df: pd.DataFrame, output_path: Path | str) -> None:
    path = Path(output_path)
    ensure_parent_dir(path)
    df[SHEET_COLUMNS].to_csv(path, index=False, encoding="utf-8-sig")


def export_xlsx(df: pd.DataFrame, output_path: Path | str) -> None:
    path = Path(output_path)
    ensure_parent_dir(path)
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        df[SHEET_COLUMNS].to_excel(
            writer,
            sheet_name=SHEET_NAME,
            startrow=0,
            index=False,
        )
        worksheet = writer.sheets[SHEET_NAME]
        worksheet.freeze_panes = "A2"
        for column_cells in worksheet.columns:
            max_length = max(len(str(cell.value or "")) for cell in column_cells)
            width = min(max(max_length + 2, 12), 36)
            worksheet.column_dimensions[column_cells[0].column_letter].width = width


def upload_to_google_sheet(
    df: pd.DataFrame,
    sheet_id: str,
    worksheet_name: str = SHEET_NAME,
    credentials_file: Path | str = "google-service.json",
    mode: str = "replace",
) -> None:
    writer = GoogleSheetWriter(credentials_file=credentials_file)
    writer.write_dataframe(sheet_id=sheet_id, worksheet_name=worksheet_name, df=df, mode=mode)
