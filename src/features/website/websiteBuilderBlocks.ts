import type { Editor } from 'grapesjs';
import { registerDesignSystemBlocks } from './websiteBuilderDesignSystemBlocks';
import { registerIconBlocks } from './websiteBuilderIconBlocks';

const WB_ANIM_CLASSES = ['wb-fade-up', 'wb-fade-in', 'wb-slide-left', 'wb-slide-right', 'wb-zoom-in', 'wb-pulse'];

function syncAnimationClasses(component: {
  getAttributes: () => Record<string, string>;
  removeClass: (c: string) => void;
  addClass: (c: string) => void;
}) {
  const attrs = component.getAttributes();
  const anim = (attrs['data-wb-anim'] ?? '').trim();
  WB_ANIM_CLASSES.forEach((c) => component.removeClass(c));
  if (anim && WB_ANIM_CLASSES.includes(anim)) {
    component.addClass(anim);
  }
  const delay = (attrs['data-wb-anim-delay'] ?? '').trim();
  const el = (component as unknown as { getEl?: () => HTMLElement | undefined }).getEl?.();
  if (el?.style) {
    el.style.animationDelay = delay && !Number.isNaN(Number(delay)) ? `${delay}ms` : '';
  }
}

function animTraits() {
  return [
    {
      type: 'select',
      label: 'Entrance',
      name: 'data-wb-anim',
      options: [
        { id: '', name: 'None' },
        { id: 'wb-fade-up', name: 'Fade up' },
        { id: 'wb-fade-in', name: 'Fade in' },
        { id: 'wb-slide-left', name: 'Slide left' },
        { id: 'wb-slide-right', name: 'Slide right' },
        { id: 'wb-zoom-in', name: 'Zoom in' },
        { id: 'wb-pulse', name: 'Pulse (loop)' },
      ],
    },
    {
      type: 'text',
      label: 'Anim delay (ms)',
      name: 'data-wb-anim-delay',
      placeholder: '0',
    },
  ];
}

/** Traits for layout blocks that should support motion presets. */
function registerAnimatableTag(editor: Editor, tag: string) {
  const tagUpper = tag.toUpperCase();
  editor.DomComponents.addType(tag, {
    extend: 'default',
    isComponent: (el) => (el as HTMLElement).tagName === tagUpper,
    model: {
      defaults: {
        traits: [...animTraits()],
      },
      init(this: {
        on: (ev: string, fn: () => void) => void;
        getAttributes: () => Record<string, string>;
        removeClass: (c: string) => void;
        addClass: (c: string) => void;
      }) {
        this.on('change:attributes', () => syncAnimationClasses(this));
        syncAnimationClasses(this);
      },
    },
  });
}

/** Official-style WhatsApp mark (single path), currentColor for theming. */
const WB_WA_ICON_SVG = `<svg class="wb-wa-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

export function waMeHrefFromDigits(raw: string): string {
  const d = raw.replace(/\D/g, '');
  return d ? `https://wa.me/${d}` : 'https://wa.me/';
}

/**
 * WhatsApp chat links: inspector phone field + wa.me deep link. Markup uses class `wb-wa-btn` or `wb-wa-float`.
 */
export function registerWhatsAppLinkType(editor: Editor) {
  editor.DomComponents.addType('whatsapp-link', {
    isComponent: (el) => {
      const a = el as HTMLElement;
      if (a.tagName !== 'A') return undefined;
      if (a.classList.contains('wb-wa-btn') || a.classList.contains('wb-wa-float')) {
        return { type: 'whatsapp-link' };
      }
      return undefined;
    },
    model: {
      defaults: {
        tagName: 'a',
        traits: [
          {
            type: 'text',
            label: 'WhatsApp number',
            name: 'data-wb-wa-phone',
            placeholder: 'e.g. 15551234567 or +1 555 123 4567',
          },
        ],
      },
      init(this: {
        on: (ev: string, fn: () => void) => void;
        getAttributes: () => Record<string, string>;
        addAttributes: (a: Record<string, string>) => void;
      }) {
        const syncHref = () => {
          const attrs = this.getAttributes();
          const raw = String(attrs['data-wb-wa-phone'] ?? '').trim();
          const next = waMeHrefFromDigits(raw);
          const cur = String(attrs.href ?? '').trim();
          if (cur !== next) this.addAttributes({ href: next });
        };
        this.on('change:attributes', syncHref);
        syncHref();
      },
    },
  });
}

export function registerLinkButtonType(editor: Editor) {
  editor.DomComponents.addType('link-button', {
    isComponent: (el) => {
      if ((el as HTMLElement)?.tagName === 'A' && (el as HTMLElement).classList?.contains('wb-link-btn')) {
        return { type: 'link-button' };
      }
      return undefined;
    },
    model: {
      defaults: {
        tagName: 'a',
        attributes: { href: '#', class: 'wb-link-btn', target: '' },
        components: 'Join now',
        traits: [
          { type: 'text', label: 'Link URL', name: 'href', placeholder: '/plans or #section-id' },
          {
            type: 'select',
            label: 'Open in',
            name: 'target',
            options: [
              { id: '', name: 'Same tab' },
              { id: '_blank', name: 'New tab' },
            ],
          },
        ],
      },
    },
  });
}

export function registerAnimatableComponents(editor: Editor) {
  for (const tag of ['section', 'header', 'footer', 'nav', 'article', 'main']) {
    registerAnimatableTag(editor, tag);
  }
}

