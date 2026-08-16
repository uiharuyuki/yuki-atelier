#!/usr/bin/env python3
"""Silently render README.md after a file-writing tool runs."""

from __future__ import annotations

import base64
import html
import json
import mimetypes
import os
import re
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote, urlparse


# --- Easy-to-change conversion conditions ---------------------------------
TARGET_FILE_NAME = "README.md"
MARKDOWN_EXTENSIONS = frozenset({".md"})
EXCLUDED_DIRECTORY_NAMES = frozenset(
    {
        ".git",
        ".hg",
        ".svn",
        ".codex",
        ".claude",
        ".cursor",
        ".vscode",
        ".idea",
        ".venv",
        "venv",
        "__pycache__",
        "node_modules",
        "bower_components",
        "vendor",
        "dist",
        "build",
        "coverage",
    }
)
EMBED_IMAGES_ONLY_FROM_DOCUMENT_DIRECTORY = True
FRONT_MATTER_TITLE_PATTERN = re.compile(r"^\s*title\s*:\s*(.*?)\s*$", re.I)

# Tool-input fields used by common Write/Edit implementations.
PATH_FIELD_NAMES = frozenset(
    {
        "file_path",
        "filepath",
        "filePath",
        "path",
        "target_file",
        "target_path",
        "targetPath",
    }
)


CSS = r"""
:root {
  color-scheme: light dark;
  --bg: #fbfaf8;
  --surface: #ffffff;
  --text: #262523;
  --muted: #6d6963;
  --line: #ddd8d0;
  --accent: #2563a8;
  --code-bg: #f1eee9;
  --quote: #6d7f91;
  --shadow: 0 1px 2px rgba(30, 25, 20, .04);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #151719;
    --surface: #1d2023;
    --text: #e8e5df;
    --muted: #aaa59d;
    --line: #3a3d40;
    --accent: #84b9ee;
    --code-bg: #272b2f;
    --quote: #9eb4c9;
    --shadow: none;
  }
}
* { box-sizing: border-box; }
html { font-size: 16px; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP",
    "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
  line-height: 1.78;
  text-rendering: optimizeLegibility;
}
main {
  width: min(720px, calc(100% - 36px));
  margin: clamp(28px, 7vw, 76px) auto;
  padding: clamp(24px, 5vw, 52px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow);
}
h1, h2, h3, h4, h5, h6 {
  line-height: 1.35;
  margin: 2em 0 .7em;
  letter-spacing: -.018em;
}
h1 { margin-top: 0; font-size: clamp(2rem, 6vw, 2.7rem); }
h2 { padding-bottom: .3em; border-bottom: 1px solid var(--line); font-size: 1.6rem; }
h3 { font-size: 1.28rem; }
p { margin: 1em 0; }
a { color: var(--accent); text-underline-offset: .16em; }
a:hover { text-decoration-thickness: 2px; }
strong { font-weight: 700; }
blockquote {
  margin: 1.5em 0;
  padding: .15em 1.2em;
  border-left: 4px solid var(--quote);
  color: var(--muted);
  background: color-mix(in srgb, var(--quote) 8%, transparent);
}
ul, ol { padding-left: 1.65em; }
li { margin: .28em 0; }
.task-list { list-style: none; padding-left: .35em; }
.task-list-item input { margin-right: .65em; accent-color: var(--accent); }
code {
  padding: .12em .36em;
  border-radius: 5px;
  background: var(--code-bg);
  font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  font-size: .9em;
}
pre {
  overflow-x: auto;
  margin: 1.5em 0;
  padding: 1.1em 1.25em;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--code-bg);
  line-height: 1.55;
}
pre code { padding: 0; background: transparent; font-size: .88rem; }
.table-wrap { overflow-x: auto; margin: 1.5em 0; }
table { width: 100%; border-collapse: collapse; font-size: .95rem; }
th, td { padding: .62em .78em; border: 1px solid var(--line); text-align: left; }
th { background: var(--code-bg); font-weight: 650; }
tr:nth-child(even) td { background: color-mix(in srgb, var(--code-bg) 45%, transparent); }
img { display: block; max-width: 100%; height: auto; margin: 1.5em auto; border-radius: 8px; }
.image-unavailable {
  display: inline-block;
  padding: .35em .65em;
  border: 1px dashed var(--line);
  border-radius: 6px;
  color: var(--muted);
  font-size: .9em;
}
hr { margin: 2.4em 0; border: 0; border-top: 1px solid var(--line); }
.document-title { margin-bottom: 1.1em; }
@media (max-width: 620px) {
  main { width: 100%; margin: 0; border: 0; border-radius: 0; padding: 24px 20px 48px; }
}
@media print {
  body, main { background: #fff; color: #111; }
  main { width: 100%; margin: 0; padding: 0; border: 0; box-shadow: none; }
  a { color: inherit; }
}
""".strip()


