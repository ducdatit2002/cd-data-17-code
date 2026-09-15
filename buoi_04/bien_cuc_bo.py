
def tinh_loi_nhuan(doanh_thu, chi_phi):
    loi_nhuan = doanh_thu - chi_phi
    message = "Lợi luận đã được tính"
    return loi_nhuan, message

# Biến cục bộ
# loi_nhuan và message được tạo bên trong hàm -> biến cục bộ (local variable)
# def demo():
#     message = "Hello"
#     # print(message) # biến cục bộ 
# print(message)

# Biến toàn cục (global variable): đọc giá trị ở nhiều nơi trong chương trình
# message = "Hello"
# def demo():
#     print(message)

# demo()
# print(message)

# Tại sao Python khai báo hàng nhưng chưa chạy 
def hello():
    print("Hello xin chào")

print("A")
hello()

# Luồng thực hiện:
# Python gặp def hello():
# -> ghi nhận rằng chương trình có hàm hello
# -> chưa chạy print("Hello")
# Python chạy print("A")
# Sau đó gặp hello() -> lúc này mới chạy phần bên trong hàm


# Hàm không có return
def thong_bao():
    print("Xử lý hoàn tất")
thong_bao()

def gui_email(email):
    print("Đã gửi email", email)
gui_email("abc@gmail.com")

print("Hello World") # -> print cũng là một hàm 
input()

name = input("Nhập họ và tên:")
# Tên hàm: input
# Tham số: "Nhập tên: "

# Nhập tên -> input() -> người dùng nhập "Đạt" -> return "Đạt" -> name

# Hàm len()
name = ["An", "Bình", "Chi", "Dũng"]
len(name)