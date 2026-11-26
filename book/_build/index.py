"""One pass over the PDF text: the page of every @@CH:key@@ marker, and for each index term the pages where it is
discussed most. Prints JSON {"markers": {key: page}, "index": {term: [pages]}}.
usage: python3 index.py book.pdf index-terms.json"""
import json, re, sys
import pypdf

pdf, terms_file = sys.argv[1], sys.argv[2]
terms = json.load(open(terms_file, encoding="utf-8"))
reader = pypdf.PdfReader(pdf)
LIG = {"ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl"}

markers, pages = {}, []
for i, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ""
    for a, b in LIG.items():
        text = text.replace(a, b)
    flat = re.sub(r"\s+", "", text)
    for k in re.findall(r"@@CH:([a-z0-9-]+)@@", flat):
        markers.setdefault(k, i)
    # undo end-of-line hyphenation, then normalise whitespace, for the term search
    body = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    pages.append(re.sub(r"\s+", " ", body))

# search the chapters, prologue and appendices, but not the front matter, contents or the index itself
first = min([v for k, v in markers.items() if k in ("prologue", "part-build")] or [1])
pro = markers.get("part-build")
last = markers.get("appx-index", len(pages) + 1) - 1
index = {}
for term, pats in terms.items():
    rx = [re.compile(p, re.I if not re.search(r"[A-Z]{2}", p) else 0) for p in pats]
    counts = []
    for n in range(first, last + 1):
        c = sum(len(r.findall(pages[n - 1])) for r in rx)
        if pro and n < pro:   # the prologue mentions everything once; prefer the chapters that develop it
            c *= 0.4
        if c:
            counts.append((c, n))
    if not counts:
        continue
    counts.sort(key=lambda x: (-x[0], x[1]))
    top = sorted(n for c, n in counts[:3])
    index[term] = top
print(json.dumps({"markers": markers, "index": index}, ensure_ascii=False))
