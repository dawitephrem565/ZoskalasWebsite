const esc = (s = '') =>
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

const val = (s = '') => String(s).trim();

export function normUrl(u = '') {
  const s = val(u);
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function fold(line) {
  if (line.length <= 74) return line;
  let out = line.slice(0, 74);
  let i = 74;
  while (i < line.length) {
    out += '\r\n ' + line.slice(i, i + 73);
    i += 73;
  }
  return out;
}

const social = (type, url) => {
  let s = val(url);
  if (!s) return '';
  if (s.startsWith('@')) s = type === 'tiktok' ? `tiktok.com/${s}` : s.slice(1);
  if (!/^https?:\/\//i.test(s) && !s.includes('.')) s = `${type}.com/${s}`;
  return `X-SOCIALPROFILE;TYPE=${type}:${normUrl(s)}`;
};

export function buildVcard(d = {}) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const name = val(d.name);
  if (name) {
    lines.push(`FN:${esc(name)}`);
    lines.push(`N:;${esc(name)};;;`);
  }
  lines.push('ORG:Zoskales Diamonds');
  if (val(d.role)) lines.push(`TITLE:${esc(val(d.role))}`);
  if (val(d.phone)) lines.push(`TEL;TYPE=CELL,VOICE:${val(d.phone)}`);
  if (val(d.location)) lines.push(`ADR;TYPE=WORK:;;${esc(val(d.location))};;;;`);
  if (val(d.website)) lines.push(`URL:${normUrl(d.website)}`);
  if (val(d.email)) lines.push(`EMAIL;TYPE=INTERNET:${val(d.email)}`);
  for (const line of [
    social('instagram', d.instagram),
    social('tiktok', d.tiktok),
    social('facebook', d.facebook),
  ]) {
    if (line) lines.push(line);
  }
  lines.push('END:VCARD');
  return lines.map(fold).join('\r\n') + '\r\n';
}