FENCE_RE = re.compile(r"^\s{0,3}(`{3,}|~{3,})(.*)$")
HEADING_RE = re.compile(r"^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$")
LIST_RE = re.compile(r"^\s{0,3}([-+*]|\d+[.)])\s+(.+)$")
TASK_RE = re.compile(r"^\[([ xX])\]\s+(.*)$")
HR_RE = re.compile(r"^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$")
TABLE_DIVIDER_RE = re.compile(r"^:?-{3,}:?$")
IMAGE_RE = re.compile(
    r"!\[([^]]*)\]\(\s*(?:<([^>\n]+)>|([^\s)]+))"
    r"(?:\s+[\"'][^\"']*[\"'])?\s*\)"
)
PATCH_PATH_RE = re.compile(r"^\*\*\*\s+(?:Add|Update|Delete)\s+File:\s*(.+?)\s*$", re.M)
PATCH_MOVE_RE = re.compile(r"^\*\*\*\s+Move to:\s*(.+?)\s*$", re.M)
UNIFIED_PATH_RE = re.compile(r"^\+\+\+\s+(?:b/)?(.+?)\s*$", re.M)


def split_front_matter(text: str) -> tuple[list[str], bool, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return lines, False, ""
    end = next((i for i in range(1, len(lines)) if lines[i].strip() in {"---", "..."}), None)
    if end is None:
        return lines, False, ""
    found = False
    title = ""
    for line in lines[1:end]:
        match = FRONT_MATTER_TITLE_PATTERN.match(line)
        if match:
            found = True
            title = match.group(1).strip()
            if len(title) >= 2 and title[0] == title[-1] and title[0] in {'"', "'"}:
                title = title[1:-1]
            break
    return lines[end + 1 :], found, title


def eligible(path: Path, body_lines: list[str], has_front_title: bool) -> bool:
    if path.name.casefold() != TARGET_FILE_NAME.casefold():
        return False
    if path.suffix.lower() not in MARKDOWN_EXTENSIONS:
        return False
    if any(part.casefold() in EXCLUDED_DIRECTORY_NAMES for part in path.parts):
        return False
    return True


def strip_markdown_for_title(value: str) -> str:
    value = re.sub(r"!\[([^]]*)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"[`*_~]", "", value)
    return html.unescape(value).strip()


def local_image_data(source: str, document: Path) -> str | None:
    raw = source.strip().strip("<>")
    raw = re.sub(r"\\([\\ ()])", r"\1", raw)
    if raw.lower().startswith("data:image/"):
        return raw
    if raw.lower().startswith("data:"):
        return None
    if re.match(r"^[A-Za-z]:[\\/]", raw):
        image_path = Path(unquote(raw))
    else:
        parsed = urlparse(raw)
        if parsed.scheme in {"http", "https"} or raw.startswith("//"):
            return raw
        if parsed.scheme == "file":
            image_path = Path(unquote(parsed.path.lstrip("/") if os.name == "nt" else parsed.path))
        elif parsed.scheme:
            return None
        else:
            clean = unquote(raw.split("#", 1)[0].split("?", 1)[0])
            image_path = document.parent / clean
    try:
        image_path = image_path.resolve()
        if EMBED_IMAGES_ONLY_FROM_DOCUMENT_DIRECTORY:
            document_directory = document.parent.resolve()
            if not image_path.is_relative_to(document_directory):
                return None
        mime, _ = mimetypes.guess_type(str(image_path))
        if not image_path.is_file() or not mime or not mime.startswith("image/"):
            return None
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        return f"data:{mime};base64,{encoded}"
    except Exception:
        return None


def render_inline(text: str, document: Path) -> str:
    stored: list[str] = []

    def stash(markup: str) -> str:
        token = f"\x00{len(stored)}\x00"
        stored.append(markup)
        return token

    def image_repl(match: re.Match[str]) -> str:
        alt = match.group(1)
        source = match.group(2) or match.group(3)
        final_source = local_image_data(source, document)
        if final_source is None:
            label = alt.strip() or "画像"
            return stash(
                f'<span class="image-unavailable" role="img" '
                f'aria-label="{html.escape(label, quote=True)}">'
                f'［{html.escape(label)}を埋め込めません］</span>'
            )
        return stash(
            f'<img src="{html.escape(final_source, quote=True)}" '
            f'alt="{html.escape(alt, quote=True)}" loading="lazy">'
        )

    def link_repl(match: re.Match[str]) -> str:
        label, target = match.group(1), match.group(2).strip().strip("<>")
        parsed = urlparse(target)
        safe = not parsed.scheme or parsed.scheme.lower() in {"http", "https", "mailto", "file"}
        href = target if safe else "#"
        return stash(f'<a href="{html.escape(href, quote=True)}">{render_inline(label, document)}</a>')

    text = re.sub(r"`([^`\n]+)`", lambda m: stash(f"<code>{html.escape(m.group(1))}</code>"), text)
    text = IMAGE_RE.sub(image_repl, text)
    text = re.sub(r"(?<!!)\[([^]]+)\]\(([^)]+)\)", link_repl, text)
    text = re.sub(
        r"\*\*(.+?)\*\*|__(.+?)__",
        lambda m: stash(f"<strong>{render_inline(m.group(1) or m.group(2), document)}</strong>"),
        text,
    )
    text = re.sub(
        r"(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!\w)_([^_\n]+)_(?!\w)",
        lambda m: stash(f"<em>{render_inline(m.group(1) or m.group(2), document)}</em>"),
        text,
    )
    rendered = html.escape(text, quote=False)
    for index, markup in enumerate(stored):
        rendered = rendered.replace(f"\x00{index}\x00", markup)
    return rendered


def split_table_row(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|") and not line.endswith(r"\|"):
        line = line[:-1]
    cells: list[str] = []
    current: list[str] = []
    escaped = False
    in_code = False
    for char in line:
        if escaped:
            current.append(char)
            escaped = False
        elif char == "\\":
            escaped = True
            current.append(char)
        elif char == "`":
            in_code = not in_code
            current.append(char)
        elif char == "|" and not in_code:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    cells.append("".join(current).strip())
    return cells


def is_table(lines: list[str], index: int) -> bool:
    if index + 1 >= len(lines) or "|" not in lines[index]:
        return False
    divider = split_table_row(lines[index + 1])
    return bool(divider) and all(TABLE_DIVIDER_RE.match(cell.replace(" ", "")) for cell in divider)


def starts_block(lines: list[str], index: int) -> bool:
    line = lines[index]
    return bool(
        not line.strip()
        or FENCE_RE.match(line)
        or HEADING_RE.match(line)
        or LIST_RE.match(line)
        or line.lstrip().startswith(">")
        or HR_RE.match(line)
        or is_table(lines, index)
    )


def render_blocks(lines: list[str], document: Path) -> str:
    output: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue

        fence = FENCE_RE.match(line)
        if fence:
            marker, info = fence.group(1), fence.group(2).strip()
            i += 1
            code: list[str] = []
            closing = re.compile(rf"^\s{{0,3}}{re.escape(marker[0])}{{{len(marker)},}}\s*$")
            while i < len(lines) and not closing.match(lines[i]):
                code.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            language = re.sub(r"[^A-Za-z0-9_+-]", "", info.split()[0]) if info else ""
            class_name = f' class="language-{html.escape(language, quote=True)}"' if language else ""
            output.append(f"<pre><code{class_name}>{html.escape(chr(10).join(code))}</code></pre>")
            continue

        heading = HEADING_RE.match(line)
        if heading:
            level = len(heading.group(1))
            output.append(f"<h{level}>{render_inline(heading.group(2), document)}</h{level}>")
            i += 1
            continue

        if HR_RE.match(line):
            output.append("<hr>")
            i += 1
            continue

        if is_table(lines, i):
            headers = split_table_row(lines[i])
            dividers = split_table_row(lines[i + 1])
            aligns = []
            for divider in dividers:
                compact = divider.replace(" ", "")
                aligns.append("center" if compact.startswith(":") and compact.endswith(":") else "right" if compact.endswith(":") else "left")
            i += 2
            rows: list[list[str]] = []
            while i < len(lines) and lines[i].strip() and "|" in lines[i]:
                rows.append(split_table_row(lines[i]))
                i += 1
            head = "".join(
                f'<th style="text-align:{aligns[n] if n < len(aligns) else "left"}">{render_inline(cell, document)}</th>'
                for n, cell in enumerate(headers)
            )
            body_rows = []
            for row in rows:
                cells = "".join(
                    f'<td style="text-align:{aligns[n] if n < len(aligns) else "left"}">{render_inline(cell, document)}</td>'
                    for n, cell in enumerate(row)
                )
                body_rows.append(f"<tr>{cells}</tr>")
            tbody = f"<tbody>{''.join(body_rows)}</tbody>" if body_rows else ""
            output.append(f'<div class="table-wrap"><table><thead><tr>{head}</tr></thead>{tbody}</table></div>')
            continue

        if line.lstrip().startswith(">"):
            quoted: list[str] = []
            while i < len(lines) and (lines[i].lstrip().startswith(">") or not lines[i].strip()):
                current = lines[i]
                quoted.append(re.sub(r"^\s{0,3}>\s?", "", current) if current.strip() else "")
                i += 1
            output.append(f"<blockquote>{render_blocks(quoted, document)}</blockquote>")
            continue

        list_match = LIST_RE.match(line)
        if list_match:
            ordered = list_match.group(1)[0].isdigit()
            items: list[tuple[str, str | None]] = []
            while i < len(lines):
                item_match = LIST_RE.match(lines[i])
                if not item_match or item_match.group(1)[0].isdigit() != ordered:
                    break
                value = item_match.group(2)
                checked: str | None = None
                task = TASK_RE.match(value)
                if task:
                    checked = "checked" if task.group(1).lower() == "x" else ""
                    value = task.group(2)
                items.append((value, checked))
                i += 1
                while i < len(lines) and lines[i].strip() and not LIST_RE.match(lines[i]) and not starts_block(lines, i):
                    value += " " + lines[i].strip()
                    items[-1] = (value, checked)
                    i += 1
            tag = "ol" if ordered else "ul"
            task_list = any(checked is not None for _, checked in items)
            class_attr = ' class="task-list"' if task_list else ""
            rendered_items = []
            for value, checked in items:
                if checked is None:
                    rendered_items.append(f"<li>{render_inline(value, document)}</li>")
                else:
                    state = " checked" if checked else ""
                    rendered_items.append(
                        f'<li class="task-list-item"><input type="checkbox" disabled{state}>'
                        f"{render_inline(value, document)}</li>"
                    )
            output.append(f"<{tag}{class_attr}>{''.join(rendered_items)}</{tag}>")
            continue

        paragraph = [line.strip()]
        i += 1
        while i < len(lines) and not starts_block(lines, i):
            paragraph.append(lines[i].strip())
            i += 1
        joined = " ".join(paragraph)
        output.append(f"<p>{render_inline(joined, document)}</p>")

    return "\n".join(output)


def document_html(path: Path, body_lines: list[str], front_title: str) -> str:
    first_h1 = next((HEADING_RE.match(line) for line in body_lines if HEADING_RE.match(line)), None)
    page_title = front_title or (strip_markdown_for_title(first_h1.group(2)) if first_h1 else path.stem)
    body_html = render_blocks(body_lines, path)
    if front_title and not any(HEADING_RE.match(line) and len(HEADING_RE.match(line).group(1)) == 1 for line in body_lines):
        body_html = f'<h1 class="document-title">{render_inline(front_title, path)}</h1>\n{body_html}'
    return f"""<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>{html.escape(page_title)}</title>
  <style>{CSS}</style>
</head>
<body>
<main>
{body_html}
</main>
</body>
</html>
"""


def resolve_candidate(raw: str, cwd: Path) -> Path | None:
    value = raw.strip().strip('"\'')
    if not value or "\n" in value or "\r" in value or value == "/dev/null":
        return None
    if value.startswith("file://"):
        parsed = urlparse(value)
        value = unquote(parsed.path.lstrip("/") if os.name == "nt" else parsed.path)
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = cwd / candidate
    try:
        return candidate.resolve()
    except Exception:
        return None


def candidate_paths(payload: object) -> list[Path]:
    if not isinstance(payload, dict):
        return []
    cwd_value = payload.get("cwd")
    cwd = Path(cwd_value).resolve() if isinstance(cwd_value, str) else Path.cwd()
    tool_input = payload.get("tool_input", payload)
    raw_paths: list[str] = []
    patch_texts: list[str] = []

    def walk(value: object, key: str = "") -> None:
        if isinstance(value, dict):
            for child_key, child_value in value.items():
                if child_key in PATH_FIELD_NAMES and isinstance(child_value, str):
                    raw_paths.append(child_value)
                elif child_key in {"command", "patch", "diff"} and isinstance(child_value, str):
                    patch_texts.append(child_value)
                elif isinstance(child_value, (dict, list)):
                    walk(child_value, child_key)
        elif isinstance(value, list):
            for child in value:
                walk(child, key)
        elif isinstance(value, str) and ("*** Begin Patch" in value or "+++ " in value):
            patch_texts.append(value)

    walk(tool_input)
    if isinstance(tool_input, str):
        walk(tool_input)
    for patch in patch_texts:
        raw_paths.extend(PATCH_PATH_RE.findall(patch))
        raw_paths.extend(PATCH_MOVE_RE.findall(patch))
        raw_paths.extend(UNIFIED_PATH_RE.findall(patch))

    found: list[Path] = []
    seen: set[str] = set()
    for raw in raw_paths:
        candidate = resolve_candidate(raw, cwd)
        if candidate is None:
            continue
        key = os.path.normcase(str(candidate))
        if key not in seen:
            seen.add(key)
            found.append(candidate)
    return found


def convert(path: Path) -> None:
    if path.name.casefold() != TARGET_FILE_NAME.casefold():
        return
    if path.suffix.lower() not in MARKDOWN_EXTENSIONS or not path.is_file():
        return
    if any(part.casefold() in EXCLUDED_DIRECTORY_NAMES for part in path.parts):
        return
    text = path.read_text(encoding="utf-8-sig")
    body_lines, has_front_title, front_title = split_front_matter(text)
    if not eligible(path, body_lines, has_front_title):
        return
    rendered = document_html(path, body_lines, front_title)
    destination = path.with_name("README.html")
    fd, temporary_name = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=".tmp", dir=destination.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(rendered)
        os.replace(temporary_name, destination)
    except BaseException:
        try:
            os.close(fd)
        except OSError:
            pass
        try:
            os.unlink(temporary_name)
        except OSError:
            pass
        raise


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        for path in candidate_paths(payload):
            try:
                convert(path)
            except BaseException:
                pass
    except BaseException:
        pass


if __name__ == "__main__":
    main()
