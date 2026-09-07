#!/usr/bin/env python3
"""Create lightweight, web-friendly copies of the design-sharing PDFs."""

from __future__ import annotations

import argparse
import io
from pathlib import Path

import pypdfium2 as pdfium
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


def optimize_pdf(source: Path, destination: Path, target_width: int, quality: int) -> None:
    document = pdfium.PdfDocument(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    writer: canvas.Canvas | None = None

    try:
        for page_index in range(len(document)):
            page = document[page_index]
            page_width, page_height = page.get_size()
            scale = min(1.0, target_width / page_width)
            bitmap = page.render(scale=scale)
            image = bitmap.to_pil().convert("RGB")

            jpeg = io.BytesIO()
            image.save(
                jpeg,
                format="JPEG",
                quality=quality,
                optimize=True,
                progressive=True,
                subsampling=2,
            )
            jpeg.seek(0)

            if writer is None:
                writer = canvas.Canvas(str(destination), pagesize=(page_width, page_height), pageCompression=1)
            else:
                writer.setPageSize((page_width, page_height))

            writer.drawImage(ImageReader(jpeg), 0, 0, width=page_width, height=page_height)
            writer.showPage()

            bitmap.close()
            page.close()

        if writer is None:
            raise ValueError(f"PDF has no pages: {source}")
        writer.save()
    finally:
        document.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--quality", type=int, default=80)
    args = parser.parse_args()

    pdfs = sorted(args.source_dir.glob("*.pdf"))
    if not pdfs:
        raise SystemExit(f"No PDFs found in {args.source_dir}")

    for source in pdfs:
        destination = args.output_dir / source.name
        source_document = pdfium.PdfDocument(source)
        page_count = len(source_document)
        source_document.close()
        print(f"Optimizing {source.name} ({page_count} pages)...", flush=True)
        optimize_pdf(source, destination, args.width, args.quality)
        size_mb = destination.stat().st_size / 1024 / 1024
        print(f"  -> {size_mb:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
