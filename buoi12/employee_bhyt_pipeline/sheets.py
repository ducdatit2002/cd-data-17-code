"""Google Sheets writer for the stage 1 pipeline."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from .constants import SHEET_COLUMNS


class GoogleSheetWriter:
    """Write the extracted dataframe into an existing Google Sheet."""

    def __init__(self, credentials_file: Path | str = "google-service.json") -> None:
        try:
            import gspread
            from google.oauth2.service_account import Credentials
        except ImportError as exc:
            raise RuntimeError(
                "Missing Google Sheets dependencies. Install requirements.txt first."
            ) from exc

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        credentials = Credentials.from_service_account_file(str(credentials_file), scopes=scopes)
        self._gspread = gspread
        self._client = gspread.authorize(credentials)

    def write_dataframe(
        self,
        sheet_id: str,
        worksheet_name: str,
        df: pd.DataFrame,
        mode: str = "replace",
        header_row: int = 1,
    ) -> None:
        worksheet = self._client.open_by_key(sheet_id).worksheet(worksheet_name)
        values = [SHEET_COLUMNS] + df[SHEET_COLUMNS].fillna("").astype(str).values.tolist()

        if mode == "append":
            existing = worksheet.get_all_values()
            if len(existing) < header_row or existing[header_row - 1][: len(SHEET_COLUMNS)] != SHEET_COLUMNS:
                self._update(worksheet, f"A{header_row}", [SHEET_COLUMNS])
            worksheet.append_rows(values[1:], value_input_option="USER_ENTERED")
            return

        worksheet.clear()
        self._update(worksheet, f"A{header_row}", values)

    @staticmethod
    def _update(worksheet, start_cell: str, values: list[list[str]]) -> None:
        try:
            worksheet.update(values=values, range_name=start_cell, value_input_option="USER_ENTERED")
        except TypeError:
            worksheet.update(start_cell, values, value_input_option="USER_ENTERED")
