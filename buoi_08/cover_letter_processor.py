# Xây dựng chuyên gia xử lý hồ sơ tên CoverLetterProcessor
# Nhiệm vụ: Đọc file word, Trích xuất dữ liệu, Làm việc với Excel, Lưu kết quả 

import os # làm việc file, foler, đường dẫn
import re # xử lý regular expression 

from openpyxl import Workbook, load_workbook # Dùng để đọc và ghi excel 
from docx import Document # Xử lý file word

class CoverLetterProcessor:
    def __init__(self, folder_path, excel_file):
        self.folder_path = folder_path
        self.excel_file = excel_file

        self.wb = None
        self.ws = None

        self.headers = [
            "Họ và tên",
            "Giới tính",
            "Ngày sinh",
            "Nơi sinh",
            "Nguyên quán",
            "Hộ khẩu thường trú",
            "Chỗ ở hiện nay",
            "Điện thoại"
        ]
    # Phương thức 1: Khởi tạo, mở excel -> initialize_excel()
    def initialize_excel(self):
        if os.path.exists(self.excel_file):
            self.wb = load_workbook(self.excel_file)
            self.ws = self.wb.active
        else:
            self.wb = Workbook()
            self.ws = self.wb.active

            self.ws.title = "Thông tin người dùng"
            self.ws.append(self.headers)

    # Phương thức 2: Read Docx
    def read_docx(self, file_path):
        doc = Document(file_path)

        doc_content = [
            paragraph.text
            for paragraph in doc.paragraphs
        ]

        doc_full = "\n".join(doc_content)
        return doc_full
