import type { Editor } from 'grapesjs';
import type { ComponentCatalogEntry, ComponentLibraryPreviewKind } from './websiteBuilderComponentCatalog';
import { DS_ICO } from './websiteBuilderDesignSystemIcons';

/** Visual design sets for full-page fitness landings (POWER … CYBERFIT). */
export type DesignSystemSetId =
  | 'power'
  | 'elite'
  | 'focus'
  | 'energy'
  | 'prime'
  | 'sporty'
  | 'cyberfit'
  | 'glassmorph'
  | 'junglebeast'
  | 'liquidfit'
  | 'vintageiron';

type DesignSetId = DesignSystemSetId;

export const DESIGN_SYSTEM_SETS: { id: DesignSetId; category: string; label: string }[] = [
  { id: 'power', category: 'Design · POWER', label: 'POWER' },
  { id: 'elite', category: 'Design · ELITE', label: 'ELITE' },
  { id: 'focus', category: 'Design · FOCUS', label: 'FOCUS' },
  { id: 'energy', category: 'Design · ENERGY', label: 'ENERGY' },
  { id: 'prime', category: 'Design · PRIME', label: 'PRIME' },
  { id: 'sporty', category: 'Design · SPORTY', label: 'SPORTY' },
  { id: 'cyberfit', category: 'Design · CYBERFIT', label: 'CYBERFIT' },
  { id: 'glassmorph', category: 'Design · GLASSMORPH', label: 'GLASSMORPH' },
  { id: 'junglebeast', category: 'Design · JUNGLE BEAST', label: 'JUNGLE BEAST' },
  { id: 'liquidfit', category: 'Design · LIQUIDFIT', label: 'LIQUIDFIT' },
  { id: 'vintageiron', category: 'Design · VINTAGE IRON', label: 'VINTAGE IRON' },
];

/** Extracted from template stack (public/wb-ds/vintage-iron). */
const WB_VIN_PUB = '/wb-ds/vintage-iron';
const IMG_VIN_HERO = `${WB_VIN_PUB}/slice-hero.jpg`;
const IMG_VIN_ABOUT = `${WB_VIN_PUB}/slice-about.jpg`;
const IMG_VIN_MAP = `${WB_VIN_PUB}/slice-map.jpg`;
const IMG_VIN_FOOT = `${WB_VIN_PUB}/slice-footer.jpg`;
const IMG_VIN_GAL1 = `${WB_VIN_PUB}/gallery-tile-1.jpg`;
const IMG_VIN_GAL2 = `${WB_VIN_PUB}/gallery-tile-2.jpg`;
const IMG_VIN_GAL3 = `${WB_VIN_PUB}/gallery-tile-3.jpg`;

/** Photo slices from `template-ref.jpg` (clean asset sheet — no baked-in UI text). */
const WB_JNG_PUB = '/wb-ds/jungle-beast';
const IMG_JNG_HERO = `${WB_JNG_PUB}/slice-hero.jpg`;
const IMG_JNG_ABOUT = `${WB_JNG_PUB}/slice-about.jpg`;
const IMG_JNG_PROGRAMS = `${WB_JNG_PUB}/slice-programs.jpg`;
const IMG_JNG_PRICING = `${WB_JNG_PUB}/slice-pricing.jpg`;
const IMG_JNG_GALLERY = `${WB_JNG_PUB}/slice-gallery.jpg`;

/** LIQUIDFIT — fluid gradient template (reference + hi-res photos). */
const WB_LIQ_PUB = '/wb-ds/liquidfit';
const IMG_LIQ_HERO =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=88';
const IMG_LIQ_ABOUT =
  'https://images.unsplash.com/photo-1583454110551-21f2fa2cfe61?auto=format&fit=crop&w=1200&q=86';
const IMG_LIQ_G1 =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=960&q=86';
const IMG_LIQ_G2 =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=960&q=86';
const IMG_LIQ_G3 =
  'https://images.unsplash.com/photo-1593079831263-1a2839b31bfb?auto=format&fit=crop&w=960&q=86';

/** Max tier strip next to nav brand (gradient pill + crown) — all design-system navs. */
const DS_MAX_BADGE_ROW = `<span class="wb-sys-ds-badges" aria-hidden="true"><span class="wb-sys-tag wb-sys-tag--max">Max</span><span class="wb-sys-tag-crown">${DS_ICO.crownNav}</span></span>`;

const IMG_HERO =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=86';
const IMG_G1 =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=960&auto=format&fit=crop&q=86';
const IMG_G2 =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=960&auto=format&fit=crop&q=86';
/** Equipment / training floor — distinct from G1/G2; stable Unsplash asset. */
const IMG_G3 =
  'https://images.unsplash.com/photo-1574689046283-16f3b6db14db?w=960&auto=format&fit=crop&q=86';
const IMG_G4 =
  'https://images.unsplash.com/photo-1593079831263-1a2839b31bfb?w=960&auto=format&fit=crop&q=86';
/** Moody training hero for FOCUS split layout */
const IMG_HERO_FOCUS =
  'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=1600&auto=format&fit=crop&q=88';
/** High-contrast training hero for PRIME split layout */
const IMG_HERO_PRIME =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT_PRIME =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop&q=86';
/** Bright lifestyle hero for ELITE split layout */
const IMG_HERO_ELITE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT_ELITE =
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&auto=format&fit=crop&q=86';
/** High-energy hero (towel / post-session) for ENERGY split layout */
const IMG_HERO_ENERGY =
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT_ENERGY =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=86';
/** Battle ropes / conditioning hero for SPORTY split layout */
const IMG_HERO_SPORTY =
  'https://images.unsplash.com/photo-1593079831263-1a2839b31bfb?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT_SPORTY =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop&q=86';
/** CYBERFIT — dark gym floor + neon energy (reliable Unsplash delivery) */
const IMG_HERO_CYBER =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=2000&q=88';
const IMG_ABOUT_CYBER =
  'https://images.unsplash.com/photo-1581009146145-bd50c405ffea?auto=format&fit=crop&w=1600&q=86';
/** GLASSMORPH — cool daylight + blue mood visuals */
const IMG_HERO_GLASS =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT_GLASS =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop&q=88';

/** Named wrapper so the layer tree shows Nav, Hero, About, etc. */
function dsSection(layerName: string, innerHtml: string): string {
  return `<div class="wb-ds-root wb-add-el wb-fade-in" data-gjs-name="${layerName}">${innerHtml.trim()}</div>`;
}

function navHtml(set: DesignSetId): string {
  if (set === 'power') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--power wb-sys-pwr-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--gympower" aria-label="Gym Power home">
            <span class="wb-sys-brand__mark">${DS_ICO.bolt}</span><span class="wb-sys-brand__gym">GYM</span><span class="wb-sys-brand__pwr">POWER</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'focus') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--focus wb-sys-foc-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--focusgym" aria-label="Focus Gym home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--foc">${DS_ICO.focusMark}</span><span class="wb-sys-brand__foc">FOCUS</span><span class="wb-sys-brand__gymtag">GYM</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'prime') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--prime wb-sys-prm-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--primefit" aria-label="Prime Fitness home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--prm">${DS_ICO.primeBolt}</span><span class="wb-sys-brand__prm">PRIME</span><span class="wb-sys-brand__fitness">FITNESS</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'elite') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--elite wb-sys-eli-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--elitefit" aria-label="Elite Fitness home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--eli">${DS_ICO.eliteShield}</span><span class="wb-sys-brand__eli">ELITE</span><span class="wb-sys-brand__fit">FITNESS</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'energy') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--energy wb-sys-eng-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--energyfit" aria-label="Energy Fit home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--en">${DS_ICO.energyShield}</span><span class="wb-sys-brand__en">ENERGY</span><span class="wb-sys-brand__fit">FIT</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'sporty') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--sporty wb-sys-spo-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--sportygym" aria-label="Sporty Gym home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--spo">${DS_ICO.sportyMark}</span><span class="wb-sys-brand__spo">SPORTY</span><span class="wb-sys-brand__gymnam">Gym</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'cyberfit') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--cyberfit wb-sys-cyb-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--cyberfit" aria-label="Neon District home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--cyb">${DS_ICO.cyberMark}</span><span class="wb-sys-brand__cyb">NEON</span><span class="wb-sys-brand__fitneon">DISTRICT</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'glassmorph') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--glassmorph wb-sys-gls-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--glassmorph" aria-label="GLASSMORPH home">
            <span class="wb-sys-brand__gls">08. GLASSMORPH</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'vintageiron') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--vintageiron wb-sys-vin-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--vintageiron" aria-label="Vintage Iron home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--vin">${DS_ICO.vintageMark}</span><span class="wb-sys-brand__vin">VINTAGE</span><span class="wb-sys-brand__iron">IRON</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn wb-sys-btn--vin-bronze" data-wb-open="join">Join now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'liquidfit') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--liquidfit wb-sys-liq-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--liquidfit" aria-label="Liquidfit home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--liq">${DS_ICO.liquidMark}</span><span class="wb-sys-brand__liq">LIQUID</span><span class="wb-sys-brand__fit">FIT</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn wb-sys-btn--liq-pill" data-wb-open="join">Join now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  if (set === 'junglebeast') {
    return dsSection(
      'Nav',
      `<nav class="wb-sys wb-sys-nav wb-sys--junglebeast wb-sys-jng-nav">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand wb-sys-brand--junglebeast" aria-label="Jungle Beast home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--jng">${DS_ICO.jungleMark}</span><span class="wb-sys-brand__jng">JUNGLE</span><span class="wb-sys-brand__beast">BEAST</span>
          </a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn wb-sys-btn--jng-pill" data-wb-open="join">Join now</button>
          </div>
        </div>
      </nav>`,
    );
  }
  return dsSection(
    'Nav',
    `<nav class="wb-sys wb-sys-nav wb-sys--${set}">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <div class="wb-sys-nav__brandcell">
          <a href="#" class="wb-sys-brand">APEX GYM</a>
          ${DS_MAX_BADGE_ROW}
          </div>
          <div class="wb-sys-nav__links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="wb-sys-nav__cta">
            <button type="button" class="wb-sys-btn" data-wb-open="join">Join now</button>
          </div>
        </div>
      </nav>`,
  );
}

