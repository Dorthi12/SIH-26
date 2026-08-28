#!/usr/bin/env python3
"""
ingest_kcc.py — Ingest KCC documents into the existing Pinecone index.

STEP 1: Download a KCC PDF and save it to:
  frontend/agrisense_government_documents/central/kcc/

STEP 2: Run this script:
  python3 rag/ingest_kcc.py

STEP 3: Verify retrieval improved:
  python3 -m rag.evaluation --retrieval-only --limit 5 --verbose
"""

import sys
import os
import glob
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

KCC_DIR = Path(__file__).parent.parent / "frontend" / "agrisense_government_documents" / "central" / "kcc"


def main():
    pdfs = list(KCC_DIR.glob("*.pdf"))

    if not pdfs:
        print("\n❌ No PDFs found in:", KCC_DIR.resolve())
        print()
        print("─" * 60)
        print("DOWNLOAD A KCC PDF MANUALLY IN YOUR BROWSER")
        print("─" * 60)
        print()
        print("Option 1 (Agriculture Ministry):")
        print("  https://agriwelfare.gov.in/en/Credit")
        print("  → Look for 'KCC Operational Guidelines' or 'KCC Circular'")
        print()
        print("Option 2 (RBI Master Circular):")
        print("  https://www.rbi.org.in/Scripts/BS_ViewMasCirculardetails.aspx?id=9034")
        print()
        print("Option 3 (PM-KISAN portal):")
        print("  https://pmkisan.gov.in/  → Resources/Documents section")
        print()
        print("Save the PDF into:")
        print(f"  {KCC_DIR.resolve()}/")
        print()
        print("Then run this script again.")
        sys.exit(1)

    # Validate PDFs are real PDFs (not HTML error pages)
    valid_pdfs = []
    for pdf in pdfs:
        with open(pdf, "rb") as f:
            header = f.read(4)
        if header == b"%PDF":
            valid_pdfs.append(pdf)
            print(f"  ✅ {pdf.name} ({pdf.stat().st_size:,} bytes)")
        else:
            print(f"  ❌ {pdf.name} — not a valid PDF (HTML page?), skipping")

    if not valid_pdfs:
        print("\n❌ All PDFs in the folder are invalid (likely HTML redirect pages).")
        print("Please download the PDF directly from your browser and save to the kcc/ folder.")
        sys.exit(1)

    print(f"\n▶ Found {len(valid_pdfs)} valid PDF(s). Starting ingestion into Pinecone...")
    print()

    from rag.ingestion.pipeline import run_pipeline
    run_pipeline(source_dir=KCC_DIR, force=True)

    print()
    print("✅ KCC ingestion complete!")
    print()
    print("▶ Verify retrieval improved:")
    print("   python3 -m rag.evaluation --retrieval-only --limit 5 --verbose")


if __name__ == "__main__":
    main()
