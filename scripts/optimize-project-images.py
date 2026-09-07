#!/usr/bin/env python3
"""Convert oversized project PNG assets to compact WebP files."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


PROJECT_ROOTS = (
    Path("src/assets/project-details"),
    Path("public/projects"),
)


def optimize_png(source: Path, quality: int, minimum_saving: float) -> tuple[int, int] | None:
    target = source.with_suffix(".webp")
    temporary = target.with_suffix(".webp.tmp")

    with Image.open(source) as image:
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(temporary, "WEBP", quality=quality, method=6, exact=True)

    source_size = source.stat().st_size
    target_size = temporary.stat().st_size
    if target_size >= source_size * (1 - minimum_saving):
        temporary.unlink()
        return None

    temporary.replace(target)
    source.unlink()
    return source_size, target_size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quality", type=int, default=85)
    parser.add_argument("--minimum-saving", type=float, default=0.05)
    args = parser.parse_args()

    converted = 0
    original_bytes = 0
    optimized_bytes = 0
    for root in PROJECT_ROOTS:
        for source in sorted(root.rglob("*.png")):
            result = optimize_png(source, args.quality, args.minimum_saving)
            if result is None:
                continue
            before, after = result
            converted += 1
            original_bytes += before
            optimized_bytes += after

    saving = 0 if not original_bytes else 1 - optimized_bytes / original_bytes
    print(
        f"Converted {converted} PNG files: "
        f"{original_bytes / 1024 / 1024:.2f} MB -> "
        f"{optimized_bytes / 1024 / 1024:.2f} MB "
        f"({saving:.1%} smaller)"
    )


if __name__ == "__main__":
    main()
