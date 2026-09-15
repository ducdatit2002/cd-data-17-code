def my_print(message):
    print(message)

# my_print("Hello")
# my_print() # sẽ bị lỗi -> vì message là tham số bắt buộc

def my_project(message = "Hello world"): # có tham số mực định 
    print(message)

# my_project("Xin chào")
# my_project()

def create_User(
        name = "unknown"
):
    print(name)

create_User("An")
create_User()

class Employee: # Tên class: Employee
    def __init__(
        self, # self đại diện cho đối tượng đang được tạo 
        name=None,
        department=None,
        salary=None
    ):
        self.name = name 
        # self.name là nơi lưu dữ liệu của đối tượng
        # name: dữ liệu được truyền vào
        self.department = department
        self.salary = salary

employee_dat = Employee(
    "Đạt",
    "IT",
    2000
)

employee_anh = Employee(
    "Ánh",
)

print(employee_anh.salary)


# Trong thực tế:
# JSON: thường được biểu diễn tự nhiên bằng dictionary, list
# CSV: có thể đưa vào DataFrame
# Database: xử lý bằng ORM, SQL, Dataframe
# Text, ảnh, audio là phi cấu trúc 

data = ["An", 20, True, 10.5]