export function registerSectionBlocks(editor: Editor) {
  const bm = editor.BlockManager;

  bm.add('wb-brochure-download', {
    label: 'Brochure download',
    category: 'Marketing',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Resource</span>
        <div class="component-title">Download brochure</div>
        <div class="component-desc">A polished PDF drop-in for timetables, pricing, and FAQs—set your file URL on the button after adding.</div>
        <a class="component-btn" href="#" download>Download PDF</a>
      </div>
    `,
  });

  bm.add('wb-header-1', {
    label: 'Hero · centered',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-fade-up wb-hero-premium" style="padding:clamp(3.5rem, 9vw, 5.75rem) 1.35rem; text-align:center; color:#fff;">
        <div class="wb-hero-premium__inner">
          <span class="component-eyebrow" style="color: rgba(226, 232, 240, 0.88);">Performance training</span>
          <h1 style="margin:0 0 0.65rem; font-size:clamp(2rem, 4.5vw, 2.85rem); font-weight:800; letter-spacing:-0.03em; line-height:1.1;">Build strength that lasts</h1>
          <p style="margin:0 0 1.35rem; font-size:1.05rem; line-height:1.58; color:#cbd5e1; opacity:0.95;">Premium coaching, smart programming, and a community that keeps members accountable—built for people who expect more from their gym.</p>
          <button type="button" class="component-btn" data-wb-open="join">Join now</button>
        </div>
      </section>
    `,
  });

  bm.add('wb-header-2', {
    label: 'Hero · split',
    category: 'Sections',
    content: `
      <header class="wb-add-el wb-slide-left wb-hero-premium" style="padding:clamp(3.5rem,8vw,5.25rem) 1.35rem; color:#fff;">
        <div class="wb-hero-split wb-add-el">
          <div class="wb-hero-premium__inner" style="text-align:left; padding:0;">
            <span class="component-eyebrow" style="color: rgba(226, 232, 240, 0.88);">Split narrative</span>
            <h1 style="font-size:clamp(2rem,4vw,2.65rem); margin:0 0 0.65rem; font-weight:800; letter-spacing:-0.03em; line-height:1.08;">Stronger, together</h1>
            <p style="margin:0 0 1.25rem; font-size:1.05rem; line-height:1.58; color:#cbd5e1;">Coaching depth, community energy, and a floor tuned for measurable progress—not busywork.</p>
            <div style="display:flex; flex-wrap:wrap; gap:0.65rem; align-items:center;">
              <button type="button" class="component-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit;">Join now</button>
              <a href="#pricing" style="color:#bfdbfe; font-weight:600; text-decoration:none; padding:0.5rem 0.15rem; border-bottom:1px solid rgba(191,219,254,0.45);">View plans</a>
            </div>
          </div>
          <div style="min-height:14rem; border-radius:18px; background:linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)); border:1px solid rgba(255,255,255,0.14); box-shadow:0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12); position:relative; overflow:hidden;">
            <div style="position:absolute; inset:0; background:radial-gradient(70% 60% at 30% 20%,rgba(96,165,250,0.22),transparent 55%); pointer-events:none;"></div>
            <div style="position:absolute; bottom:1rem; left:1rem; right:1rem; padding:0.65rem 0.85rem; border-radius:12px; background:rgba(15,23,42,0.55); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); font-size:0.78rem; color:#e2e8f0;">Swap for hero photography or product UI</div>
          </div>
        </div>
      </header>
    `,
  });

  bm.add('wb-header-3', {
    label: 'Hero · minimal',
    category: 'Sections',
    content: `
      <header class="wb-add-el wb-fade-in" style="padding:clamp(3.25rem,7vw,4.5rem) 1.35rem; text-align:center; background:linear-gradient(180deg,#fff 0%,#f8fafc 100%); color:#0f172a; border-bottom:1px solid rgba(148,163,184,0.2);">
        <div style="max-width:40rem; margin:0 auto;">
          <span class="component-eyebrow">Editorial</span>
          <h1 style="margin:0.35rem 0 0.55rem; font-size:clamp(1.85rem,4vw,2.45rem); font-weight:800; letter-spacing:-0.035em; line-height:1.1;">Train with purpose</h1>
          <p style="margin:0 1.25rem; font-size:1rem; line-height:1.62; color:#64748b;">Quiet confidence: one headline, one line of proof, one decisive action—how premium SaaS opens a story.</p>
          <button type="button" class="component-btn" data-wb-open="visit" style="margin-top:1.15rem; border:0; cursor:pointer; font:inherit;">Plan a visit</button>
        </div>
      </header>
    `,
  });

  bm.add('wb-about-1', {
    label: 'About · simple',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-fade-in wb-section-shell" style="padding:3rem 0;">
        <div class="component-card" style="max-width:48rem; margin:0 auto;">
          <span class="component-eyebrow">Our story</span>
          <h2 class="component-title" style="font-size:1.45rem; margin-bottom:0.5rem;">Engineered for progress</h2>
          <p class="component-desc" style="margin:0; max-width:none;">World-class equipment, evidence-based coaching, and a member experience designed to feel as serious as your goals.</p>
        </div>
      </section>
    `,
  });

  bm.add('wb-set-ocean-flow', {
    label: 'Set · Ocean flow (nav+hero+footer)',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-template-root" style="background:linear-gradient(180deg,#f0f7ff,#f8fbff);">
        <nav class="wb-fade-in" style="padding:0.85rem 1.25rem; background:rgba(15,23,42,0.92); backdrop-filter:blur(12px); color:#fff; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div class="wb-nav-stack-sm" style="max-width:68rem; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <strong style="letter-spacing:0.04em; font-size:0.92rem;">OceanFit</strong>
            <div style="display:flex; gap:1.1rem; align-items:center; font-size:0.88rem;">
              <a href="#programs" style="color:#cbd5e1; text-decoration:none; font-weight:500;">Programs</a>
              <a href="#pricing" style="color:#cbd5e1; text-decoration:none; font-weight:500;">Pricing</a>
              <button type="button" class="wb-link-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit; padding:0.45rem 1rem;">Join now</button>
            </div>
          </div>
        </nav>
        <header class="wb-fade-up" style="padding:clamp(3.75rem,9vw,5.5rem) 1.35rem; text-align:center; background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#1e40af 100%); color:#fff; position:relative; overflow:hidden;">
          <div style="position:absolute; inset:0; background:radial-gradient(55% 50% at 50% -10%,rgba(255,255,255,0.2),transparent 60%); pointer-events:none;"></div>
          <div style="position:relative;">
            <span class="component-eyebrow" style="color:rgba(226,232,240,0.9);">Signature set</span>
            <h1 style="margin:0.4rem 0 0.55rem; font-size:clamp(2rem,4.5vw,2.75rem); font-weight:800; letter-spacing:-0.03em; line-height:1.08;">Train with momentum</h1>
            <p style="margin:0 auto 1.35rem; max-width:36rem; font-size:1.05rem; line-height:1.58; color:#e0e7ff;">Strength, conditioning, and lifestyle—one cohesive experience members feel from day one.</p>
            <button type="button" class="wb-link-btn" data-wb-open="visit" style="border:0; cursor:pointer; font:inherit; background:#fff; color:#1d4ed8; box-shadow:0 12px 40px rgba(0,0,0,0.2);">Plan a visit</button>
          </div>
        </header>
        <footer class="wb-fade-in" style="padding:1.35rem 1.25rem; background:#020617; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.12);">
          <div style="max-width:68rem; margin:0 auto; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center; font-size:0.88rem;">
            <span style="color:#e2e8f0; font-weight:600;">OceanFit Studio</span>
            <a href="#" data-wb-open="enquiry" style="color:#93c5fd; text-decoration:none; font-weight:600;">Send enquiry</a>
          </div>
        </footer>
      </section>
    `,
  });

  bm.add('wb-set-sunset-energy', {
    label: 'Set · Sunset energy (nav+hero+footer)',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-template-root" style="background:linear-gradient(180deg,#fff7ed,#fffbeb);">
        <nav class="wb-slide-right" style="padding:0.85rem 1.25rem; background:#030712; color:#fff; border-bottom:1px solid rgba(249,115,22,0.2);">
          <div class="wb-nav-stack-sm" style="max-width:68rem; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <strong style="letter-spacing:0.06em; font-size:0.88rem;">PulseLab</strong>
            <div style="display:flex; gap:1rem; align-items:center; font-size:0.88rem;">
              <a href="#coaches" style="color:#d1d5db; text-decoration:none;">Coaches</a>
              <a href="#offers" style="color:#d1d5db; text-decoration:none;">Offers</a>
              <button type="button" class="wb-link-btn" data-wb-open="trial" style="border:0; cursor:pointer; font:inherit; background:linear-gradient(135deg,#fb923c,#ea580c); box-shadow:0 8px 24px rgba(234,88,12,0.35);">Free trial</button>
            </div>
          </div>
        </nav>
        <header class="wb-slide-left" style="padding:clamp(3.5rem,8vw,5rem) 1.35rem; background:linear-gradient(125deg,#0f172a 0%,#431407 55%,#7c2d12 100%); color:#fff; position:relative; overflow:hidden;">
          <div style="position:absolute; inset:0; background:radial-gradient(40% 50% at 85% 20%,rgba(251,146,60,0.25),transparent 55%); pointer-events:none;"></div>
          <div style="max-width:40rem; margin:0 auto; position:relative; text-align:center;">
            <span class="component-eyebrow" style="color:#fed7aa;">High-energy</span>
            <h1 style="margin:0.4rem 0 0.55rem; font-size:clamp(1.95rem,4vw,2.65rem); font-weight:800; letter-spacing:-0.03em; line-height:1.08;">Build strength that lasts</h1>
            <p style="margin:0 0 1.15rem; opacity:0.92; font-size:1.02rem; line-height:1.58; color:#ffedd5;">Structured plans, loud accountability, and a floor that rewards consistency.</p>
            <button type="button" class="wb-link-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit;">Start now</button>
          </div>
        </header>
        <footer class="wb-fade-in" style="padding:1.25rem 1.25rem; background:#030712; color:#9ca3af; border-top:1px solid rgba(255,255,255,0.06);">
          <div style="max-width:68rem; margin:0 auto; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center; font-size:0.86rem;">
            <span style="color:#e5e7eb;">Mon–Sat · 6:00 – 22:00</span>
            <a href="#" data-wb-open="visit" style="color:#fdba74; text-decoration:none; font-weight:600;">Book a visit</a>
          </div>
        </footer>
      </section>
    `,
  });

  bm.add('wb-set-clean-minimal', {
    label: 'Set · Clean minimal (nav+hero+footer)',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-template-root" style="background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);">
        <nav class="wb-fade-in" style="padding:0.85rem 1.25rem; border-bottom:1px solid rgba(148,163,184,0.22); background:rgba(255,255,255,0.85); backdrop-filter:blur(10px);">
          <div class="wb-nav-stack-sm" style="max-width:67rem; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#0f172a; letter-spacing:0.04em; font-size:0.9rem;">ZenCore</strong>
            <div style="display:flex; gap:1rem; align-items:center; font-size:0.88rem;">
              <a href="#about" style="color:#334155; text-decoration:none; font-weight:500;">About</a>
              <a href="#pricing" style="color:#334155; text-decoration:none; font-weight:500;">Plans</a>
              <button type="button" class="wb-link-btn" data-wb-open="enquiry" style="border:0; cursor:pointer; font:inherit; background:#0f172a;">Contact</button>
            </div>
          </div>
        </nav>
        <header class="wb-zoom-in" style="padding:clamp(3.25rem,7vw,4.75rem) 1.35rem; text-align:center; color:#0f172a;">
          <div style="max-width:38rem; margin:0 auto;">
            <span class="component-eyebrow">Premium coaching</span>
            <h1 style="margin:0.35rem 0 0.5rem; font-size:clamp(1.85rem,4vw,2.4rem); font-weight:800; letter-spacing:-0.035em; line-height:1.1;">Simple plan. Strong results.</h1>
            <p style="margin:0 auto 1.15rem; max-width:32rem; color:#475569; line-height:1.62; font-size:1rem;">Routine you can repeat, progress you can see, and support that does not vanish after signup.</p>
            <button type="button" class="wb-link-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit;">Join now</button>
          </div>
        </header>
        <footer class="wb-fade-in" style="padding:1.15rem 1.25rem; border-top:1px solid rgba(148,163,184,0.2); color:#64748b; background:#fff;">
          <div style="max-width:67rem; margin:0 auto; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center; font-size:0.88rem;">
            <span style="font-weight:600; color:#334155;">ZenCore Performance</span>
            <a class="wb-wa-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" data-wb-wa-phone="919876543210" style="display:inline-flex;align-items:center;gap:0.35rem;color:#0f172a;text-decoration:none;font-weight:600;">
              ${WB_WA_ICON_SVG}
              <span>WhatsApp us</span>
            </a>
          </div>
        </footer>
      </section>
    `,
  });

  bm.add('wb-nav-1', {
    label: 'Nav · sticky bar',
    category: 'Sections',
    content: `
      <nav class="wb-add-el wb-fade-in" style="position:sticky; top:0; z-index:40; background:rgba(255,255,255,0.88); backdrop-filter:blur(12px); border-bottom:1px solid rgba(148,163,184,0.22); box-shadow:0 1px 0 rgba(255,255,255,0.9) inset;">
        <div class="wb-nav-stack-sm" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1.25rem; max-width:68rem; margin:0 auto;">
          <strong style="letter-spacing:0.08em; font-size:0.78rem; color:#0f172a;">GYM BRAND</strong>
          <div style="display:flex; gap:1.1rem; align-items:center; font-size:0.88rem;">
            <a href="#coaches" style="color:#334155; text-decoration:none; font-weight:500;">Coaches</a>
            <a href="#offers" style="color:#334155; text-decoration:none; font-weight:500;">Offers</a>
            <a href="#pricing" style="color:#334155; text-decoration:none; font-weight:500;">Pricing</a>
            <button type="button" class="wb-link-btn" data-wb-open="enquiry" style="padding:0.42rem 0.95rem; border:0; cursor:pointer; font:inherit;">Contact</button>
          </div>
        </div>
      </nav>
    `,
  });

  bm.add('wb-nav-2', {
    label: 'Nav · centered',
    category: 'Sections',
    content: `
      <nav class="wb-add-el wb-fade-in" style="background:linear-gradient(180deg,#0f172a,#020617); color:#fff; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:68rem; margin:0 auto; padding:1rem 1.25rem; display:flex; flex-direction:column; align-items:center; gap:0.65rem;">
          <strong style="letter-spacing:0.14em; font-size:0.72rem; color:#94a3b8;">GYM BRAND</strong>
          <div style="display:flex; gap:1.35rem; flex-wrap:wrap; justify-content:center; font-size:0.9rem;">
            <a href="#about" style="color:#e2e8f0; text-decoration:none; font-weight:500;">About</a>
            <a href="#pricing" style="color:#e2e8f0; text-decoration:none; font-weight:500;">Pricing</a>
            <a href="#" data-wb-open="visit" style="color:#93c5fd; text-decoration:none; font-weight:600;">Plan a visit</a>
          </div>
        </div>
      </nav>
    `,
  });

  bm.add('wb-nav-3', {
    label: 'Nav · pill links',
    category: 'Sections',
    content: `
      <nav class="wb-add-el wb-fade-in" style="background:linear-gradient(180deg,#f8fafc,#f1f5f9); border-bottom:1px solid rgba(148,163,184,0.2);">
        <div style="max-width:68rem; margin:0 auto; padding:0.75rem 1.25rem; display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
          <a href="#programs" style="padding:0.45rem 1rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); text-decoration:none; color:#0f172a; font-size:0.84rem; font-weight:600; box-shadow:0 1px 3px rgba(15,23,42,0.05);">Programs</a>
          <a href="#coaches" style="padding:0.45rem 1rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); text-decoration:none; color:#0f172a; font-size:0.84rem; font-weight:600; box-shadow:0 1px 3px rgba(15,23,42,0.05);">Coaches</a>
          <a href="#" data-wb-open="join" style="padding:0.45rem 1.1rem; border-radius:999px; background:linear-gradient(135deg,#0f172a,#1e293b); border:1px solid rgba(15,23,42,0.9); text-decoration:none; color:#fff; font-size:0.84rem; font-weight:700; box-shadow:0 6px 20px rgba(15,23,42,0.25);">Join</a>
        </div>
      </nav>
    `,
  });

  bm.add('wb-pricing-1', {
    label: 'Pricing · 3 cards',
    category: 'Sections',
    content: `
      <section id="pricing" class="wb-add-el wb-fade-up wb-section-shell" style="padding:3.75rem 0; background:linear-gradient(180deg,#f8fafc,#fff);">
        <div style="text-align:center; max-width:36rem; margin:0 auto 2.25rem;">
          <span class="component-eyebrow">Membership</span>
          <h2 style="margin:0.35rem 0 0; font-size:clamp(1.5rem,3vw,1.9rem); font-weight:800; letter-spacing:-0.03em; color:#0f172a;">Plans that scale with ambition</h2>
          <p style="margin:0.5rem 0 0; font-size:0.92rem; color:#64748b; line-height:1.55;">Three clear tiers—edit copy and wire CTAs to your join flow.</p>
        </div>
        <div class="wb-grid-autofill-3 wb-add-el">
          <article class="component-card" style="padding:1.35rem 1.25rem;">
            <span class="component-eyebrow">Entry</span>
            <h3 class="component-title" style="font-size:1.05rem; margin-top:0.15rem;">Starter</h3>
            <p style="margin:0.35rem 0 0.85rem; font-size:1.85rem; font-weight:800; letter-spacing:-0.02em; color:var(--primary,#2563eb);">$29<span style="font-size:0.75rem; font-weight:600; color:#64748b;">/mo</span></p>
            <p class="component-desc" style="font-size:0.82rem; margin-bottom:1rem;">Baseline access for a steady training habit.</p>
            <a class="component-btn" href="#" style="display:inline-flex; width:100%; justify-content:center; box-sizing:border-box;">Choose Starter</a>
          </article>
          <article class="wb-pulse component-card" style="padding:1.35rem 1.25rem; background:linear-gradient(165deg,#0f172a 0%,#1e293b 100%); color:#fff; border-color:rgba(255,255,255,0.12); box-shadow:0 20px 50px rgba(15,23,42,0.35); transform:translateY(-4px);">
            <span class="component-eyebrow" style="color:#93c5fd;">Most popular</span>
            <h3 class="component-title" style="font-size:1.05rem; margin-top:0.15rem; color:#fff;">Pro</h3>
            <p style="margin:0.35rem 0 0.85rem; font-size:1.85rem; font-weight:800; letter-spacing:-0.02em; color:#fff;">$59<span style="font-size:0.75rem; font-weight:600; color:#94a3b8;">/mo</span></p>
            <p class="component-desc" style="font-size:0.82rem; margin-bottom:1rem; color:#cbd5e1;">Unlimited floor + priority scheduling.</p>
            <a class="wb-link-btn" href="#" style="display:inline-flex; width:100%; justify-content:center; box-sizing:border-box; background:#fff; color:#0f172a;">Choose Pro</a>
          </article>
          <article class="component-card" style="padding:1.35rem 1.25rem;">
            <span class="component-eyebrow">Teams &amp; pros</span>
            <h3 class="component-title" style="font-size:1.05rem; margin-top:0.15rem;">Elite</h3>
            <p style="margin:0.35rem 0 0.85rem; font-size:1.85rem; font-weight:800; letter-spacing:-0.02em; color:var(--primary,#2563eb);">$89<span style="font-size:0.75rem; font-weight:600; color:#64748b;">/mo</span></p>
            <p class="component-desc" style="font-size:0.82rem; margin-bottom:1rem;">1:1 programming and concierge support.</p>
            <a class="component-btn" href="#" style="display:inline-flex; width:100%; justify-content:center; box-sizing:border-box;">Choose Elite</a>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-pricing-2', {
    label: 'Pricing · 2 wide',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-slide-left wb-section-shell" style="padding:3.5rem 0; background:var(--bg);">
        <div style="text-align:center; max-width:40rem; margin:0 auto 2rem;">
          <span class="component-eyebrow">Membership</span>
          <h2 style="margin:0; font-size:clamp(1.5rem,3vw,1.85rem); font-weight:800; letter-spacing:-0.03em; color:var(--text);">Plans members stay on</h2>
          <p style="margin:0.5rem 0 0; font-size:0.9rem; color:var(--muted); line-height:1.55;">Pair transparent pricing with your join flow—edit tiers and amounts anytime.</p>
        </div>
        <div class="wb-add-el grid" style="max-width:46rem; margin:0 auto;">
          <div class="component-card">
            <span class="component-eyebrow">Starter</span>
            <h3 class="component-title" style="font-size:1.15rem;">Essentials access</h3>
            <p style="margin:0 0 0.75rem; font-weight:800; font-size:1.35rem; letter-spacing:-0.02em; color:var(--primary);">₹999<span style="font-size:0.75rem; font-weight:600; color:var(--muted);">/mo</span></p>
            <p class="component-desc" style="margin-bottom:0.75rem;">Perfect for a consistent training rhythm.</p>
            <button type="button" class="component-btn" data-wb-open="join">Choose</button>
          </div>
          <div class="component-card">
            <span class="component-eyebrow">Most popular</span>
            <h3 class="component-title" style="font-size:1.15rem;">Unlimited coaching</h3>
            <p style="margin:0 0 0.75rem; font-weight:800; font-size:1.35rem; letter-spacing:-0.02em; color:var(--primary);">₹1999<span style="font-size:0.75rem; font-weight:600; color:var(--muted);">/mo</span></p>
            <p class="component-desc" style="margin-bottom:0.75rem;">Priority scheduling and deeper programming.</p>
            <button type="button" class="component-btn" data-wb-open="join">Choose</button>
          </div>
        </div>
      </section>
    `,
  });

  bm.add('wb-coaches-1', {
    label: 'Coaches · 3 columns',
    category: 'Sections',
    content: `
      <section id="coaches" class="wb-add-el wb-slide-left wb-section-shell" style="padding:3.75rem 0; background:linear-gradient(180deg,#fff,#f8fafc);">
        <div style="text-align:center; max-width:36rem; margin:0 auto 2.25rem;">
          <span class="component-eyebrow">People</span>
          <h2 style="margin:0.35rem 0 0; font-size:clamp(1.45rem,3vw,1.85rem); font-weight:800; letter-spacing:-0.03em; color:#0f172a;">Coaches members ask for by name</h2>
          <p style="margin:0.45rem 0 0; font-size:0.9rem; color:#64748b; line-height:1.55;">Replace portraits and bios—structure mirrors enterprise team grids.</p>
        </div>
        <div class="wb-grid-autofill-3 wb-add-el">
          <article class="component-card" style="padding:0; overflow:hidden;">
            <div style="height:7.5rem; background:linear-gradient(135deg,#e2e8f0,#cbd5e1); display:flex; align-items:center; justify-content:center;">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='44' r='22' fill='%2394a3b8'/%3E%3Cpath d='M24 108c4-28 72-28 72 0' fill='%2394a3b8'/%3E%3C/svg%3E" alt="" style="width:4.5rem;height:auto;opacity:0.85;" />
            </div>
            <div style="padding:1.1rem 1.15rem 1.2rem;">
              <h3 class="component-title" style="font-size:1rem; margin:0;">Jordan Lee</h3>
              <p class="component-desc" style="margin:0.35rem 0 0; font-size:0.82rem;">Strength · Olympic lifting bias</p>
            </div>
          </article>
          <article class="component-card" style="padding:0; overflow:hidden;">
            <div style="height:7.5rem; background:linear-gradient(135deg,#e0e7ff,#c7d2fe); display:flex; align-items:center; justify-content:center;">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='44' r='22' fill='%2364748b'/%3E%3Cpath d='M24 108c4-28 72-28 72 0' fill='%2364748b'/%3E%3C/svg%3E" alt="" style="width:4.5rem;height:auto;opacity:0.9;" />
            </div>
            <div style="padding:1.1rem 1.15rem 1.2rem;">
              <h3 class="component-title" style="font-size:1rem; margin:0;">Sam Rivera</h3>
              <p class="component-desc" style="margin:0.35rem 0 0; font-size:0.82rem;">Mobility · Conditioning</p>
            </div>
          </article>
          <article class="component-card" style="padding:0; overflow:hidden;">
            <div style="height:7.5rem; background:linear-gradient(135deg,#fce7f3,#fbcfe8); display:flex; align-items:center; justify-content:center;">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='44' r='22' fill='%23a21caf'/%3E%3Cpath d='M24 108c4-28 72-28 72 0' fill='%23a21caf'/%3E%3C/svg%3E" alt="" style="width:4.5rem;height:auto;opacity:0.85;" />
            </div>
            <div style="padding:1.1rem 1.15rem 1.2rem;">
              <h3 class="component-title" style="font-size:1rem; margin:0;">Priya Nair</h3>
              <p class="component-desc" style="margin:0.35rem 0 0; font-size:0.82rem;">Metabolic health · Fat loss</p>
            </div>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-coaches-2', {
    label: 'Gallery · 2 images',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-fade-up wb-section-shell" style="padding:3.5rem 0; background:var(--bg);">
        <div style="text-align:center; max-width:36rem; margin:0 auto 2rem;">
          <span class="component-eyebrow">Visual story</span>
          <h2 style="margin:0; font-size:clamp(1.45rem,3vw,1.8rem); font-weight:800; letter-spacing:-0.03em; color:var(--text);">Inside the training floor</h2>
          <p style="margin:0.45rem 0 0; font-size:0.9rem; color:var(--muted); line-height:1.55;">Swap placeholders for high-res photography—pair with motion blocks for hover polish.</p>
        </div>
        <div class="wb-add-el grid" style="max-width:46rem; margin:0 auto;">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23f1f5f9'/%3E%3Cstop offset='1' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='640' height='420' rx='18'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='15' font-weight='600'%3EReplace · Facility%3C/text%3E%3C/svg%3E" alt="" style="width:100%;height:auto;border-radius:16px;display:block;border:1px solid rgba(148,163,184,0.35);box-shadow:0 10px 30px rgba(15,23,42,0.08);" />
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='h' x1='1' y1='0' x2='0' y2='1'%3E%3Cstop stop-color='%23f8fafc'/%3E%3Cstop offset='1' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23h)' width='640' height='420' rx='18'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='15' font-weight='600'%3EReplace · Community%3C/text%3E%3C/svg%3E" alt="" style="width:100%;height:auto;border-radius:16px;display:block;border:1px solid rgba(148,163,184,0.35);box-shadow:0 10px 30px rgba(15,23,42,0.08);" />
        </div>
      </section>
    `,
  });

  bm.add('wb-offers-1', {
    label: 'Offers · banner',
    category: 'Sections',
    content: `
      <section id="offers" class="wb-add-el wb-fade-up wb-section-shell" style="padding:2.75rem 0; background:var(--bg);">
        <div class="component-card" style="max-width:36rem; margin:0 auto; background:linear-gradient(145deg,#eff6ff 0%,#dbeafe 100%); border-color:rgba(59,130,246,0.28);">
          <span class="component-eyebrow" style="color:#3b82f6;">Limited offer</span>
          <div class="component-title" style="color:#1e3a8a;">50% off founding memberships</div>
          <div class="component-desc" style="color:#334155;">Create urgency with a crisp headline—then route visitors to your pricing section.</div>
          <a class="component-btn" href="#pricing">View plans</a>
        </div>
      </section>
    `,
  });

  bm.add('wb-offers-2', {
    label: 'Offers · split strip',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-slide-right" style="padding:clamp(2rem,5vw,2.75rem) 1.35rem; background:linear-gradient(105deg,#020617 0%,#0f172a 40%,#9a3412 88%,#ea580c 100%); color:#fff; position:relative; overflow:hidden;">
        <div style="position:absolute; inset:0; background:radial-gradient(50% 80% at 0% 50%,rgba(251,146,60,0.2),transparent 55%); pointer-events:none;"></div>
        <div style="max-width:66rem; margin:0 auto; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1.25rem; position:relative;">
          <div style="max-width:32rem;">
            <span class="component-eyebrow" style="color:#fed7aa;">Seasonal</span>
            <strong style="display:block; margin-top:0.35rem; font-size:clamp(1.15rem,2.2vw,1.35rem); font-weight:800; letter-spacing:-0.02em;">Winter join special</strong>
            <p style="margin:0.45rem 0 0; opacity:0.92; font-size:0.95rem; line-height:1.55; color:#ffedd5;">First month incentive with scarcity baked into the headline—route to pricing.</p>
          </div>
          <a class="wb-link-btn" href="#pricing" style="white-space:nowrap; box-shadow:0 12px 32px rgba(0,0,0,0.25);">See offer</a>
        </div>
      </section>
    `,
  });

  bm.add('wb-footer-1', {
    label: 'Footer · simple',
    category: 'Sections',
    content: `
      <footer id="contact" class="wb-add-el wb-fade-in" style="padding:2.75rem 1.35rem; background:linear-gradient(180deg,#020617,#000); color:#94a3b8; border-top:1px solid rgba(148,163,184,0.15);">
        <div style="max-width:66rem; margin:0 auto; display:flex; flex-wrap:wrap; gap:1.25rem; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#f8fafc; letter-spacing:0.06em; font-size:0.78rem;">GYM BRAND</strong>
            <p style="margin:0.45rem 0 0; font-size:0.9rem; color:#cbd5e1;">+91 90000 00000 · hello@gym.com</p>
          </div>
          <div style="display:flex; gap:0.65rem;">
            <a class="wb-wa-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" data-wb-wa-phone="919876543210" style="display:inline-flex;align-items:center;gap:0.4rem;color:#93c5fd;text-decoration:none;font-weight:600;">
              ${WB_WA_ICON_SVG}
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>
    `,
  });

  bm.add('wb-footer-2', {
    label: 'Footer · 3 columns',
    category: 'Sections',
    content: `
      <footer class="wb-add-el wb-fade-in" style="padding:3rem 1.35rem 2.5rem; background:linear-gradient(180deg,#0f172a,#020617); color:#94a3b8; border-top:1px solid rgba(255,255,255,0.06);">
        <div class="wb-footer-cols wb-add-el">
          <div>
            <strong style="color:#f1f5f9; font-size:0.72rem; letter-spacing:0.12em;">BRAND</strong>
            <p style="margin:0.65rem 0 0; line-height:1.6; font-size:0.9rem;">Your gym story in one confident line—mirrors enterprise marketing footers.</p>
          </div>
          <div>
            <strong style="color:#f1f5f9; font-size:0.72rem; letter-spacing:0.12em;">EXPLORE</strong>
            <p style="margin:0.65rem 0 0; line-height:1.85; font-size:0.9rem;">
              <a href="#pricing" style="color:#93c5fd; text-decoration:none; font-weight:600;">Pricing</a><br/>
              <a href="#" data-wb-open="visit" style="color:#93c5fd; text-decoration:none; font-weight:600;">Plan a visit</a>
            </p>
          </div>
          <div>
            <strong style="color:#f1f5f9; font-size:0.72rem; letter-spacing:0.12em;">HOURS</strong>
            <p style="margin:0.65rem 0 0; line-height:1.6; font-size:0.9rem;">Mon–Sat · 06:00–22:00<br/>Sun · members by appointment</p>
          </div>
        </div>
      </footer>
    `,
  });

  bm.add('wb-cta-join', {
    label: 'CTA · Join now',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Lead capture</span>
        <div class="component-title">Join now</div>
        <div class="component-desc">High-intent CTA wired to your live join flow—same backend as Crystal marketing pages.</div>
        <button type="button" class="component-btn" data-wb-open="join">Start membership</button>
      </div>
    `,
  });

  bm.add('wb-cta-call', {
    label: 'CTA · Call now',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Direct line</span>
        <div class="component-title">Call the front desk</div>
        <div class="component-desc">One tap for prospects on mobile—update the tel: link to your studio line.</div>
        <a class="component-btn" href="tel:+919000000000">Call now</a>
      </div>
    `,
  });

  bm.add('wb-cta-whatsapp', {
    label: 'CTA · WhatsApp',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Messaging</span>
        <div class="component-title">WhatsApp concierge</div>
        <div class="component-desc">Route warm leads to WhatsApp—set your business number in the sidebar; visitors tap to open chat.</div>
        <a class="component-btn wb-wa-btn wb-add-el" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" data-wb-wa-phone="919876543210" style="display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;">
          <span class="wb-wa-btn__inner" style="display:inline-flex;align-items:center;gap:0.5rem;">
            ${WB_WA_ICON_SVG}
            <span>Chat on WhatsApp</span>
          </span>
        </a>
      </div>
    `,
  });

  bm.add('wb-cta-email', {
    label: 'CTA · Email',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Inbox</span>
        <div class="component-title">Email the team</div>
        <div class="component-desc">Premium mailto CTA with clear intent—set href to your front desk or sales inbox.</div>
        <a class="component-btn" href="mailto:hello@gym.com">Compose email</a>
      </div>
    `,
  });

  bm.add('wb-cta-visit', {
    label: 'CTA · Plan a visit',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Experience</span>
        <div class="component-title">Plan a studio visit</div>
        <div class="component-desc">Qualified tours with zero friction—opens your visit capture flow on the published site.</div>
        <button type="button" class="component-btn" data-wb-open="visit">Schedule visit</button>
      </div>
    `,
  });

  bm.add('wb-cta-trial', {
    label: 'CTA · Free trial',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Acquisition</span>
        <div class="component-title">Complimentary trial session</div>
        <div class="component-desc">Lower the barrier to entry—wired to your Crystal trial booking modal when live.</div>
        <button type="button" class="component-btn" data-wb-open="trial">Claim free trial</button>
      </div>
    `,
  });

  bm.add('wb-enquiry-card', {
    label: 'Enquiry card',
    category: 'Modals',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Concierge</span>
        <div class="component-title">Priority enquiry</div>
        <div class="component-desc">A single confident action that opens your service enquiry modal—ideal beside pricing or contact rows.</div>
        <button type="button" class="component-btn" data-wb-open="enquiry">Talk to us</button>
      </div>
    `,
  });

  bm.add('wb-modals-lead-strip', {
    label: 'Modals · Lead actions row',
    category: 'Modals',
    content: `
      <div class="wb-add-el component-card" style="max-width:40rem; margin:0 auto;">
        <span class="component-eyebrow">Lead capture</span>
        <div class="component-title">Crystal lead modals</div>
        <div class="component-desc">Four actions wired to the published-site script: join, visit, trial, and service enquiry. Styling matches the default component library cards.</div>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.65rem;">
          <button type="button" class="component-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit;">Join now</button>
          <button type="button" class="component-btn" data-wb-open="visit" style="border:0; cursor:pointer; font:inherit; background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff;">Plan visit</button>
          <button type="button" class="component-btn" data-wb-open="trial" style="border:0; cursor:pointer; font:inherit; background:linear-gradient(135deg,#fb923c,#ea580c); color:#fff;">Free trial</button>
          <button type="button" class="component-btn" data-wb-open="enquiry" style="border:0; cursor:pointer; font:inherit; background:linear-gradient(135deg,#ecfdf5,#bbf7d0); color:#166534;">Enquiry</button>
        </div>
      </div>
    `,
  });

  bm.add('wb-form-contact', {
    label: 'Contact form',
    category: 'Forms',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Lead form</span>
        <div class="component-title">Concierge enquiry</div>
        <div class="component-desc">Sends from the page when live (same service-enquiry API as design-system contact blocks).</div>
        <form class="wb-sys-contact__form">
          <input type="text" name="name" placeholder="Full name" autocomplete="name" />
          <input type="email" name="email" placeholder="Email" autocomplete="email" />
          <input type="tel" name="phone" placeholder="Mobile (10 digits)" inputmode="numeric" autocomplete="tel" />
          <textarea name="message" rows="3" placeholder="Tell us about your goals"></textarea>
          <button type="submit" class="component-btn">Submit enquiry</button>
        </form>
      </div>
    `,
  });

  bm.add('wb-info-hours-card', {
    label: 'Info · Working hours',
    category: 'Info',
    content: `
      <section class="wb-add-el component-card" style="max-width:26rem; margin:0 auto;">
        <span class="component-eyebrow">Studio hours</span>
        <h3 class="component-title" style="font-size:1.12rem;">When we&apos;re on the floor</h3>
        <div style="display:grid; gap:0.65rem; color:#334155; font-size:0.9rem; margin-top:0.35rem;">
          <div style="display:flex; justify-content:space-between; gap:14px; padding:0.45rem 0; border-bottom:1px solid rgba(148,163,184,0.2);"><span style="color:var(--muted);">Mon – Fri</span><strong>6:00 – 22:00</strong></div>
          <div style="display:flex; justify-content:space-between; gap:14px; padding:0.45rem 0; border-bottom:1px solid rgba(148,163,184,0.2);"><span style="color:var(--muted);">Saturday</span><strong>7:00 – 21:00</strong></div>
          <div style="display:flex; justify-content:space-between; gap:14px; padding:0.45rem 0;"><span style="color:var(--muted);">Sunday</span><strong>8:00 – 13:00</strong></div>
        </div>
      </section>
    `,
  });

  bm.add('wb-info-address-card', {
    label: 'Info · Address card',
    category: 'Info',
    content: `
      <section class="wb-add-el component-card" style="max-width:28rem; margin:0 auto;">
        <span class="component-eyebrow">Location</span>
        <h3 class="component-title" style="font-size:1.12rem;">Flagship studio</h3>
        <p class="component-desc" style="margin-bottom:1rem;">2nd Floor, Fitness Tower, MG Road, Bengaluru — 560001</p>
        <a class="wb-link-btn" href="#" data-wb-open="visit" style="display:inline-flex;">Book a tour</a>
      </section>
    `,
  });

  bm.add('wb-info-social-strip', {
    label: 'Info · Social links',
    category: 'Info',
    content: `
      <section class="wb-add-el component-card" style="max-width:36rem; margin:0 auto;">
        <span class="component-eyebrow">Social</span>
        <h3 class="component-title" style="font-size:1.12rem;">Stay close to the community</h3>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.35rem;">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style="padding:0.5rem 0.95rem; border-radius:999px; text-decoration:none; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); color:#0f172a; font-weight:600; font-size:0.82rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Instagram</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style="padding:0.5rem 0.95rem; border-radius:999px; text-decoration:none; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); color:#0f172a; font-weight:600; font-size:0.82rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Facebook</a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style="padding:0.5rem 0.95rem; border-radius:999px; text-decoration:none; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); color:#0f172a; font-weight:600; font-size:0.82rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">YouTube</a>
          <a class="wb-wa-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" data-wb-wa-phone="919876543210" style="display:inline-flex;align-items:center;gap:0.45rem;padding:0.5rem 0.95rem;border-radius:999px;text-decoration:none;background:linear-gradient(135deg,#ecfdf5,#dcfce7);border:1px solid rgba(34,197,94,0.35);color:#166534;font-weight:700;font-size:0.82rem;">
            ${WB_WA_ICON_SVG}
            <span>WhatsApp</span>
          </a>
        </div>
      </section>
    `,
  });

  bm.add('wb-info-contact-methods', {
    label: 'Info · Contact methods',
    category: 'Info',
    content: `
      <section class="wb-add-el component-card" style="max-width:46rem; margin:0 auto;">
        <span class="component-eyebrow">Reach us</span>
        <h3 class="component-title" style="font-size:1.12rem;">Three high-intent channels</h3>
        <div class="wb-grid-contact-row wb-add-el" style="margin-top:0.35rem;">
          <a href="tel:+919000000000" style="text-decoration:none; border-radius:12px; padding:0.85rem 0.95rem; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#0f172a; box-shadow:0 2px 8px rgba(15,23,42,0.04);">
            <strong style="display:block; font-size:0.72rem; letter-spacing:0.08em; color:#64748b;">CALL</strong>
            <span style="font-size:0.86rem; font-weight:700;">+91 90000 00000</span>
          </a>
          <a href="mailto:hello@gym.com" style="text-decoration:none; border-radius:12px; padding:0.85rem 0.95rem; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#0f172a; box-shadow:0 2px 8px rgba(15,23,42,0.04);">
            <strong style="display:block; font-size:0.72rem; letter-spacing:0.08em; color:#64748b;">EMAIL</strong>
            <span style="font-size:0.86rem; font-weight:700;">hello@gym.com</span>
          </a>
          <button type="button" data-wb-open="enquiry" style="text-align:left; border-radius:12px; padding:0.85rem 0.95rem; background:linear-gradient(145deg,#eff6ff,#dbeafe); border:1px solid rgba(59,130,246,0.35); color:#1d4ed8; cursor:pointer; font:inherit; box-shadow:0 4px 14px rgba(37,99,235,0.12);">
            <strong style="display:block; font-size:0.72rem; letter-spacing:0.08em; color:#3b82f6;">ENQUIRY</strong>
            <span style="font-size:0.86rem; font-weight:700;">Open concierge</span>
          </button>
        </div>
      </section>
    `,
  });

  bm.add('wb-info-quick-links', {
    label: 'Info · Quick links',
    category: 'Info',
    content: `
      <section class="wb-add-el component-card" style="max-width:28rem; margin:0 auto;">
        <span class="component-eyebrow">Navigate</span>
        <h3 class="component-title" style="font-size:1.12rem;">Shortcuts visitors expect</h3>
        <nav style="display:grid; gap:0.45rem; margin-top:0.35rem;">
          <a href="#pricing" style="text-decoration:none; color:#0f172a; border-radius:11px; padding:0.65rem 0.85rem; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.3); font-weight:600; font-size:0.88rem; box-shadow:0 1px 3px rgba(15,23,42,0.04);">Membership plans</a>
          <a href="#coaches" style="text-decoration:none; color:#0f172a; border-radius:11px; padding:0.65rem 0.85rem; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.3); font-weight:600; font-size:0.88rem; box-shadow:0 1px 3px rgba(15,23,42,0.04);">Meet our coaches</a>
          <a href="#" data-wb-open="visit" style="text-decoration:none; color:#0f172a; border-radius:11px; padding:0.65rem 0.85rem; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.3); font-weight:600; font-size:0.88rem; box-shadow:0 1px 3px rgba(15,23,42,0.04);">Plan a studio visit</a>
        </nav>
      </section>
    `,
  });

  bm.add('wb-trust-metrics-3', {
    label: 'Trust · Metrics strip',
    category: 'Trust',
    content: `
      <section class="wb-add-el wb-fade-up" style="padding:clamp(1.75rem,4vw,2.25rem) 1.25rem; background:linear-gradient(135deg,#020617 0%,#0f172a 55%,#1e293b 100%); color:#fff; border-radius:18px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 24px 60px rgba(15,23,42,0.35); position:relative; overflow:hidden;">
        <div style="position:absolute; inset:0; background:radial-gradient(40% 60% at 80% 0%,rgba(96,165,250,0.15),transparent 50%); pointer-events:none;"></div>
        <div class="wb-metrics-row wb-add-el">
          <article style="text-align:center; padding:1rem 0.75rem; background:rgba(255,255,255,0.06); border-radius:14px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(8px);">
            <strong style="font-size:clamp(1.35rem,2.5vw,1.65rem); font-weight:800; letter-spacing:-0.02em; display:block;">2,500+</strong>
            <span style="font-size:0.8rem; color:#cbd5e1;">Active members</span>
          </article>
          <article style="text-align:center; padding:1rem 0.75rem; background:rgba(255,255,255,0.06); border-radius:14px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(8px);">
            <strong style="font-size:clamp(1.35rem,2.5vw,1.65rem); font-weight:800; letter-spacing:-0.02em; display:block;">4.9</strong>
            <span style="font-size:0.8rem; color:#cbd5e1;">Avg. rating</span>
          </article>
          <article style="text-align:center; padding:1rem 0.75rem; background:rgba(255,255,255,0.06); border-radius:14px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(8px);">
            <strong style="font-size:clamp(1.35rem,2.5vw,1.65rem); font-weight:800; letter-spacing:-0.02em; display:block;">12+</strong>
            <span style="font-size:0.8rem; color:#cbd5e1;">Years coaching</span>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-trust-rating-card', {
    label: 'Trust · Rating card',
    category: 'Trust',
    content: `
      <section class="wb-add-el component-card" style="max-width:28rem; margin:0 auto;">
        <span class="component-eyebrow">Member feedback</span>
        <div style="display:flex; align-items:flex-end; gap:0.65rem; margin-top:0.25rem;">
          <strong style="font-size:2.35rem; line-height:1; color:#0f172a; font-weight:800; letter-spacing:-0.03em;">4.9</strong>
          <span style="color:#f59e0b; letter-spacing:0.15em; margin-bottom:0.2rem; font-size:0.9rem;" aria-hidden="true">★★★★★</span>
        </div>
        <p class="component-desc" style="margin-top:0.65rem;">Rated by 1,200+ members across reviews and social—pair with testimonial blocks.</p>
      </section>
    `,
  });

  bm.add('wb-trust-payment-strip', {
    label: 'Trust · Payments accepted',
    category: 'Trust',
    content: `
      <section class="wb-add-el component-card" style="max-width:46rem; margin:0 auto;">
        <span class="component-eyebrow">Checkout</span>
        <p class="component-title" style="font-size:1.02rem; margin:0.15rem 0 0.65rem;">Payments we accept</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.45rem;">
          <span style="padding:0.4rem 0.85rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#334155; font-weight:700; font-size:0.78rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Visa</span>
          <span style="padding:0.4rem 0.85rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#334155; font-weight:700; font-size:0.78rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Mastercard</span>
          <span style="padding:0.4rem 0.85rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#334155; font-weight:700; font-size:0.78rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">UPI</span>
          <span style="padding:0.4rem 0.85rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#334155; font-weight:700; font-size:0.78rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Netbanking</span>
          <span style="padding:0.4rem 0.85rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f8fafc); border:1px solid rgba(148,163,184,0.35); color:#334155; font-weight:700; font-size:0.78rem; box-shadow:0 1px 2px rgba(15,23,42,0.04);">Wallets</span>
        </div>
      </section>
    `,
  });

  bm.add('wb-trust-brand-logos', {
    label: 'Trust · Partner logos',
    category: 'Trust',
    content: `
      <section class="wb-add-el component-card" style="max-width:46rem; margin:0 auto;">
        <span class="component-eyebrow">Partners</span>
        <p class="component-title" style="font-size:1.02rem; margin:0.15rem 0 0.65rem;">Trusted alongside</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          <span style="padding:0.45rem 0.95rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); font-weight:800; color:#334155; font-size:0.78rem; letter-spacing:0.04em;">NIKE</span>
          <span style="padding:0.45rem 0.95rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); font-weight:800; color:#334155; font-size:0.78rem; letter-spacing:0.04em;">REEBOK</span>
          <span style="padding:0.45rem 0.95rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); font-weight:800; color:#334155; font-size:0.78rem; letter-spacing:0.04em;">MYPROTEIN</span>
          <span style="padding:0.45rem 0.95rem; border-radius:999px; background:linear-gradient(180deg,#fff,#f1f5f9); border:1px solid rgba(148,163,184,0.35); font-weight:800; color:#334155; font-size:0.78rem; letter-spacing:0.04em;">PUMA</span>
        </div>
      </section>
    `,
  });

  bm.add('wb-content-why-us-list', {
    label: 'Content · Why us list',
    category: 'Content',
    content: `
      <section class="wb-add-el component-card" style="max-width:46rem; margin:0 auto;">
        <span class="component-eyebrow">Proof points</span>
        <h3 class="component-title" style="font-size:1.15rem;">Why members choose us</h3>
        <ul style="margin:0.5rem 0 0; padding:0; list-style:none; display:grid; gap:0.65rem; color:#334155;">
          <li style="display:flex; gap:0.65rem; align-items:flex-start; padding:0.65rem 0.75rem; border-radius:12px; background:linear-gradient(180deg,rgba(248,250,252,0.9),#fff); border:1px solid rgba(148,163,184,0.25);"><span style="flex-shrink:0; width:1.35rem; height:1.35rem; border-radius:999px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-size:0.72rem; font-weight:800; display:flex; align-items:center; justify-content:center;">1</span><span style="line-height:1.5; font-size:0.9rem;"><strong style="color:#0f172a;">Certified depth</strong> — goal-specific plans, not generic templates.</span></li>
          <li style="display:flex; gap:0.65rem; align-items:flex-start; padding:0.65rem 0.75rem; border-radius:12px; background:linear-gradient(180deg,rgba(248,250,252,0.9),#fff); border:1px solid rgba(148,163,184,0.25);"><span style="flex-shrink:0; width:1.35rem; height:1.35rem; border-radius:999px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-size:0.72rem; font-weight:800; display:flex; align-items:center; justify-content:center;">2</span><span style="line-height:1.5; font-size:0.9rem;"><strong style="color:#0f172a;">Premium floor</strong> — modern kit, immaculate zones, sensible density.</span></li>
          <li style="display:flex; gap:0.65rem; align-items:flex-start; padding:0.65rem 0.75rem; border-radius:12px; background:linear-gradient(180deg,rgba(248,250,252,0.9),#fff); border:1px solid rgba(148,163,184,0.25);"><span style="flex-shrink:0; width:1.35rem; height:1.35rem; border-radius:999px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-size:0.72rem; font-weight:800; display:flex; align-items:center; justify-content:center;">3</span><span style="line-height:1.5; font-size:0.9rem;"><strong style="color:#0f172a;">Human follow-up</strong> — flexible scheduling with real accountability.</span></li>
          <li style="display:flex; gap:0.65rem; align-items:flex-start; padding:0.65rem 0.75rem; border-radius:12px; background:linear-gradient(180deg,rgba(248,250,252,0.9),#fff); border:1px solid rgba(148,163,184,0.25);"><span style="flex-shrink:0; width:1.35rem; height:1.35rem; border-radius:999px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-size:0.72rem; font-weight:800; display:flex; align-items:center; justify-content:center;">4</span><span style="line-height:1.5; font-size:0.9rem;"><strong style="color:#0f172a;">Community lift</strong> — culture that keeps people showing up.</span></li>
        </ul>
      </section>
    `,
  });

  bm.add('wb-content-cta-grid-2', {
    label: 'Content · Dual CTA cards',
    category: 'Content',
    content: `
      <section class="wb-add-el wb-section-shell" style="padding:2.5rem 0; background:linear-gradient(180deg,#f1f5f9,#f8fafc); border-radius:18px;">
        <div class="wb-grid-autofill-2 wb-add-el">
          <article class="component-card" style="margin:0;">
            <span class="component-eyebrow">This week</span>
            <h4 class="component-title" style="font-size:1rem; margin-top:0.15rem;">Join with a starter plan</h4>
            <p class="component-desc" style="margin-bottom:1rem;">Onboarding that feels concierge, not chaotic.</p>
            <button type="button" class="component-btn" data-wb-open="join" style="border:0; cursor:pointer; font:inherit;">Join now</button>
          </article>
          <article class="component-card" style="margin:0;">
            <span class="component-eyebrow">Qualified tour</span>
            <h4 class="component-title" style="font-size:1rem; margin-top:0.15rem;">Visit before you commit</h4>
            <p class="component-desc" style="margin-bottom:1rem;">Meet coaches, feel the floor, leave with clarity.</p>
            <button type="button" class="component-btn" data-wb-open="visit" style="border:0; cursor:pointer; font:inherit;">Plan a visit</button>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-content-services-grid', {
    label: 'Content · Services grid',
    category: 'Content',
    content: `
      <section class="wb-add-el wb-section-shell" style="padding:3rem 0; background:linear-gradient(180deg,#fff,#f8fafc); border-radius:18px;">
        <div style="text-align:center; max-width:32rem; margin:0 auto 1.75rem;">
          <span class="component-eyebrow">Programs</span>
          <h3 style="margin:0.35rem 0 0; font-size:clamp(1.25rem,2.5vw,1.5rem); font-weight:800; letter-spacing:-0.03em; color:#0f172a;">Services members book first</h3>
        </div>
        <div class="wb-grid-autofill-3 wb-add-el">
          <article class="component-card" style="margin:0;"><strong style="font-size:0.95rem; color:#0f172a;">Strength training</strong><p class="component-desc" style="margin:0.45rem 0 0; font-size:0.84rem;">Progressive overload with coach eyes on every set.</p></article>
          <article class="component-card" style="margin:0;"><strong style="font-size:0.95rem; color:#0f172a;">HIIT blocks</strong><p class="component-desc" style="margin:0.45rem 0 0; font-size:0.84rem;">Metabolic density without sacrificing form standards.</p></article>
          <article class="component-card" style="margin:0;"><strong style="font-size:0.95rem; color:#0f172a;">Yoga &amp; mobility</strong><p class="component-desc" style="margin:0.45rem 0 0; font-size:0.84rem;">Recovery sessions that complement heavy weeks.</p></article>
        </div>
      </section>
    `,
  });

  bm.add('wb-testimonial-1', {
    label: 'Testimonial',
    category: 'Trust',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Social proof</span>
        <p style="margin:0 0 0.85rem; font-size:1.02rem; line-height:1.62; font-weight:500; letter-spacing:-0.01em; color:var(--text);">“The coaching staff treats progression like a product. I have never stayed this consistent.”</p>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
          <strong style="color:var(--muted); font-size:0.82rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase;">Alex Mercer · Member since 2024</strong>
          <span style="color:#fbbf24; letter-spacing:0.18em; font-size:0.78rem;" aria-label="5 star rating">★★★★★</span>
        </div>
      </div>
    `,
  });

  bm.add('wb-embed-site', {
    label: 'Embed · iframe',
    category: 'Content',
    content: `
      <section class="wb-add-el component-card" style="max-width:60rem; margin:0 auto;">
        <span class="component-eyebrow">Embed</span>
        <h3 class="component-title" style="font-size:1.12rem;">Framed external experience</h3>
        <p class="component-desc">Select the iframe and set <strong>src</strong> in the sidebar—maps, Loom, Calendly, or policy pages inherit the same chrome as maps.</p>
        <div class="component-media">
          <iframe title="Embedded content" src="about:blank" style="width:100%; min-height:280px; border:0; display:block; background:#f1f5f9;" loading="lazy"></iframe>
        </div>
      </section>
    `,
  });

  bm.add('wb-map-location', {
    label: 'Map · location',
    category: 'Content',
    content: `
      <div class="wb-add-el component-card">
        <span class="component-eyebrow">Visit</span>
        <div class="component-title">Studio location</div>
        <div class="component-desc">Framed map embed with editorial hierarchy—paste your Google Maps URL into iframe src.</div>
        <div class="component-media">
          <iframe
            title="Gym location map"
            src="https://maps.google.com/maps?q=Kochi&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
            width="100%"
            height="168"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            style="border:0;display:block;width:100%;"
          ></iframe>
        </div>
      </div>
    `,
  });

  bm.add('wb-cta-join-anim', {
    label: 'CTA · Join (animated)',
    category: 'Actions',
    content: `
      <div class="wb-add-el component-card fade-up hover-scale">
        <span class="component-eyebrow">Motion CTA</span>
        <div class="component-title">Join now · animated</div>
        <div class="component-desc">Scroll reveal, depth hover, shimmer CTA, and a soft glow pulse—still routes to your live join modal.</div>
        <button type="button" class="component-btn glow-btn pulse" data-wb-open="join">Start membership</button>
      </div>
    `,
  });

  bm.add('wb-cta-whatsapp-float-anim', {
    label: 'CTA · WhatsApp float (animated)',
    category: 'Actions',
    content: `
      <a class="wb-add-el wb-wa-float wb-wa-btn pulse hover-scale" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-wb-wa-phone="919876543210" style="text-decoration:none;color:#fff;">
        <svg class="wb-wa-ico" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    `,
  });

  bm.add('wb-enquiry-slide-anim', {
    label: 'Enquiry · slide panel (animated)',
    category: 'Modals',
    content: `
      <div class="wb-add-el wb-enquiry-slide" data-wb-enquiry-slide>
        <button type="button" class="component-btn wb-enquiry-slide__toggle">Quick enquiry</button>
        <div class="wb-enquiry-slide__backdrop" aria-hidden="true"></div>
        <aside class="wb-enquiry-slide__drawer">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:1rem;">
            <div>
              <span class="component-eyebrow">Drawer</span>
              <div class="component-title" style="margin:0;">Concierge line</div>
              <p class="component-desc" style="margin:0.35rem 0 0; font-size:0.78rem;">Blur backdrop + eased rail—Send still opens your live enquiry modal.</p>
            </div>
            <button type="button" class="wb-drawer-close" data-wb-enquiry-slide-close aria-label="Close">&times;</button>
          </div>
          <input class="wb-enquiry-slide__field" type="tel" placeholder="Best number to reach you" autocomplete="tel" />
          <button type="button" class="component-btn" data-wb-open="enquiry">Submit enquiry</button>
        </aside>
      </div>
    `,
  });

  bm.add('wb-offers-gradient-anim', {
    label: 'Offers · gradient banner (animated)',
    category: 'Sections',
    content: `
      <div class="wb-add-el wb-offer-gradient-anim">&#128293; Founding members save 50% · Limited seats</div>
    `,
  });

  bm.add('wb-map-location-anim', {
    label: 'Map · location (animated)',
    category: 'Content',
    content: `
      <div class="wb-add-el component-card fade-up hover-scale">
        <span class="component-eyebrow">Visit</span>
        <div class="component-title">Location · motion</div>
        <div class="component-desc">Scroll reveal plus hover depth on the card frame—swap the embed when you go live.</div>
        <div class="component-media">
          <iframe
            title="Gym location map"
            src="https://maps.google.com/maps?q=Kochi&amp;t=&amp;z=13&amp;output=embed"
            width="100%"
            height="168"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            style="border:0;display:block;width:100%;"
          ></iframe>
        </div>
      </div>
    `,
  });

  bm.add('wb-testimonial-carousel-anim', {
    label: 'Testimonial · carousel (animated)',
    category: 'Trust',
    content: `
      <div class="wb-add-el component-card wb-tcarousel" data-wb-tcarousel="The programming finally feels bespoke.|Coaches obsess about form, not just reps.|The space feels closer to a boutique studio than a big-box gym.">
        <span class="component-eyebrow">Rotating proof</span>
        <p class="wb-tcarousel__text">The programming finally feels bespoke.</p>
      </div>
    `,
  });

  bm.add('wb-scroll-top', {
    label: 'Nav · Scroll to top',
    category: 'Navigation',
    content: `
      <button type="button" class="wb-add-el wb-scroll-top" data-wb-scroll-top aria-label="Back to top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </button>
    `,
  });

  bm.add('wb-gallery-hover-anim', {
    label: 'Gallery · hover zoom (animated)',
    category: 'Sections',
    content: `
      <section class="wb-add-el wb-section-shell" style="padding:3.5rem 0;background:var(--bg);">
        <div style="text-align:center;max-width:36rem;margin:0 auto 2rem;">
          <span class="component-eyebrow">Motion gallery</span>
          <h2 style="margin:0;font-size:clamp(1.45rem,3vw,1.8rem);font-weight:800;letter-spacing:-0.03em;color:var(--text);">Moments worth zooming</h2>
          <p style="margin:0.45rem 0 0;font-size:0.9rem;color:var(--muted);line-height:1.55;">Scroll-in fades plus hover lift—swap SVGs for your photography.</p>
        </div>
        <div class="wb-add-el grid wb-gallery-anim-grid" style="max-width:46rem;margin:0 auto;">
          <img class="hover-scale fade-up" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect fill='%23f1f5f9' width='640' height='420' rx='18'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='15' font-weight='600'%3EFrame A%3C/text%3E%3C/svg%3E" alt="" />
          <img class="hover-scale fade-up" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect fill='%23f8fafc' width='640' height='420' rx='18'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='15' font-weight='600'%3EFrame B%3C/text%3E%3C/svg%3E" alt="" />
        </div>
      </section>
    `,
  });

}

/** Open every Grapes block category (so Design · POWER … blocks are visible without extra clicks). */
export function expandBlockManagerCategories(editor: Editor) {
  try {
    const coll = editor.BlockManager.getCategories() as unknown as {
      each?: (fn: (cat: { set: (a: string, v: unknown) => void }) => void) => void;
    };
    coll.each?.((cat) => {
      cat.set('open', true);
    });
  } catch {
    /* ignore */
  }
  try {
    editor.BlockManager.render();
  } catch {
    /* ignore */
  }
}

export function registerWebsiteBuilderExtensions(editor: Editor) {
  registerLinkButtonType(editor);
  registerWhatsAppLinkType(editor);
  registerAnimatableComponents(editor);
  registerSectionBlocks(editor);
  registerIconBlocks(editor);
  registerDesignSystemBlocks(editor);
  expandBlockManagerCategories(editor);
}
