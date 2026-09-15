# for i in range(10):
#     print(i)
# i là biến thay đổi theo từng vòng
# range(start, stop, step)
# Bắt đầu bằng 2, dừng 10, bước 2 
# for i in range(2,10,2):
#     print(i)

# ds_skills = ["SQL", "Power BI", "Python", "Excel"]
# # Với mỗi skill nằm trong ds_skills, hãy in skill đó ra 
# for skill in ds_skills:
#     print(skill)

# For kết hợp với IF
# scores = [3, 2, 8, 9, 10]
# Muốn in những điểm lớn hơn hoặc bằng 5 
# for score in scores:
#     if score >= 5:
#         print(score)
# Quy trình: Duyệt -> Kiểm tra -> Xử lý 


# Break: dừng vòng lặp hiện tại ngay lập tức
for i in range(10):
    if i == 5:
        break
    print(i)

