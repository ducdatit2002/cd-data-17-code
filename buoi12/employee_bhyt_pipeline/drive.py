"""Google Drive downloader for private input folders."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
GOOGLE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"


@dataclass(frozen=True)
class DriveDownloadResult:
    scanned: int = 0
    downloaded: int = 0
    skipped: int = 0

    def __add__(self, other: "DriveDownloadResult") -> "DriveDownloadResult":
        return DriveDownloadResult(
            scanned=self.scanned + other.scanned,
            downloaded=self.downloaded + other.downloaded,
            skipped=self.skipped + other.skipped,
        )


class GoogleDriveDownloader:
    """Download files from private Google Drive folders via service account."""

    def __init__(self, credentials_file: Path | str = "google-service.json") -> None:
        try:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
        except ImportError as exc:
            raise RuntimeError(
                "Missing Google Drive dependencies. Install requirements.txt first."
            ) from exc

        credentials = Credentials.from_service_account_file(
            str(credentials_file),
            scopes=[DRIVE_READONLY_SCOPE],
        )
        self._service = build("drive", "v3", credentials=credentials, cache_discovery=False)

    def download_folder(
        self,
        folder_id: str,
        output_dir: Path | str,
        allowed_extensions: Iterable[str],
        recursive: bool = False,
        overwrite: bool = False,
    ) -> DriveDownloadResult:
        target_dir = Path(output_dir)
        target_dir.mkdir(parents=True, exist_ok=True)
        allowed = {ext.lower().lstrip(".") for ext in allowed_extensions}
        result = DriveDownloadResult()

        for file_meta in self._iter_folder_files(folder_id, recursive=recursive):
            result += DriveDownloadResult(scanned=1)
            if file_meta["mimeType"] == GOOGLE_FOLDER_MIME_TYPE:
                continue

            filename = safe_filename(file_meta["name"])
            extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
            if allowed and extension not in allowed:
                result += DriveDownloadResult(skipped=1)
                continue

            did_download = self._download_file(
                file_id=file_meta["id"],
                output_path=target_dir / filename,
                overwrite=overwrite,
            )
            if did_download:
                result += DriveDownloadResult(downloaded=1)
            else:
                result += DriveDownloadResult(skipped=1)

        return result

    def _iter_folder_files(self, folder_id: str, recursive: bool) -> Iterable[dict[str, str]]:
        page_token = None
        while True:
            response = (
                self._service.files()
                .list(
                    q=f"'{folder_id}' in parents and trashed = false",
                    fields="nextPageToken, files(id, name, mimeType, size, modifiedTime)",
                    pageSize=1000,
                    pageToken=page_token,
                    includeItemsFromAllDrives=True,
                    supportsAllDrives=True,
                )
                .execute()
            )
            for file_meta in response.get("files", []):
                yield file_meta
                if recursive and file_meta["mimeType"] == GOOGLE_FOLDER_MIME_TYPE:
                    yield from self._iter_folder_files(file_meta["id"], recursive=True)

            page_token = response.get("nextPageToken")
            if not page_token:
                break

    def _download_file(self, file_id: str, output_path: Path, overwrite: bool) -> bool:
        if output_path.exists() and not overwrite:
            return False

        from googleapiclient.http import MediaIoBaseDownload

        output_path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = output_path.with_suffix(output_path.suffix + ".download")
        request = self._service.files().get_media(fileId=file_id, supportsAllDrives=True)
        with temp_path.open("wb") as file_handle:
            downloader = MediaIoBaseDownload(file_handle, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
        temp_path.replace(output_path)
        return True


def safe_filename(name: str) -> str:
    cleaned = re.sub(r"[/:\\]+", "_", name).strip()
    return cleaned or "downloaded_file"


def download_drive_inputs(
    credentials_file: Path | str,
    employee_folder_id: str | None,
    bhyt_folder_id: str | None,
    employee_dir: Path | str = "employee_info",
    bhyt_dir: Path | str = "bhyt",
    recursive: bool = False,
    overwrite: bool = False,
) -> dict[str, DriveDownloadResult]:
    downloader = GoogleDriveDownloader(credentials_file=credentials_file)
    results: dict[str, DriveDownloadResult] = {}

    if employee_folder_id:
        results["employee_info"] = downloader.download_folder(
            folder_id=employee_folder_id,
            output_dir=employee_dir,
            allowed_extensions=["pdf"],
            recursive=recursive,
            overwrite=overwrite,
        )

    if bhyt_folder_id:
        results["bhyt"] = downloader.download_folder(
            folder_id=bhyt_folder_id,
            output_dir=bhyt_dir,
            allowed_extensions=["png", "jpg", "jpeg"],
            recursive=recursive,
            overwrite=overwrite,
        )

    return results