function heroHtml(set: DesignSetId): string {
  if (set === 'power') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--power wb-sys-pwr-hero">
        <div class="wb-sys-pwr-hero__shell">
          <div class="wb-sys-pwr-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Train with purpose</span>
            <h1 class="wb-sys-h1 wb-sys-h1--impact wb-ds-reveal wb-ds-reveal--d2">Build strength that lasts</h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Premium iron, coaches who care about form, and programming that respects recovery—built for members who train like it matters.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-pwr-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'focus') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--focus wb-sys-foc-hero">
        <div class="wb-sys-foc-hero__shell">
          <div class="wb-sys-foc-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Discipline in every session</span>
            <h1 class="wb-sys-h1 wb-sys-h1--impact wb-ds-reveal wb-ds-reveal--d2">Focus commit succeed.</h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Disciplined today, strength tomorrow—coaching, programming, and a floor built for members who train with intent.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-foc-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO_FOCUS}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'prime') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--prime wb-sys-prm-hero">
        <div class="wb-sys-prm-hero__shell">
          <div class="wb-sys-prm-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Train at a higher level</span>
            <h1 class="wb-sys-h1 wb-sys-h1--impact wb-ds-reveal wb-ds-reveal--d2">Better stronger together</h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Join our community that pushes you every day—premium coaching, intelligent programming, and a floor that feels electric.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-prm-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO_PRIME}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'elite') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--elite wb-sys-eli-hero">
        <div class="wb-sys-eli-hero__shell">
          <div class="wb-sys-eli-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Performance lifestyle</span>
            <h1 class="wb-sys-h1 wb-sys-h1--impact wb-ds-reveal wb-ds-reveal--d2">Train transform achieve</h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Take your training to the next level—smart programming, world-class equipment, and coaches who help you stack wins week after week.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-eli-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO_ELITE}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'energy') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--energy wb-sys-eng-hero">
        <div class="wb-sys-eng-hero__shell">
          <div class="wb-sys-eng-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Train with intensity</span>
            <h1 class="wb-sys-h1 wb-sys-h1--eng-display wb-ds-reveal wb-ds-reveal--d2">
              <span class="wb-sys-eng-hero-stack" aria-label="Energy motivation results">
                <span class="wb-sys-eng-hero-row">Energy</span>
                <span class="wb-sys-eng-hero-row">Motivation</span>
                <span class="wb-sys-eng-hero-row wb-sys-eng-hero-row--accent">Results</span>
              </span>
            </h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Feel the power. Live the energy. Be your best—coaching, classes, and a floor that keeps every session electric.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-eng-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO_ENERGY}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'sporty') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--sporty wb-sys-spo-hero">
        <div class="wb-sys-spo-hero__shell">
          <div class="wb-sys-spo-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Welcome in</span>
            <h1 class="wb-sys-h1 wb-sys-h1--spo-display wb-ds-reveal wb-ds-reveal--d2">Start your fitness journey</h1>
            <p class="wb-sys-lead wb-ds-reveal wb-ds-reveal--d3">Train with purpose in a bright, modern space—coached sessions, open gym blocks, and programming that meets you where you are.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Explore Programs</a>
            </div>
          </div>
          <div class="wb-sys-spo-hero__imgCol" aria-hidden="true">
            <img src="${IMG_HERO_SPORTY}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'cyberfit') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--cyberfit wb-sys-cyb-hero">
        <div class="wb-sys-cyb-hero__toprail" aria-hidden="true"></div>
        <div class="wb-sys-cyb-hero__stage">
          <div class="wb-sys-cyb-hero__media wb-sys-cyb-imgfx" aria-hidden="true">
            <img src="${IMG_HERO_CYBER}" alt="Athletes training under neon gym lighting" width="1600" height="900" loading="eager" decoding="async" referrerpolicy="no-referrer" />
          </div>
          <div class="wb-sys-cyb-hero__veil"></div>
          <div class="wb-sys-cyb-hero__content">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Neon district · elite training</span>
            <h1 class="wb-sys-h1 wb-sys-h1--cyb wb-ds-reveal wb-ds-reveal--d2">Train beyond limits</h1>
            <p class="wb-sys-lead wb-sys-lead--cyb wb-ds-reveal wb-ds-reveal--d3">High-voltage coaching, biometric-aware programming, and a floor lit for PRs—where discipline meets synthwave energy.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">View Programs</a>
            </div>
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'vintageiron') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--vintageiron wb-sys-vin-hero">
        <div class="wb-sys-vin-hero__frame">
          <div class="wb-sys-vin-hero__media" aria-hidden="true">
            <img src="${IMG_VIN_HERO}" alt="" width="1200" height="700" loading="eager" decoding="async" />
          </div>
          <div class="wb-sys-vin-hero__veil" aria-hidden="true"></div>
          <div class="wb-sys-vin-hero__copy">
            <span class="wb-sys-vin-hero__ico" aria-hidden="true">${DS_ICO.vintageMark}</span>
            <h1 class="wb-sys-h1 wb-sys-h1--vin">Old school iron. <span class="wb-sys-h1__vin-accent">Real results.</span></h1>
            <p class="wb-sys-lead wb-sys-lead--vin">Build on discipline. Backed by legacy.</p>
            <div class="wb-sys-actions">
              <button type="button" class="wb-sys-btn wb-sys-btn--vin-bronze" data-wb-open="join">Join now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--vin-outline">Our programs</a>
            </div>
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'liquidfit') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--liquidfit wb-sys-liq-hero">
        <div class="wb-sys-liq-hero__bg" aria-hidden="true"></div>
        <div class="wb-sys-liq-themebar">
          <span class="wb-sys-liq-themebar__id">2. LIQUID FLOW</span>
          <span class="wb-sys-liq-themebar__meta">Fluid · gradient · dynamic</span>
          <span class="wb-sys-liq-themebar__swatches" aria-hidden="true">
            <i style="--liq-swatch:#38bdf8"></i><i style="--liq-swatch:#6366f1"></i><i style="--liq-swatch:#a855f7"></i><i style="--liq-swatch:#f0f9ff"></i>
          </span>
        </div>
        <div class="wb-sys-liq-hero__wave wb-sys-liq-hero__wave--top" aria-hidden="true"></div>
        <div class="wb-sys-liq-hero__shell">
          <div class="wb-sys-liq-hero__copy">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Fluid · gradient · dynamic</span>
            <h1 class="wb-sys-h1 wb-sys-h1--liq wb-ds-reveal wb-ds-reveal--d2">Flow into strength.</h1>
            <p class="wb-sys-lead wb-sys-lead--liq wb-ds-reveal wb-ds-reveal--d3">Move better. Feel stronger. Live healthier.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn wb-sys-btn--liq-solid" data-wb-open="join">Join now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--liq-outline">Explore programs</a>
            </div>
          </div>
          <div class="wb-sys-liq-hero__visual" aria-hidden="true">
            <div class="wb-sys-liq-blob wb-sys-liq-blob--hero">
              <img src="${IMG_LIQ_HERO}" alt="" width="720" height="900" loading="eager" decoding="async" referrerpolicy="no-referrer" />
            </div>
          </div>
        </div>
        <div class="wb-sys-liq-hero__wave wb-sys-liq-hero__wave--bottom" aria-hidden="true"></div>
      </header>`,
    );
  }
  if (set === 'junglebeast') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--junglebeast wb-sys-jng-hero">
        <div class="wb-sys-jng-hero__veil" aria-hidden="true"></div>
        <div class="wb-sys-jng-hero__stage">
          <div class="wb-sys-jng-hero__content">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Train wild · live bold</span>
            <h1 class="wb-sys-h1 wb-sys-h1--jng wb-ds-reveal wb-ds-reveal--d2">
              Unleash your <span class="wb-sys-h1__lime">inner beast.</span>
            </h1>
            <p class="wb-sys-lead wb-sys-lead--jng wb-ds-reveal wb-ds-reveal--d3">Train wild. Live bold. Stay untamed.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join the pack</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">Our programs</a>
            </div>
            <div class="wb-sys-jng-hero__stats" aria-label="Club stats">
              <div class="wb-sys-jng-hero__stat"><span class="wb-sys-jng-hero__stat-num">8+</span><span class="wb-sys-jng-hero__stat-lbl">Years</span></div>
              <div class="wb-sys-jng-hero__stat"><span class="wb-sys-jng-hero__stat-num">20+</span><span class="wb-sys-jng-hero__stat-lbl">Coaches</span></div>
              <div class="wb-sys-jng-hero__stat"><span class="wb-sys-jng-hero__stat-num">4500+</span><span class="wb-sys-jng-hero__stat-lbl">Beasts</span></div>
            </div>
          </div>
          <div class="wb-sys-jng-hero__figure" aria-hidden="true">
            <img src="${IMG_JNG_HERO}" alt="" width="485" height="300" loading="eager" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  if (set === 'glassmorph') {
    return dsSection(
      'Hero',
      `<header class="wb-sys wb-sys-hero wb-sys--glassmorph wb-sys-gls-hero">
        <div class="wb-sys-gls-themebar">
          <span class="wb-sys-gls-themebar__id">08. GLASSMORPH</span>
          <span class="wb-sys-gls-themebar__meta">Modern · transparent · blue</span>
          <span class="wb-sys-gls-themebar__swatches" aria-hidden="true">
            <i style="--gls-swatch:#dfe9ff"></i><i style="--gls-swatch:#6f8cff"></i><i style="--gls-swatch:#7dc8ff"></i><i style="--gls-swatch:#ffffff"></i>
          </span>
        </div>
        <div class="wb-sys-gls-hero__shell">
          <div class="wb-sys-gls-hero__copyCol">
            <span class="wb-sys-eyebrow wb-ds-reveal wb-ds-reveal--d1">Modern transparency</span>
            <div class="wb-sys-gls-hero__badges wb-ds-reveal wb-ds-reveal--d1">
              <span class="wb-sys-tag wb-sys-tag--premium">Premium</span>
            </div>
            <h1 class="wb-sys-h1 wb-sys-h1--gls-display wb-ds-reveal wb-ds-reveal--d2">Elevate your every move</h1>
            <p class="wb-sys-lead wb-sys-lead--gls wb-ds-reveal wb-ds-reveal--d3">A premium glass-style fitness experience with structured coaching, clear progress tracking, and calm energy built into every session.</p>
            <div class="wb-sys-actions wb-ds-reveal wb-ds-reveal--d4">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join Now</button>
              <a href="#programs" class="wb-sys-btn wb-sys-btn--ghost">View Programs</a>
            </div>
          </div>
          <div class="wb-sys-gls-hero__imgCol wb-sys-gls-imgfx" aria-hidden="true">
            <img src="${IMG_HERO_GLASS}" alt="" width="960" height="640" loading="lazy" decoding="async" />
          </div>
        </div>
      </header>`,
    );
  }
  return dsSection(
    'Hero',
    `<header class="wb-sys wb-sys-hero wb-sys--${set}">
        <div class="wb-sys-hero__grid">
          <div class="wb-sys-hero__copy">
            <span class="wb-sys-eyebrow">Train with purpose</span>
            <h1 class="wb-sys-h1 wb-sys-h1--impact">Build strength that lasts</h1>
            <p class="wb-sys-lead">Premium equipment, expert coaches, and programming built for real results—whether you are new to the floor or chasing your next PR.</p>
            <div class="wb-sys-actions">
              <button type="button" class="wb-sys-btn" data-wb-open="join">Join now</button>
              <a href="#pricing" class="wb-sys-btn wb-sys-btn--ghost">View plans</a>
            </div>
          </div>
          <div class="wb-sys-hero__media">
            <div class="wb-sys-hero__figure">
              <img src="${IMG_HERO}" alt="Athletes training in a modern gym" width="640" height="420" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </header>`,
  );
}

function aboutHtml(set: DesignSetId): string {
  if (set === 'glassmorph') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--glassmorph wb-sys-gls-about">
        <div class="wb-sys-gls-about__card">
          <div class="wb-sys-gls-about__copy">
            <span class="wb-sys-eyebrow">About us</span>
            <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">Transparent training, real results</h2>
            <p class="wb-sys-sub wb-sys-sub--gls">We combine performance programming with a clean, focused atmosphere so members can build consistency without burnout.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--gls">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">8+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">18+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">2700+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-gls-about__visual wb-sys-gls-imgfx" aria-hidden="true">
            <img src="${IMG_ABOUT_GLASS}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'power') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--power">
        <div class="wb-sys-section__head wb-sys-section__head--wide">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2">We are more than just a gym</h2>
          <p class="wb-sys-sub">A flagship floor, coaches who track your numbers, and a culture that shows up for each other—this is training with intent.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">From onboarding to periodization, every touchpoint is designed to remove friction and keep you accountable week after week.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">10+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">25+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">5000+</span>
                <span class="wb-sys-stat-lbl">Members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual" aria-hidden="true">
            <img src="${IMG_ABOUT}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'focus') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--focus">
        <div class="wb-sys-section__head wb-sys-section__head--wide wb-sys-foc-about__head">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2 wb-sys-h2--foc-kicker">Focused on you, focused on results</h2>
          <p class="wb-sys-sub">A dark-floor training culture, coaches who track progression, and programming that respects recovery—built for members who want clarity, not noise.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">From onboarding to accountability check-ins, every touchpoint is designed to keep you consistent week after week.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">8+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">20+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">4000+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual" aria-hidden="true">
            <img src="${IMG_ABOUT}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'prime') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--prime">
        <div class="wb-sys-section__head wb-sys-section__head--wide wb-sys-prm-about__head">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2 wb-sys-h2--prm-kicker">Stronger together, every day</h2>
          <p class="wb-sys-sub">Small-group energy, coaches who track your progression, and a culture that celebrates consistency as much as PRs.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">Whether you are building a base or sharpening performance, every block is designed to keep you progressing without burning out.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">11+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">28+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">5100+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual" aria-hidden="true">
            <img src="${IMG_ABOUT_PRIME}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'elite') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--elite">
        <div class="wb-sys-section__head wb-sys-section__head--wide wb-sys-eli-about__head">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eli-kicker">Elevate your fitness lifestyle</h2>
          <p class="wb-sys-sub">A bright, premium training floor with concierge-level service—where programming, recovery, and community all pull in the same direction.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">From your first session to your next milestone, we build habits that stick—clear plans, measurable progress, and coaches who keep you accountable.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--eli">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">12+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">30+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">6000+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual wb-sys-about__visual--eli" aria-hidden="true">
            <img src="${IMG_ABOUT_ELITE}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'energy') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--energy">
        <div class="wb-sys-section__head wb-sys-section__head--wide wb-sys-eng-about__head">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eng-kicker">Good energy great results</h2>
          <p class="wb-sys-sub">A bright, high-tempo club built for people who want structure, variety, and coaches who keep the standard high—without losing the fun.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">Whether you are chasing fat loss, strength, or longevity, we combine smart programming with accountability so progress never feels random.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--eng">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num"><span class="wb-sys-stat-val">9</span><span class="wb-sys-stat-plus">+</span></span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num"><span class="wb-sys-stat-val">22</span><span class="wb-sys-stat-plus">+</span></span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num"><span class="wb-sys-stat-val">4500</span><span class="wb-sys-stat-plus">+</span></span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual wb-sys-about__visual--en" aria-hidden="true">
            <img src="${IMG_ABOUT_ENERGY}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'sporty') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--sporty">
        <div class="wb-sys-section__head wb-sys-section__head--wide wb-sys-spo-about__head">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2 wb-sys-h2--spo-kicker">Your goals, our mission</h2>
          <p class="wb-sys-sub">We built Sporty Gym for people who want clear coaching, smart programming, and a community that makes showing up easier.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">From day one you get structure, feedback, and a team that tracks what matters—so every week feels like forward motion.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--spo">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">10+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">24+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">4800+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual wb-sys-about__visual--spo" aria-hidden="true">
            <img src="${IMG_ABOUT_SPORTY}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'cyberfit') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--cyberfit wb-sys-cyb-about">
        <div class="wb-sys-cyb-about__card">
          <div class="wb-sys-cyb-about__copy">
            <span class="wb-sys-eyebrow">About us</span>
            <h2 class="wb-sys-h2 wb-sys-h2--cyb">The future is fit</h2>
            <p class="wb-sys-sub wb-sys-sub--cyb">Neon-noir floors, quantified progression, and coaches who treat every session like a mission brief—built for athletes who want the edge without the noise.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--cyb">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">5+</span>
                <span class="wb-sys-stat-lbl">Years</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">15+</span>
                <span class="wb-sys-stat-lbl">Coaches</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">3000+</span>
                <span class="wb-sys-stat-lbl">Members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-cyb-about__visual wb-sys-cyb-imgfx" aria-hidden="true">
            <img src="${IMG_ABOUT_CYBER}" alt="Coached training on the gym floor" width="560" height="420" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'vintageiron') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--vintageiron wb-sys-vin-about">
        <div class="wb-sys-vin-panel wb-sys-vin-panel--parchment">
          <div class="wb-sys-vin-about__grid">
            <div class="wb-sys-vin-about__copy">
              <span class="wb-sys-eyebrow">Legacy</span>
              <h2 class="wb-sys-h2 wb-sys-h2--vin">Built on legacy. <span class="wb-sys-h2__vin-line">Focused on you.</span></h2>
              <p class="wb-sys-sub wb-sys-sub--vin">Vintage floors, iron that feels honest, and coaches who still believe in reps over hype—this is training for people who want the work to speak.</p>
              <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--vin">
                <div class="wb-sys-stat-block">
                  <span class="wb-sys-stat-num">25+</span>
                  <span class="wb-sys-stat-lbl">Years</span>
                </div>
                <div class="wb-sys-stat-block">
                  <span class="wb-sys-stat-num">30+</span>
                  <span class="wb-sys-stat-lbl">Experts</span>
                </div>
                <div class="wb-sys-stat-block">
                  <span class="wb-sys-stat-num">4000+</span>
                  <span class="wb-sys-stat-lbl">Members</span>
                </div>
              </div>
            </div>
            <div class="wb-sys-vin-about__photo" aria-hidden="true">
              <img src="${IMG_VIN_ABOUT}" alt="" width="640" height="520" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'liquidfit') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--liquidfit wb-sys-liq-about">
        <div class="wb-sys-liq-about__wave" aria-hidden="true"></div>
        <div class="wb-sys-liq-about__grid">
          <div class="wb-sys-liq-about__copy">
            <span class="wb-sys-eyebrow">About</span>
            <h2 class="wb-sys-h2 wb-sys-h2--liq">Fitness that adapts to you</h2>
            <p class="wb-sys-sub wb-sys-sub--liq">Liquid programming, coaches who read your recovery, and a floor that bends with your goals—built for members who want flow, not friction.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--liq">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">12+</span>
                <span class="wb-sys-stat-lbl">Plans</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">30+</span>
                <span class="wb-sys-stat-lbl">Coaches</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">7000+</span>
                <span class="wb-sys-stat-lbl">Happy members</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-liq-about__visual" aria-hidden="true">
            <div class="wb-sys-liq-blob wb-sys-liq-blob--about">
              <img src="${IMG_LIQ_ABOUT}" alt="" width="640" height="800" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>`,
    );
  }
  if (set === 'junglebeast') {
    return dsSection(
      'About',
      `<section id="about" class="wb-sys wb-sys-section wb-sys--junglebeast wb-sys-jng-about">
        <div class="wb-sys-jng-about__grid">
          <div class="wb-sys-jng-about__copy">
            <span class="wb-sys-eyebrow">No excuses</span>
            <h2 class="wb-sys-h2 wb-sys-h2--jng">We don't build bodies. <span class="wb-sys-h2__lime">We build beasts.</span></h2>
            <p class="wb-sys-sub wb-sys-sub--jng">Jungle-grade intensity, coaches who track every rep, and a floor tuned for members who want the edge—without the fluff.</p>
            <div class="wb-sys-jng-iconrow" aria-hidden="true">
              <span class="wb-sys-jng-iconrow__ico">${DS_ICO.coaching}</span>
              <span class="wb-sys-jng-iconrow__ico">${DS_ICO.strengthTraining}</span>
              <span class="wb-sys-jng-iconrow__ico">${DS_ICO.healthTracking}</span>
              <span class="wb-sys-jng-iconrow__ico">${DS_ICO.enduranceFlame}</span>
            </div>
            <p class="wb-sys-jng-claw-tag" aria-hidden="true">No excuses. Only results.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics wb-sys-stats--jng">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">8+</span>
                <span class="wb-sys-stat-lbl">Years</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">20+</span>
                <span class="wb-sys-stat-lbl">Coaches</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">4500+</span>
                <span class="wb-sys-stat-lbl">Beasts</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-jng-about__visual" aria-hidden="true">
            <img src="${IMG_JNG_ABOUT}" alt="" width="485" height="297" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
    );
  }
  return dsSection(
    'About',
    `<section id="about" class="wb-sys wb-sys-section wb-sys--${set}">
        <div class="wb-sys-section__head wb-sys-section__head--wide">
          <span class="wb-sys-eyebrow">About us</span>
          <h2 class="wb-sys-h2">Built for serious training</h2>
          <p class="wb-sys-sub">A flagship floor, small-group classes, and coaches who track your progression like a training roadmap—not a sales funnel.</p>
        </div>
        <div class="wb-sys-about__row">
          <div class="wb-sys-about__copy">
            <p class="wb-sys-sub" style="margin:0 0 1.25rem;">From onboarding to periodization, every touchpoint is designed to remove friction and keep you accountable week after week.</p>
            <div class="wb-sys-stats wb-sys-stats--metrics">
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">10+</span>
                <span class="wb-sys-stat-lbl">Years experience</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">25+</span>
                <span class="wb-sys-stat-lbl">Expert trainers</span>
              </div>
              <div class="wb-sys-stat-block">
                <span class="wb-sys-stat-num">40+</span>
                <span class="wb-sys-stat-lbl">Classes weekly</span>
              </div>
            </div>
          </div>
          <div class="wb-sys-about__visual" aria-hidden="true">
            <img src="${IMG_ABOUT}" alt="" width="520" height="400" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>`,
  );
}

function featuresHtml(set: DesignSetId): string {
  if (set === 'vintageiron') {
    const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--vintageiron wb-sys-vin-features">
        <div class="wb-sys-vin-panel wb-sys-vin-panel--dark">
          <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-vin-features__head">
            <span class="wb-sys-eyebrow">Programs</span>
            <h2 class="wb-sys-h2 wb-sys-h2--vin">Forged on the floor</h2>
            <p class="wb-sys-sub wb-sys-sub--vin-dark">Four pillars that match the Vintage Iron stack—swap copy to match how you coach.</p>
          </div>
          <div class="wb-sys-vin-icon-grid">
            <article class="wb-sys-vin-icon-card fade-up hover-scale">
              <div class="wb-sys-vin-icon-ring" aria-hidden="true">${DS_ICO.crossTraining}</div>
              <h3 class="wb-sys-vin-icon-card__title">Circuit training</h3>
              <p class="wb-sys-vin-icon-card__desc">Stations, carries, and grit rounds that build work capacity without losing form.</p>
            </article>
            <article class="wb-sys-vin-icon-card fade-up hover-scale">
              <div class="wb-sys-vin-icon-ring" aria-hidden="true">${DS_ICO.muscleGain}</div>
              <h3 class="wb-sys-vin-icon-card__title">Strength</h3>
              <p class="wb-sys-vin-icon-card__desc">Progressive overload on racks and platforms—track numbers, earn the next plate.</p>
            </article>
            <article class="wb-sys-vin-icon-card fade-up hover-scale">
              <div class="wb-sys-vin-icon-ring" aria-hidden="true">${DS_ICO.eliteShield}</div>
              <h3 class="wb-sys-vin-icon-card__title">HIIT class</h3>
              <p class="wb-sys-vin-icon-card__desc">Short rounds, loud plates, pacing that keeps you honest rep after rep.</p>
            </article>
            <article class="wb-sys-vin-icon-card fade-up hover-scale">
              <div class="wb-sys-vin-icon-ring" aria-hidden="true">${DS_ICO.focusMark}</div>
              <h3 class="wb-sys-vin-icon-card__title">Mindset</h3>
              <p class="wb-sys-vin-icon-card__desc">Accountability, standards, and a culture that shows up when it is heavy.</p>
            </article>
          </div>
        </div>
      </section>`;
    return dsSection('Programs', inner);
  }
  if (set === 'liquidfit') {
    const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--liquidfit wb-sys-liq-features">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-liq-features__head">
          <span class="wb-sys-eyebrow">Programs</span>
          <h2 class="wb-sys-h2 wb-sys-h2--liq">Everything in one flow</h2>
          <p class="wb-sys-sub wb-sys-sub--liq">Four pillars that match the Liquidfit stack—rename or reorder to fit your club.</p>
        </div>
        <div class="wb-sys-liq-icon-grid">
          <article class="wb-sys-liq-icon-card fade-up hover-scale">
            <div class="wb-sys-liq-icon-ring" aria-hidden="true">${DS_ICO.healthTracking}</div>
            <h3 class="wb-sys-liq-icon-card__title">Smart workouts</h3>
            <p class="wb-sys-liq-icon-card__desc">Adaptive blocks that scale load, tempo, and rest to how you show up each day.</p>
          </article>
          <article class="wb-sys-liq-icon-card fade-up hover-scale">
            <div class="wb-sys-liq-icon-ring" aria-hidden="true">${DS_ICO.coaching}</div>
            <h3 class="wb-sys-liq-icon-card__title">Personal training</h3>
            <p class="wb-sys-liq-icon-card__desc">1:1 sessions with clear targets, video review, and weekly progression notes.</p>
          </article>
          <article class="wb-sys-liq-icon-card fade-up hover-scale">
            <div class="wb-sys-liq-icon-ring" aria-hidden="true">${DS_ICO.wellnessCalm}</div>
            <h3 class="wb-sys-liq-icon-card__title">Nutrition plans</h3>
            <p class="wb-sys-liq-icon-card__desc">Simple fueling guides that sync with your training phase—not crash diets.</p>
          </article>
          <article class="wb-sys-liq-icon-card fade-up hover-scale">
            <div class="wb-sys-liq-icon-ring" aria-hidden="true">${DS_ICO.flexibility}</div>
            <h3 class="wb-sys-liq-icon-card__title">Wellness support</h3>
            <p class="wb-sys-liq-icon-card__desc">Sleep, stress, and mobility touchpoints so hard weeks still feel sustainable.</p>
          </article>
        </div>
      </section>`;
    return dsSection('Programs', inner);
  }
  if (set === 'junglebeast') {
    const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--junglebeast wb-sys-jng-features">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-jng-features__head">
          <span class="wb-sys-eyebrow">Beast mode</span>
          <h2 class="wb-sys-h2 wb-sys-h2--jng">Programs built for the wild</h2>
          <p class="wb-sys-sub wb-sys-sub--jng">Four tracks—rename or swap copy to match your floor. Visuals pulled from your reference template.</p>
        </div>
        <div class="wb-sys-jng-pro-grid">
          <article class="wb-sys-jng-pro-card fade-up hover-scale">
            <div class="wb-sys-jng-pro-card__media" style="--jng-pro-bg:url(${IMG_JNG_PROGRAMS});--jng-pro-pos:20% 22%;"></div>
            <div class="wb-sys-jng-pro-card__body">
              <h3 class="wb-sys-jng-pro-card__title">Strength training</h3>
              <p class="wb-sys-jng-pro-card__desc">Heavy compounds, tracked progression, and form-first coaching.</p>
              <span class="wb-sys-jng-pro-card__ico" aria-hidden="true">${DS_ICO.strengthTraining}</span>
            </div>
          </article>
          <article class="wb-sys-jng-pro-card fade-up hover-scale">
            <div class="wb-sys-jng-pro-card__media" style="--jng-pro-bg:url(${IMG_JNG_PROGRAMS});--jng-pro-pos:55% 35%;"></div>
            <div class="wb-sys-jng-pro-card__body">
              <h3 class="wb-sys-jng-pro-card__title">Combat conditioning</h3>
              <p class="wb-sys-jng-pro-card__desc">Intervals, bags, and engine work that hits like a stampede.</p>
              <span class="wb-sys-jng-pro-card__ico" aria-hidden="true">${DS_ICO.crossTraining}</span>
            </div>
          </article>
          <article class="wb-sys-jng-pro-card fade-up hover-scale">
            <div class="wb-sys-jng-pro-card__media" style="--jng-pro-bg:url(${IMG_JNG_PROGRAMS});--jng-pro-pos:40% 62%;"></div>
            <div class="wb-sys-jng-pro-card__body">
              <h3 class="wb-sys-jng-pro-card__title">Instinct HIIT</h3>
              <p class="wb-sys-jng-pro-card__desc">Short rounds, loud energy, pacing that keeps you honest.</p>
              <span class="wb-sys-jng-pro-card__ico" aria-hidden="true">${DS_ICO.enduranceFlame}</span>
            </div>
          </article>
          <article class="wb-sys-jng-pro-card fade-up hover-scale">
            <div class="wb-sys-jng-pro-card__media" style="--jng-pro-bg:url(${IMG_JNG_PROGRAMS});--jng-pro-pos:78% 48%;"></div>
            <div class="wb-sys-jng-pro-card__body">
              <h3 class="wb-sys-jng-pro-card__title">Recover &amp; reset</h3>
              <p class="wb-sys-jng-pro-card__desc">Mobility, breath work, and low-impact resets between hard weeks.</p>
              <span class="wb-sys-jng-pro-card__ico" aria-hidden="true">${DS_ICO.flexibility}</span>
            </div>
          </article>
        </div>
      </section>`;
    return dsSection('Programs', inner);
  }
  if (set === 'cyberfit') {
    const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--cyberfit">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-cyb-features__head">
          <span class="wb-sys-eyebrow">Systems</span>
          <h2 class="wb-sys-h2 wb-sys-h2--cyb">Engineered for overload</h2>
          <p class="wb-sys-sub wb-sys-sub--cyb">Three uplinks that define the Neon District stack—rename or rewire to match your club.</p>
        </div>
        <div class="wb-sys-cyb-feature-grid">
          <article class="wb-sys-cyb-feature fade-up hover-scale">
            <div class="wb-sys-cyb-feature__icon" aria-hidden="true">${DS_ICO.healthTracking}</div>
            <h3 class="wb-sys-cyb-feature__title">Cyber tracking</h3>
            <p class="wb-sys-cyb-feature__desc">Live metrics, session logs, and recovery signals so you always know if you are trending up.</p>
          </article>
          <article class="wb-sys-cyb-feature fade-up hover-scale">
            <div class="wb-sys-cyb-feature__icon" aria-hidden="true">${DS_ICO.crossTraining}</div>
            <h3 class="wb-sys-cyb-feature__title">Hyper workouts</h3>
            <p class="wb-sys-cyb-feature__desc">Hybrid strength and engine blocks with pacing that hits like a mainframe overclock—then backs off.</p>
          </article>
          <article class="wb-sys-cyb-feature fade-up hover-scale">
            <div class="wb-sys-cyb-feature__icon" aria-hidden="true">${DS_ICO.flexibility}</div>
            <h3 class="wb-sys-cyb-feature__title">Bio sync</h3>
            <p class="wb-sys-cyb-feature__desc">Mobility finishers and nervous-system resets so hard weeks still feel sustainable.</p>
          </article>
        </div>
      </section>`;
    return dsSection('Programs', inner);
  }
  if (set === 'glassmorph') {
    const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--glassmorph">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-gls-features__head">
          <span class="wb-sys-eyebrow">Programs</span>
          <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">Move smarter every day</h2>
          <p class="wb-sys-sub wb-sys-sub--gls">Four guided tracks designed for strength, conditioning, and long-term wellness.</p>
        </div>
        <div class="wb-sys-grid4 wb-sys-grid4--gls">
          <article class="wb-sys-feature wb-sys-feature--gls fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.strengthTraining}</div>
            <h3 class="wb-sys-feature__title">Functional training</h3>
            <p class="wb-sys-feature__desc">Build practical strength with coached compound patterns and progressive overload.</p>
          </article>
          <article class="wb-sys-feature wb-sys-feature--gls fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.enduranceFlame}</div>
            <h3 class="wb-sys-feature__title">HIIT workouts</h3>
            <p class="wb-sys-feature__desc">Short, high-impact intervals to improve stamina and maximize training efficiency.</p>
          </article>
          <article class="wb-sys-feature wb-sys-feature--gls fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.flexibility}</div>
            <h3 class="wb-sys-feature__title">Core and mobility</h3>
            <p class="wb-sys-feature__desc">Support every lift with better stability, range of motion, and movement quality.</p>
          </article>
          <article class="wb-sys-feature wb-sys-feature--gls fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.coaching}</div>
            <h3 class="wb-sys-feature__title">Personal coaching</h3>
            <p class="wb-sys-feature__desc">Individualized plans and accountability for members at every fitness level.</p>
          </article>
        </div>
      </section>`;
    return dsSection('Body', inner);
  }
  const head =
    set === 'focus' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-foc-features__head">
          <span class="wb-sys-eyebrow">Programs</span>
          <h2 class="wb-sys-h2 wb-sys-h2--foc-kicker">Train with precision</h2>
          <p class="wb-sys-sub">Four pillars that match the Focus floor—swap titles or descriptions anytime.</p>
        </div>`
    : set === 'prime' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-prm-features__head">
          <span class="wb-sys-eyebrow">Why Prime</span>
          <h2 class="wb-sys-h2 wb-sys-h2--prm-kicker">Built for momentum</h2>
          <p class="wb-sys-sub">Four pillars that match the Prime experience—community, drive, challenge, and proof.</p>
        </div>`
    : set === 'elite' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eli-features__head">
          <span class="wb-sys-eyebrow">Facilities</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eli-kicker">Designed for every training style</h2>
          <p class="wb-sys-sub">Four flagship zones members use daily—rename or reorder to match your club layout.</p>
        </div>`
    : set === 'energy' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eng-features__head">
          <span class="wb-sys-eyebrow">Programs</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eng-kicker">Goals we help you crush</h2>
          <p class="wb-sys-sub">Four tracks members mix and match—swap titles or descriptions to match how you coach.</p>
        </div>`
    : set === 'sporty' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-spo-features__head">
          <span class="wb-sys-eyebrow">Facilities</span>
          <h2 class="wb-sys-h2 wb-sys-h2--spo-kicker">Train smarter on every shift</h2>
          <p class="wb-sys-sub">Four pillars that match the Sporty floor—rename or reorder to fit your club story.</p>
        </div>`
    : `<div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Why us</span>
          <h2 class="wb-sys-h2">Everything you need on one floor</h2>
          <p class="wb-sys-sub">Four pillars members feel from day one—swap copy to match your facility.</p>
        </div>`;
  const grid =
    set === 'focus' ?
      `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.strengthTraining}</div>
            <h3 class="wb-sys-feature__title">Strength training</h3>
            <p class="wb-sys-feature__desc">Progressive overload, quality racks, and coaching that respects technique before ego.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.crossTraining}</div>
            <h3 class="wb-sys-feature__title">Cross training</h3>
            <p class="wb-sys-feature__desc">Conditioning blocks, mixed formats, and pacing that keeps you sharp without burning out.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.flexibility}</div>
            <h3 class="wb-sys-feature__title">Flexibility</h3>
            <p class="wb-sys-feature__desc">Mobility finishers, recovery tools, and space to reset between hard training days.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.healthTracking}</div>
            <h3 class="wb-sys-feature__title">Health tracking</h3>
            <p class="wb-sys-feature__desc">Check-ins, benchmarks, and simple metrics so you can see momentum—not guesswork.</p>
          </article>
        </div>`
    : set === 'prime' ?
      `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.users}</div>
            <h3 class="wb-sys-feature__title">Community</h3>
            <p class="wb-sys-feature__desc">Supportive fitness community—spotters, accountability partners, and coaches who know your name.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.bolt}</div>
            <h3 class="wb-sys-feature__title">Motivation</h3>
            <p class="wb-sys-feature__desc">Stay inspired every day with programming that stays fresh and coaches who push with purpose.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.challengeTarget}</div>
            <h3 class="wb-sys-feature__title">Challenges</h3>
            <p class="wb-sys-feature__desc">Push your limits with benchmarks, mini-competitions, and clear targets every training phase.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.healthTracking}</div>
            <h3 class="wb-sys-feature__title">Results</h3>
            <p class="wb-sys-feature__desc">Real results, real people—track lifts, conditioning scores, and body comp over time.</p>
          </article>
        </div>`
    : set === 'elite' ?
      `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.cardio}</div>
            <h3 class="wb-sys-feature__title">Cardio zone</h3>
            <p class="wb-sys-feature__desc">Treadmills, bikes, and sleds in a bright, ventilated lane built for steady-state and intervals.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.strengthTraining}</div>
            <h3 class="wb-sys-feature__title">Strength area</h3>
            <p class="wb-sys-feature__desc">Olympic platforms, calibrated plates, and racks spaced for real lifting—not crowded corners.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.studio}</div>
            <h3 class="wb-sys-feature__title">Group studio</h3>
            <p class="wb-sys-feature__desc">Sound-treated room for HIIT, rhythm rides, and coached classes with clear sightlines.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.recovery}</div>
            <h3 class="wb-sys-feature__title">Recovery suite</h3>
            <p class="wb-sys-feature__desc">Stretch space, percussion tools, and hydro options so hard weeks still feel sustainable.</p>
          </article>
        </div>`
    : set === 'energy' ?
      `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.fatLoss}</div>
            <h3 class="wb-sys-feature__title">Fat loss</h3>
            <p class="wb-sys-feature__desc">Metabolic circuits, smart nutrition nudges, and weekly check-ins so the scale and mirror both move.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.muscleGain}</div>
            <h3 class="wb-sys-feature__title">Muscle gain</h3>
            <p class="wb-sys-feature__desc">Hypertrophy blocks, tracked lifts, and recovery built in so you add quality size—not just soreness.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.enduranceFlame}</div>
            <h3 class="wb-sys-feature__title">Endurance</h3>
            <p class="wb-sys-feature__desc">Intervals, engine work, and cardio formats that build stamina without boring you to death.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.wellnessCalm}</div>
            <h3 class="wb-sys-feature__title">Wellness</h3>
            <p class="wb-sys-feature__desc">Mobility flows, breath work, and low-impact resets so you can train hard and still feel human.</p>
          </article>
        </div>`
    : set === 'sporty' ?
      `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.crossTraining}</div>
            <h3 class="wb-sys-feature__title">Functional training</h3>
            <p class="wb-sys-feature__desc">Train for real-life strength—carries, crawls, and full-body patterns that transfer beyond the gym floor.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.enduranceFlame}</div>
            <h3 class="wb-sys-feature__title">HIIT workouts</h3>
            <p class="wb-sys-feature__desc">High intensity, fast burn—short blocks, loud energy, and pacing that keeps you honest rep after rep.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.flexibility}</div>
            <h3 class="wb-sys-feature__title">Core strength</h3>
            <p class="wb-sys-feature__desc">Stronger core, better you—anti-rotation work, bracing drills, and trunk stability that supports every lift.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.coaching}</div>
            <h3 class="wb-sys-feature__title">Personal care</h3>
            <p class="wb-sys-feature__desc">Personalized care for everyone—options for beginners, return-to-training, and members chasing performance goals.</p>
          </article>
        </div>`
    : `<div class="wb-sys-grid4">
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.equipment}</div>
            <h3 class="wb-sys-feature__title">Modern equipment</h3>
            <p class="wb-sys-feature__desc">Racks, plates, cardio, and recovery tools maintained to competition standard.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.coaching}</div>
            <h3 class="wb-sys-feature__title">Expert coaching</h3>
            <p class="wb-sys-feature__desc">Credentials you can verify—form cues, load management, and clear progressions.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.clock}</div>
            <h3 class="wb-sys-feature__title">Flexible schedules</h3>
            <p class="wb-sys-feature__desc">Early opens, late closes, and class formats that fit real calendars.</p>
          </article>
          <article class="wb-sys-feature fade-up hover-scale">
            <div class="wb-sys-feature__icon" aria-hidden="true">${DS_ICO.users}</div>
            <h3 class="wb-sys-feature__title">Community</h3>
            <p class="wb-sys-feature__desc">A culture that pushes effort without ego—spotters, accountability, and respect.</p>
          </article>
        </div>`;
  const inner = `
      <section id="programs" class="wb-sys wb-sys-section wb-sys-section--features wb-sys--${set}">
        ${head}
        ${grid}
      </section>`;
  return dsSection('Body', inner);
}

function pricingHtml(set: DesignSetId): string {
  if (set === 'cyberfit') {
    const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--cyberfit">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-cyb-pricing__head">
          <span class="wb-sys-eyebrow">Pricing</span>
          <h2 class="wb-sys-h2 wb-sys-h2--cyb">Choose your plan</h2>
          <p class="wb-sys-sub wb-sys-sub--cyb">Basic, Pro, and Elite—each uplink with its own neon signature. Pro is recommended for most operators.</p>
        </div>
        <div class="wb-sys-price wb-sys-cyb-price">
          <article class="wb-sys-price__tier wb-sys-cyb-price__tier--cyan fade-up hover-scale">
            <span class="wb-sys-eyebrow">Basic</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
            <p class="wb-sys-price__amt wb-sys-cyb-price__amt--cyan">$29<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>Open gym hours</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Locker + scan-in</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>App telemetry</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--hit wb-sys-cyb-price__tier--magenta fade-up hover-scale">
            <span class="wb-sys-price__badge wb-sys-price__badge--cyb">Recommended</span>
            <span class="wb-sys-eyebrow">Pro</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
            <p class="wb-sys-price__amt wb-sys-cyb-price__amt--magenta">$59<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>All group formats</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Priority booking</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Quarterly review</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-cyb-price__tier--violet fade-up hover-scale">
            <span class="wb-sys-eyebrow">Elite</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
            <p class="wb-sys-price__amt wb-sys-cyb-price__amt--violet">$99<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>1:1 programming</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Nutrition sync</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Concierge scheduling</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
        </div>
      </section>`;
    return dsSection('Pricing', inner);
  }
  if (set === 'vintageiron') {
    const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--vintageiron">
        <div class="wb-sys-vin-panel wb-sys-vin-panel--dark">
          <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-vin-pricing__head">
            <span class="wb-sys-eyebrow">Membership</span>
            <h2 class="wb-sys-h2 wb-sys-h2--vin">Membership plans</h2>
            <p class="wb-sys-sub wb-sys-sub--vin-dark">Basic, Standard, and Premium—Standard is the best seller for members training most days.</p>
          </div>
          <div class="wb-sys-price wb-sys-vin-price">
            <article class="wb-sys-price__tier wb-sys-vin-price__tier fade-up hover-scale">
              <span class="wb-sys-eyebrow">Basic</span>
              <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
              <p class="wb-sys-price__amt wb-sys-vin-price__amt">$29<span class="wb-sys-price__per">/mo</span></p>
              <ul class="wb-sys-price__list">
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Open gym hours</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Locker access</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Starter programs</li>
              </ul>
              <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--vin-bronze" data-wb-open="join">Join now</button>
            </article>
            <article class="wb-sys-price__tier wb-sys-price__tier--hit wb-sys-vin-price__tier wb-sys-vin-price__tier--hit fade-up hover-scale">
              <span class="wb-sys-price__badge wb-sys-price__badge--vin">Best seller</span>
              <span class="wb-sys-eyebrow">Standard</span>
              <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
              <p class="wb-sys-price__amt wb-sys-vin-price__amt">$59<span class="wb-sys-price__per">/mo</span></p>
              <ul class="wb-sys-price__list">
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>All group formats</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Priority booking</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Monthly check-in</li>
              </ul>
              <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--vin-bronze" data-wb-open="join">Join now</button>
            </article>
            <article class="wb-sys-price__tier wb-sys-vin-price__tier fade-up hover-scale">
              <span class="wb-sys-eyebrow">Premium</span>
              <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
              <p class="wb-sys-price__amt wb-sys-vin-price__amt">$99<span class="wb-sys-price__per">/mo</span></p>
              <ul class="wb-sys-price__list">
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>1:1 programming</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Nutrition support</li>
                <li><span class="wb-sys-check wb-sys-check--vin" aria-hidden="true"></span>Concierge scheduling</li>
              </ul>
              <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--vin-bronze" data-wb-open="join">Join now</button>
            </article>
          </div>
        </div>
      </section>`;
    return dsSection('Pricing', inner);
  }
  if (set === 'liquidfit') {
    const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--liquidfit">
        <div class="wb-sys-liq-pricing__wave" aria-hidden="true"></div>
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-liq-pricing__head">
          <span class="wb-sys-eyebrow">Memberships</span>
          <h2 class="wb-sys-h2 wb-sys-h2--liq">Choose your flow</h2>
          <p class="wb-sys-sub wb-sys-sub--liq">Classic, Advanced, and Elite—glass panels with cyan‑violet glow. Advanced is the member favorite.</p>
        </div>
        <div class="wb-sys-price wb-sys-liq-price">
          <article class="wb-sys-price__tier wb-sys-liq-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">Classic</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
            <p class="wb-sys-price__amt wb-sys-liq-price__amt">$29<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Open gym hours</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Locker + app</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Starter programs</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--liq-ghost" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--hit wb-sys-liq-price__tier wb-sys-liq-price__tier--hit fade-up hover-scale">
            <span class="wb-sys-price__badge wb-sys-price__badge--liq">Most popular</span>
            <span class="wb-sys-eyebrow">Advanced</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
            <p class="wb-sys-price__amt wb-sys-liq-price__amt">$59<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>All group formats</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Priority booking</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Monthly review</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--liq-gradient" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-liq-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">Elite</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
            <p class="wb-sys-price__amt wb-sys-liq-price__amt">$99<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>1:1 programming</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Nutrition sync</li>
              <li><span class="wb-sys-check wb-sys-check--liq" aria-hidden="true"></span>Concierge scheduling</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--liq-ghost" data-wb-open="join">Get started</button>
          </article>
        </div>
      </section>`;
    return dsSection('Pricing', inner);
  }
  if (set === 'junglebeast') {
    const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--junglebeast">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-jng-pricing__head">
          <span class="wb-sys-eyebrow">Choose your plan</span>
          <h2 class="wb-sys-h2 wb-sys-h2--jng">Choose your paw</h2>
          <p class="wb-sys-sub wb-sys-sub--jng">Cub, Warrior, Alpha—wood-stone frames and neon checks. Warrior is the pack favorite.</p>
        </div>
        <div class="wb-sys-jng-pricing__bg" aria-hidden="true" style="background-image:url(${IMG_JNG_PRICING})"></div>
        <div class="wb-sys-price wb-sys-jng-price">
          <article class="wb-sys-price__tier wb-sys-jng-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">Cub</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
            <p class="wb-sys-price__amt wb-sys-jng-price__amt">$29<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Open gym hours</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Locker + scan-in</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>App access</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--ghost" data-wb-open="join">Join now</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--hit wb-sys-jng-price__tier wb-sys-jng-price__tier--hit fade-up hover-scale">
            <span class="wb-sys-price__badge wb-sys-price__badge--jng">Most popular</span>
            <span class="wb-sys-eyebrow">Warrior</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
            <p class="wb-sys-price__amt wb-sys-jng-price__amt">$59<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>All group formats</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Priority booking</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Monthly check-in</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Join now</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-jng-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">Alpha</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
            <p class="wb-sys-price__amt wb-sys-jng-price__amt">$99<span class="wb-sys-price__per">/mo</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>1:1 programming</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Nutrition sync</li>
              <li><span class="wb-sys-check wb-sys-check--jng" aria-hidden="true"></span>Concierge scheduling</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--ghost" data-wb-open="join">Upgrade</button>
          </article>
        </div>
      </section>`;
    return dsSection('Pricing', inner);
  }
  if (set === 'glassmorph') {
    const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--glassmorph">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-gls-pricing__head">
          <span class="wb-sys-eyebrow">Choose your plan</span>
          <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">Memberships that fit your pace</h2>
          <p class="wb-sys-sub wb-sys-sub--gls">Simple monthly options with transparent benefits and no hidden complexity.</p>
        </div>
        <div class="wb-sys-price wb-sys-gls-price">
          <article class="wb-sys-price__tier wb-sys-price__tier--gls fade-up hover-scale">
            <span class="wb-sys-eyebrow">Basic</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
            <p class="wb-sys-price__amt">$39<span class="wb-sys-price__per">/ month</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>Open gym hours</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Locker room access</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>App check-ins</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--hit wb-sys-price__tier--gls wb-sys-price__tier--gls-hit fade-up hover-scale">
            <span class="wb-sys-price__badge wb-sys-price__badge--gls">Most popular</span>
            <span class="wb-sys-eyebrow">Standard</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
            <p class="wb-sys-price__amt">$59<span class="wb-sys-price__per">/ month</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>All group formats</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Priority booking</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Monthly check-in</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--gls fade-up hover-scale">
            <span class="wb-sys-eyebrow">Premium</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
            <p class="wb-sys-price__amt">$99<span class="wb-sys-price__per">/ month</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>1:1 programming</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Nutrition support</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Dedicated support</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
        </div>
      </section>`;
    return dsSection('Pricing', inner);
  }
  const head =
    set === 'power' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-pwr-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--pwr-kicker">Pick your lane</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—Standard fits most members training 4+ days a week.</p>
        </div>`
    : set === 'focus' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-foc-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--foc-kicker">Memberships that scale</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—Standard is highlighted as best value for most members.</p>
        </div>`
    : set === 'prime' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-prm-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--prm-kicker">Choose your edge</h2>
          <p class="wb-sys-sub">Base, Standard, and Premium—Standard is the popular pick for members training most days.</p>
        </div>`
    : set === 'elite' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eli-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eli-kicker">Memberships built around you</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—Standard is recommended for members who want classes plus open gym.</p>
        </div>`
    : set === 'energy' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eng-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eng-kicker">Pick the plan that matches your pace</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—Standard is the sweet spot for members who want classes plus open gym access.</p>
        </div>`
    : set === 'sporty' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-spo-pricing__head">
          <span class="wb-sys-eyebrow">Pricing plans</span>
          <h2 class="wb-sys-h2 wb-sys-h2--spo-kicker">Simple memberships, serious value</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—Standard is highlighted for members who want classes plus open gym.</p>
        </div>`
    : `<div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Membership</span>
          <h2 class="wb-sys-h2">Plans that scale with you</h2>
          <p class="wb-sys-sub">Basic, Standard, and Premium—highlight Standard for most members.</p>
        </div>`;
  const prices =
    set === 'power' || set === 'focus' || set === 'prime' || set === 'elite' || set === 'energy' || set === 'sporty' ?
      { a: '$29', b: '$59', c: '$99' }
    : { a: '₹999', b: '₹1999', c: '₹3499' };
  const pricePer = set === 'sporty' ? '/ month' : '/mo';
  const hitBadge =
    set === 'focus' ? `<span class="wb-sys-price__badge wb-sys-price__badge--foc">Best value</span>`
    : set === 'prime' ? `<span class="wb-sys-price__badge wb-sys-price__badge--prm">Popular</span>`
    : set === 'elite' ? `<span class="wb-sys-price__badge wb-sys-price__badge--eli">Recommended</span>`
    : set === 'energy' ? `<span class="wb-sys-price__badge wb-sys-price__badge--eng">Popular</span>`
    : '';
  const inner = `
      <section id="pricing" class="wb-sys wb-sys-section wb-sys--${set}">
        ${head}
        <div class="wb-sys-price">
          <article class="wb-sys-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">${set === 'prime' ? 'Base' : 'Basic'}</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Floor access</h3>
            <p class="wb-sys-price__amt">${prices.a}<span class="wb-sys-price__per">${pricePer}</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>Open gym hours</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Locker access</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>App check-ins</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier wb-sys-price__tier--hit fade-up hover-scale">
            ${hitBadge}
            <span class="wb-sys-eyebrow">Standard</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Classes included</h3>
            <p class="wb-sys-price__amt">${prices.b}<span class="wb-sys-price__per">${pricePer}</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>All group formats</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Priority booking</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Quarterly review</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
          <article class="wb-sys-price__tier fade-up hover-scale">
            <span class="wb-sys-eyebrow">Premium</span>
            <h3 class="wb-sys-card__title" style="margin:0.35rem 0 0;">Coaching plus</h3>
            <p class="wb-sys-price__amt">${prices.c}<span class="wb-sys-price__per">${pricePer}</span></p>
            <ul class="wb-sys-price__list">
              <li><span class="wb-sys-check" aria-hidden="true"></span>1:1 programming</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Nutrition check-ins</li>
              <li><span class="wb-sys-check" aria-hidden="true"></span>Concierge scheduling</li>
            </ul>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="join">Get started</button>
          </article>
        </div>
      </section>`;
  return dsSection('Pricing', inner);
}

