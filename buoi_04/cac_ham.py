# 1. Hàm print()
# print("Hello World") # -> print cũng là một hàm 

# 2. Hàm input()
# input()
# name = input("Nhập họ và tên:")
# Tên hàm: input
# Tham số: "Nhập tên: "
# Nhập tên -> input() -> người dùng nhập "Đạt" -> return "Đạt" -> name

# 3. Hàm len()
name = ["An", "Bình", "Chi", "Dũng"]
print(len(name))

print(len("Hello World"))

# Hàm có sẵn: hàm đã xây dựng bởi Python
# -> print(), input(), len(), int(), float(), abs() 

# Hàm tự viết: cho các công việc đăng thù 
def tinh_hoa_hong():
    print("Tính hoa hồng")