# name = input("Nhập họ và tên:")
# print(name)

# ho_ten = "Duc Dat"
# tuoi = 25
# salary = 10000000
# print(ho_ten)

names = ["An", "Bình", "Chi"]
# Biến: Lưu dữ liệu
# Hàm: Lưu một quy trình xử lý 

def chao():
    print("Xin chào")

chao()

# Quy trình xử lý đơn hàng: Giá gốc -> Tính giảm giá -> Thuế -> Giá cuối cùng
# Tác dụng của hàm: code ngắn hơn, dễ sửa hơn, dễ quản lý hơn, ít sai hơn 

# Chương trình: Đọc dữ liệu -> Làm sách dữ liệu -> Phân tích -> Báo cáo -> Gửi email 

def doc_du_lieu():
    print("đọc dữ liệu")

def lam_sach_du_lieu():
    print("làm sạch dữ liệu")

def phan_tich_du_lieu():
    print("phân tích dữ liệu")

def tao_bao_cao():
    print("Tạo báo cáo")

def gui_email():
    print("Gửi email")

doc_du_lieu()
lam_sach_du_lieu()
phan_tich_du_lieu()
tao_bao_cao()
gui_email()