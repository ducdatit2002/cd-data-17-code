import streamlit as st

# Nhóm 1: Thành phần dùng để hiển thị
st.title("Hello Streamlit")
st.header("Nhập thông tin người dùng")
# st.write()
# st.success()
# st.error() 

# Nhóm 2: Widget dùng để nhận input -> widget trả về một giá trị 
name = st.text_input("Nhập họ và tên")
age = st.slider("Nhập tuổi của bạn", min_value=0, max_value=100, value=20 )
birth_date = st.date_input("Ngày sinh")
phone = st.text_input("Số điện thoại")
is_student = st.checkbox("Là học sinh?")
language = st.selectbox(
    "Chọn ngôn ngữ",
    ["Tiếng Việt", "Tiếng Hàn", "Tiếng Trung"]
)
sport = st.multiselect(
    "Chọn các môn thể thao",
    ["Đá banh", "Bóng bàn", "Bóng bầu dục"]
)
st.write(name)
st.write(age)
st.write(birth_date)


# st.date_input()
# st.checkbox()
# st.selectbox()
# st.multiselect()