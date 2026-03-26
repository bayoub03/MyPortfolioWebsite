#!/usr/bin/env python3
"""Generate the CV PDF from cv.html using WeasyPrint."""

import os
import sys

try:
    from weasyprint import HTML
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("Error: weasyprint is not installed. Run: python3 -m pip install weasyprint")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(SCRIPT_DIR, "cv.html")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "ayoub_bouhnine_cv.pdf")

if not os.path.exists(HTML_PATH):
    print(f"Error: {HTML_PATH} not found")
    sys.exit(1)

print("Loading CV template...")
font_config = FontConfiguration()
html = HTML(filename=HTML_PATH)

print("Generating PDF...")
html.write_pdf(OUTPUT_PATH, font_config=font_config)

file_size_kb = os.path.getsize(OUTPUT_PATH) / 1024
print(f"CV generated successfully: {os.path.abspath(OUTPUT_PATH)}")
print(f"File size: {file_size_kb:.1f} KB")
