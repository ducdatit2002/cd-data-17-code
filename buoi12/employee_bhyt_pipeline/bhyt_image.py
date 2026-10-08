"""Extractor for BHYT card images."""

from __future__ import annotations

import importlib.util
import re
from pathlib import Path
from typing import Literal

from PIL import Image

from .constants import (
    DEFAULT_BHYT_VALID_FROM,
    DEFAULT_BHYT_VALID_TO,
    DEMO_BHYT_CARD_PREFIX,
)
from .utils import clean_text, extract_employee_id_from_name

BHYTMode = Literal["auto", "ocr", "demo"]


class BHYTImageExtractor:
    """Extract BHYT fields from card images.

    In production, install ``pytesseract`` and the Tesseract binary to enable
    OCR. For the supplied clean demo dataset, the fallback can derive BHYT
    values from the paired employee record and deterministic demo layout.
    """

    def __init__(self, mode: BHYTMode = "auto") -> None:
        self.mode = mode
        self._has_tesseract = importlib.util.find_spec("pytesseract") is not None

    def extract_file(
        self,
        image_path: Path | str,
        employee_hint: dict[str, str] | None = None,
    ) -> dict[str, str]:
        path = Path(image_path)
        employee_id = extract_employee_id_from_name(path)
        self._validate_image(path)

        if self.mode in {"auto", "ocr"} and self._has_tesseract:
            try:
                ocr_row = self._extract_with_tesseract(path)
                if ocr_row.get("Ma_so_BHXH") or ocr_row.get("Ma_the_BHYT"):
                    ocr_row["Ma_nhan_vien"] = ocr_row.get("Ma_nhan_vien") or employee_id
                    ocr_row["Nguon_BHYT_file"] = path.name
                    ocr_row["BHYT_extraction_method"] = "ocr"
                    return ocr_row
            except Exception:
                if self.mode == "ocr":
                    raise

        if self.mode == "ocr":
            raise RuntimeError(
                "OCR mode was requested, but pytesseract/tesseract is not available "
                f"or no text could be extracted from {path.name}."
            )

        return self._extract_demo_fallback(path, employee_hint or {})

    def extract_dir(
        self,
        image_dir: Path | str,
        employee_by_id: dict[str, dict[str, str]] | None = None,
    ) -> list[dict[str, str]]:
        employee_by_id = employee_by_id or {}
        paths = sorted(Path(image_dir).glob("*.png"))
        rows = []
        for path in paths:
            employee_id = extract_employee_id_from_name(path)
            rows.append(self.extract_file(path, employee_by_id.get(employee_id)))
        return rows

    @staticmethod
    def _validate_image(path: Path) -> None:
        with Image.open(path) as image:
            image.verify()

    @staticmethod
    def _extract_with_tesseract(path: Path) -> dict[str, str]:
        import pytesseract  # type: ignore[import-not-found]

        with Image.open(path) as image:
            text = pytesseract.image_to_string(image, lang="vie+eng")
        return parse_bhyt_text(text)

    @staticmethod
    def _extract_demo_fallback(path: Path, employee_hint: dict[str, str]) -> dict[str, str]:
        employee_id = extract_employee_id_from_name(path)
        ma_so_bhxh = clean_text(employee_hint.get("Ma_so_BHXH"))
        ma_the_bhyt = f"{DEMO_BHYT_CARD_PREFIX}{ma_so_bhxh}" if ma_so_bhxh else ""

        return {
            "Ma_nhan_vien": employee_id,
            "Ho_ten": clean_text(employee_hint.get("Ho_ten")).upper(),
            "Gioi_tinh": clean_text(employee_hint.get("Gioi_tinh")),
            "Ngay_sinh": clean_text(employee_hint.get("Ngay_sinh")),
            "Ma_so_BHXH": ma_so_bhxh,
            "Ma_the_BHYT": ma_the_bhyt,
            "Noi_DK_KCB": clean_text(employee_hint.get("Noi_DK_KCB")),
            "Gia_tri_BHYT_tu": DEFAULT_BHYT_VALID_FROM,
            "Gia_tri_BHYT_den": DEFAULT_BHYT_VALID_TO,
            "Dia_chi_thuong_tru": clean_text(employee_hint.get("Dia_chi_thuong_tru")),
            "Nguon_BHYT_file": path.name,
            "BHYT_extraction_method": "demo_fallback",
        }


def parse_bhyt_text(text: str) -> dict[str, str]:
    """Parse OCR text from the BHYT card layout."""

    compact = "\n".join(clean_text(line) for line in text.splitlines() if clean_text(line))
    row = {
        "Ho_ten": _match_after_label(compact, r"H[oọ] và tên"),
        "Ngay_sinh": _match_after_label(compact, r"Ngày sinh"),
        "Gioi_tinh": _match_after_label(compact, r"Giới tính"),
        "Ma_so_BHXH": _match_after_label(compact, r"Mã số BHXH"),
        "Ma_the_BHYT": _match_after_label(compact, r"Mã thẻ BHYT"),
        "Noi_DK_KCB": _match_after_label(compact, r"Nơi ĐK KCB ban đầu"),
        "Gia_tri_BHYT_tu": _match_after_label(compact, r"Giá trị sử dụng từ"),
        "Gia_tri_BHYT_den": _match_after_label(compact, r"Giá trị sử dụng đến"),
        "Dia_chi_thuong_tru": _match_after_label(compact, r"Địa chỉ"),
    }

    if not row["Ma_the_BHYT"]:
        match = re.search(r"\b[A-Z]{2}\d{10,16}\b", compact)
        row["Ma_the_BHYT"] = match.group(0) if match else ""
    return row


def _match_after_label(text: str, label_pattern: str) -> str:
    pattern = rf"{label_pattern}\s*\n?(.+?)(?:\n[A-ZÀ-Ỵa-zà-ỵ].+?:|\n(?:Họ|Ngày|Giới|Mã|Nơi|Giá|Địa)|$)"
    match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return ""
    value = clean_text(match.group(1))
    return value.split("\n", 1)[0].strip()
