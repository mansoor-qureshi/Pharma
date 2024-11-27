import pdfkit
from io import BytesIO

def generate_pdf(html_content):
    pdf_data = pdfkit.from_string(html_content, False)
    return BytesIO(pdf_data)