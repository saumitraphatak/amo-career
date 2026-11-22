"""Build executed Jupyter notebooks (nbformat 4) from small Python specs, without nbformat.

usage: python3 build.py <specs_dir> <out_dir> [key ...]
Each spec module defines TITLE, PAGE (key), and CELLS = [("md", text) | ("code", source), ...].
Code cells run in one namespace (like a kernel); stdout and matplotlib figures become outputs.
Any exception aborts the build, so the "check against the page" cells really are checks.
"""
import base64, contextlib, importlib.util, io, json, os, sys, traceback
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SITE = "https://amotoolkit.com/pages/"
COLAB = "https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/"

def lines(src):
    src = src.strip("\n")
    parts = src.split("\n")
    return [p + "\n" for p in parts[:-1]] + [parts[-1]]

def run(cells, title, key):
    ns = {"__name__": "__main__"}
    out_cells, n = [], 0
    header = (f"# {title}\n\nPython companion to the AMO Toolkit page [{title}]({SITE}{key}.html). "
              f"It reproduces the page's calculator with the same constants and formulas, so you can change "
              f"anything, script a scan, or check a number in your own analysis.\n\n"
              f"[Open in Colab]({COLAB}{key}.ipynb) · needs only `numpy`, `scipy` and `matplotlib`.")
    cells = [("md", header)] + list(cells)
    plt.rcParams.update({"figure.dpi": 110, "figure.figsize": (7, 3.6), "axes.grid": True, "grid.alpha": 0.3})
    for kind, src in cells:
        if kind == "md":
            out_cells.append({"cell_type": "markdown", "metadata": {}, "source": lines(src)})
            continue
        n += 1
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                exec(compile(src.strip("\n"), f"<{key} cell {n}>", "exec"), ns)
        except Exception:
            sys.stderr.write(f"\n--- {key}: cell {n} failed ---\n{src}\n")
            traceback.print_exc()
            raise SystemExit(1)
        outs = []
        if buf.getvalue():
            outs.append({"output_type": "stream", "name": "stdout", "text": lines(buf.getvalue().rstrip("\n") + "\n") if buf.getvalue() else []})
        for num in plt.get_fignums():
            fig = plt.figure(num)
            b = io.BytesIO(); fig.savefig(b, format="png", bbox_inches="tight"); plt.close(fig)
            outs.append({"output_type": "display_data", "metadata": {},
                         "data": {"image/png": base64.b64encode(b.getvalue()).decode(), "text/plain": ["<Figure>"]}})
        out_cells.append({"cell_type": "code", "execution_count": n, "metadata": {}, "outputs": outs, "source": lines(src)})
    return {"cells": out_cells, "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3"},
        "amo_toolkit": {"page": key}}, "nbformat": 4, "nbformat_minor": 5}

def main():
    specs, out = sys.argv[1], sys.argv[2]
    only = set(sys.argv[3:])
    os.makedirs(out, exist_ok=True)
    sys.path.insert(0, specs)
    for fn in sorted(os.listdir(specs)):
        if not fn.endswith(".py") or fn.startswith("_"): continue
        spec = importlib.util.spec_from_file_location(fn[:-3], os.path.join(specs, fn))
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        if only and m.PAGE not in only: continue
        nb = run(m.CELLS, m.TITLE, m.PAGE)
        with open(os.path.join(out, f"{m.PAGE}.ipynb"), "w") as f:
            json.dump(nb, f, indent=1, ensure_ascii=False); f.write("\n")
        print(f"built {m.PAGE}.ipynb: {len(nb['cells'])} cells")

if __name__ == "__main__":
    main()
