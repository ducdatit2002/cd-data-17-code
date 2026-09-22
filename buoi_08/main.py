from cover_letter_processor import CoverLetterProcessor

processor = CoverLetterProcessor(
    "cover_letter",
    "so_yeu_ly_lich.xlsx"
)
processor.initialize_excel()
processor.wb.save(processor.excel_file)

