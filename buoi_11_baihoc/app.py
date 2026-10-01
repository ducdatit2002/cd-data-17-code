# Nhập họ tên, Ngày sinh, Email, Số điện thoại, Là học sinh 

import streamlit as st

with st.form(key="user_form"):
    name = st.text_input("Họ và tên")
    birth_date = st.date_input("Ngày sinh")
    phone = st.text_input("Số điện thoại")
    email = st.text_input("Email")
    is_student = st.checkbox("Là học sinh?")

    submit_button = st.form_submit_button("Thêm thông tin")