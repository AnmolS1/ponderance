/**
 * rehype-sidenotes
 *
 * Transforms GFM footnotes (already emitted by the markdown pipeline as a
 * trailing `<section class="footnotes">`) into inline gutter sidenotes placed
 * at each reference point. The `.sidenote` element is styled (in the note
 * layout) to float into the right margin on wide screens and fall inline on
 * mobile — the "marginalia" look, sourced from ordinary `[^name]` footnotes.
 *
 * No external deps: a manual hast walk keeps the build surface small.
 */

function isFootnotesSection(node) {
  if (node.type !== 'element' || node.tagName !== 'section') return false;
  const p = node.properties || {};
  const cls = Array.isArray(p.className) ? p.className : [];
  return p.dataFootnotes !== undefined || cls.includes('footnotes');
}

function hasFlag(node, flag) {
  return node.type === 'element' && node.properties && node.properties[flag] !== undefined;
}

function textOf(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

/** Deep-clone hast children while dropping the GFM back-reference anchors. */
function cleanDefChildren(children) {
  const out = [];
  for (const child of children) {
    if (hasFlag(child, 'dataFootnoteBackref')) continue;
    const clone = structuredClone(child);
    if (clone.children) clone.children = cleanDefChildren(clone.children);
    out.push(clone);
  }
  return out;
}

/** Collect { id -> contentChildren } from the footnotes <ol>. */
function collectDefs(section, defs) {
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'li' && node.properties && node.properties.id) {
      let content = cleanDefChildren(node.children);
      // Unwrap a single trailing <p> so the note reads inline.
      const els = content.filter((c) => c.type === 'element' || (c.type === 'text' && c.value.trim()));
      if (els.length === 1 && els[0].type === 'element' && els[0].tagName === 'p') {
        content = els[0].children;
      }
      defs.set(node.properties.id, content);
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(section);
}

/** Find the <a data-footnote-ref> inside a <sup>; return its href + label. */
function findRef(sup) {
  let found = null;
  const walk = (node) => {
    if (found) return;
    if (hasFlag(node, 'dataFootnoteRef') && node.tagName === 'a') {
      found = { href: String(node.properties.href || ''), label: textOf(node).trim() };
      return;
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(sup);
  return found;
}

function marker(num) {
  return {
    type: 'element',
    tagName: 'sup',
    properties: { className: ['sidenote-ref'] },
    children: [{ type: 'text', value: num }],
  };
}

function sidenote(num, content) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['sidenote'] },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sidenote-label'] },
        children: [{ type: 'text', value: num }],
      },
      { type: 'text', value: ' ' },
      ...content,
    ],
  };
}

export default function rehypeSidenotes() {
  return (tree) => {
    const defs = new Map();

    // Pass 1: harvest definitions and remove the footnotes section.
    const harvest = (node) => {
      if (!node.children) return;
      const kept = [];
      for (const child of node.children) {
        if (isFootnotesSection(child)) {
          collectDefs(child, defs);
        } else {
          kept.push(child);
        }
      }
      node.children = kept;
      node.children.forEach(harvest);
    };
    harvest(tree);

    if (defs.size === 0) return;

    // Pass 2: replace each <sup> reference with an inline marker + sidenote.
    const inject = (node) => {
      if (!node.children) return;
      const out = [];
      for (const child of node.children) {
        if (child.type === 'element') inject(child);
        const ref = child.type === 'element' && child.tagName === 'sup' ? findRef(child) : null;
        if (ref) {
          const id = ref.href.replace(/^#/, '');
          const content = defs.get(id);
          out.push(marker(ref.label));
          if (content) out.push(sidenote(ref.label, content));
        } else {
          out.push(child);
        }
      }
      node.children = out;
    };
    inject(tree);
  };
}
