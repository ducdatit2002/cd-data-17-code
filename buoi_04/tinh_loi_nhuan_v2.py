# Đề bài: Tính lợi nhuận rồi gửi email cho sếp

# Bước 1: Tính lợi nhuận
def tinh_loi_nhuan(doanh_thu, chi_phi):
    loi_nhuan = doanh_thu - chi_phi
    return loi_nhuan

   
# Bước 2: Gửi lợi nhuận cho sếp 
def gui_email(email, loi_nhuan):
    print("Gửi đến:", email)
    print("Lợi nhuận:", loi_nhuan)

loi_nhuan = tinh_loi_nhuan(5000000, 4500000)
gui_email("boss@cybersoft.edu.vn", loi_nhuan)

# Tư duy:
# 10 triệu doanh thu + 7 triệu chi phí -> tinh_loi_nhuan() -> 3 triệu
# gui_email -> sếp nhận báo cáo

# Pipeline xử lý dữ liệu: Đọc file -> Làm sạch dữ liệu -> Phân tích -> Tạo báo cáo -> Gửi email 
# def doc_file():
# def lam_sach_du_lieu():
# def phan_tich():
# def tao_bao_cao():
# def gui_email():