function galleryCarouselDots(count: number): string {
  const buttons = Array.from({ length: count }, (_, i) => {
    const active = i === 0 ? ' wb-sys-carousel__dot--active' : '';
    const cur = i === 0 ? 'true' : 'false';
    return `<button type="button" class="wb-sys-carousel__dot${active}" data-wb-ds-dot="${i}" aria-label="Photo ${i + 1} of ${count}" aria-current="${cur}"></button>`;
  }).join('');
  return `<div class="wb-sys-carousel__dots" role="tablist">${buttons}</div>`;
}

function galleryHtml(set: DesignSetId): string {
  if (set === 'vintageiron') {
    const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--vintageiron">
        <div class="wb-sys-vin-panel wb-sys-vin-panel--dark">
          <div class="wb-sys-section__head wb-sys-section__head--center">
            <span class="wb-sys-eyebrow">Gallery</span>
            <h2 class="wb-sys-h2 wb-sys-h2--vin">The iron floor</h2>
            <p class="wb-sys-sub wb-sys-sub--vin-dark">Frames pulled from your reference template—replace with your own facility shots.</p>
          </div>
          <div class="wb-sys-vin-gallery">
            <figure class="wb-sys-vin-gallery__cell"><img src="${IMG_VIN_GAL1}" alt="Gym interior" width="400" height="220" loading="lazy" decoding="async" /></figure>
            <figure class="wb-sys-vin-gallery__cell"><img src="${IMG_VIN_GAL2}" alt="Training floor" width="400" height="220" loading="lazy" decoding="async" /></figure>
            <figure class="wb-sys-vin-gallery__cell"><img src="${IMG_VIN_GAL3}" alt="Vintage iron" width="400" height="220" loading="lazy" decoding="async" /></figure>
          </div>
        </div>
      </section>`;
    return dsSection('Gallery', inner);
  }
  if (set === 'liquidfit') {
    const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--liquidfit">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-liq-gallery__head">
          <span class="wb-sys-eyebrow">Gallery</span>
          <h2 class="wb-sys-h2 wb-sys-h2--liq">Flow state on the floor</h2>
          <p class="wb-sys-sub wb-sys-sub--liq">Liquid frames—swap photos to match your facility energy.</p>
        </div>
        <div class="wb-sys-liq-gallery">
          <figure class="wb-sys-liq-gallery__cell wb-sys-liq-gallery__cell--a"><img src="${IMG_LIQ_G1}" alt="Training" width="520" height="320" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
          <figure class="wb-sys-liq-gallery__cell wb-sys-liq-gallery__cell--b"><img src="${IMG_LIQ_G2}" alt="Members" width="520" height="320" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
          <figure class="wb-sys-liq-gallery__cell wb-sys-liq-gallery__cell--c"><img src="${IMG_LIQ_G3}" alt="Gym floor" width="520" height="320" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
        </div>
      </section>`;
    return dsSection('Gallery', inner);
  }
  if (set === 'junglebeast') {
    const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--junglebeast">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-jng-gallery__head">
          <span class="wb-sys-eyebrow">Gallery</span>
          <h2 class="wb-sys-h2 wb-sys-h2--jng">The beast in action</h2>
          <p class="wb-sys-sub wb-sys-sub--jng">Frames from your reference scroll—swap for your own facility shots anytime.</p>
        </div>
        <div class="wb-sys-jng-gallery">
          <figure class="wb-sys-jng-gallery__cell"><img src="${IMG_JNG_GALLERY}" alt="Training floor" width="400" height="240" loading="lazy" decoding="async" style="object-position:12% center" /></figure>
          <figure class="wb-sys-jng-gallery__cell"><img src="${IMG_JNG_GALLERY}" alt="Members training" width="400" height="240" loading="lazy" decoding="async" style="object-position:50% center" /></figure>
          <figure class="wb-sys-jng-gallery__cell"><img src="${IMG_JNG_GALLERY}" alt="Gym energy" width="400" height="240" loading="lazy" decoding="async" style="object-position:88% center" /></figure>
        </div>
      </section>`;
    return dsSection('Gallery', inner);
  }
  if (set === 'cyberfit') {
    const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--cyberfit">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Gallery</span>
          <h2 class="wb-sys-h2 wb-sys-h2--cyb">Inside the grid</h2>
          <p class="wb-sys-sub wb-sys-sub--cyb">Three neon bays—tight spacing, heavy grade. Replace images to match your facility.</p>
        </div>
        <div class="wb-sys-cyb-gallery">
          <figure class="wb-sys-cyb-gallery__cell wb-sys-cyb-imgfx"><img src="${IMG_G1}" alt="Training floor" width="640" height="380" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
          <figure class="wb-sys-cyb-gallery__cell wb-sys-cyb-imgfx"><img src="${IMG_G2}" alt="Gym interior" width="640" height="380" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
          <figure class="wb-sys-cyb-gallery__cell wb-sys-cyb-imgfx"><img src="${IMG_G3}" alt="Equipment" width="640" height="380" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>
        </div>
      </section>`;
    return dsSection('Gallery', inner);
  }
  if (set === 'glassmorph') {
    const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--glassmorph">
        <div class="wb-sys-section__head wb-sys-section__head--center wb-sys-gls-gallery__head">
          <span class="wb-sys-eyebrow">Gallery</span>
          <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">Inside the studio</h2>
          <p class="wb-sys-sub wb-sys-sub--gls">Bright spaces, premium equipment, and a calm high-performance atmosphere.</p>
        </div>
        <div class="wb-sys-gls-gallery">
          <figure class="wb-sys-gls-gallery__cell wb-sys-gls-imgfx"><img src="${IMG_G1}" alt="Gym floor" width="520" height="320" loading="lazy" decoding="async" /></figure>
          <figure class="wb-sys-gls-gallery__cell wb-sys-gls-imgfx"><img src="${IMG_G2}" alt="Training area" width="520" height="320" loading="lazy" decoding="async" /></figure>
          <figure class="wb-sys-gls-gallery__cell wb-sys-gls-imgfx"><img src="${IMG_G3}" alt="Equipment" width="520" height="320" loading="lazy" decoding="async" /></figure>
          <figure class="wb-sys-gls-gallery__cell wb-sys-gls-imgfx"><img src="${IMG_G4}" alt="Members training" width="520" height="320" loading="lazy" decoding="async" /></figure>
        </div>
      </section>`;
    return dsSection('Gallery', inner);
  }
  const slideCount = 4;
  const carouselSkin =
    set === 'power' ? ' wb-sys-carousel--pwr'
    : set === 'focus' ? ' wb-sys-carousel--foc'
    : set === 'prime' ? ' wb-sys-carousel--prm'
    : set === 'elite' ? ' wb-sys-carousel--eli'
    : set === 'energy' ? ' wb-sys-carousel--eng'
    : set === 'sporty' ? ' wb-sys-carousel--spo'
    : '';
  const autoplay =
    set === 'power' || set === 'focus' || set === 'prime' || set === 'elite' || set === 'energy' || set === 'sporty' ?
      ' data-wb-ds-gallery-autoplay="5600"'
    : '';
  const dots = galleryCarouselDots(slideCount);
  const inner = `
      <section id="gallery" class="wb-sys wb-sys-section wb-sys--${set}">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Gallery</span>
          <h2 class="wb-sys-h2">Inside the gym</h2>
          <p class="wb-sys-sub">Premium strip gallery—use arrows, dots, or swipe. Images are easy to swap.</p>
        </div>
        <div class="wb-sys-carousel${carouselSkin}" data-wb-ds-gallery="1"${autoplay}>
          <button type="button" class="wb-sys-carousel__btn wb-sys-carousel__btn--prev" aria-label="Previous photos">${DS_ICO.chevL}</button>
          <div class="wb-sys-carousel__viewport">
            <div class="wb-sys-carousel__track">
              <figure class="wb-sys-carousel__slide"><img src="${IMG_G1}" alt="Gym floor" width="520" height="320" loading="lazy" decoding="async" /></figure>
              <figure class="wb-sys-carousel__slide"><img src="${IMG_G2}" alt="Training area" width="520" height="320" loading="lazy" decoding="async" /></figure>
              <figure class="wb-sys-carousel__slide"><img src="${IMG_G3}" alt="Equipment" width="520" height="320" loading="lazy" decoding="async" /></figure>
              <figure class="wb-sys-carousel__slide"><img src="${IMG_G4}" alt="Members training" width="520" height="320" loading="lazy" decoding="async" /></figure>
            </div>
          </div>
          <button type="button" class="wb-sys-carousel__btn wb-sys-carousel__btn--next" aria-label="Next photos">${DS_ICO.chevR}</button>
          ${dots}
        </div>
      </section>`;
  return dsSection('Gallery', inner);
}

function mapHtml(set: DesignSetId): string {
  if (set === 'vintageiron') {
    const inner = `
      <section class="wb-sys wb-sys-section wb-sys--vintageiron wb-sys-vin-map-section">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2 wb-sys-h2--vin">Find the yard</h2>
          <p class="wb-sys-sub wb-sys-sub--vin-map">Vintage Iron HQ, Detroit MI 48201 · Mon–Sun 5:00–22:00</p>
        </div>
        <div class="wb-sys-vin-map">
          <div class="wb-sys-vin-map__texture" style="background-image:url(${IMG_VIN_MAP})" aria-hidden="true"></div>
          <div class="wb-sys-vin-map__pin" aria-hidden="true"></div>
          <iframe title="Gym location map" src="https://maps.google.com/maps?q=Detroit+MI&amp;z=12&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
    return dsSection('Maps', inner);
  }
  if (set === 'liquidfit') {
    const inner = `
      <section class="wb-sys wb-sys-section wb-sys--liquidfit wb-sys-liq-map-section">
        <div class="wb-sys-liq-map__wave" aria-hidden="true"></div>
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2 wb-sys-h2--liq">Find the flow</h2>
          <p class="wb-sys-sub wb-sys-sub--liq">Liquidfit Studio, Los Angeles CA 90028 · Mon–Sun 5:00–23:00</p>
        </div>
        <div class="wb-sys-map wb-sys-map--liq">
          <div class="wb-sys-map--liq__pin" aria-hidden="true"></div>
          <iframe title="Gym location map" src="https://maps.google.com/maps?q=Los+Angeles+CA&amp;z=12&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
    return dsSection('Maps', inner);
  }
  if (set === 'junglebeast') {
    const inner = `
      <section class="wb-sys wb-sys-section wb-sys--junglebeast">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2 wb-sys-h2--jng">Find us in the wild</h2>
          <p class="wb-sys-sub wb-sys-sub--jng">Jungle Beast HQ · Mon–Sun 05:00–23:00</p>
        </div>
        <div class="wb-sys-map wb-sys-map--jng">
          <iframe title="Gym location map" src="https://maps.google.com/maps?q=Miami+FL&amp;z=12&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
    return dsSection('Maps', inner);
  }
  if (set === 'cyberfit') {
    const inner = `
      <section class="wb-sys wb-sys-section wb-sys--cyberfit">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2 wb-sys-h2--cyb">Find us</h2>
          <p class="wb-sys-sub wb-sys-sub--cyb">Neon District HQ, Neo Tokyo 10011 · Mon–Sun 05:30–24:00</p>
        </div>
        <div class="wb-sys-map wb-sys-map--cyb-neon">
          <iframe title="Gym location map" src="https://maps.google.com/maps?q=Tokyo+Japan&amp;z=12&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
    return dsSection('Maps', inner);
  }
  if (set === 'glassmorph') {
    const inner = `
      <section class="wb-sys wb-sys-section wb-sys--glassmorph">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">Find us</h2>
          <p class="wb-sys-sub wb-sys-sub--gls">Tower Plaza, Midtown · Mon–Sun 5:30–23:00</p>
        </div>
        <div class="wb-sys-map wb-sys-map--gls-light">
          <iframe title="Gym location map" src="https://maps.google.com/maps?q=Midtown+New+York&amp;z=13&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
    return dsSection('Maps', inner);
  }
  const mapWrapClass =
    set === 'power' ? 'wb-sys-map wb-sys-map--pwr-night'
    : set === 'focus' ? 'wb-sys-map wb-sys-map--foc-night'
    : set === 'prime' ? 'wb-sys-map wb-sys-map--prm-night'
    : set === 'elite' ? 'wb-sys-map wb-sys-map--eli-light'
    : set === 'energy' ? 'wb-sys-map wb-sys-map--eng-light'
    : set === 'sporty' ? 'wb-sys-map wb-sys-map--spo-light'
    : 'wb-sys-map';
  const mapSub =
    set === 'prime' ?
      'Midtown studio, New York, NY 10001 · Mon–Sun 5:30–23:00'
    : set === 'elite' ?
      'Harbor District, San Diego, CA 92101 · Mon–Sun 5:00–22:00'
    : set === 'energy' ?
      'Riverside District, Austin, TX 78701 · Mon–Sun 5:00–22:00'
    : set === 'sporty' ?
      'Lakeside Ave, Chicago, IL 60614 · Mon–Sun 5:30–22:00'
    : '2nd Floor, Fitness Tower, MG Road — Bengaluru 560001 · Mon–Sun 6:00–22:00';
  const mapSrc =
    set === 'prime' ?
      'https://maps.google.com/maps?q=New+York+NY&amp;z=13&amp;output=embed'
    : set === 'elite' ?
      'https://maps.google.com/maps?q=San+Diego+CA&amp;z=12&amp;output=embed'
    : set === 'energy' ?
      'https://maps.google.com/maps?q=Austin+TX&amp;z=12&amp;output=embed'
    : set === 'sporty' ?
      'https://maps.google.com/maps?q=Chicago+IL&amp;z=12&amp;output=embed'
    : 'https://maps.google.com/maps?q=Bengaluru&amp;z=12&amp;output=embed';
  const inner = `
      <section class="wb-sys wb-sys-section wb-sys--${set}">
        <div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Visit</span>
          <h2 class="wb-sys-h2">Find us</h2>
          <p class="wb-sys-sub">${mapSub}</p>
        </div>
        <div class="${mapWrapClass}">
          <iframe title="Gym location map" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
  return dsSection('Maps', inner);
}

function contactHtml(set: DesignSetId): string {
  if (set === 'vintageiron') {
    const mail = 'hello@vintageiron.gym';
    const head = `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-vin-contact__head">
          <span class="wb-sys-eyebrow">Contact</span>
          <h2 class="wb-sys-h2 wb-sys-h2--vin">Get in touch</h2>
          <p class="wb-sys-sub wb-sys-sub--vin">Memberships, guest passes, or a tour of the floor—reach us any time.</p>
        </div>`;
    const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--vintageiron wb-sys-vin-contact">
        <div class="wb-sys-vin-panel wb-sys-vin-panel--parchment">
          ${head}
          <div class="wb-sys-contact-split wb-sys-vin-contact-split">
            <div class="wb-sys-contact__info">
              <div class="wb-sys-contact__line">
                <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
                <div><strong>Phone</strong><br /><a href="tel:+13135550177">+1 (313) 555-0177</a></div>
              </div>
              <div class="wb-sys-contact__line">
                <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
                <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
              </div>
              <div class="wb-sys-contact__line">
                <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
                <div><strong>Address</strong><br />Ironworks Ave, Detroit MI 48201</div>
              </div>
            </div>
            <form class="wb-sys-contact__form wb-sys-vin-contact__form">
              <input type="text" name="name" placeholder="Name" autocomplete="name" />
              <input type="email" name="email" placeholder="Email" autocomplete="email" />
              <textarea name="message" rows="4" placeholder="Message"></textarea>
              <button type="submit" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--vin-bronze">Send message</button>
            </form>
          </div>
        </div>
      </section>`;
    return dsSection('Contacts', inner);
  }
  if (set === 'liquidfit') {
    const mail = 'hello@liquidfit.studio';
    const head = `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-liq-contact__head">
          <span class="wb-sys-eyebrow">Contact</span>
          <h2 class="wb-sys-h2 wb-sys-h2--liq">We're here to help you flow</h2>
          <p class="wb-sys-sub wb-sys-sub--liq">Memberships, schedules, or your first session—reach us by phone, email, or the form.</p>
        </div>`;
    const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--liquidfit wb-sys-liq-contact">
        ${head}
        <div class="wb-sys-contact-split wb-sys-liq-contact-split">
          <div class="wb-sys-contact__info">
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
              <div><strong>Phone</strong><br /><a href="tel:+13235550188">+1 (323) 555-0188</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
              <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
              <div><strong>Address</strong><br />Flow District, Los Angeles CA 90028</div>
            </div>
          </div>
          <form class="wb-sys-contact__form wb-sys-liq-contact__form">
            <input type="text" name="name" placeholder="Name" autocomplete="name" />
            <input type="email" name="email" placeholder="Email" autocomplete="email" />
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="submit" class="wb-sys-btn wb-sys-btn--block wb-sys-btn--liq-gradient">Send message</button>
          </form>
        </div>
      </section>`;
    return dsSection('Contacts', inner);
  }
  if (set === 'junglebeast') {
    const mail = 'hello@junglebeast.fit';
    const head = `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-jng-contact__head">
          <span class="wb-sys-eyebrow">Contact</span>
          <h2 class="wb-sys-h2 wb-sys-h2--jng">Let's build your beast mode</h2>
          <p class="wb-sys-sub wb-sys-sub--jng">Call the den, email the pack, or send a message—we answer within one business day.</p>
        </div>`;
    const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--junglebeast wb-sys-jng-contact">
        ${head}
        <div class="wb-sys-contact-split wb-sys-jng-contact-split">
          <div class="wb-sys-contact__info">
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
              <div><strong>Phone</strong><br /><a href="tel:+13055550199">+1 (305) 555-0199</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
              <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
              <div><strong>Address</strong><br />Canopy District, Miami FL 33101</div>
            </div>
          </div>
          <form class="wb-sys-contact__form wb-sys-jng-contact__form">
            <input type="text" name="name" placeholder="Name" autocomplete="name" />
            <input type="email" name="email" placeholder="Email" autocomplete="email" />
            <input type="tel" name="phone" placeholder="Phone" inputmode="tel" autocomplete="tel" />
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="submit" class="wb-sys-btn wb-sys-btn--block">Send message</button>
          </form>
        </div>
      </section>`;
    return dsSection('Contacts', inner);
  }
  if (set === 'cyberfit') {
    const mail = 'hello@neondistrict.fit';
    const head = `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-cyb-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--cyb">Open a channel</h2>
          <p class="wb-sys-sub wb-sys-sub--cyb">Ping the desk, uplink email, or drop a packet in the form—we respond within one business cycle.</p>
        </div>`;
    const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--cyberfit">
        ${head}
        <div class="wb-sys-contact-split wb-sys-cyb-contact-split">
          <div class="wb-sys-contact__info">
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
              <div><strong>Phone</strong><br /><a href="tel:+13105550177">+1 (310) 555-0177</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
              <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
              <div><strong>Address</strong><br />Neon District HQ, Neo Tokyo 10011</div>
            </div>
          </div>
          <form class="wb-sys-contact__form wb-sys-cyb-contact__form">
            <input type="text" name="name" placeholder="Name" autocomplete="name" />
            <input type="email" name="email" placeholder="Email" autocomplete="email" />
            <input type="tel" name="phone" placeholder="Phone (10 digits)" inputmode="numeric" autocomplete="tel" />
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="submit" class="wb-sys-btn wb-sys-btn--block">Send message</button>
          </form>
        </div>
      </section>`;
    return dsSection('Contacts', inner);
  }
  if (set === 'glassmorph') {
    const mail = 'hello@glassmorph.fit';
    const head = `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-gls-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--gls-kicker">We are here to help</h2>
          <p class="wb-sys-sub wb-sys-sub--gls">Ask about memberships, schedules, or your first training plan.</p>
        </div>`;
    const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--glassmorph">
        ${head}
        <div class="wb-sys-contact-split wb-sys-gls-contact-split">
          <div class="wb-sys-contact__info">
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
              <div><strong>Phone</strong><br /><a href="tel:+12125550123">+1 (212) 555-0123</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
              <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
              <div><strong>Address</strong><br />Tower Plaza, Midtown, New York</div>
            </div>
          </div>
          <form class="wb-sys-contact__form wb-sys-gls-contact__form">
            <input type="text" name="name" placeholder="Name" autocomplete="name" />
            <input type="email" name="email" placeholder="Email" autocomplete="email" />
            <input type="tel" name="phone" placeholder="Phone (10 digits)" inputmode="numeric" autocomplete="tel" />
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="submit" class="wb-sys-btn wb-sys-btn--block">Send message</button>
          </form>
        </div>
      </section>`;
    return dsSection('Contacts', inner);
  }
  const mail =
    set === 'power' ? 'hello@gympower.com'
    : set === 'focus' ? 'hello@focusgym.com'
    : set === 'prime' ? 'hello@primefitness.com'
    : set === 'elite' ? 'hello@elitefitness.com'
    : set === 'energy' ? 'hello@energyfit.com'
    : set === 'sporty' ? 'hello@sportygym.com'
    : 'hello@apexgym.com';
  const head =
    set === 'power' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-pwr-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2">We will get back within one business day</h2>
          <p class="wb-sys-sub">Call the desk, email the team, or send a note from the form.</p>
        </div>`
    : set === 'focus' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-foc-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--foc-kicker">We reply within one business day</h2>
          <p class="wb-sys-sub">Phone, email, or the form—pick what is fastest for you.</p>
        </div>`
    : set === 'prime' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-prm-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--prm-kicker">We will get back within one business day</h2>
          <p class="wb-sys-sub">Call the front desk, email the member team, or send a note from the form.</p>
        </div>`
    : set === 'elite' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eli-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eli-kicker">We would love to hear from you</h2>
          <p class="wb-sys-sub">Membership questions, corporate plans, or a quick tour—reach us any time.</p>
        </div>`
    : set === 'energy' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-eng-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--eng-kicker">We will get back within one business day</h2>
          <p class="wb-sys-sub">Call the front desk, email the team, or drop a note—we are here to help you get started.</p>
        </div>`
    : set === 'sporty' ?
      `<div class="wb-sys-section__head wb-sys-section__head--center wb-sys-spo-contact__head">
          <span class="wb-sys-eyebrow">Get in touch</span>
          <h2 class="wb-sys-h2 wb-sys-h2--spo-kicker">We would love to hear from you</h2>
          <p class="wb-sys-sub">Membership questions, a guest pass, or a quick tour—reach us by phone, email, or the form.</p>
        </div>`
    : `<div class="wb-sys-section__head wb-sys-section__head--center">
          <span class="wb-sys-eyebrow">Contact</span>
          <h2 class="wb-sys-h2">Start a conversation</h2>
          <p class="wb-sys-sub">Reach the desk directly—or send a note and we will reply within one business day.</p>
        </div>`;
  const phone =
    set === 'prime' ?
      `<a href="tel:+12125550199">+1 (212) 555-0199</a>`
    : set === 'elite' ?
      `<a href="tel:+16195550120">+1 (619) 555-0120</a>`
    : set === 'energy' ?
      `<a href="tel:+15125550188">+1 (512) 555-0188</a>`
    : set === 'sporty' ?
      `<a href="tel:+13125550177">+1 (312) 555-0177</a>`
    : `<a href="tel:+919000000000">+91 90000 00000</a>`;
  const address =
    set === 'prime' ? '450 W 31st St, New York, NY 10001'
    : set === 'elite' ? '1200 Harbor View Ave, San Diego, CA 92101'
    : set === 'energy' ? '400 Riverside Dr, Austin, TX 78704'
    : set === 'sporty' ? '1800 N Sheffield Ave, Chicago, IL 60614'
    : 'MG Road, Bengaluru 560001';
  const inner = `
      <section id="contact" class="wb-sys wb-sys-section wb-sys--${set}">
        ${head}
        <div class="wb-sys-contact-split">
          <div class="wb-sys-contact__info">
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.phone}</span>
              <div><strong>Phone</strong><br />${phone}</div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mail}</span>
              <div><strong>Email</strong><br /><a href="mailto:${mail}">${mail}</a></div>
            </div>
            <div class="wb-sys-contact__line">
              <span class="wb-sys-contact__ico wb-sys-contact__ico--svg" aria-hidden="true">${DS_ICO.mapPin}</span>
              <div><strong>Address</strong><br />${address}</div>
            </div>
          </div>
          <form class="wb-sys-contact__form">
            <input type="text" name="name" placeholder="Name" autocomplete="name" />
            <input type="email" name="email" placeholder="Email" autocomplete="email" />
            <input type="tel" name="phone" placeholder="Phone (10 digits)" inputmode="numeric" autocomplete="tel" />
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="submit" class="wb-sys-btn wb-sys-btn--block">Send message</button>
          </form>
        </div>
      </section>`;
  return dsSection('Contacts', inner);
}

function footerHtml(set: DesignSetId): string {
  const brand =
    set === 'power' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--gympower"><span class="wb-sys-brand__gym">GYM</span><span class="wb-sys-brand__pwr">POWER</span></p>
            <p class="wb-sys-footer__tag">Hard training. Real community. Measurable progress.</p>
          </div>`
    : set === 'focus' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--focusgym">
              <span class="wb-sys-footer__logo-mark">${DS_ICO.focusMark}</span>
              <span class="wb-sys-brand__foc">FOCUS</span><span class="wb-sys-brand__gymtag">GYM</span>
            </p>
            <p class="wb-sys-footer__tag">Discipline on the floor. Clarity in programming. Progress you can measure.</p>
          </div>`
    : set === 'prime' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--primefit">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--prm">${DS_ICO.primeBolt}</span>
              <span class="wb-sys-brand__prm">PRIME</span><span class="wb-sys-brand__fitness">FITNESS</span>
            </p>
            <p class="wb-sys-footer__tag">Stronger together, every day.</p>
          </div>`
    : set === 'elite' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--elitefit">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--eli">${DS_ICO.eliteShield}</span>
              <span class="wb-sys-brand__eli">ELITE</span><span class="wb-sys-brand__fit">FITNESS</span>
            </p>
            <p class="wb-sys-footer__tag">Elevate your fitness lifestyle—every session, every season.</p>
          </div>`
    : set === 'energy' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--energyfit">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--en">${DS_ICO.energyShield}</span>
              <span class="wb-sys-brand__en">ENERGY</span><span class="wb-sys-brand__fit">FIT</span>
            </p>
            <p class="wb-sys-footer__tag">Feel the power. Live the energy. Be your best—every rep, every week.</p>
          </div>`
    : set === 'sporty' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--sportygym">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--spo">${DS_ICO.sportyMark}</span>
              <span class="wb-sys-brand__spo">SPORTY</span><span class="wb-sys-brand__gymnam">Gym</span>
            </p>
            <p class="wb-sys-footer__tag">Your goals, our mission—training that feels clear, supportive, and built to last.</p>
          </div>`
    : set === 'cyberfit' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--cyberfit">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--cyb">${DS_ICO.cyberMark}</span>
              <span class="wb-sys-footer__cyb-gradient">Neon District</span>
            </p>
            <p class="wb-sys-footer__tag wb-sys-footer__tag--cyb">Train beyond limits—neon discipline, measurable voltage, zero downtime.</p>
          </div>`
    : set === 'glassmorph' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--glassmorph">
              <span class="wb-sys-footer__gls-wordmark">GLASSMORPH</span>
            </p>
            <p class="wb-sys-footer__tag wb-sys-footer__tag--gls">Modern transparency. Intelligent training. Measurable progress.</p>
          </div>`
    : set === 'junglebeast' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--junglebeast">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--jng">${DS_ICO.jungleMark}</span>
              <span class="wb-sys-footer__jng-wordmark">JUNGLE BEAST</span>
            </p>
            <p class="wb-sys-footer__tag wb-sys-footer__tag--jng">Train wild. Live bold. Stay untamed—neon discipline, jungle grit, zero excuses.</p>
          </div>`
    : set === 'liquidfit' ?
      `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo wb-sys-footer__logo--liquidfit">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--liq">${DS_ICO.liquidMark}</span>
              <span class="wb-sys-footer__liq-word">LIQUID<span class="wb-sys-footer__liq-fit">FIT</span></span>
            </p>
            <p class="wb-sys-footer__tag wb-sys-footer__tag--liq">New. You. Transform.</p>
          </div>`
    : set === 'vintageiron' ?
      `<div class="wb-sys-footer__brand wb-sys-footer__brand--vintageiron">
            <div class="wb-sys-footer__vin-barbell" aria-hidden="true">
              <img src="${IMG_VIN_FOOT}" alt="" width="800" height="180" loading="lazy" decoding="async" />
            </div>
            <p class="wb-sys-footer__logo wb-sys-footer__logo--vintageiron">
              <span class="wb-sys-footer__logo-mark wb-sys-footer__logo-mark--vin">${DS_ICO.vintageMark}</span>
              <span class="wb-sys-footer__vin-word">VINTAGE<span class="wb-sys-footer__vin-iron">IRON</span></span>
            </p>
            <p class="wb-sys-footer__tag wb-sys-footer__tag--vin">Old school iron. Real community. No shortcuts.</p>
          </div>`
    : `<div class="wb-sys-footer__brand">
            <p class="wb-sys-footer__logo">APEX GYM</p>
            <p class="wb-sys-footer__tag">Strength, community, and measurable outcomes—built for members who show up.</p>
          </div>`;
  const socialLinks =
    set === 'power' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link">${DS_ICO.socialX}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>`
    : set === 'prime' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link">${DS_ICO.socialX}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>`
    : set === 'focus' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Twitter" class="wb-sys-footer__social-link">${DS_ICO.socialTw}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>`
    : set === 'elite' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Twitter" class="wb-sys-footer__social-link">${DS_ICO.socialTw}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>`
    : set === 'energy' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Twitter" class="wb-sys-footer__social-link">${DS_ICO.socialTw}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>`
    : set === 'sporty' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Twitter" class="wb-sys-footer__social-link">${DS_ICO.socialTw}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link">${DS_ICO.socialLi}</a>`
    : set === 'cyberfit' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link wb-sys-footer__social-link--cyb">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link wb-sys-footer__social-link--cyb">${DS_ICO.socialX}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link wb-sys-footer__social-link--cyb">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link wb-sys-footer__social-link--cyb">${DS_ICO.socialLi}</a>`
    : set === 'glassmorph' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link wb-sys-footer__social-link--gls">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link wb-sys-footer__social-link--gls">${DS_ICO.socialX}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link wb-sys-footer__social-link--gls">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link wb-sys-footer__social-link--gls">${DS_ICO.socialLi}</a>`
    : set === 'junglebeast' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link wb-sys-footer__social-link--jng">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link wb-sys-footer__social-link--jng">${DS_ICO.socialX}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link wb-sys-footer__social-link--jng">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link wb-sys-footer__social-link--jng">${DS_ICO.socialLi}</a>`
    : set === 'liquidfit' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link wb-sys-footer__social-link--liq">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link wb-sys-footer__social-link--liq">${DS_ICO.socialX}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link wb-sys-footer__social-link--liq">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link wb-sys-footer__social-link--liq">${DS_ICO.socialLi}</a>`
    : set === 'vintageiron' ?
      `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link wb-sys-footer__social-link--vin">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link wb-sys-footer__social-link--vin">${DS_ICO.socialIg}</a>
              <a href="#" aria-label="X" class="wb-sys-footer__social-link wb-sys-footer__social-link--vin">${DS_ICO.socialX}</a>
              <a href="#" aria-label="LinkedIn" class="wb-sys-footer__social-link wb-sys-footer__social-link--vin">${DS_ICO.socialLi}</a>`
    : `<a href="#" aria-label="Facebook" class="wb-sys-footer__social-link">${DS_ICO.socialFb}</a>
              <a href="#" aria-label="Twitter" class="wb-sys-footer__social-link">${DS_ICO.socialTw}</a>
              <a href="#" aria-label="Instagram" class="wb-sys-footer__social-link">${DS_ICO.socialIg}</a>`;
  const copy =
    set === 'power' ?
      `© ${new Date().getFullYear()} Gym Power. All rights reserved.`
    : set === 'focus' ?
      `© ${new Date().getFullYear()} Focus Gym. All rights reserved.`
    : set === 'prime' ?
      `© ${new Date().getFullYear()} Prime Fitness. All rights reserved.`
    : set === 'elite' ?
      `© ${new Date().getFullYear()} Elite Fitness. All rights reserved.`
    : set === 'energy' ?
      `© ${new Date().getFullYear()} Energy Fit. All rights reserved.`
    : set === 'sporty' ?
      `© ${new Date().getFullYear()} Sporty Gym. All rights reserved.`
    : set === 'cyberfit' ?
      `© ${new Date().getFullYear()} Neon District. All rights reserved.`
    : set === 'glassmorph' ?
      `© ${new Date().getFullYear()} GLASSMORPH. All rights reserved.`
    : set === 'junglebeast' ?
      `© ${new Date().getFullYear()} Jungle Beast. All rights reserved.`
    : set === 'liquidfit' ?
      `© ${new Date().getFullYear()} Liquidfit. All rights reserved.`
    : set === 'vintageiron' ?
      `© ${new Date().getFullYear()} Vintage Iron. All rights reserved.`
    : `© ${new Date().getFullYear()} Apex Gym. All rights reserved.`;
  const quickLinks =
    set === 'elite' || set === 'cyberfit' || set === 'glassmorph' || set === 'junglebeast' || set === 'liquidfit' ||
    set === 'vintageiron' ?
      `<li><a href="#">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#programs">Programs</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#contact">Contact</a></li>`
    : `<li><a href="#">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#programs">Programs</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>`;
  const footerSkin =
    set === 'elite' ? ' wb-sys-footer--eli'
    : set === 'energy' ? ' wb-sys-footer--eng'
    : set === 'sporty' ? ' wb-sys-footer--spo'
    : set === 'cyberfit' ? ' wb-sys-footer--cyb'
    : set === 'glassmorph' ? ' wb-sys-footer--gls'
    : set === 'junglebeast' ? ' wb-sys-footer--jng'
    : set === 'liquidfit' ? ' wb-sys-footer--liq'
    : set === 'vintageiron' ? ' wb-sys-footer--vin'
    : '';
  const inner = `
      <footer class="wb-sys wb-sys-footer wb-sys--${set}${footerSkin}">
        <div class="wb-sys-footer__grid">
          ${brand}
          <div>
            <p class="wb-sys-footer__title">Quick links</p>
            <ul class="wb-sys-footer__list">
              ${quickLinks}
            </ul>
          </div>
          <div>
            <p class="wb-sys-footer__title">Follow us</p>
            <div class="wb-sys-footer__social">
              ${socialLinks}
            </div>
          </div>
        </div>
        <p class="wb-sys-footer__copy">${copy}</p>
      </footer>`;
  return dsSection('Footer', inner);
}

