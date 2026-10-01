from datetime import date
from pathlib import Path

import pandas as pd
import streamlit as st

import helper

FILE_NAME = Path("data/user_information.xlsx")
SHEET_NAME = "Thông tin người dùng"
COLUMNS = ["Họ và tên", "Ngày sinh", "Email", "SDT", "Là học sinh"]


def load_excel(file_path: Path) -> pd.DataFrame:
    """Đọc file Excel; nếu chưa có file thì tạo DataFrame rỗng đúng schema."""
    try:
        return pd.read_excel(file_path, sheet_name=SHEET_NAME, dtype={"SDT": str})
    except (FileNotFoundError, ValueError):
        return pd.DataFrame(columns=COLUMNS)


def save_excel(data: pd.DataFrame, file_path: Path) -> None:
    """Ghi dữ liệu theo đúng ý tưởng a=append file có sẵn, w=write file mới."""
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if file_path.exists():
        with pd.ExcelWriter(
            file_path,
            engine="openpyxl",
            mode="a",
            if_sheet_exists="replace",
        ) as writer:
            data.to_excel(writer, sheet_name=SHEET_NAME, index=False)
    else:
        with pd.ExcelWriter(file_path, engine="openpyxl", mode="w") as writer:
            data.to_excel(writer, sheet_name=SHEET_NAME, index=False)


st.set_page_config(page_title="Nhập liệu người dùng", page_icon="📝", layout="centered")
st.title("📝 Phần mềm nhập liệu người dùng")
st.caption("Streamlit + pandas + Excel")

with st.form(key="user_form"):
    name = st.text_input("Nhập họ và tên")
    birthdate = st.date_input(
        "Nhập ngày sinh",
        min_value=date(1900, 1, 1),
        max_value=date.today(),
    )
    email = st.text_input("Nhập email")
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
        new_info = pd.DataFrame([user_info])
        new_data = pd.concat([data, new_info], ignore_index=True)
        # Excel trả về Timestamp, còn st.date_input trả về datetime.date.
        # Chuẩn hóa cả cột để Arrow không gặp kiểu dữ liệu hỗn hợp.
        new_data["Ngày sinh"] = pd.to_datetime(new_data["Ngày sinh"])
        save_excel(new_data, FILE_NAME)

        st.success("Lưu thông tin thành công.")
        st.dataframe(new_data, use_container_width=True)
