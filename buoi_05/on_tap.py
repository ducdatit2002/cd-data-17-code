numbers = [1,2,3,4,5]
name = ["An", "Bình","Bích", "Chi", "Dũng"]
ds_skills = ["SQL", "Python", "Excel", "Power BI", "MongoDB"]

# Thao tác: Đọc, Cập nhật, Thêm, Xóa 

# Lấy "Python"
print(ds_skills[1])
# Cập nhật Python thành "DAX"
ds_skills[1] = "DAX"
print(ds_skills)
# Thêm phần tử và List
ds_skills.append("DAX")
ds_skills.insert(0, "JavaScript")
print(ds_skills)
# Xóa phần tử 
ds_skills.remove("DAX")
print(ds_skills)