"""Utility helpers used across extractors."""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def normalize_for_compare(value: object) -> str:
    text = clean_text(value).casefold()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("đ", "d")
    return re.sub(r"[^a-z0-9]+", "", text)


def extract_employee_id_from_name(path: Path | str) -> str:
    match = re.search(r"CS-ACA-\d+", Path(path).name, flags=re.IGNORECASE)
    return match.group(0).upper() if match else ""


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def column_number_to_letter(number: int) -> str:
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result
