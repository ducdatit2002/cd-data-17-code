employee = {
    "name": ["An", "Ánh", "Bình", "Bảo", "Bích", "Chi"],
    "department": ["IT", "HR", "IT", "Finance", "HR", "Finance"],
    "salary": [2000, 1000, 2200, 200, 1200, 2000]
}
print(employee["name"][0])
print(employee["department"][0])
print(employee["salary"][0])

# In tất cả nhân viên 
number_of_employees = len(
    employee["name"]
)
for i in range(number_of_employees):
    print("Tên:", employee["name"][i])

    print("Phòng ban:", employee["department"][i])

    print("Lương:", employee["salary"][i])

    print("----------------------")

# Tính tổng lương của từng phòng ban
# Kết quả mong muốn: { "IT":4200, "HR": 2200, "Finance": 2200}

# Tư duy: 
# Key -> tên phòng ban
# Value -> tổng lương phòng ban đó

# Tạo dictionary rỗng để lưu
salary_by_department = {}
# Duyệt từng nhân viên 
for i in range(len(employee["name"])):
    department = employee["department"][i]
    salary = employee["salary"][i]

    # Kiểm tra phòng ban đã tồn tại? 
    if department in salary_by_department:
        salary_by_department[department] += salary
    else:
        salary_by_department[department] = salary

print(salary_by_department)