"""Bản mở rộng từ demo đầu buổi: có bảng, biểu đồ và nút tải Excel.

Phần bảng/biểu đồ/tải file được thêm để khớp với phần demo đầu transcript;
transcript không ghi đầy đủ từng dòng code cho phần mở rộng này.
"""
from datetime import date
from io import BytesIO
from pathlib import Path

import pandas as pd
import streamlit as st

import helper

FILE_NAME = Path("data/user_information.xlsx")
SHEET_NAME = "Thông tin người dùng"
COLUMNS = ["Họ và tên", "Ngày sinh", "Email", "SDT", "Là học sinh"]


def load_excel(file_path: Path) -> pd.DataFrame:
    try:
        return pd.read_excel(file_path, sheet_name=SHEET_NAME, dtype={"SDT": str})
    except (FileNotFoundError, ValueError):
        return pd.DataFrame(columns=COLUMNS)


def save_excel(data: pd.DataFrame, file_path: Path) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    if file_path.exists():
        with pd.ExcelWriter(file_path, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
            data.to_excel(writer, sheet_name=SHEET_NAME, index=False)
    else:
        with pd.ExcelWriter(file_path, engine="openpyxl", mode="w") as writer:
            data.to_excel(writer, sheet_name=SHEET_NAME, index=False)


def dataframe_to_excel_bytes(data: pd.DataFrame) -> bytes:
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        data.to_excel(writer, sheet_name=SHEET_NAME, index=False)
    return output.getvalue()


st.set_page_config(page_title="Nhập liệu người dùng", page_icon="📝", layout="wide")
st.title("📝 Phần mềm nhập liệu người dùng")

with st.form(key="user_form"):
    left, right = st.columns(2)
    with left:
        name = st.text_input("Nhập họ và tên")
        birthdate = st.date_input("Nhập ngày sinh", min_value=date(1900, 1, 1), max_value=date.today())
        email = st.text_input("Nhập email")
    with right:
        phone = st.text_input("Nhập số điện thoại")
        is_student = st.checkbox("Là học sinh?")

    submit_button = st.form_submit_button("Thêm thông tin")

if submit_button:
    errors = helper.validate_all(name, email, phone)
    if errors:
        st.error("Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.")
        for error in errors:
            st.write(f"- {error}")
    else:
        user_info = {
            "Họ và tên": helper.format_name(name),
            "Ngày sinh": birthdate,
            "Email": email.strip(),
            "SDT": phone.strip(),
            "Là học sinh": is_student,
        }
        data = load_excel(FILE_NAME)
        new_data = pd.concat([data, pd.DataFrame([user_info])], ignore_index=True)
        save_excel(new_data, FILE_NAME)
        st.success("Lưu thông tin thành công.")


data = load_excel(FILE_NAME)
if not data.empty:
    st.subheader("Dữ liệu đã nhập")
    st.dataframe(data, use_container_width=True)

    st.subheader("Thống kê học sinh")
    chart_data = (
        data["Là học sinh"]
        .fillna(False)
        .map({True: "Học sinh", False: "Không phải học sinh"})
        .value_counts()
        .rename_axis("Nhóm")
        .to_frame("Số lượng")
    )
    st.bar_chart(chart_data)

    st.download_button(
        "Tải file Excel",
        data=dataframe_to_excel_bytes(data),
        file_name="user_information.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
