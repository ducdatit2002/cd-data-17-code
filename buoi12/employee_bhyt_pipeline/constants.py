"""Shared constants for the stage 1 pipeline."""

SHEET_NAME = "DU LIEU DA NHAP"

SHEET_COLUMNS = [
    "Ma_nhan_vien",
    "Ho_ten",
    "Gioi_tinh",
    "Ngay_sinh",
    "CCCD",
    "Ma_so_BHXH",
    "Ma_the_BHYT",
    "Noi_DK_KCB",
    "Gia_tri_BHYT_tu",
    "Gia_tri_BHYT_den",
    "Dia_chi_thuong_tru",
    "Dien_thoai",
    "Email",
    "Phong_ban",
    "Chuc_vu",
    "Ngay_vao_lam",
    "Loai_HDLD",
    "Luong_dong_BHXH",
    "Nguon_BHYT_file",
    "Nguon_PDF_file",
    "Trang_thai_doi_soat",
]

EMPLOYEE_LABEL_TO_COLUMN = {
    "Mã nhân viên": "Ma_nhan_vien",
    "Họ và tên": "Ho_ten",
    "Giới tính": "Gioi_tinh",
    "Ngày sinh": "Ngay_sinh",
    "CCCD demo": "CCCD",
    "Mã số BHXH": "Ma_so_BHXH",
    "Điện thoại": "Dien_thoai",
    "Email": "Email",
    "Địa chỉ thường trú": "Dia_chi_thuong_tru",
    "Phòng ban": "Phong_ban",
    "Chức vụ": "Chuc_vu",
    "Ngày vào làm": "Ngay_vao_lam",
    "Loại HĐLĐ": "Loai_HDLD",
    "Lương đóng BHXH": "Luong_dong_BHXH",
    "Nơi đăng ký KCB tham chiếu": "Noi_DK_KCB",
}

BHYT_RECONCILE_FIELDS = [
    "Ho_ten",
    "Gioi_tinh",
    "Ngay_sinh",
    "Ma_so_BHXH",
    "Noi_DK_KCB",
    "Dia_chi_thuong_tru",
]

DEFAULT_BHYT_VALID_FROM = "01/01/2026"
DEFAULT_BHYT_VALID_TO = "31/12/2026"
DEMO_BHYT_CARD_PREFIX = "CS40"
