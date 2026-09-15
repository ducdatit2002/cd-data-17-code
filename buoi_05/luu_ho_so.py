# Tên: Phạm Đức Đạt
# Phòng ban: AI R&D
# Lương: 2000$

# employee = ["Phạm Đức Đạt", "AI R&D", 2000]

# employee[1]
# employee[2]

# "Phạm Đức Đạt" là gì? là tên
# AI R&D là công việc hay là gì?
# 2000 là lương hay là năm sinh

# Dictionary: lưu dữ liệu theo cặp Key -> Value 
# (Trường thông tin ->Thông tin )

# name -> Phạm Đức Đạt
# role: AI R&D
# salary: 2000
employees = {
    "name": "Phạm Đức Đạt",
    "role": "AI R&D",
    "salary":2000
}

employee = ["Phạm Đức Đạt", "AI R&D", 2000]

# Muốn lấy "Đạt":
print(employee[0]) # -> Truy cập bằng vị trí 
print(employees["name"]) # Truy cập bằng key 
print(employees["salary"])

# Chuyển từ phòng AI R&D sang phòng AIOT
employees["role"] = "AIOT" # -> Update(Key Đã tồn tại -> Cập nhật value)
# Thêm trường thông tin mới department = AI Department
employees["department"] = "AI Department" # -> ADD (Key chưa tồn tại -> Tạo key mới)

employees["salary"] = 350
# Thêm email là cybersoft@gmail.com 
employees["email"] = "cybersoft@gmail.com"


employees.pop("department") # Xóa trường thông tin 
# -> pop của list: xóa vị trí
# -> pop của dictionary -> key 

employees.pop("phone")
print(employees)