const SECTION_BUILDERS: Record<string, (set: DesignSetId) => string> = {
  nav: navHtml,
  hero: heroHtml,
  about: aboutHtml,
  features: featuresHtml,
  pricing: pricingHtml,
  gallery: galleryHtml,
  map: mapHtml,
  contact: contactHtml,
  footer: footerHtml,
};

/** Section order when inserting a full page for one design set (must match SECTION_BUILDERS). */
export const DESIGN_SYSTEM_SECTION_ORDER = [
  'nav',
  'hero',
  'about',
  'features',
  'pricing',
  'gallery',
  'map',
  'contact',
  'footer',
] as const satisfies readonly (keyof typeof SECTION_BUILDERS)[];

/** Section HTML only — `gjs-pro-template` wraps with `wb-template-root` like other Pro seeds. */
export function getDesignSystemTemplatePayloadForBuilder(setId: DesignSystemSetId): { html: string; css: string } {
  const inner = DESIGN_SYSTEM_SECTION_ORDER.map((key) => SECTION_BUILDERS[key](setId)).join('\n');
  return { html: inner, css: '' };
}

const SECTION_LABELS: Record<string, string> = {
  nav: 'Navbar',
  hero: 'Hero',
  about: 'About',
  features: 'Features',
  pricing: 'Pricing',
  gallery: 'Gallery',
  map: 'Map',
  contact: 'Contact',
  footer: 'Footer',
};

