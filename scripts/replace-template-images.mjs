/**
 * One-off: replace GrapesJS CDN image URLs in template HTML/CSS with Unsplash gym photos.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../src/assets/templates');

/** Stable Unsplash gym / fitness photos (hotlink-friendly). */
const GYM_WIDE = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0c684c217bd?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1550345332-9099d987b04d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517963879466-0611b4f8a4a7?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1583454156664-23a94d8b6862?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1530827906684-8e9a4d2e0b0e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1400&q=80',
];

const GYM_AVATAR = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80',
];

const CDN_RE = /https:\/\/cdn\.grapesjs\.com\/workspaces\/[^")\s]+/g;

function replaceContent(text) {
  let i = 0;
  let a = 0;
  return text.replace(CDN_RE, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('logo') && lower.endsWith('.webp')) {
      return match;
    }
    const isAvatar =
      lower.includes('avatar') ||
      lower.includes('testimony') ||
      lower.includes('testimonial');
    if (isAvatar) {
      const url = GYM_AVATAR[a % GYM_AVATAR.length];
      a += 1;
      return url;
    }
    const url = GYM_WIDE[i % GYM_WIDE.length];
    i += 1;
    return url;
  });
}

const files = [
  'autopilot.html',
  'fitcore.html',
  'sole.html',
  'sonicflow.html',
  'vital.html',
  'zen.html',
  'autopilot.css',
  'fitcore.css',
  'sole.css',
  'sonicflow.css',
  'vital.css',
  'zen.css',
];

for (const name of files) {
  const p = path.join(templatesDir, name);
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, replaceContent(text));
  console.log('updated', name);
}
