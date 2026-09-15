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