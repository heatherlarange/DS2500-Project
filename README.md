# DS2500 Project - Free-Kick Success Map

An interactive map of the attacking half of a soccer pitch. Click any spot and it
reports the distance and angle to goal, then opens a tile with the free-kick
scoring stats from that area: the success rate, the shot and goal counts, and the
nearest player who scored a free kick from there.

The tool is built on a combined free-kick dataset (StatsBomb, HuggingFace xG,
and Football Events) covering major men's leagues and international tournaments.

## Quickest way to open it: one file, no setup

**`freekick_map.html`** is the whole tool in a single file - the pitch, the code,
and the data are all inside it. Download it and double-click. It opens in any
browser with no server, no Python, and no install.

To get it from GitHub: open
[`freekick_map.html`](freekick_map.html), click the **Download raw file** button
(top right), then double-click the downloaded file. Or grab the whole repo with
**Code -> Download ZIP**.

Everything below describes the multi-file version in `app/`, which is the same
tool split into separate files for development.

## The main product

`app/` is an interactive web page (plain HTML, CSS, and SVG - no build step):

- **`index.html`** - the page: header, the pitch, and the stat tile.
- **`app.js`** - draws the half-pitch, handles clicks, computes distance/angle
  live, and fills the tile from the dataset.
- **`styles.css`** - dark sports-analytics theme.
- **`field_stats.json`** - the data the tile reads. Starts empty; generated from
  the CSV by the script below.

## How the pieces fit together

```
data/freekicks_direct_only.csv  +  data/freekicks_indirect_only.csv
        ->  src/build_field_data.py  ->  app/field_stats.json  ->  app/ (the map)
```

1. The two CSVs in `data/` hold every free-kick shot, split by type, in one shared schema.
2. `src/build_field_data.py` bins the pitch into a grid and computes, per cell,
   the shot/goal counts, the success rate, and the nearest scorer.
3. The web app loads that JSON and shows the numbers when you click a spot.

## Run it locally

Because the app reads a JSON file, open it through a local server (not by
double-clicking, which some browsers block from reading local files):

```bash
python -m http.server 8000 --directory app
```

Then visit `http://localhost:8000`. The pitch is fully interactive right away;
the distance and angle read out on every click.

## Light up the data tile

The stat slots (success rate, shots, goals, nearest scorer) start empty on
purpose. To fill them from the dataset:

```bash
python src/build_field_data.py
```

That reads both CSVs in `data/`, writes `app/field_stats.json`, and bakes the
same data into `freekick_map.html` so the one-file version stays self-contained.
It produces 156 grid cells from 15,917 located free-kick shots. Every cell also
carries a direct/indirect breakdown, so the heatmap can shade the two types
separately.

## Repository layout

```
DS2500-Project/
├── freekick_map.html       # THE ONE-FILE VERSION - double-click to run
├── app/                    # same tool, split into files for development
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── field_stats.json    # generated data (starts empty)
├── data/
│   ├── freekicks_direct_only.csv     # 3,846 direct free kicks
│   ├── freekicks_indirect_only.csv   # 12,092 indirect free kicks
│   └── README.md           # data schema and sources
└── src/
    ├── build_field_data.py # turns the CSV into field_stats.json
    └── main.py
```

## Publishing (so teammates can open it)

The map is hosted with GitHub Pages. A repo owner or admin enables it once:

1. Repo **Settings** -> **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`, **Folder**: `/ (root)`, then **Save**

A root redirect (`index.html`) forwards visitors to the map, so the public link is:

**https://heatherlarange.github.io/DS2500-Project/**

Anyone can open that in a browser - no install. The pitch is interactive
immediately; generate and commit `app/field_stats.json`
(`python src/build_field_data.py`) so the live tiles show data.
