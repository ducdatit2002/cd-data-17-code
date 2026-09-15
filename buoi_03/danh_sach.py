ds_skills = ["SQL", "Power BI", "Python", "Excel"]
# Python dùng index bắt đầu từ 0 
# SQL --> index 0
# Power BI --> index 1
# Python --> index 2
# Excel --> index 3
print(ds_skills)
# Lấy một phần tử: ten_list[index]
print(ds_skills[2])

# Các thao tác thường xử: Thêm, Xóa, Sửa, Đọc

# Append: dùng để thêm phần tử vào cuối List
# Thêm "DAX"
# Cú pháp: ten_list.append(phan_tu) 
ds_skills.append("DAX")
print(ds_skills)

# Insert: chèn vào một vị trí xác định
# Thêm "Data Modeling" vào vị trí 2
# Cú pháp: ten_list.insert(2, "Data Modeling")
ds_skills.insert(2, "Data Modeling")
print(ds_skills)

# Cập nhật phần tử
# Thay chữ Power BI thành Power Query 
# -> Muốn sửa phần tử -> thì phải truy cập được phần tử 
# Cú pháp: ten_list[index] = gia_tri_moi 
ds_skills[1] = "Power Query"
print(ds_skills)

# Remove: Xóa phần tử -> Nhận vào giá trị cần xóa 
# Nếu có nhiều phần tử trùng nhau, sẽ xóa phần tử khớp đầu tiên mà nó tìm thấy 
# Xóa chữ "SQL"
# Cú pháp: ten_list.remove("")
ds_skills.remove("SQL")
print(ds_skills)

# Xóa theo vị trí index với pop()
# pop() 
ds_skills.pop(1)
print(ds_skills)

menu = ["Cua", "Tôm", "Cá", "Cơm"]

# Xóa "Cua" -> remove 
# Xóa món ở index 2 -> pop