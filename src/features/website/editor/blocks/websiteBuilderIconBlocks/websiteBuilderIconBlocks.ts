import type { Editor } from 'grapesjs';

/** Stroke icons (24×24) for library blocks — `currentColor` for theming in the builder. */
function wbStrokeSvg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

function iconBlockHtml(slug: string, accessibleName: string, svgInner: string): string {
  const esc = accessibleName.replace(/"/g, '&quot;');
  return `<div class="wb-add-el wb-icon-block" data-wb-icon="${slug}" aria-label="${esc}">${wbStrokeSvg(svgInner)}</div>`;
}

const ICON_PATHS: Record<string, string> = {
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1-1.16-2.89-2.5-4 0 2.5-2 4.5-2 8a5 5 0 0 0 9.33 2"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'map-pin':
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="none"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C7 11.1 6 13 6 15a7 7 0 0 0 7 7z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  music:
    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="none"/><circle cx="18" cy="16" r="3" fill="none"/>',
  'bar-chart': '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  target:
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="none"/><circle cx="12" cy="12" r="2" fill="none"/>',
  award: '<circle cx="12" cy="8" r="6" fill="none"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  dumbbell:
    '<line x1="7" y1="12" x2="17" y2="12"/><rect x="4" y="9" width="4" height="6" rx="1"/><rect x="16" y="9" width="4" height="6" rx="1"/>',
  'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-down': '<path d="m19 12-7 7-7-7"/><path d="M12 5v14"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'file-text':
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'share-2':
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  'trash-2':
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M9 2h6"/><path d="M12 9v4l2 2"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'link-2':
    '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/>',
};

const ICON_LABELS: Record<string, string> = {
  activity: 'Pulse / activity',
  heart: 'Heart / wellness',
  flame: 'Flame / intensity',
  zap: 'Lightning / energy',
  clock: 'Clock / hours',
  'map-pin': 'Map pin / location',
  phone: 'Phone / call',
  mail: 'Mail / email',
  calendar: 'Calendar / booking',
  users: 'Users / group class',
  trophy: 'Trophy / win',
  star: 'Star / rating',
  'check-circle': 'Check circle / done',
  droplet: 'Droplet / hydration',
  shield: 'Shield / trust',
  'message-circle': 'Message / chat',
  'arrow-right': 'Arrow right / next',
  music: 'Music / playlist',
  'bar-chart': 'Bar chart / stats',
  target: 'Target / goals',
  award: 'Award / badge',
  sparkles: 'Sparkles / premium',
  dumbbell: 'Dumbbell / strength',
  'user-round': 'User / coach',
  'arrow-up': 'Arrow up',
  'arrow-down': 'Arrow down',
  'arrow-left': 'Arrow left',
  'chevron-up': 'Chevron up',
  'chevron-down': 'Chevron down',
  'chevron-left': 'Chevron left',
  'chevron-right': 'Chevron right',
  menu: 'Menu',
  x: 'Close',
  plus: 'Plus',
  minus: 'Minus',
  check: 'Check',
  search: 'Search',
  settings: 'Settings',
  home: 'Home',
  'file-text': 'File text',
  'share-2': 'Share',
  download: 'Download',
  upload: 'Upload',
  pencil: 'Edit',
  'trash-2': 'Delete',
  filter: 'Filter',
  'log-out': 'Logout',
  timer: 'Timer',
  image: 'Image',
  'link-2': 'Link',
  sun: 'Sun',
  cloud: 'Cloud',
};

export type IconLibrarySubgroup =
  | 'actions'
  | 'arrows'
  | 'interface'
  | 'communication'
  | 'time'
  | 'media'
  | 'files'
  | 'social'
  | 'weather';

export const ICON_LIBRARY_SUBGROUP_FILTERS: { id: 'all' | IconLibrarySubgroup; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'actions', label: 'Actions' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'interface', label: 'Interface' },
  { id: 'communication', label: 'Communication' },
  { id: 'time', label: 'Time' },
  { id: 'media', label: 'Media' },
  { id: 'files', label: 'Files' },
  { id: 'social', label: 'Social' },
  { id: 'weather', label: 'Weather' },
];

const ICON_SLUG_SUBGROUP: Record<string, IconLibrarySubgroup> = {
  activity: 'actions',
  heart: 'actions',
  flame: 'actions',
  zap: 'actions',
  dumbbell: 'actions',
  trophy: 'actions',
  star: 'actions',
  award: 'actions',
  target: 'actions',
  sparkles: 'actions',
  'arrow-right': 'arrows',
  'arrow-up': 'arrows',
  'arrow-down': 'arrows',
  'arrow-left': 'arrows',
  'chevron-up': 'arrows',
  'chevron-down': 'arrows',
  'chevron-left': 'arrows',
  'chevron-right': 'arrows',
  menu: 'interface',
  x: 'interface',
  plus: 'interface',
  minus: 'interface',
  check: 'interface',
  search: 'interface',
  settings: 'interface',
  home: 'interface',
  filter: 'interface',
  pencil: 'interface',
  'trash-2': 'interface',
  download: 'interface',
  upload: 'interface',
  'share-2': 'interface',
  'log-out': 'interface',
  users: 'interface',
  'user-round': 'interface',
  'check-circle': 'interface',
  shield: 'interface',
  'map-pin': 'communication',
  phone: 'communication',
  mail: 'communication',
  'message-circle': 'communication',
  clock: 'time',
  calendar: 'time',
  timer: 'time',
  music: 'media',
  'bar-chart': 'media',
  image: 'media',
  'file-text': 'files',
  'link-2': 'social',
  droplet: 'weather',
  sun: 'weather',
  cloud: 'weather',
};

