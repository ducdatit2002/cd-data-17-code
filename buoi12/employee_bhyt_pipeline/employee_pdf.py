"""Extractor for employee information PDFs."""

from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader

from .constants import EMPLOYEE_LABEL_TO_COLUMN
from .utils import clean_text, extract_employee_id_from_name


class EmployeePDFExtractor:
    """Extract employee fields from the demo PDF form layout."""

    def extract_file(self, pdf_path: Path | str) -> dict[str, str]:
        path = Path(pdf_path)
        text = self._read_pdf_text(path)
        lines = [clean_text(line) for line in text.splitlines()]
        lines = [line for line in lines if line]

        row: dict[str, str] = {column: "" for column in EMPLOYEE_LABEL_TO_COLUMN.values()}
        for label, column in EMPLOYEE_LABEL_TO_COLUMN.items():
            row[column] = self._value_after_label(lines, label)

        if not row["Ma_nhan_vien"]:
            row["Ma_nhan_vien"] = extract_employee_id_from_name(path)

        row["Nguon_PDF_file"] = path.name
        return row

    def extract_dir(self, pdf_dir: Path | str) -> list[dict[str, str]]:
        paths = sorted(Path(pdf_dir).glob("*.pdf"))
        return [self.extract_file(path) for path in paths]

    @staticmethod
    def _read_pdf_text(path: Path) -> str:
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    @staticmethod
    def _value_after_label(lines: list[str], label: str) -> str:
        for index, line in enumerate(lines):
            if clean_text(line) == label and index + 1 < len(lines):
                return clean_text(lines[index + 1])
        return ""
