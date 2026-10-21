# Dark Projects & Journal pages

The site stays plain static HTML/CSS. No build step or dependency is needed to serve the committed pages on GitHub Pages or Vercel.

To edit or add a page:

1. Edit a JSON file in `journal/content/`, or copy the existing file and choose a unique lowercase, hyphenated `slug`.
2. Set `title`, optional `title_break_after`, `description`, and `metadata`. Use `materials_layout: "paired"` for two documents side by side on wide screens (stacked below 1024px). Leave unknown information blank; blank description/metadata fields are omitted.
3. Edit `sections` in reading order. Supported types:
   - `embed`: `heading`, accessible iframe `title`, `src`, and optional `link` to open the original.
   - `text`: optional `heading` and a `paragraphs` array of plain text.
   - `image`: optional `heading`, `src`, `alt`, and optional `caption`.
   - `link`: optional `heading`, `href`, and `text`.
4. Run `python scripts/build-journal.py` from the repository root. The script uses only Python's standard library and generates `journal/<slug>/index.html`.
5. Commit both the JSON and generated HTML. Add a relative homepage card link to `journal/<slug>/` when ready.

The shared layout is `detail-template.html`; all detail-page design lives in `detail.css`. Homepage CSS and JavaScript are not loaded on detail pages. Thus the homepage stays light, and detail pages retain native browser cursor behavior with no music-note trail.

Relative links support both GitHub Pages' `/joline-tran/` project prefix and a domain-root deployment. Return links go to `../../#projects`.

The literacy project includes the supplied summary, date, and authors, with paired Paper and Presentation previews. Its two Drive preview URLs come directly from the supplied materials. Drive sharing permissions still determine who can view the documents; each embed has an “Open original” link as an alternative to the embedded viewer.

Google Drive controls the cursor and appearance inside its cross-origin preview frames.
