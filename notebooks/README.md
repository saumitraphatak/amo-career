# AMO Toolkit notebooks

Python companions to the calculators on [AMO Toolkit](https://amotoolkit.com). Each notebook reproduces one page's calculator with the same constants and formulas, adds a plot or a scan the page does not show, and ends with a cell that checks its numbers against the values the live page displays at its default settings.

They need only `numpy`, `scipy` and `matplotlib` (see `requirements.txt`). Open one in Colab from the table, or download it and run it locally with Jupyter.

| Page | Notebook | Run online |
|---|---|---|
| [Absorption Imaging Lab](https://amotoolkit.com/pages/absorption-imaging.html) | [`absorption-imaging.ipynb`](absorption-imaging.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/absorption-imaging.ipynb) |
| [Automating the Experiment](https://amotoolkit.com/pages/automation.html) | [`automation.ipynb`](automation.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/automation.ipynb) |
| [Cavity QED Coupling Lab](https://amotoolkit.com/pages/cavity-qed.html) | [`cavity-qed.ipynb`](cavity-qed.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/cavity-qed.ipynb) |
| [Experiment Control Systems](https://amotoolkit.com/pages/control-systems.html) | [`control-systems.ipynb`](control-systems.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/control-systems.ipynb) |
| [Laser Cooling Simulator](https://amotoolkit.com/pages/cooling-simulator.html) | [`cooling-simulator.ipynb`](cooling-simulator.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/cooling-simulator.ipynb) |
| [Dynamical Decoupling](https://amotoolkit.com/pages/dd-playground.html) | [`dd-playground.ipynb`](dd-playground.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/dd-playground.ipynb) |
| [Rydberg Gate Error Budget](https://amotoolkit.com/pages/fidelity-budget.html) | [`fidelity-budget.ipynb`](fidelity-budget.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/fidelity-budget.ipynb) |
| [Single-atom Imaging](https://amotoolkit.com/pages/imaging-calculator.html) | [`imaging-calculator.ipynb`](imaging-calculator.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/imaging-calculator.ipynb) |
| [Quick Lab Console](https://amotoolkit.com/pages/lab-calculators.html) | [`lab-calculators.ipynb`](lab-calculators.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/lab-calculators.ipynb) |
| [Single-atom Cooling](https://amotoolkit.com/pages/laser-cooling.html) | [`laser-cooling.ipynb`](laser-cooling.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/laser-cooling.ipynb) |
| [Laser Locking Guide](https://amotoolkit.com/pages/laser-locking.html) | [`laser-locking.ipynb`](laser-locking.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/laser-locking.ipynb) |
| [MOT Designer](https://amotoolkit.com/pages/mot-designer.html) | [`mot-designer.ipynb`](mot-designer.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/mot-designer.ipynb) |
| [Randomized Benchmarking](https://amotoolkit.com/pages/rb-explorer.html) | [`rb-explorer.ipynb`](rb-explorer.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/rb-explorer.ipynb) |
| [Single-atom Temperature](https://amotoolkit.com/pages/release-recapture.html) | [`release-recapture.ipynb`](release-recapture.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/release-recapture.ipynb) |
| [Remote Entanglement](https://amotoolkit.com/pages/remote-entanglement.html) | [`remote-entanglement.ipynb`](remote-entanglement.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/remote-entanglement.ipynb) |
| [Rydberg Blockade Lab](https://amotoolkit.com/pages/rydberg-calculator.html) | [`rydberg-calculator.ipynb`](rydberg-calculator.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/rydberg-calculator.ipynb) |
| [MOT Temperature](https://amotoolkit.com/pages/tof-calculator.html) | [`tof-calculator.ipynb`](tof-calculator.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/tof-calculator.ipynb) |
| [Tweezer Array Design Lab](https://amotoolkit.com/pages/tweezer-designer.html) | [`tweezer-designer.ipynb`](tweezer-designer.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/tweezer-designer.ipynb) |
| [Vacuum Systems Guide](https://amotoolkit.com/pages/vacuum-systems.html) | [`vacuum-systems.ipynb`](vacuum-systems.ipynb) | [Open in Colab](https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/vacuum-systems.ipynb) |

## For maintainers
`_build/` holds the sources: `specs/<page>.py` lists each notebook's cells, `build.py` executes them and writes the `.ipynb` files with their outputs (it stops if any check fails), and `scrape.js` reads a page's displayed values with Playwright when a page changes. Rebuild with

    python3 notebooks/_build/build.py notebooks/_build/specs notebooks

If a page's formula or default changes, update its spec and the expected values in its last cell, then rebuild. The notebooks are also linked from each page's "how to use this page" note and from the Teach page.
