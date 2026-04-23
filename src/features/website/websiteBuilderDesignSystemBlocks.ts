import type { Editor } from 'grapesjs';
import type { ComponentCatalogEntry, ComponentLibraryPreviewKind } from './websiteBuilderComponentCatalog';
import { DS_ICO } from './websiteBuilderDesignSystemIcons';

/** Six visual systems aligned to the fitness landing reference grid (POWER … SPORTY). */
export type DesignSystemSetId = 'power' | 'elite' | 'focus' | 'energy' | 'prime' | 'sporty';

type DesignSetId = DesignSystemSetId;

export const DESIGN_SYSTEM_SETS: { id: DesignSetId; category: string; label: string }[] = [
  { id: 'power', category: 'Design · POWER', label: 'POWER' },
  { id: 'elite', category: 'Design · ELITE', label: 'ELITE' },
  { id: 'focus', category: 'Design · FOCUS', label: 'FOCUS' },
  { id: 'energy', category: 'Design · ENERGY', label: 'ENERGY' },
  { id: 'prime', category: 'Design · PRIME', label: 'PRIME' },
  { id: 'sporty', category: 'Design · SPORTY', label: 'SPORTY' },
];

const IMG_HERO =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&auto=format&fit=crop&q=88';
const IMG_ABOUT =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=86';
const IMG_G1 =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=960&auto=format&fit=crop&q=86';
const IMG_G2 =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=960&auto=format&fit=crop&q=86';
const IMG_G3 =
  'https://images.unsplash.com/photo-1581009146145-5e350ccc1b5e?w=960&auto=format&fit=crop&q=86';
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
          <a href="#" class="wb-sys-brand wb-sys-brand--gympower" aria-label="Gym Power home">
            <span class="wb-sys-brand__mark">${DS_ICO.bolt}</span><span class="wb-sys-brand__gym">GYM</span><span class="wb-sys-brand__pwr">POWER</span>
          </a>
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
          <a href="#" class="wb-sys-brand wb-sys-brand--focusgym" aria-label="Focus Gym home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--foc">${DS_ICO.focusMark}</span><span class="wb-sys-brand__foc">FOCUS</span><span class="wb-sys-brand__gymtag">GYM</span>
          </a>
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
          <a href="#" class="wb-sys-brand wb-sys-brand--primefit" aria-label="Prime Fitness home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--prm">${DS_ICO.primeBolt}</span><span class="wb-sys-brand__prm">PRIME</span><span class="wb-sys-brand__fitness">FITNESS</span>
          </a>
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
          <a href="#" class="wb-sys-brand wb-sys-brand--elitefit" aria-label="Elite Fitness home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--eli">${DS_ICO.eliteShield}</span><span class="wb-sys-brand__eli">ELITE</span><span class="wb-sys-brand__fit">FITNESS</span>
          </a>
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
          <a href="#" class="wb-sys-brand wb-sys-brand--energyfit" aria-label="Energy Fit home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--en">${DS_ICO.energyShield}</span><span class="wb-sys-brand__en">ENERGY</span><span class="wb-sys-brand__fit">FIT</span>
          </a>
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
          <a href="#" class="wb-sys-brand wb-sys-brand--sportygym" aria-label="Sporty Gym home">
            <span class="wb-sys-brand__mark wb-sys-brand__mark--spo">${DS_ICO.sportyMark}</span><span class="wb-sys-brand__spo">SPORTY</span><span class="wb-sys-brand__gymnam">Gym</span>
          </a>
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
  return dsSection(
    'Nav',
    `<nav class="wb-sys wb-sys-nav wb-sys--${set}">
        <div class="wb-sys-nav__inner wb-sys-nav__inner--bar">
          <a href="#" class="wb-sys-brand">APEX GYM</a>
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
            <textarea name="message" rows="4" placeholder="Message"></textarea>
            <button type="button" class="wb-sys-btn wb-sys-btn--block" data-wb-open="enquiry">Send message</button>
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
    : `© ${new Date().getFullYear()} Apex Gym. All rights reserved.`;
  const quickLinks =
    set === 'elite' ?
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
