# Giả sử Lương cơ bản: 15 triệu
# Bonus: 10%
# KPI: 100 triệu

# Doanh thu thực tế của người dùng do người dùng nhập vào 
# Quy tắc: 
# Nếu sale > KPI -> Cộng thêm 10% lương
# Nhưng sale < 80 triệu -> Trừ 10% lương
# Ngược lại giữ nguyên 

# Input: sale thực tế 
salary = 15000000
bonus = 0.1
kpi = 100000000
sale = float(input("Nhập vào doanh thu thực tế: "))

# Process: 
# Nếu Sale > KPI: 
#   Lương = lương + 10%
# Nếu không:
#   Lương giữ nguyên 
if sale > kpi:
    salary = salary + (salary * bonus)

if sale < 80000000:
    salary = salary - (salary * bonus)
# Output: lương thực nhận 
print("Lương thực nhận:" ,salary)

