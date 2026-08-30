"""Generate sample PDF documents from text files for testing."""

import fitz
from pathlib import Path

SAMPLE_DIR = Path(__file__).parent.parent / "sample-documents"
OUTPUT_DIR = SAMPLE_DIR / "pdf"


def text_to_pdf(text_path: Path, output_path: Path) -> None:
    text = text_path.read_text(encoding="utf-8")
    doc = fitz.open()
    lines = text.split("\n")
    page_text = ""
    char_limit = 2500

    for line in lines:
        if len(page_text) + len(line) > char_limit:
            page = doc.new_page()
            page.insert_text((50, 50), page_text, fontsize=11)
            page_text = line + "\n"
        else:
            page_text += line + "\n"

    if page_text.strip():
        page = doc.new_page()
        page.insert_text((50, 50), page_text, fontsize=11)

    doc.save(str(output_path))
    doc.close()
    print(f"Created: {output_path}")


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    for txt_file in SAMPLE_DIR.glob("*.txt"):
        pdf_path = OUTPUT_DIR / (txt_file.stem + ".pdf")
        text_to_pdf(txt_file, pdf_path)


if __name__ == "__main__":
    main()