export function registerDesignSystemBlocks(editor: Editor) {
  const bm = editor.BlockManager;
  for (const s of DESIGN_SYSTEM_SETS) {
    for (const key of Object.keys(SECTION_BUILDERS)) {
      const id = `wb-ds-${s.id}-${key}`;
      const label = `${s.label} · ${SECTION_LABELS[key]}`;
      bm.add(id, {
        label,
        category: s.category,
        content: SECTION_BUILDERS[key](s.id),
      });
    }
  }
}

export const DESIGN_SYSTEM_BLOCK_IDS: string[] = DESIGN_SYSTEM_SETS.flatMap((s) =>
  Object.keys(SECTION_BUILDERS).map((k) => `wb-ds-${s.id}-${k}`),
);

const DS_PREVIEW: Record<string, ComponentLibraryPreviewKind> = {
  nav: 'nav',
  hero: 'hero',
  about: 'content',
  features: 'content',
  pricing: 'pricing',
  gallery: 'content',
  map: 'embed',
  contact: 'form',
  footer: 'footer',
};

/** Library entries for the component picker (filter: design-systems). */
export function buildDesignSystemCatalogEntries(): ComponentCatalogEntry[] {
  const out: ComponentCatalogEntry[] = [];
  for (const s of DESIGN_SYSTEM_SETS) {
    for (const key of Object.keys(SECTION_BUILDERS)) {
      const sec = SECTION_LABELS[key];
      out.push({
        blockId: `wb-ds-${s.id}-${key}`,
        title: `${s.label} · ${sec}`,
        description: `${sec} for the ${s.label} design set—use every section from one column of the template grid for a matching full page.`,
        filter: 'design-systems',
        preview: DS_PREVIEW[key] ?? 'content',
      });
    }
  }
  return out;
}
