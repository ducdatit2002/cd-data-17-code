import openpyxl 

excel_file = "user_information.xlsx"

# 3 bước tạo file excel: Tạo Workbook, Lấy Worksheet, Đặt tên Worksheet
workbook = openpyxl.Workbook()
worksheet = workbook.active
worksheet.title = "Thông tin người dùng"

# Lưu 5 thông tin của nhân viên: Họ tên, Ngày sinh, Email, SĐT, Công việc 
headers = [
    "Họ và tên",
    "Ngày sinh",
    "Email",
    "Số điện thoại",
    "Công việc"
]
worksheet.append(headers)

# Nhập 5 trường thông tin
ho_ten = input("Nhập họ tên: ")
ngay_sinh = input("Nhập ngày sinh: ")
email = input("Nhập Email: ")
so_dien_thoai = input("Nhập số điện thoại: ")
cong_viec = input("Nhập công việc:")

# Dữ liệu người dùng
user_data = [
    ho_ten,
    ngay_sinh,
    email,
    so_dien_thoai,
    cong_viec
]
worksheet.append(user_data)
workbook.save(excel_file)