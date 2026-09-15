score = float(input("Nhập điểm trung bình: "))

if score > 10:
    print("Điểm không hợp lệ")
elif score < 0:
    print("Điểm không hợp lệ")
elif score >= 9:
    print("Xuất sắc")
elif score >= 8:
    print("Giỏi")
elif score >= 6.5:
    print("Khá")
elif score >= 5:
    print("Trung bình")
else:
    print("Yếu")