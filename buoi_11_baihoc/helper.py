import re
def format_name(name: str) -> str:
    # Chuẩn hóa họ tên: bỏ khoảng trắng thừa, viết hoa đầu mỗi từ
    return " ".join(name.strip().split()).title()

def validate_email(email:str) -> bool: # abc.gmai.com 
    # Kiểm tra email xem đúng hay sai
    email = email.strip()
    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    return re.fullmatch(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    # Số điện thoại gồm đúng 10 chữ số
    phone = phone.strip()
    return phone.isdigit() and len(phone) == 10

def validate_all(name: str, email: str, phone: str) -> list[str]:
    # Trả về danh sách lỗi. Danh sách rỗng nghĩa là dữ liệu hợp lệ
    errors: list[str] = []
    if not name.strip():
        errors.append("Họ và tên không được để trống")
    if not validate_email(email):
        errors.append("Email không đúng định dạng")
    if not validate_phone(phone):
        errors.append("Số điện thoại phải gồm đúng 10 chữ số")
    return errors
