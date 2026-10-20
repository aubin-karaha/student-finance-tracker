import { esc } from './ui.js';
export function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null; 
    } catch {
        return null;
    }
}

//Making it safe against HTML injection

export function highlight(text, re) {
    text = String(text); if (!re) return esc(text);
    const g = new RegExp(re.source, re.flags.replace('g', '') + 'g');
    let out = '', i = 0;

    for (const m of text.matchAll(g)) {
        if (!m[0]) continue;
        out += esc(text.slice(i, m.index)) + '<mark>' + esc(m[0]) + '</mark>'; i = m.index + m[0].length;
    }

    return out + esc(text.slice(i));
}