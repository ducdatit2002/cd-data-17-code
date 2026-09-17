import os 
import openpyxl

excel_file = "visitor_data.xlsx"
new_file = "new_visitor_data.xlsx"

if os.path.exists(excel_file):
    workbook = openpyxl.load_workbook(excel_file)
    worksheet = workbook["Sheet1"]

    # Thêm cột Pricing Plan nếu chưa tồn tại
    if worksheet["H1"].value != "Pricing Plan":
        worksheet.insert_cols(8)
        worksheet["H1"] = "Pricing Plan"

    # Bắt đầu xử lý từ hàng 2 (do hàng đầu là tiêu đề)
    row_num = 2 

    for row_values in worksheet.iter_rows(
        min_row=2, # bắt đầu đọc từ hàng 2
        values_only = True # tôi chỉ cần giá trị của các ô 
    ):
        pricing_plan_id = row_values[6]

        if pricing_plan_id == 1:
            worksheet[f"H{row_num}"] = "Cơ bản"
        elif pricing_plan_id == 2:
            worksheet[f"H{row_num}"] = "Hội viên"
        elif pricing_plan_id == 3:
            worksheet[f"H{row_num}"] = "Gói VIP"

        row_num += 1
    workbook.save(new_file)
    print("Đã lưu file thành công")
else:
    print("File không tồn tại")