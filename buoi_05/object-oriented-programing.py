# Object Oriented Progamming (Thuộc tính - Phương thức)

# Học sinh: 
# -> Thông tin: Tên, Lớp, Mã học sinh, Trường -> Attributes (Thuộc tính)
# Thuộc tính là những thông tin dùng để mô tả hoặc xác định một đối tượng 
# -> Hành động: Học, Ăn, Ngủ, Chơi -> Methods (Phương thức)
# Phương thức là hành động hoặc công việc mà đối tượng có thể thực hiện 

# Lập trình viên:
# -> Thuộc tính: mã nhân viên, họ tên, giới tính, lương
# -> Phương thức: code, test, deploy, fix bug, review code 

# HR:
# -> Thuộc tính: Tên, công ty, phòng ban, lương
# -> Phương thức: Tuyển dụng, training, quản lý hồ sơ 

# -> Thông tin: attribute
# -> Hành động: method

# Thuộc tính (Attributes): là những thông tin dùng để mô tả hoặc xác định một đối tượng
# Phương thức (Methods): là hành động hoặc công việc mà đối tượng có thể thực hiện

# Class: mẫu
class Employee: # Tên class: Employee
    def __init__(
        self, # self đại diện cho đối tượng đang được tạo 
        name,
        department,
        salary
    ):
        self.name = name 
        # self.name là nơi lưu dữ liệu của đối tượng
        # name: dữ liệu được truyền vào
        self.department = department
        self.salary = salary

# Tạo nhân viên Đạt
employee_dat = Employee(
    "Đạt",
    "IT",
    2000
)

employee_anh = Employee(
    "Ánh",
    "HR",
    1000
)

employee_binh = Employee(
    "Bình",
    "IT", 
    2200
)

employee_bao = Employee(
    "Bảo",
    "Finance",
    200
)

# Truy cập vào thuộc tính
# employee["name"] -> dùng cho dictionary 
print(employee_dat.name)

# Form nhân sự:
# Tên: ............
# Phòng ban:.......
# Lương:...........

# Ví dụ: 
# Object: hồ sơ của một nhân viên 
# Class: mẫu hồ sơ nhân viên 

# Dictionary

employee_dictionary = {
    "name": "An",
    "department": "IT",
    "salary": 2000
}

print(employee_dictionary["name"])

print(employee_binh.name)

class CEO:
    def __init__(
        self,
        name,
        department,
        salary,
        employees
    ):
        self.name = name
        self.department = department
        self.salary = salary
        self.employees = employees
    # Method in ra thông tin nhân viên 
    def print_employees(self):
        for employee in self.employees:
            print("Tên:", employee.name)
            print("Phòng ban:", employee.department)
            print("Lương:", employee.salary)
            print("-------------------")

    # Method tính tổng lương theo phòng ban
    def salary_by_department(self):
        result = {}

        for employee in self.employees:
            department = employee.department
            salary = employee.salary

            if department in result:
                result[department] += salary

            else: 
                result[department] = salary
        return result
employees = [
    employee_binh,
    employee_dat,
    employee_anh,
    employee_bao
]
ceo = CEO(
    "Sếp",
    "Management",
    10000,
    employees
)
ceo.print_employees()

result = ceo.salary_by_department()
print(result)