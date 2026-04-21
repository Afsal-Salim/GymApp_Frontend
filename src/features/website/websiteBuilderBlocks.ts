import type { Editor } from 'grapesjs';

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

  bm.add('wb-header-1', {
    label: 'Hero · centered',
    category: 'Header',
    content: `
      <header class="wb-fade-up" style="padding:88px 20px; text-align:center; background:#0f172a; color:#fff;">
        <p style="margin:0 0 10px; letter-spacing:.08em; text-transform:uppercase; opacity:.7;">Gym website</p>
        <h1 style="margin:0 0 12px; font-size:42px;">Your next headline</h1>
        <p style="margin:0 auto 22px; max-width:680px; opacity:.86;">Write a strong conversion-focused intro here.</p>
        <a class="wb-link-btn" href="#pricing">Primary CTA</a>
      </header>
    `,
  });

  bm.add('wb-header-2', {
    label: 'Hero · split',
    category: 'Header',
    content: `
      <header class="wb-slide-left" style="padding:72px 20px; background:linear-gradient(120deg,#0f172a,#1e293b); color:#fff;">
        <div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:28px; align-items:center;">
          <div>
            <h1 style="font-size:40px; margin:0 0 12px;">Stronger together</h1>
            <p style="margin:0 0 18px; opacity:.88;">Coaching, community, and a floor built for progress.</p>
            <a class="wb-link-btn" href="#pricing">View plans</a>
          </div>
          <div style="min-height:180px; border-radius:16px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);"></div>
        </div>
      </header>
    `,
  });

  bm.add('wb-header-3', {
    label: 'Hero · minimal',
    category: 'Header',
    content: `
      <header class="wb-fade-in" style="padding:64px 20px; text-align:center; background:#fff; color:#0f172a;">
        <p style="margin:0 0 8px; font-size:14px; letter-spacing:.12em; text-transform:uppercase; color:#64748b;">Premium training</p>
        <h1 style="margin:0 0 10px; font-size:38px;">Train with purpose</h1>
        <a class="wb-link-btn" href="#contact" style="margin-top:8px;">Book a visit</a>
      </header>
    `,
  });

  bm.add('wb-nav-1', {
    label: 'Nav · sticky bar',
    category: 'Navigation',
    content: `
      <nav class="wb-fade-in" style="position:sticky; top:0; z-index:40; background:#ffffff; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 20px; max-width:1100px; margin:0 auto;">
          <strong>GYM BRAND</strong>
          <div style="display:flex; gap:16px; align-items:center;">
            <a href="#coaches">Coaches</a>
            <a href="#offers">Offers</a>
            <a href="#pricing">Pricing</a>
            <a class="wb-link-btn" href="#contact" style="padding:.45rem .9rem;">Contact</a>
          </div>
        </div>
      </nav>
    `,
  });

  bm.add('wb-nav-2', {
    label: 'Nav · centered',
    category: 'Navigation',
    content: `
      <nav class="wb-fade-in" style="background:#0f172a; color:#fff;">
        <div style="max-width:1100px; margin:0 auto; padding:14px 20px; display:flex; flex-direction:column; align-items:center; gap:10px;">
          <strong style="letter-spacing:.06em;">GYM BRAND</strong>
          <div style="display:flex; gap:18px; flex-wrap:wrap; justify-content:center;">
            <a href="#about" style="color:#e2e8f0;">About</a>
            <a href="#pricing" style="color:#e2e8f0;">Pricing</a>
            <a href="#visit" style="color:#e2e8f0;">Visit</a>
          </div>
        </div>
      </nav>
    `,
  });

  bm.add('wb-nav-3', {
    label: 'Nav · pill links',
    category: 'Navigation',
    content: `
      <nav class="wb-fade-in" style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
        <div style="max-width:1100px; margin:0 auto; padding:12px 20px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <a href="#programs" style="padding:6px 14px; border-radius:999px; background:#fff; border:1px solid #cbd5e1; text-decoration:none; color:#0f172a;">Programs</a>
          <a href="#coaches" style="padding:6px 14px; border-radius:999px; background:#fff; border:1px solid #cbd5e1; text-decoration:none; color:#0f172a;">Coaches</a>
          <a href="#pricing" style="padding:6px 14px; border-radius:999px; background:#0f172a; border:1px solid #0f172a; text-decoration:none; color:#fff;">Join</a>
        </div>
      </nav>
    `,
  });

  bm.add('wb-pricing-1', {
    label: 'Pricing · 3 cards',
    category: 'Pricing',
    content: `
      <section id="pricing" class="wb-fade-up" style="padding:64px 20px; background:#f8fafc;">
        <h2 style="text-align:center; margin:0 0 26px;">Membership Plans</h2>
        <div style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; max-width:1060px; margin:0 auto;">
          <article style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px;">
            <h3>Starter</h3><p style="font-size:28px; font-weight:700;">$29</p><a class="wb-link-btn" href="#">Choose Starter</a>
          </article>
          <article class="wb-pulse" style="background:#0f172a; color:#fff; border-radius:14px; padding:18px;">
            <h3>Pro</h3><p style="font-size:28px; font-weight:700;">$59</p><a class="wb-link-btn" href="#">Choose Pro</a>
          </article>
          <article style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px;">
            <h3>Elite</h3><p style="font-size:28px; font-weight:700;">$89</p><a class="wb-link-btn" href="#">Choose Elite</a>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-pricing-2', {
    label: 'Pricing · 2 wide',
    category: 'Pricing',
    content: `
      <section class="wb-slide-left" style="padding:56px 20px; background:#fff;">
        <h2 style="text-align:center; margin:0 0 22px;">Plans</h2>
        <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; max-width:900px; margin:0 auto;">
          <article style="border-radius:16px; padding:22px; background:#f1f5f9; border:1px solid #e2e8f0;">
            <h3>Monthly</h3><p style="font-size:32px; font-weight:800;">$49/mo</p>
            <a class="wb-link-btn" href="#">Select</a>
          </article>
          <article style="border-radius:16px; padding:22px; background:#0f172a; color:#fff;">
            <h3>Annual</h3><p style="font-size:32px; font-weight:800;">$399/yr</p>
            <a class="wb-link-btn" href="#">Save more</a>
          </article>
        </div>
      </section>
    `,
  });

  bm.add('wb-coaches-1', {
    label: 'Coaches · 3 columns',
    category: 'Coaches',
    content: `
      <section id="coaches" class="wb-slide-left" style="padding:64px 20px; background:#fff;">
        <h2 style="text-align:center; margin:0 0 26px;">Meet our coaches</h2>
        <div style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; max-width:1060px; margin:0 auto;">
          <article style="border:1px solid #e2e8f0; border-radius:14px; padding:16px;"><h3>Coach 1</h3><p>Strength specialist</p></article>
          <article style="border:1px solid #e2e8f0; border-radius:14px; padding:16px;"><h3>Coach 2</h3><p>Mobility and conditioning</p></article>
          <article style="border:1px solid #e2e8f0; border-radius:14px; padding:16px;"><h3>Coach 3</h3><p>Weight loss mentor</p></article>
        </div>
      </section>
    `,
  });

  bm.add('wb-coaches-2', {
    label: 'Coaches · 4 grid',
    category: 'Coaches',
    content: `
      <section class="wb-fade-up" style="padding:56px 20px; background:#f8fafc;">
        <h2 style="text-align:center; margin:0 0 22px;">Team</h2>
        <div style="display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; max-width:1100px; margin:0 auto;">
          ${[1, 2, 3, 4].map((i) => `<article style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; text-align:center;"><strong>Coach ${i}</strong><p style="margin:6px 0 0; font-size:13px; color:#64748b;">Specialty</p></article>`).join('')}
        </div>
      </section>
    `,
  });

  bm.add('wb-offers-1', {
    label: 'Offers · banner',
    category: 'Offers',
    content: `
      <section id="offers" class="wb-fade-up" style="padding:62px 20px; background:#111827; color:#fff; text-align:center;">
        <h2 style="margin:0 0 10px;">Limited-time offers</h2>
        <p style="margin:0 auto 18px; max-width:680px; opacity:.86;">Add your current gym offers and drive visitors to immediate action.</p>
        <a class="wb-link-btn" href="#pricing">Claim this offer</a>
      </section>
    `,
  });

  bm.add('wb-offers-2', {
    label: 'Offers · split strip',
    category: 'Offers',
    content: `
      <section class="wb-slide-right" style="padding:48px 20px; background:linear-gradient(90deg,#0f172a,#b45309); color:#fff;">
        <div style="max-width:1060px; margin:0 auto; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
          <div><strong style="font-size:20px;">Winter join special</strong><p style="margin:6px 0 0; opacity:.9;">New members save on the first month.</p></div>
          <a class="wb-link-btn" href="#pricing">See offer</a>
        </div>
      </section>
    `,
  });

  bm.add('wb-footer-1', {
    label: 'Footer · simple',
    category: 'Footer',
    content: `
      <footer id="contact" class="wb-fade-in" style="padding:42px 20px; background:#020617; color:#cbd5e1;">
        <div style="max-width:1060px; margin:0 auto; display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between; align-items:center;">
          <div><strong style="color:#fff;">Gym Brand</strong><p style="margin:4px 0 0;">+91 90000 00000 · hello@gym.com</p></div>
          <div style="display:flex; gap:10px;"><a class="wb-link-btn" href="https://wa.me/" target="_blank">WhatsApp</a></div>
        </div>
      </footer>
    `,
  });

  bm.add('wb-footer-2', {
    label: 'Footer · 3 columns',
    category: 'Footer',
    content: `
      <footer class="wb-fade-in" style="padding:48px 20px; background:#0f172a; color:#94a3b8;">
        <div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px;">
          <div><strong style="color:#fff;">Brand</strong><p style="margin:8px 0 0;">Your gym story in one line.</p></div>
          <div><strong style="color:#fff;">Explore</strong><p style="margin:8px 0 0;"><a href="#pricing" style="color:#93c5fd;">Pricing</a><br/><a href="#visit" style="color:#93c5fd;">Visit</a></p></div>
          <div><strong style="color:#fff;">Hours</strong><p style="margin:8px 0 0;">Mon–Sat 6–10</p></div>
        </div>
      </footer>
    `,
  });

  bm.add('wb-div', {
    label: 'Empty div',
    category: 'Layout',
    content: `<div style="min-height:80px; padding:16px; border:1px dashed #94a3b8;">New div</div>`,
  });
}

export function registerWebsiteBuilderExtensions(editor: Editor) {
  registerLinkButtonType(editor);
  registerAnimatableComponents(editor);
  registerSectionBlocks(editor);
}
