import streamlit as st

st.title("Hello Streamlit")
st.header("Demo method và widget")

st.subheader("1. text_input")
name = st.text_input("Nhập tên")
st.write("Giá trị trả về:", name)

st.subheader("2. number_input")
age_number = st.number_input("Nhập tuổi", min_value=0, max_value=120, value=20)
st.write("Tuổi từ number_input:", age_number)

st.subheader("3. slider")
age_slider = st.slider("Chọn tuổi", min_value=0, max_value=100, value=20)
st.write("Tuổi từ slider:", age_slider)

st.subheader("4. checkbox")
is_student = st.checkbox("Là học sinh?")
st.write("Kiểu Boolean:", is_student)

st.subheader("5. selectbox")
language = st.selectbox("Chọn ngôn ngữ", ["Tiếng Việt", "Tiếng Anh", "Tiếng Pháp"])
st.write("Một lựa chọn, trả về chuỗi:", language)

st.subheader("6. multiselect")
languages = st.multiselect(
    "Chọn nhiều ngôn ngữ",
    ["Tiếng Việt", "Tiếng Anh", "Tiếng Pháp"],
)
st.write("Nhiều lựa chọn, trả về list:", languages)
