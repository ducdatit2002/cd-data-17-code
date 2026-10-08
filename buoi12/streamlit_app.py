"""Optional Streamlit UI for the stage 1 pipeline."""

from __future__ import annotations

from pathlib import Path

import streamlit as st

from employee_bhyt_pipeline import SHEET_NAME, PipelineConfig, run_pipeline
from employee_bhyt_pipeline.drive import download_drive_inputs
from employee_bhyt_pipeline.pipeline import upload_to_google_sheet


st.set_page_config(page_title="BHYT Employee Pipeline", layout="wide")
st.title("BHYT Employee Pipeline - Giai doan 1")

st.sidebar.header("Local cache")
employee_dir = st.sidebar.text_input("Employee PDF folder", "employee_info")
bhyt_dir = st.sidebar.text_input("BHYT image folder", "bhyt")

st.sidebar.header("Google Drive input")
drive_employee_folder_id = st.sidebar.text_input("Drive employee_info folder ID")
drive_bhyt_folder_id = st.sidebar.text_input("Drive BHYT folder ID")
drive_recursive = st.sidebar.checkbox("Download nested folders")
drive_overwrite = st.sidebar.checkbox("Overwrite local downloaded files")

st.sidebar.header("Google Sheet output")
sheet_id = st.sidebar.text_input("Google Sheet ID")
sheet_name = st.sidebar.text_input("Worksheet name", SHEET_NAME)
credentials = st.sidebar.text_input("Credentials file", "google_service.json")
write_mode = st.sidebar.selectbox("Write mode", ["replace", "append"])

st.sidebar.header("Extraction")
bhyt_mode = st.sidebar.selectbox("BHYT mode", ["auto", "demo", "ocr"])

if st.button("Chay pipeline"):
    config = PipelineConfig(
        employee_dir=Path(employee_dir),
        bhyt_dir=Path(bhyt_dir),
        bhyt_mode=bhyt_mode,
    )
    try:
        if drive_employee_folder_id or drive_bhyt_folder_id:
            with st.spinner("Dang tai file tu Google Drive..."):
                drive_results = download_drive_inputs(
                    credentials_file=credentials,
                    employee_folder_id=drive_employee_folder_id or None,
                    bhyt_folder_id=drive_bhyt_folder_id or None,
                    employee_dir=employee_dir,
                    bhyt_dir=bhyt_dir,
                    recursive=drive_recursive,
                    overwrite=drive_overwrite,
                )

            if drive_results:
                st.subheader("Ket qua tai Google Drive")
                cols = st.columns(len(drive_results))
                for col, (source_name, result) in zip(cols, drive_results.items()):
                    with col:
                        st.metric(f"{source_name} scanned", result.scanned)
                        st.metric(f"{source_name} downloaded", result.downloaded)
                        st.metric(f"{source_name} skipped", result.skipped)

        df = run_pipeline(config)
        st.success(f"Da trich xuat {len(df)} dong du lieu.")
        st.dataframe(df, use_container_width=True)

        if sheet_id:
            upload_to_google_sheet(
                df=df,
                sheet_id=sheet_id,
                worksheet_name=sheet_name,
                credentials_file=credentials,
                mode=write_mode,
            )
            st.success("Da cap nhat Google Sheet.")
    except Exception as exc:
        st.error(str(exc))