import fs from 'node:fs';
import path from 'node:path';

const TEMPLATES_DIR = path.join(process.cwd(), 'src/assets/templates');

/** Template CSS followed by shared Pro typography (Playfair + Inter). */
export function loadProTemplateCss(filename: string): string {
  const main = fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');
  const typography = fs.readFileSync(path.join(TEMPLATES_DIR, 'pro-templates-typography.css'), 'utf8');
  return `${main}\n${typography}`;
}
