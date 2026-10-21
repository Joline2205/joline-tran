#!/usr/bin/env python3
"""Generate deployable journal pages using only Python's standard library."""
from html import escape
import json
from pathlib import Path
import re
from string import Template
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
JOURNAL = ROOT / 'journal'


def safe_url(value):
    """Allow normal site links and HTTPS media, never executable URL schemes."""
    value = str(value)
    parsed = urlsplit(value)
    if parsed.scheme not in ('', 'https') or value.startswith('//'):
        raise ValueError(f'Expected a relative or HTTPS URL: {value!r}')
    return escape(value, quote=True)


def render_section(section, index):
    kind = section['type']
    heading = section.get('heading', '')
    heading_id = f'material-{index}'
    label = f'<h2 id="{heading_id}">{escape(heading)}</h2>' if heading else ''
    contents = ''
    if kind == 'embed':
        title = escape(section['title'], quote=True)
        source = safe_url(section['src'])
        link = section.get('link')
        open_link = (f'<a class="material-link" href="{safe_url(link)}" target="_blank" '
                     f'rel="noopener noreferrer">Open original</a>') if link else ''
        contents = (f'<div class="material-heading">{label}{open_link}</div>\n'
                    f'          <div class="document-viewer"><iframe src="{source}" title="{title}" '
                    'width="100%" height="800" loading="lazy" allowfullscreen></iframe></div>')
    elif kind == 'text':
        paragraphs = section.get('paragraphs', [])
        contents = label + ''.join(f'<p>{escape(p)}</p>' for p in paragraphs)
    elif kind == 'image':
        contents = label + (f'<figure><img class="content-image" src="{safe_url(section["src"])}" '
                            f'alt="{escape(section["alt"], quote=True)}" loading="lazy">')
        if section.get('caption'):
            contents += f'<figcaption>{escape(section["caption"])}</figcaption>'
        contents += '</figure>'
    elif kind == 'link':
        contents = label + f'<p><a href="{safe_url(section["href"])}">{escape(section["text"])}</a></p>'
    else:
        raise ValueError(f'Unknown section type: {kind!r}')
    label_attribute = f' aria-labelledby="{heading_id}"' if heading else ''
    return f'        <section class="material material-{kind}"{label_attribute}>\n          {contents}\n        </section>'


def build():
    template = Template((JOURNAL / 'detail-template.html').read_text())
    for path in sorted((JOURNAL / 'content').glob('*.json')):
        data = json.loads(path.read_text())
        slug = data['slug']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
            raise ValueError(f'Invalid journal slug: {slug!r}')
        title = data['title']
        heading = escape(title)
        break_after = data.get('title_break_after')
        if break_after and title.startswith(break_after + ' '):
            heading = escape(break_after) + '<br>' + escape(title[len(break_after) + 1:])
        description = data.get('description', '').strip()
        metadata = data.get('metadata', [])
        page = template.substitute(
            title=escape(title), heading=heading,
            description_meta=f'<meta name="description" content="{escape(description, quote=True)}">' if description else '',
            description_markup=f'<p class="detail-description">{escape(description)}</p>' if description else '',
            metadata_markup='<ul class="detail-metadata">' + ''.join(f'<li>{escape(item)}</li>' for item in metadata) + '</ul>' if metadata else '',
            sections='\n'.join(render_section(section, i) for i, section in enumerate(data['sections'], 1)),
        )
        destination = JOURNAL / slug / 'index.html'
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(page)
        print(destination.relative_to(ROOT))


if __name__ == '__main__':
    build()
