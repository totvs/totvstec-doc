import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../docs/tlpp/rest/metadados');

function fix(file) {
  let text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  if (lines[0] !== '---') return;

  const closeIdx = lines.findIndex((l, i) => i > 0 && l === '---');
  if (closeIdx === -1) {
    const sp = lines.find((l) => l.startsWith('sidebar_position:'));
    const title = lines.find((l) => l.startsWith('title:'));
    const bodyStart = lines.findIndex(
      (l, i) => i > 0 && (l.startsWith('#') || l.startsWith('import ') || l.startsWith('|')),
    );
    if (bodyStart === -1) return;
    const meta = [];
    if (title) meta.push(title);
    if (sp) meta.push(sp);
    meta.push('displayed_sidebar: restSidebar');
    const body = lines.slice(bodyStart).join('\n');
    text = `---\n${meta.join('\n')}\n---\n\n${body}`;
    fs.writeFileSync(file, text.endsWith('\n') ? text : text + '\n');
    return;
  }

  if (!text.includes('displayed_sidebar:')) {
    const insertAt = closeIdx;
    lines.splice(insertAt, 0, 'displayed_sidebar: restSidebar');
    fs.writeFileSync(file, lines.join('\n'));
  }
}

for (const f of fs.readdirSync(dir, {recursive: true})) {
  if (String(f).endsWith('.mdx')) fix(path.join(dir, f));
}
console.log('rest-doc frontmatter repaired');
