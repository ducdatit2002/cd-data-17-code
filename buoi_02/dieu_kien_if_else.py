# Cú pháp:
# if dieu_kien1:
#     code1
# elif dieu_kien2:
#     code2
# else:
#     code3

# Input: sale thực tế 
salary = 15000000
bonus = 0.1
kpi = 100000000
sale = float(input("Nhập vào doanh thu thực tế: "))

# Process
if sale > kpi: 
    salary = salary + salary*bonus
    print("Thưởng")
elif sale < 80000000 and sale >= 10000000: # Nếu điều kiện trước không đúng thì xét điều kiện tiếp theo
    salary = salary - salary*bonus
    print("Phạt)")
else: # Không cần viết điều kiện
    print("GIữ nguyên")

# Output: lương thực nhận 
print("Lương thực nhận:" ,salary)
