
# Yêu cầu: Trả về tất cả tên bắt đầu bằng chữ B 
# Ví dụ: ["Bảo", "Bình", "An"]

# Tìm kiếm: TÌm thấy -> có thể trả về ngay
# Lọc:
# 1. Tìm thấy -> Lưu lại
# 2. Tiếp tục tìm
# 3. Tìm hết danh sách
# 4. Trả về toàn bộ kết quả tìm được

danh_sach = [
    "An",
    "Anh",
    "Bảo",
    "Bình", 
    "Bích"
]

def loc_ten(danh_sach, ky_tu_bat_dau):
    ten_loc_duoc = [] # Lưu trữ 
    for ten in danh_sach:
        # if ten[0] == ky_tu_bat_dau:  # Nếu vị trí 0 của tên bằng ký tự bắt đầu
        # Dùng startswich()
        if ten.startswith(ky_tu_bat_dau):
        # "Bình".startswith("B") -> True
            ten_loc_duoc.append(ten) # Thêm vào lưu trữ
    return ten_loc_duoc

ket_qua = loc_ten(danh_sach, "B")
print(ket_qua)

# Lọc dữ liệu: Duyệt từng dữ liệu -> Kiểm tra điều kiện -> Đúng: Lưu vào kết quả 
# (Sai: Tiếp tục cho đến hết)


# Sếp cần lấy danh sách khách hàng phát sinh toàn bộ giao diện trong quý này, ở TPHCM, tổng doanh thu lớn hơn 50 triệu và chưa được nhân viên chăm sóc trong 30 ngày gần đây 
# Tách ra:
# Lấy danh sách khách hàng 
# -> ở TP.HCM 
# -> doanh thu > 50 triệu 
# -> 30 ngày chưa chăm sóc 

# -> Phân rã bài toán 