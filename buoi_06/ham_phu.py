import re

def validate_email(email):
    email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if re.match(email_pattern, email):
        return True
    else:
        return False

def validate_phone(phone):
    # Kiểm tra chỉ chứa số
    if not phone.isdigit():
        return False
    # Kiểm tra độ dài từ 10 đến 11 số
    if len(phone) < 10 or len(phone) > 11:
        return False

    return True