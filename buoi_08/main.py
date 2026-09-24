from cover_letter_processor import CoverLetterProcessor

processor = CoverLetterProcessor(
    folder_path="cover_letter",
    excel_file="so_yeu_ly_lich.xlsx"
)
processor.process_documents()
