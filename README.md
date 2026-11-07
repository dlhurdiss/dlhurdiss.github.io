# Hurdiss Lab website

Plain HTML/CSS site, hosted on GitHub Pages at https://dlhurdiss.github.io.
No build step: edit a file, commit, push, and the site updates within a minute or two.

## Files

| File | What it contains |
|---|---|
| `index.html` | Home page (hero, themes, recent structures, highlights, latest news) |
| `research.html` | Research text, themes, highlights, funding, knowledge transfer |
| `structures.html` | All PDB entries, with a 3D viewer (PDBe Mol*) |
| `people.html` | PI, team photo, current members, alumni |
| `publications.html` | Publication list with search and year filter |
| `news.html` | All news items |
| `contact.html` | Affiliation and links |
| `assets/css/style.css` | All styling. Colours are at the top under `:root` |
| `assets/js/main.js` | Menu, animations, filters, 3D viewer |
| `images/` | Highlights, structures (from RCSB PDB), news photos, team photo |

The navigation bar and footer are repeated in every page. If you change them, change them in all seven files.

## Common edits

**Add a news item:** in `news.html` (and optionally `index.html`, which shows the latest four), copy an existing
`<article class="news-card ...">…</article>` block, paste it at the top, and change the date, text and image path.
Put the photo in `images/news/`.

**Add a publication:** in `publications.html`, copy an `<li class="pub">…</li>` block inside the right year.
For a new year, copy a whole `<section class="pub-year" …>` block and add a year button to the filter bar.

**Add a structure:** download the image from `https://cdn.rcsb.org/images/structures/<id>_assembly-1.jpeg`
into `images/structures/<id>.jpg`, then copy an `<article class="struct-card" …>` block in `structures.html`.
The `data-family` value controls which filter button it belongs to.

**Add a person:** in `people.html`, copy an `<li class="person">…</li>` line and change the initials, name and years.

## Preview locally

Open `index.html` in a browser. The 3D viewer works best through a local server:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Credits

Structure images: RCSB PDB (rcsb.org), CC BY 4.0. 3D viewer: PDBe Mol*. Content adapted from the UU staff pages.
