# Sale > 100 triệu
#     tăng 10% lương

# 10 triệu <= Sale < 80 triệu
#     giảm 10% lương

# Các trường hợp khác
#     xử lý theo chính sách còn lại

# Input:
salary = 15_000_000
bonus = 0.1

sale = float(input("Nhập vào doanh thu thực tế: "))
if sale < 0:
    print("Dữ liệu không hợp lệ")

if sale >= 100_000_000: 
    salary = salary + salary*0.1
elif sale < 80_000_000 and sale >= 10_000_000:
    salary = salary - salary*0.1
else: # Else: những cái ngoài điều kiện
    print("Trường hợp khác")

print("Lương thực nhận: ", salary)

