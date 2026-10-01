# Project Streamlit nhập liệu người dùng

Project được dựng lại từ transcript buổi học.

## Cấu trúc

- `demo.py`: các method/widget cơ bản.
- `app.py`: project chính bám sát flow cuối buổi.
- `app_extended.py`: bản mở rộng có bảng, biểu đồ và tải Excel theo demo đầu buổi.
- `helper.py`: chuẩn hóa tên và validate email/số điện thoại.
- `data/`: nơi phát sinh file `user_information.xlsx`.
- `requirements.txt`: thư viện cần cài.

## Cài đặt

### Windows

```bash
python -m pip install -r requirements.txt
python -m streamlit hello
python -m streamlit run demo.py
python -m streamlit run app.py
```

Nếu lệnh `streamlit` đã nằm trong PATH, có thể dùng:

```bash
streamlit hello
streamlit run app.py
```

### macOS / Linux

```bash
python3 -m pip install -r requirements.txt
python3 -m streamlit hello
python3 -m streamlit run app.py
```

## Luồng chương trình

1. User nhập họ tên, ngày sinh, email, số điện thoại, trạng thái học sinh.
2. User bấm `Thêm thông tin`.
3. `helper.validate_all()` trả danh sách lỗi.
4. Nếu có lỗi, app hiển thị từng lỗi.
5. Nếu hợp lệ, chuẩn hóa tên và tạo `user_info`.
6. Đọc dữ liệu Excel cũ. Nếu chưa có file thì tạo DataFrame rỗng.
7. Dùng `pd.concat(..., ignore_index=True)` để ghép dòng mới.
8. Ghi lại sheet `Thông tin người dùng` bằng `openpyxl`.

## Lưu ý quan trọng

- Số điện thoại được lưu dưới dạng chuỗi, không phải số, để giữ số `0` đầu.
- Tên key trong `user_info` phải khớp với tên cột DataFrame.
- `st.form` cần có `st.form_submit_button` để tạo trigger submit.
- Flow validate số điện thoại trong project này dùng đúng 10 chữ số, bám phần test cuối transcript.
