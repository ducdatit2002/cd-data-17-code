# Tạo một dictionary sản phẩm gồm Mã sản phẩm, Tên, Giá, Số lượng
# Sau đó in ra tên, đổi giá, thêm category, xóa số lượng 

san_pham = {
    "ma_san_pham": "SP001",
    "ten": "Laptop Cybersoft",
    "gia": 15000000,
    "so_luong": 10
}
# 1. In ra dictionary ban đầu
print("Sản phẩm ban đầu: ", san_pham)
# 2. Đổi giá
san_pham["gia"] = 140000000
print("Sau khi đổi giá:", san_pham)
# 3. Thêm category 
san_pham["category"] = "Điện tử"
print("Sau khi thêm category:", san_pham)
# Xóa số lượng
del san_pham["so_luong"]
print("Sau khi xóa số lượng", san_pham)