const ICON_CARD_TITLES: Record<string, string> = {
  activity: 'Activity',
  heart: 'Heart',
  flame: 'Flame',
  zap: 'Lightning',
  clock: 'Clock',
  'map-pin': 'Map pin',
  phone: 'Phone',
  mail: 'Mail',
  calendar: 'Calendar',
  users: 'Users',
  trophy: 'Trophy',
  star: 'Star',
  'check-circle': 'Check circle',
  droplet: 'Droplet',
  shield: 'Shield',
  'message-circle': 'Message',
  'arrow-right': 'Arrow right',
  music: 'Music',
  'bar-chart': 'Chart',
  target: 'Target',
  award: 'Medal',
  sparkles: 'Sparkles',
  dumbbell: 'Dumbbell',
  'user-round': 'User',
  'arrow-up': 'Arrow up',
  'arrow-down': 'Arrow down',
  'arrow-left': 'Arrow left',
  'chevron-up': 'Chevron up',
  'chevron-down': 'Chevron down',
  'chevron-left': 'Chevron left',
  'chevron-right': 'Chevron right',
  menu: 'Menu',
  x: 'Close',
  plus: 'Plus',
  minus: 'Minus',
  check: 'Check',
  search: 'Search',
  settings: 'Settings',
  home: 'Home',
  'file-text': 'File',
  'share-2': 'Share',
  download: 'Download',
  upload: 'Upload',
  pencil: 'Edit',
  'trash-2': 'Delete',
  filter: 'Filter',
  'log-out': 'Logout',
  timer: 'Timer',
  image: 'Image',
  'link-2': 'Link',
  sun: 'Sun',
  cloud: 'Cloud',
};

export function iconLibrarySvgMarkup(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

export type IconLibraryItem = {
  slug: string;
  blockId: string;
  cardTitle: string;
  subgroup: IconLibrarySubgroup;
  svgInner: string;
};

export function getIconLibraryItems(): IconLibraryItem[] {
  const slugs = Object.keys(ICON_PATHS) as (keyof typeof ICON_PATHS)[];
  return slugs.map((slug) => {
    const paths = ICON_PATHS[slug];
    return {
      slug,
      blockId: `wb-icon-${slug}`,
      cardTitle: ICON_CARD_TITLES[slug] ?? String(slug).replace(/-/g, ' '),
      subgroup: ICON_SLUG_SUBGROUP[slug] ?? 'interface',
      svgInner: paths ?? '',
    };
  });
}

const ICON_BLOCK_SLUGS = Object.keys(ICON_PATHS) as (keyof typeof ICON_PATHS)[];

export const ICON_COMPONENT_CATALOG_ENTRIES = ICON_BLOCK_SLUGS.map((slug) => ({
  blockId: `wb-icon-${slug}`,
  title: `Icon · ${ICON_LABELS[slug] ?? slug}`,
  description: 'Inline SVG — resize or change color via Styles; duplicate anywhere on the page.',
  filter: 'icons',
  preview: 'content',
}));

function iconKitCell(slug: string): string {
  const label = ICON_LABELS[slug] ?? slug;
  return iconBlockHtml(slug, label, ICON_PATHS[slug] ?? '');
}

/** One section with a grid of every icon — delete cells you do not need. */
const ICONS_GRID_KIT_HTML = `
<section class="wb-add-el component-card wb-icons-kit" style="max-width:52rem; margin:0 auto;">
  <span class="component-eyebrow">Icon library</span>
  <h3 class="component-title" style="font-size:1.12rem;">Starter pack</h3>
  <p class="component-desc" style="margin-bottom:0.85rem;">Inline SVGs you can copy, resize, or recolor. Remove icons you do not need.</p>
  <div class="wb-icons-kit__grid wb-add-el">
    ${ICON_BLOCK_SLUGS.map((s) => iconKitCell(s)).join('')}
  </div>
</section>`;

export const ICON_GRID_KIT_CATALOG_ENTRY = {
  blockId: 'wb-icons-grid-kit',
  title: 'Icons · all-in-one grid',
  description: 'Every library icon in one card — delete extras or pull icons into other sections.',
  filter: 'icons',
  preview: 'content',
};

export function registerIconBlocks(editor: Editor): void {
  const bm = editor.BlockManager;
  for (const slug of ICON_BLOCK_SLUGS) {
    const paths = ICON_PATHS[slug];
    if (!paths) continue;
    const label = ICON_LABELS[slug] ?? slug;
    bm.add(`wb-icon-${slug}`, {
      label: `Icon · ${label}`,
      category: 'Icons',
      content: iconBlockHtml(slug, label, paths),
    });
  }
  bm.add('wb-icons-grid-kit', {
    label: 'Icons · All-in-one grid',
    category: 'Icons',
    content: ICONS_GRID_KIT_HTML,
  });
}
