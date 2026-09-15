# Tìm vị trí của tên "Bình"

# Input: Danh sách, Tên cần tìm
# Output: vị trí của tên "Bình"
# Process:
# 1. Duyệt danh sách 
# 2. So sánh từng tên với tên cần tìm
# 3. Tìm được thì trả về kết quả 

# Bước 1: Duyệt danh sách

# for i, ten in enumerate(danh_sach):
#     print(i,ten)

# Viết hàm tìm kiếm 
def tim_ten(danh_sach, ten_can_tim):
    if ten_can_tim not in danh_sach:
        return "Không tồn tại"

    for i, ten in enumerate(danh_sach):
        if ten == ten_can_tim:
            return i

danh_sach = ["An", "Bình", "Chi", "Dũng", "Lan"]
ket_qua = tim_ten(danh_sach, "Minh")
print(ket_qua)


# if "An" in danh_sach: -> Nếu An nằm trong danh sách
# if "Bình" not in danh_sach: -> Nếu AN không nằm trong danh sách


