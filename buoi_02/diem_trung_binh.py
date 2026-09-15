# Viết chương trình tính điểm trung bình ba môn toán văn anh và đưa ra xếp loại học sinh
# Ví dụ: Lớn hơn bằng 8 -> Giỏi; Lớn hơn 5: Khá; Nhỏ hơn 5: Trung bình

# Input 
toan = float(input("Nhập điểm toán: "))
van = float(input("Nhập điểm văn: "))
anh = float(input("Nhập điểm anh: "))

# Process
diem_tb = (toan + van + anh)/3
print("Điểm trung bình", round(diem_tb, 2))
# Hàm round: làm tròn
# if: Nếu điều kiện này đúng thì làm việc này
# elif: Nếu điều kiện trước không đúng thì xét tiếp điều kiện này
# else: không cần viết điều kiện 

if diem_tb >= 8:
    print("Xếp loại: Giỏi")
elif diem_tb >= 6 and diem_tb < 8 :
    print("Xếp loại: Khá")
else: 
    print("Xếp loại: Trung bình")

# and: trường hơp tất cả phải đúng -> khá khó tính, muốn tất cả phải đúng
# or: hoặc (1 trong 2 cái phải đúng)


# if username_wrong or password_wrong:
#     print("Đăng nhập thất bại")