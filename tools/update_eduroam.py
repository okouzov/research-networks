"""Refresh data/eduroam.json from the eduroam.bg monitoring table.

Usage (from the site folder):  python tools/update_eduroam.py

Reads https://www.eduroam.bg/?page_id=213, takes every row of the monitoring table
(institution, server, overall status) and rewrites "servers" and "asof" in data/eduroam.json.
The polished names in "names" are kept; institutions that have no entry yet are listed at
the end so a bg/en name can be added by hand. Standard library only (certifi is used if installed).
"""
import datetime
import html
import json
import pathlib
import re
import ssl
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "eduroam.json"


def rows_of(page):
    """Rows of the monitoring table as [institution, server, time, status1812, radtest, status].
    The page's markup is not well-formed (<img ...</td> without '>'), so cells are split with
    regular expressions instead of an HTML parser; a status cell is read from <img description=...>."""
    body = page[page.find("<tbody"):page.find("</tbody>")]
    out = []
    for tr in re.split(r"<tr[^>]*>", body)[1:]:
        cells = []
        for td in re.split(r"<td[^>]*>", tr)[1:]:
            d = re.search(r'description="([^"]*)"', td)
            text = re.sub(r"<[^>]*>?", " ", td.split("</td")[0])
            cells.append(d.group(1) if d else " ".join(html.unescape(text).split()))
        if len(cells) >= 6 and cells[1]:
            out.append(cells)
    return out


def main():
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    req = urllib.request.Request(doc["live"]["page"], headers={"User-Agent": "renet-site-updater"})
    # certifi's CA bundle when available: the Windows store can reject the current Let's Encrypt chain
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        page = r.read().decode("utf-8", "replace")
    rows = rows_of(page)
    if not rows:
        sys.exit("No rows found: the monitoring page layout may have changed. data/eduroam.json was not touched.")
    doc["servers"] = [{"inst": r[0], "host": r[1], "status": r[5]} for r in rows]
    doc["asof"] = datetime.date.today().isoformat()
    # write UTF-8 without BOM so browsers and Python both read it cleanly
    DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    insts = sorted({s["inst"] for s in doc["servers"]})
    missing = [i for i in insts if i not in doc["names"]]
    print(f"{len(doc['servers'])} servers, {len(insts)} entries in the table -> {DATA}")
    if missing:
        print("No polished name yet (add to 'names'):", ", ".join(missing))


if __name__ == "__main__":
    main()
