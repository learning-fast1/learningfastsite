# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static HTML/CSS site (no build system, no bundler, no package manager) for **Learning Fast**
(learning-fast.com), a Greek-language educational site for elementary/middle school students
(Α΄–ΣΤ΄ Δημοτικού and some Γυμνάσιο). Content is split across Γλώσσα (language) and Μαθηματικά
(math), plus Ειδική Εκπαίδευση (special education) and Εκπαιδευτικά Παιχνίδια (educational games).

Deployed via GitHub Pages with a custom domain (see `CNAME` = `learning-fast.com`), remote is
`github.com/learning-fast1/learningfastsite`.

## Commands

There is no build, lint, or test tooling — pages are plain HTML/CSS/JS served as-is. To preview
changes, open the HTML file directly in a browser or serve the directory with any static file
server (e.g. `python -m http.server`).

Site-wide edits are made through one-off Python scripts at the repo root (e.g. `update_nav.py`,
`fix_navbar_order.py`, `seo_update.py`, `keyword_seo.py`, `homepage_seo.py`, `landing_pages.py`,
`show_mathimatika.py`, `hide_mathimatika.py`, `remove_emojis.py`, `create_glossa.py`,
`fix_empty.py`). These are throwaway, single-purpose scripts (regex/string replacement across all
`*.html` files) rather than a repeatable pipeline — read a script before rerunning it, since it may
be tied to specific string literals that only matched the DOM at the time it was written. Run with
`python3 <script>.py`. When making a change that must apply to every page (e.g. a navbar link, a
footer tweak, an SEO field), prefer writing/adapting one of these scripts over hand-editing every
HTML file individually.

## Architecture

**No templating engine.** Every page is a fully self-contained `.html` file with the navbar,
dropdown menus, and footer copy-pasted inline. There is no shared header/footer include, so any
structural nav/footer change must be propagated to all HTML files — this is exactly what the
root-level Python scripts exist to do (walk `**/*.html` and regex-replace).

**Two parallel content hierarchies, plus a games tree:**
- `taxeis/<grade>/` — per-grade landing pages (e.g. `taxeis/a-dimotikou`, `taxeis/b-gymnasiou`)
- `glossa/<topic>/` and `mathimatika/` — per-subject content (e.g. `glossa/orthografia`,
  `glossa/meri-logou`)
- `ekpaideftika-paixnidia/<grade>/<subject>/<topic>/` — games, organized grade → subject → topic
  (e.g. `ekpaideftika-paixnidia/e-dimotikou/mathimatika/klasmata/`)
- `eidiki-ekpaideysi/` — special-education material, its own subtree

Grade folder naming: `a-dimotikou`, `b-dimotikou`, `g-dimotikou`, `d-dimotikou`, `e-dimotikou`,
`st-dimotikou` (Α΄–ΣΤ΄ Δημοτικού), `a-gymnasiou`, `b-gymnasiou`.

**Games are either embedded or externally hosted:**
- Embedded games (e.g. `ekpaideftika-paixnidia/e-dimotikou/mathimatika/klasmata/`) are
  self-contained subfolders with their own `assets/`, `css/`, `js/` — vanilla JS/DOM/canvas, no
  framework, no shared code with the rest of the site.
- Many sidebar/game links point to `https://learning-fast1.github.io/<game-name>/` — separate
  repos/deployments entirely outside this codebase. Don't expect to find their source here.

**Stylesheets — only one is live.** `styles/main.css` (~850 lines) is the real, actively
referenced stylesheet (linked from all pages via `<link rel="stylesheet" href="styles/main.css">`,
adjusted for relative depth). `css/main.css` is a smaller, orphaned/unused leftover — nothing
references it. Edit `styles/main.css`, not `css/main.css`.

**SEO conventions repeated per page** (set by the root Python scripts, not hand-maintained per
file): Google Analytics gtag snippet in `<head>` (note: different pages use different GA
measurement IDs — this is pre-existing and not necessarily a bug to "fix"), `<meta name="description">`,
`<link rel="canonical">`, and on several pages a `application/ld+json` `FAQPage` schema block.
`sitemap.xml` and `robots.txt` are maintained by hand/scripts alongside page changes — update
`sitemap.xml` when adding or removing a page.

**Language:** all user-facing content is Greek (`lang="el"`). Keep new copy consistent with the
existing tone/vocabulary already used on sibling pages.
