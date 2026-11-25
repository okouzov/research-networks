"""Build deploy/site.zip: everything the web server needs, nothing else.
Run from the project folder:  python tools/pack.py
Then in Hostinger File Manager: upload site.zip into public_html (or the site's folder) and Extract, overwriting."""
import os, zipfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'tools', 'export', 'deploy', '.git', '__pycache__', '.claude'}
SKIP_FILES = {'README.md', 'DEPLOY.md', '.gitignore'}

out_dir = os.path.join(ROOT, 'deploy'); os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, 'site.zip')
n = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if f in SKIP_FILES or f.endswith('.pyc'): continue
            p = os.path.join(d, f); rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
            z.write(p, rel); n += 1
print(f'{out}  ({n} files, {os.path.getsize(out) // 1024} KB, {time.strftime("%d.%m.%Y %H:%M")})')
