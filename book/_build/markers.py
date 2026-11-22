"""Find the page number of each @@CH:key@@ marker in the PDF. Prints JSON {key: page}."""
import json, re, sys
import pypdf

r = pypdf.PdfReader(sys.argv[1])
found = {}
for i, page in enumerate(r.pages, 1):
    text = page.extract_text() or ""
    flat = re.sub(r"\s+", "", text).replace("\ufb01", "fi").replace("\ufb02", "fl").replace("\ufb00", "ff")
    for k in re.findall(r"@@CH:([a-z0-9-]+)@@", flat):
        found.setdefault(k, i)
print(json.dumps(found))
