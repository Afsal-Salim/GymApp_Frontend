/**
 * Fitness landing design sets (POWER … CYBERFIT)
 * matching the reference grid: navbar → hero → about → features → pricing → gallery → map → contact → footer.
 */
export const WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');

.wb-ds-root {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.wb-ds-root *,
.wb-ds-root *::before,
.wb-ds-root *::after {
  box-sizing: border-box;
}

.wb-ds-ico {
  display: block;
  flex-shrink: 0;
}
.wb-ds-ico--nav {
  width: 1.15rem;
  height: 1.15rem;
  color: #f87171;
  filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.35));
}
.wb-ds-ico--feature {
  width: 1.55rem;
  height: 1.55rem;
}
.wb-ds-ico--contact {
  width: 1.2rem;
  height: 1.2rem;
}
.wb-ds-ico--chev {
  width: 1.15rem;
  height: 1.15rem;
}
.wb-ds-ico--social {
  width: 0.95rem;
  height: 0.95rem;
}

@keyframes wbDsRevealIn {
  from {
    opacity: 0;
    transform: translateY(14px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
.wb-ds-reveal {
  animation: wbDsRevealIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}
.wb-ds-reveal--d1 {
  animation-delay: 0.06s;
}
.wb-ds-reveal--d2 {
  animation-delay: 0.16s;
}
.wb-ds-reveal--d3 {
  animation-delay: 0.28s;
}
.wb-ds-reveal--d4 {
  animation-delay: 0.4s;
}

/*
 * Design-system sections must stay visible in the builder canvas and in preview
 * even when scroll-reveal JS misses (nested iframe / blob window) or entrance
 * animations do not run to completion. The .fade-up class defaults to opacity:0 elsewhere.
 */
.wb-ds-root.wb-fade-in,
.wb-ds-root .fade-up {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
}
.wb-ds-root .fade-up.show {
  opacity: 1 !important;
  transform: none !important;
}

/*
 * Page chrome: GrapesJS (and many exports) default the iframe/document body to white.
 * Dark design sets paint sections, but gutters and unpainted strips stay white — neon text
 * then looks “missing”. Match the real page backdrop when a design set is present.
 */
html:has(.wb-sys--cyberfit),
body:has(.wb-sys--cyberfit) {
  background-color: #050505 !important;
}
html:has(.wb-sys--power),
body:has(.wb-sys--power) {
  background-color: #0a0a0a !important;
}
html:has(.wb-sys--focus),
body:has(.wb-sys--focus) {
  background-color: #0a0f06 !important;
}
html:has(.wb-sys--prime),
body:has(.wb-sys--prime) {
  background-color: #0c0618 !important;
}
html:has(.wb-sys--glassmorph),
body:has(.wb-sys--glassmorph) {
  background-color: #f2f6ff !important;
}
html:has(.wb-sys--elite),
body:has(.wb-sys--elite) {
  background-color: #f8fafc !important;
}
html:has(.wb-sys--energy),
body:has(.wb-sys--energy) {
  background-color: #fffaf5 !important;
}
html:has(.wb-sys--sporty),
body:has(.wb-sys--sporty) {
  background-color: #f8f9fa !important;
}

/* --- Shared layout (reference structure) --- */
.wb-sys {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.wb-sys *,
.wb-sys *::before,
.wb-sys *::after {
  box-sizing: border-box;
}

.wb-sys-nav {
  position: sticky;
  top: 0;
  z-index: 80;
  width: 100%;
  transition: box-shadow 0.35s ease, background 0.35s ease;
}
.wb-sys-nav__inner--bar {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.8rem clamp(0.85rem, 3vw, 1.35rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem 1rem;
}
.wb-sys-brand {
  justify-self: start;
  font-weight: 800;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  text-transform: uppercase;
  text-decoration: none;
}
.wb-sys-nav__brandcell {
  justify-self: start;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.65rem;
  min-width: 0;
}
.wb-sys-nav__brandcell .wb-sys-brand {
  justify-self: auto;
}
.wb-sys-ds-badges {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  flex-shrink: 0;
}
.wb-sys-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.wb-sys-tag--max {
  padding: 0.14rem 0.42rem;
  border-radius: 5px;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 26%, #a855f7 55%, #d946ef 78%, #f0abfc 100%);
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.42);
}
.wb-sys-tag-crown {
  display: inline-flex;
  width: 15px;
  height: 15px;
  color: #f59e0b;
  filter: drop-shadow(0 1px 1px rgba(245, 158, 11, 0.4));
}
.wb-sys-tag-crown svg {
  width: 100%;
  height: 100%;
  display: block;
}
.wb-sys-tag--premium {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.16rem 0.52rem;
  border-radius: 6px;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, #5b21b6 0%, #6d28d9 40%, #7c3aed 100%);
  box-shadow: 0 1px 4px rgba(91, 33, 182, 0.35);
}
.wb-sys-tag--premium::before {
  content: '✦';
  font-size: 0.52rem;
  line-height: 1;
  opacity: 0.95;
}
.wb-sys-gls-hero__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.35rem 0 0.5rem;
}
.wb-sys-nav__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.1rem;
  font-size: 0.84rem;
  font-weight: 600;
}
.wb-sys-nav__links a {
  text-decoration: none;
  transition: color 0.2s ease, opacity 0.2s ease;
}
.wb-sys-nav__cta {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 720px) {
  .wb-sys-nav__inner--bar {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }
  .wb-sys-brand {
    justify-self: center;
  }
  .wb-sys-nav__brandcell {
    justify-content: center;
    justify-self: center;
  }
  .wb-sys-nav__cta {
    justify-self: stretch;
  }
  .wb-sys-nav__cta .wb-sys-btn {
    width: 100%;
    justify-content: center;
  }
}

.wb-sys-hero {
  position: relative;
  overflow: hidden;
  padding: clamp(3rem, 8vw, 5.25rem) clamp(0.85rem, 3vw, 1.35rem);
}
.wb-sys-hero__grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: clamp(1.35rem, 4vw, 2.75rem);
  align-items: center;
}
.wb-sys-hero__figure {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}
.wb-sys-hero__figure img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  min-height: 14rem;
}

.wb-sys-eyebrow {
  display: block;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 0.55rem;
  opacity: 0.95;
}
.wb-sys-h1 {
  margin: 0 0 0.65rem;
  font-size: clamp(1.85rem, 4.2vw, 2.65rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
.wb-sys-h1--impact {
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.05;
}
.wb-sys-lead {
  margin: 0 0 1.25rem;
  font-size: 1.02rem;
  line-height: 1.62;
  max-width: 36rem;
}
.wb-sys-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}

.wb-sys-section {
  padding: clamp(2.65rem, 5.5vw, 3.85rem) clamp(0.85rem, 3vw, 1.35rem);
}
.wb-sys-section__head {
  margin-bottom: 2rem;
}
.wb-sys-section__head--center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 40rem;
}
.wb-sys-section__head--wide {
  max-width: 44rem;
}
.wb-sys-h2 {
  margin: 0.35rem 0 0;
  font-size: clamp(1.28rem, 2.6vw, 1.72rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.15;
}
.wb-sys-sub {
  margin: 0.5rem 0 0;
  font-size: 0.94rem;
  line-height: 1.58;
}

.wb-sys-about__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: clamp(1.25rem, 3vw, 2.25rem);
  max-width: 72rem;
  margin: 0 auto;
  align-items: center;
}
.wb-sys-about__visual {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}
.wb-sys-about__visual img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  min-height: 15rem;
}

.wb-sys-stats--metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem 1rem;
}
@media (max-width: 640px) {
  .wb-sys-stats--metrics {
    grid-template-columns: 1fr;
  }
}
.wb-sys-stat-block {
  padding: 0.65rem 0.5rem 0.75rem;
  border-radius: 12px;
  text-align: left;
}
.wb-sys-stat-num {
  display: block;
  font-size: clamp(1.65rem, 3.8vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.wb-sys-stat-lbl {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.88;
}

.wb-sys-grid4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  max-width: 72rem;
  margin: 0 auto;
}
@media (max-width: 960px) {
  .wb-sys-grid4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .wb-sys-grid4 {
    grid-template-columns: 1fr;
  }
}
.wb-sys-feature {
  border-radius: 16px;
  padding: 1.2rem 1.1rem 1.3rem;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.25s ease;
}
.wb-sys-feature:hover {
  transform: translateY(-3px);
}
.wb-sys-feature__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.45rem;
  margin-bottom: 0.75rem;
}
.wb-sys-feature__title {
  margin: 0 0 0.4rem;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.wb-sys-feature__desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
}

.wb-sys-price {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16.5rem), 1fr));
  gap: 1rem;
  max-width: 66rem;
  margin: 0 auto;
  align-items: stretch;
}
.wb-sys-price__tier {
  border-radius: 16px;
  padding: 1.35rem 1.2rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.wb-sys-price__tier:hover {
  transform: translateY(-3px);
}
.wb-sys-price__tier--hit {
  position: relative;
  z-index: 1;
  transform: scale(1.02);
}
.wb-sys-price__amt {
  margin: 0.35rem 0 0.55rem;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.wb-sys-price__per {
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.85;
  margin-left: 0.08rem;
}
.wb-sys-price__list {
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
  font-size: 0.82rem;
  line-height: 1.55;
  flex: 1;
}
.wb-sys-price__list li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-bottom: 0.35rem;
}
.wb-sys-check {
  flex-shrink: 0;
  width: 0.95rem;
  height: 0.95rem;
  margin-top: 0.18rem;
  border-radius: 3px;
  border: 2px solid currentColor;
  opacity: 0.9;
  position: relative;
}
.wb-sys-check::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 0px;
  width: 4px;
  height: 7px;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  opacity: 0.95;
}

.wb-sys-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 70rem;
  margin: 0 auto;
  padding-bottom: 2.1rem;
}
.wb-sys-carousel__viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.wb-sys-carousel__viewport::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.wb-sys-carousel__track {
  display: flex;
  gap: 0.75rem;
  padding: 0.2rem 0;
}
.wb-sys-carousel__slide {
  margin: 0;
  flex: 0 0 min(88%, 26rem);
  scroll-snap-align: start;
}
.wb-sys-carousel__slide img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  object-fit: cover;
  aspect-ratio: 16 / 10;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.wb-sys-carousel__viewport:hover .wb-sys-carousel__slide:hover img {
  transform: scale(1.02);
}
.wb-sys-carousel__btn {
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  cursor: pointer;
  font-size: 1.45rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.2s ease, transform 0.2s ease;
}
.wb-sys-carousel__btn:hover {
  transform: scale(1.05);
}
.wb-sys-carousel__btn .wb-ds-ico {
  pointer-events: none;
}

.wb-sys-carousel__dots {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  gap: 0.45rem;
  align-items: center;
}
.wb-sys-carousel__dot {
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  margin: 0;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(255, 255, 255, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.wb-sys-carousel__dot:hover {
  transform: scale(1.15);
}
.wb-sys-carousel__dot--active {
  background: rgba(37, 99, 235, 0.95);
  border-color: rgba(191, 219, 254, 0.9);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22);
}

.wb-sys-map {
  max-width: 58rem;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
}
.wb-sys-map iframe {
  display: block;
  width: 100%;
  border: 0;
  min-height: 220px;
}

.wb-sys-contact-split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: clamp(1.35rem, 3.2vw, 2.75rem);
  max-width: 58rem;
  margin: 0 auto;
  align-items: start;
  justify-items: stretch;
}
@media (min-width: 768px) {
  .wb-sys-contact-split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
    gap: clamp(1.25rem, 3vw, 2rem) clamp(1.75rem, 4vw, 3rem);
    align-items: start;
  }
}
.wb-sys-contact__info,
.wb-sys-contact__form {
  min-width: 0;
}
.wb-sys-contact__info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.wb-sys-contact__line {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  font-size: 0.88rem;
  line-height: 1.45;
}
.wb-sys-contact__line a {
  text-decoration: none;
}
.wb-sys-contact__line a:hover {
  text-decoration: underline;
}
.wb-sys-contact__ico {
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
}
.wb-sys-contact__ico--svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
.wb-sys-contact__form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 0;
  align-self: stretch;
}
.wb-sys-contact__form input,
.wb-sys-contact__form textarea {
  width: 100%;
  padding: 0.62rem 0.75rem;
  border-radius: 11px;
  margin-bottom: 0;
  font: inherit;
  box-sizing: border-box;
}

.wb-sys-footer {
  padding: 2.75rem clamp(0.85rem, 3vw, 1.35rem) 1.25rem;
  background: #050508;
  color: #94a3b8;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.wb-sys-footer__grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr));
  gap: 1.75rem;
  font-size: 0.88rem;
}
@media (max-width: 720px) {
  .wb-sys-footer__grid {
    grid-template-columns: 1fr;
  }
}
.wb-sys-footer__logo {
  margin: 0 0 0.45rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  font-size: 0.74rem;
  text-transform: uppercase;
  color: #f1f5f9;
}
.wb-sys-footer__tag {
  margin: 0;
  line-height: 1.55;
  max-width: 22rem;
}
.wb-sys-footer__title {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0 0 0.55rem;
  color: #e2e8f0;
}
.wb-sys-footer__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.wb-sys-footer__list li {
  margin: 0.32rem 0;
}
.wb-sys-footer a {
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.wb-sys-footer a:hover {
  opacity: 0.85;
}
.wb-sys-footer__social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.wb-sys-footer__social-link {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 800;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-sys-footer__social-link .wb-ds-ico--social {
  width: 0.88rem;
  height: 0.88rem;
}
.wb-sys-footer__copy {
  max-width: 72rem;
  margin: 2rem auto 0;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  font-size: 0.76rem;
  color: #64748b;
}

.wb-sys-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.15rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  font: inherit;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, filter 0.2s ease;
}
button.wb-sys-btn,
a.wb-sys-btn {
  -webkit-appearance: none;
  appearance: none;
}
.wb-sys-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.04);
}
.wb-sys-btn--ghost {
  background: transparent;
}
.wb-sys-btn--block {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* POWER reference (SET 1): brand, split hero, carousel dots, night map */
.wb-sys-brand--gympower {
  display: inline-flex;
  align-items: center;
  gap: 0;
  letter-spacing: 0.14em;
  font-weight: 900;
  font-size: 0.78rem;
  text-decoration: none;
}
.wb-sys-brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.42rem;
}
.wb-sys-brand--gympower .wb-sys-brand__gym {
  color: #fafafa;
}
.wb-sys-brand--gympower .wb-sys-brand__pwr {
  color: #ef4444;
}

.wb-sys-pwr-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-pwr-hero {
  padding: 0;
  min-height: min(82vh, 44rem);
}
.wb-sys-pwr-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  min-height: min(82vh, 44rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-pwr-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-pwr-hero__imgCol {
    min-height: 15rem;
    order: -1;
  }
}
.wb-sys-pwr-hero__copyCol {
  padding: clamp(2.5rem, 6vw, 4.25rem) clamp(1rem, 4vw, 2.25rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #030303;
  position: relative;
  z-index: 0;
}
.wb-sys-pwr-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-pwr-hero__copyCol::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(90deg, transparent 50%, rgba(3, 3, 3, 0.75) 100%);
}
@media (max-width: 900px) {
  .wb-sys-pwr-hero__copyCol::after {
    display: none;
  }
}
.wb-sys-pwr-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: #000;
}
.wb-sys-pwr-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
  filter: contrast(1.1) saturate(0.88) brightness(0.68);
  opacity: 0.86;
}
.wb-sys-pwr-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, #030303 0%, rgba(3, 3, 3, 0.5) 32%, transparent 58%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.78) 100%),
    radial-gradient(ellipse 85% 65% at 72% 48%, transparent 38%, rgba(0, 0, 0, 0.88) 100%);
}

.wb-sys-h2--pwr-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 900;
}
.wb-sys-pwr-pricing__head .wb-sys-eyebrow {
  letter-spacing: 0.22em;
}

.wb-sys-carousel--pwr {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--pwr .wb-sys-carousel__slide img {
  border-color: rgba(64, 64, 64, 0.55);
  filter: contrast(1.08) saturate(0.82) brightness(0.76);
}

.wb-sys-map--pwr-night {
  background: #070707;
  border: 1px solid rgba(220, 38, 38, 0.22);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
.wb-sys-map--pwr-night iframe {
  filter: grayscale(1) contrast(1.08) brightness(0.52) invert(0.05);
  min-height: 260px;
  opacity: 0.92;
}

.wb-sys-pwr-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.2em;
}

.wb-sys-footer__logo--gympower {
  display: flex;
  align-items: baseline;
  gap: 0;
  letter-spacing: 0.14em;
}
.wb-sys-footer__logo--gympower .wb-sys-brand__gym {
  color: #fafafa;
}
.wb-sys-footer__logo--gympower .wb-sys-brand__pwr {
  color: #ef4444;
}

/* FOCUS reference (SET 2): chartreuse/lime on black, split hero, night map */
.wb-sys-brand--focusgym {
  display: inline-flex;
  align-items: center;
  gap: 0;
  letter-spacing: 0.12em;
  font-weight: 900;
  font-size: 0.76rem;
  text-decoration: none;
  text-transform: uppercase;
}
.wb-sys-brand--focusgym .wb-sys-brand__foc {
  color: #f8fafc;
}
.wb-sys-brand--focusgym .wb-sys-brand__gymtag {
  color: #9ccf3f;
  margin-left: 0.12em;
}
.wb-sys-brand__mark--foc .wb-ds-ico--foc-nav {
  color: #e2e8f0;
  filter: drop-shadow(0 0 8px rgba(156, 207, 63, 0.25));
}

.wb-sys-foc-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-foc-hero {
  padding: 0;
  min-height: min(82vh, 44rem);
}
.wb-sys-foc-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  min-height: min(82vh, 44rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-foc-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-foc-hero__imgCol {
    min-height: 15rem;
    order: -1;
  }
}
.wb-sys-foc-hero__copyCol {
  padding: clamp(2.5rem, 6vw, 4.25rem) clamp(1rem, 4vw, 2.25rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #040506;
  position: relative;
  z-index: 0;
}
.wb-sys-foc-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-foc-hero__copyCol::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(90deg, transparent 48%, rgba(4, 5, 6, 0.82) 100%);
}
@media (max-width: 900px) {
  .wb-sys-foc-hero__copyCol::after {
    display: none;
  }
}
.wb-sys-foc-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: #000;
}
.wb-sys-foc-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 24%;
  display: block;
  filter: contrast(1.08) saturate(0.85) brightness(0.66);
  opacity: 0.88;
}
.wb-sys-foc-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, #040506 0%, rgba(4, 5, 6, 0.48) 30%, transparent 56%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.76) 100%),
    radial-gradient(ellipse 88% 62% at 70% 45%, transparent 36%, rgba(0, 0, 0, 0.88) 100%);
}

.wb-sys-h2--foc-kicker {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 900;
}
.wb-sys-foc-pricing__head .wb-sys-eyebrow,
.wb-sys-foc-features__head .wb-sys-eyebrow,
.wb-sys-foc-about__head .wb-sys-eyebrow,
.wb-sys-foc-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.2em;
}

.wb-sys-price__tier--hit {
  position: relative;
}
.wb-sys-price__badge--foc {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 2;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #89c33f, #b8e070);
  color: #0a0f06;
  box-shadow: 0 6px 18px rgba(156, 207, 63, 0.35);
}

.wb-sys-carousel--foc {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--foc .wb-sys-carousel__slide img {
  border-color: rgba(71, 85, 105, 0.45);
  filter: contrast(1.05) saturate(0.88) brightness(0.78);
}

.wb-sys-map--foc-night {
  position: relative;
  background: #050508;
  border: 1px solid rgba(156, 207, 63, 0.22);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
.wb-sys-map--foc-night::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.25rem;
  height: 2.25rem;
  margin: -1.125rem 0 0 -1.125rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, #9ccf3f, #6a9a2e);
  box-shadow: 0 0 0 4px rgba(156, 207, 63, 0.2), 0 10px 28px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}
.wb-sys-map--foc-night iframe {
  position: relative;
  z-index: 1;
  filter: grayscale(1) contrast(1.06) brightness(0.5) invert(0.04);
  min-height: 260px;
  opacity: 0.9;
}

.wb-sys-footer__logo--focusgym {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  letter-spacing: 0.12em;
  font-weight: 900;
  font-size: 0.74rem;
  text-transform: uppercase;
}
.wb-sys-footer__logo--focusgym .wb-sys-brand__foc {
  color: #f8fafc;
}
.wb-sys-footer__logo--focusgym .wb-sys-brand__gymtag {
  color: #9ccf3f;
}
.wb-sys-footer__logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.wb-sys-footer__logo-mark .wb-ds-ico--foc-nav {
  width: 1.1rem;
  height: 1.1rem;
  color: #e2e8f0;
}

/* ========== POWER — dark + red ========== */
.wb-sys--power {
  font-family: Montserrat, system-ui, -apple-system, sans-serif;
}
.wb-sys--power.wb-sys-nav {
  background: rgba(8, 8, 10, 0.94);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
}
.wb-sys--power .wb-sys-brand {
  color: #fef2f2;
}
.wb-sys--power .wb-sys-nav__links a {
  color: #a8a29e;
}
.wb-sys--power .wb-sys-nav__links a:hover {
  color: #f87171;
}
.wb-sys--power .wb-sys-btn {
  background: linear-gradient(135deg, #b91c1c, #dc2626 55%, #ef4444);
  color: #fff;
  border-color: rgba(248, 113, 113, 0.35);
  box-shadow: 0 8px 28px rgba(220, 38, 38, 0.4);
}
.wb-sys--power.wb-sys-hero {
  background: radial-gradient(70% 55% at 85% 20%, rgba(220, 38, 38, 0.22), transparent 55%),
    linear-gradient(165deg, #030303 0%, #171717 50%, #0a0a0a 100%);
  color: #fafafa;
}
.wb-sys--power.wb-sys-pwr-hero {
  background: #020202;
  padding: 0;
  overflow: hidden;
}
.wb-sys--power .wb-sys-h1--impact {
  letter-spacing: 0.05em;
}
.wb-sys--power .wb-sys-hero__figure {
  box-shadow: 0 28px 70px rgba(220, 38, 38, 0.18), 0 0 0 1px rgba(220, 38, 38, 0.12);
}
.wb-sys--power .wb-sys-eyebrow {
  color: #f87171;
}
.wb-sys--power .wb-sys-lead {
  color: #d4d4d4;
}
.wb-sys--power .wb-sys-btn--ghost {
  color: #fecaca;
  border-color: rgba(248, 113, 113, 0.45);
}
.wb-sys--power.wb-sys-section {
  background: #0a0a0a;
  color: #e5e5e5;
}
.wb-sys--power .wb-sys-sub {
  color: #a3a3a3;
}
.wb-sys--power .wb-sys-feature {
  background: linear-gradient(165deg, #171717, #0f0f0f);
  border: 1px solid rgba(220, 38, 38, 0.15);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
}
.wb-sys--power .wb-sys-feature:hover {
  border-color: rgba(248, 113, 113, 0.35);
}
.wb-sys--power .wb-sys-feature__icon {
  background: rgba(220, 38, 38, 0.18);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.25);
}
.wb-sys--power .wb-sys-feature__desc {
  color: #a3a3a3;
}
.wb-sys--power .wb-sys-stat-block {
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
}
.wb-sys--power .wb-sys-stat-num {
  color: #fecaca;
}
.wb-sys--power .wb-sys-stat-lbl {
  color: #fca5a5;
}
.wb-sys--power .wb-sys-about__visual {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(220, 38, 38, 0.15);
}
.wb-sys--power .wb-sys-about__visual img {
  filter: contrast(1.08) saturate(0.78) brightness(0.68);
  opacity: 0.9;
}
.wb-sys--power .wb-sys-about__visual::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(220, 38, 38, 0.14);
  background:
    linear-gradient(90deg, rgba(8, 8, 8, 0.4) 0%, transparent 48%),
    linear-gradient(180deg, transparent 42%, rgba(0, 0, 0, 0.68) 100%),
    radial-gradient(ellipse at 68% 42%, transparent 48%, rgba(0, 0, 0, 0.55) 100%);
}
.wb-sys--power .wb-sys-price__tier {
  background: #141414;
  border: 1px solid rgba(64, 64, 64, 0.6);
  color: #fafafa;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.18), 0 14px 42px rgba(0, 0, 0, 0.52);
}
.wb-sys--power .wb-sys-price__tier--hit {
  background: linear-gradient(165deg, #450a0a 0%, #1c1917 100%);
  border: 1px solid rgba(248, 113, 113, 0.45);
  box-shadow: 0 22px 55px rgba(220, 38, 38, 0.2);
}
.wb-sys--power .wb-sys-price__amt {
  color: #f87171;
}
.wb-sys--power .wb-sys-carousel__btn {
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fecaca;
}
.wb-sys--power .wb-sys-carousel__dot {
  border-color: rgba(220, 38, 38, 0.42);
  background: rgba(12, 12, 12, 0.92);
}
.wb-sys--power .wb-sys-carousel__dot--active {
  background: linear-gradient(145deg, #b91c1c, #ef4444);
  border-color: rgba(254, 202, 202, 0.85);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.22), 0 0 18px rgba(239, 68, 68, 0.32);
}
.wb-sys--power .wb-sys-feature__icon .wb-ds-ico {
  color: #fecaca;
}
.wb-sys--power .wb-sys-contact__ico--svg {
  color: #f87171;
}
.wb-sys--power.wb-sys-contact .wb-sys-contact-split {
  background: rgba(20, 20, 20, 0.95);
  border-radius: 18px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(82, 82, 82, 0.5);
}
.wb-sys--power .wb-sys-contact__line a {
  color: #fecaca;
}
.wb-sys--power .wb-sys-contact__form input,
.wb-sys--power .wb-sys-contact__form textarea {
  border: 1px solid rgba(82, 82, 82, 0.7);
  background: rgba(10, 10, 10, 0.85);
  color: #fafafa;
}
.wb-sys--power.wb-sys-footer {
  border-top-color: rgba(220, 38, 38, 0.2);
}
.wb-sys--power .wb-sys-footer a {
  color: #f87171;
}
.wb-sys--power .wb-sys-footer__social-link {
  background: rgba(220, 38, 38, 0.12);
  color: #fecaca;
}

/* ELITE reference (SET 2): blue/white split hero, light map, carousel, recommended tier */
.wb-sys-brand--elitefit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.1em;
  font-weight: 900;
  font-size: 0.72rem;
  text-decoration: none;
  text-transform: uppercase;
}
.wb-sys-brand--elitefit .wb-sys-brand__eli {
  color: #0f172a;
}
.wb-sys-brand--elitefit .wb-sys-brand__fit {
  color: #0066ff;
  margin-left: 0.08em;
}
.wb-sys-brand__mark--eli .wb-ds-ico--eli-nav {
  width: 1.15rem;
  height: 1.15rem;
  color: #0066ff;
  filter: drop-shadow(0 2px 8px rgba(0, 102, 255, 0.25));
}

.wb-sys-eli-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-h2--eli-kicker {
  text-transform: none;
  letter-spacing: -0.02em;
  font-weight: 800;
  color: #0f172a;
}
.wb-sys-eli-pricing__head .wb-sys-eyebrow,
.wb-sys-eli-features__head .wb-sys-eyebrow,
.wb-sys-eli-about__head .wb-sys-eyebrow,
.wb-sys-eli-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.18em;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.62rem;
}

.wb-sys-price__badge--eli {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 2;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #0052cc, #0066ff 55%, #3385ff);
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.35);
}

.wb-sys-eli-hero {
  padding: 0;
  min-height: min(78vh, 42rem);
  overflow: hidden;
}
.wb-sys-eli-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr);
  min-height: min(78vh, 42rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-eli-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-eli-hero__imgCol {
    min-height: 16rem;
    order: -1;
  }
}
.wb-sys-eli-hero__copyCol {
  padding: clamp(2.25rem, 5vw, 4rem) clamp(1rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 50% at 12% 18%, rgba(0, 102, 255, 0.08), transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 72%, rgba(0, 102, 255, 0.06), transparent 50%),
    linear-gradient(180deg, #fff 0%, #f8fbff 100%);
}
.wb-sys-eli-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-eli-hero__copyCol::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
  background:
    linear-gradient(125deg, transparent 40%, rgba(0, 102, 255, 0.04) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='%230066ff' fill-opacity='0.06' d='M0 0h40v40H0zm40 40h40v40H40z'/%3E%3C/svg%3E");
  background-size: auto, 72px 72px;
}
.wb-sys-eli-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f7ff 0%, #e8f2ff 100%);
}
.wb-sys-eli-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 28%;
  display: block;
}
.wb-sys-eli-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, #f8fbff 0%, rgba(248, 251, 255, 0.55) 22%, transparent 48%),
    linear-gradient(180deg, rgba(0, 102, 255, 0.12) 0%, transparent 38%),
    radial-gradient(ellipse 90% 70% at 72% 42%, transparent 32%, rgba(0, 102, 255, 0.22) 100%);
}

.wb-sys-about__visual--eli {
  border-radius: 1.35rem;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
}
.wb-sys-about__visual--eli img {
  border-radius: inherit;
}

.wb-sys-carousel--eli {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--eli .wb-sys-carousel__slide img {
  border-color: rgba(0, 102, 255, 0.18);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}
.wb-sys-carousel--eli .wb-sys-carousel__btn {
  background: #0066ff;
  border-color: rgba(0, 82, 204, 0.5);
  color: #fff;
  box-shadow: 0 8px 22px rgba(0, 102, 255, 0.35);
}
.wb-sys-carousel--eli .wb-sys-carousel__btn:hover {
  background: #0052cc;
  border-color: #0047b3;
}
.wb-sys-carousel--eli .wb-sys-carousel__dot {
  border-color: rgba(0, 102, 255, 0.35);
  background: #fff;
}
.wb-sys-carousel--eli .wb-sys-carousel__dot--active {
  background: #0066ff;
  border-color: #3385ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.2);
}

.wb-sys-map--eli-light {
  position: relative;
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  overflow: hidden;
}
.wb-sys-map--eli-light iframe {
  position: relative;
  z-index: 1;
  filter: saturate(0.65) contrast(0.95) brightness(1.08) sepia(0.08) hue-rotate(-12deg);
  min-height: 260px;
  opacity: 0.92;
}
.wb-sys-map--eli-light::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.35rem;
  height: 2.35rem;
  margin: -1.175rem 0 0 -1.175rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, #0066ff, #0047b3);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.95), 0 10px 28px rgba(0, 102, 255, 0.45);
  pointer-events: none;
}

.wb-sys-footer__logo--elitefit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  letter-spacing: 0.1em;
  font-weight: 900;
  font-size: 0.72rem;
  text-transform: uppercase;
}
.wb-sys-footer__logo--elitefit .wb-sys-brand__eli {
  color: #0f172a;
}
.wb-sys-footer__logo--elitefit .wb-sys-brand__fit {
  color: #0066ff;
}
.wb-sys-footer__logo-mark--eli .wb-ds-ico--eli-nav {
  width: 1.05rem;
  height: 1.05rem;
  color: #0066ff;
}

/* ========== ELITE — light + blue ========== */
.wb-sys--elite {
  font-family: Inter, system-ui, sans-serif;
  --wb-eli-blue: #0066ff;
  --wb-eli-blue-soft: #3385ff;
}
.wb-sys--elite.wb-sys-nav {
  background: linear-gradient(180deg, rgba(240, 247, 255, 0.98) 0%, rgba(255, 255, 255, 0.96) 42%, rgba(255, 255, 255, 0.94) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}
.wb-sys--elite.wb-sys-eli-nav {
  background: linear-gradient(180deg, #f0f7ff 0%, rgba(255, 255, 255, 0.97) 55%, rgba(255, 255, 255, 0.95) 100%);
}
.wb-sys--elite .wb-sys-brand {
  color: #0f172a;
}
.wb-sys--elite .wb-sys-nav__links a {
  color: #475569;
}
.wb-sys--elite .wb-sys-nav__links a:hover {
  color: #2563eb;
}
.wb-sys--elite .wb-sys-btn {
  background: linear-gradient(135deg, #0052cc, var(--wb-eli-blue) 52%, var(--wb-eli-blue-soft));
  color: #fff;
  border-color: rgba(0, 102, 255, 0.25);
  box-shadow: 0 8px 26px rgba(0, 102, 255, 0.32);
}
.wb-sys--elite .wb-sys-btn:hover {
  filter: brightness(1.05);
  box-shadow: 0 10px 30px rgba(0, 102, 255, 0.38);
}
.wb-sys--elite.wb-sys-hero {
  background: linear-gradient(180deg, #f8fafc 0%, #fff 55%, #eff6ff 100%);
  color: #0f172a;
}
.wb-sys--elite.wb-sys-eli-hero {
  background: #fff;
  padding: 0;
}
.wb-sys--elite .wb-sys-eli-hero .wb-sys-h1--impact {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.05;
}
.wb-sys--elite .wb-sys-hero__figure {
  box-shadow: 0 22px 50px rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(191, 219, 254, 0.8);
}
.wb-sys--elite .wb-sys-eyebrow {
  color: #2563eb;
}
.wb-sys--elite .wb-sys-lead {
  color: #475569;
}
.wb-sys--elite .wb-sys-btn--ghost {
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.28);
}
.wb-sys--elite.wb-sys-section {
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: #0f172a;
}
.wb-sys--elite.wb-sys-section.wb-sys-section--features {
  padding-top: clamp(3.5rem, 8vw, 5.5rem);
  padding-bottom: clamp(3.5rem, 8vw, 5.5rem);
}
.wb-sys--elite .wb-sys-sub {
  color: #64748b;
}
.wb-sys--elite .wb-sys-feature {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}
.wb-sys--elite .wb-sys-feature:hover {
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
}
.wb-sys--elite .wb-sys-feature__icon {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid rgba(191, 219, 254, 0.9);
}
.wb-sys--elite .wb-sys-feature__desc {
  color: #64748b;
}
.wb-sys--elite .wb-sys-feature__title {
  font-weight: 800;
  color: #0f172a;
}
.wb-sys--elite .wb-sys-stat-block {
  background: #f1f5f9;
  border: 1px solid rgba(226, 232, 240, 0.9);
}
.wb-sys--elite .wb-sys-stats:not(.wb-sys-stats--eli) .wb-sys-stat-num {
  color: #1d4ed8;
}
.wb-sys--elite .wb-sys-stats:not(.wb-sys-stats--eli) .wb-sys-stat-lbl {
  color: #475569;
}
.wb-sys--elite .wb-sys-stats--eli .wb-sys-stat-num {
  color: #0f172a;
  font-weight: 900;
}
.wb-sys--elite .wb-sys-stats--eli .wb-sys-stat-lbl {
  color: var(--wb-eli-blue);
  font-weight: 700;
}
.wb-sys--elite .wb-sys-about__visual {
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}
.wb-sys--elite .wb-sys-price__tier {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: #0f172a;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}
.wb-sys--elite .wb-sys-price__tier--hit {
  background: #fff;
  border: 2px solid var(--wb-eli-blue);
  box-shadow: 0 20px 50px rgba(0, 102, 255, 0.14);
  transform: scale(1.02);
}
@media (max-width: 900px) {
  .wb-sys--elite .wb-sys-price__tier--hit {
    transform: none;
  }
}
.wb-sys--elite .wb-sys-price__amt {
  color: #0f172a;
  font-weight: 800;
}
.wb-sys--elite .wb-sys-price__tier .wb-sys-eyebrow {
  color: var(--wb-eli-blue);
  font-weight: 800;
}
.wb-sys--elite .wb-sys-check {
  border-color: rgba(0, 102, 255, 0.45);
  background: rgba(0, 102, 255, 0.08);
  color: var(--wb-eli-blue);
}
.wb-sys--elite .wb-sys-carousel:not(.wb-sys-carousel--eli) .wb-sys-carousel__btn {
  background: #fff;
  border-color: rgba(148, 163, 184, 0.35);
  color: #1e293b;
}
.wb-sys--elite.wb-sys-contact .wb-sys-contact-split {
  background: #f8fafc;
  border-radius: 18px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(203, 213, 225, 0.85);
}
.wb-sys--elite .wb-sys-contact__line a {
  color: #2563eb;
}
.wb-sys--elite .wb-sys-contact__form input,
.wb-sys--elite .wb-sys-contact__form textarea {
  border: 1px solid rgba(203, 213, 225, 0.95);
  background: #fff;
  color: #0f172a;
}
.wb-sys--elite.wb-sys-footer {
  border-top-color: rgba(148, 163, 184, 0.25);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}
.wb-sys--elite .wb-sys-footer a {
  color: #2563eb;
}
.wb-sys--elite .wb-sys-footer a:hover {
  color: var(--wb-eli-blue);
}
.wb-sys--elite .wb-sys-footer__social-link {
  background: rgba(37, 99, 235, 0.12);
  color: #bfdbfe;
}
.wb-sys-footer--eli {
  background: #f1f5f9 !important;
  border-top: 1px solid rgba(203, 213, 225, 0.85);
}
.wb-sys-footer--eli .wb-sys-footer__title {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.62rem;
}
.wb-sys-footer--eli .wb-sys-footer__copy {
  color: #64748b;
}
.wb-sys-footer--eli .wb-sys-footer__social-link {
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 6px;
}
.wb-sys-footer--eli .wb-sys-footer__social-link:hover {
  background: #1e293b;
  color: #fff;
}
.wb-sys-footer--eli .wb-sys-footer__list a {
  color: #475569;
}
.wb-sys-footer--eli .wb-sys-footer__list a:hover {
  color: var(--wb-eli-blue);
}

/* ========== FOCUS — SET 2 chartreuse / lime on black ========== */
.wb-sys--focus {
  font-family: Montserrat, system-ui, -apple-system, sans-serif;
  --wb-foc-lime: #9ccf3f;
  --wb-foc-lime-bright: #c8e877;
  --wb-foc-lime-deep: #6a9a2e;
  --wb-foc-ink: #0a0f06;
}
.wb-sys--focus.wb-sys-nav {
  background: rgba(2, 3, 6, 0.96);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(156, 207, 63, 0.22);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55);
}
.wb-sys--focus .wb-sys-brand:not(.wb-sys-brand--focusgym) {
  color: #f8fafc;
}
.wb-sys--focus .wb-sys-nav__links a {
  color: #e2e8f0;
}
.wb-sys--focus .wb-sys-nav__links a:hover {
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus .wb-sys-btn {
  background: linear-gradient(135deg, var(--wb-foc-lime-deep), var(--wb-foc-lime) 52%, var(--wb-foc-lime-bright));
  color: var(--wb-foc-ink);
  border-color: rgba(200, 232, 119, 0.45);
  box-shadow: 0 10px 32px rgba(156, 207, 63, 0.32);
  font-weight: 800;
}
.wb-sys--focus.wb-sys-hero {
  background: radial-gradient(55% 45% at 12% 12%, rgba(156, 207, 63, 0.12), transparent 52%),
    linear-gradient(168deg, #020203 0%, #0a0d12 48%, #050806 100%);
  color: #f8fafc;
}
.wb-sys--focus.wb-sys-foc-hero {
  background: #020203;
  padding: 0;
  overflow: hidden;
}
.wb-sys--focus .wb-sys-hero__figure {
  box-shadow: 0 28px 70px rgba(156, 207, 63, 0.12), 0 0 0 1px rgba(156, 207, 63, 0.14);
}
.wb-sys--focus .wb-sys-eyebrow {
  color: var(--wb-foc-lime);
  font-weight: 800;
}
.wb-sys--focus .wb-sys-h2 {
  color: #f8fafc;
}
.wb-sys--focus .wb-sys-lead {
  color: #cbd5e1;
}
.wb-sys--focus .wb-sys-btn--ghost {
  color: #f8fafc;
  border-color: rgba(248, 250, 252, 0.45);
  background: rgba(255, 255, 255, 0.03);
}
.wb-sys--focus .wb-sys-btn--ghost:hover {
  border-color: rgba(156, 207, 63, 0.65);
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus.wb-sys-section {
  background: #030306;
  color: #e2e8f0;
}
.wb-sys--focus .wb-sys-sub {
  color: #94a3b8;
}
.wb-sys--focus .wb-sys-feature__title {
  color: var(--wb-foc-lime-bright);
  font-weight: 800;
}
.wb-sys--focus .wb-sys-feature {
  background: linear-gradient(165deg, rgba(12, 14, 18, 0.96), rgba(4, 5, 8, 0.99));
  border: 1px solid rgba(156, 207, 63, 0.16);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.45);
}
.wb-sys--focus .wb-sys-feature:hover {
  border-color: rgba(200, 232, 119, 0.38);
}
.wb-sys--focus .wb-sys-feature__icon {
  background: rgba(156, 207, 63, 0.12);
  color: var(--wb-foc-lime);
  border: 1px solid rgba(156, 207, 63, 0.28);
}
.wb-sys--focus .wb-sys-feature__icon .wb-ds-ico {
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus .wb-sys-feature__desc {
  color: #94a3b8;
}

/* FOCUS · Programs / features band — light “ELITE-style” slab (rest of set stays dark) */
.wb-sys--focus.wb-sys-section.wb-sys-section--features {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #f0f7ff 100%);
  color: #0f172a;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-sub {
  color: #64748b;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-h2--foc-kicker {
  color: #0f172a;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-foc-features__head {
  max-width: 44rem;
  margin-left: auto;
  margin-right: auto;
  padding: clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 3vw, 1.75rem);
  margin-bottom: 0.25rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 14px 42px rgba(15, 23, 42, 0.08);
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-foc-features__head .wb-sys-eyebrow {
  color: #0066ff;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.62rem;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature:hover {
  border-color: rgba(0, 102, 255, 0.28);
  box-shadow: 0 18px 44px rgba(0, 102, 255, 0.12);
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature__title {
  color: #0f172a;
  font-weight: 800;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature__icon {
  background: #eff6ff;
  color: #0066ff;
  border: 1px solid rgba(191, 219, 254, 0.95);
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature__icon .wb-ds-ico {
  color: #0066ff;
}
.wb-sys--focus.wb-sys-section.wb-sys-section--features .wb-sys-feature__desc {
  color: #64748b;
}

.wb-sys--focus .wb-sys-stat-block {
  background: rgba(156, 207, 63, 0.06);
  border: 1px solid rgba(156, 207, 63, 0.2);
}
.wb-sys--focus .wb-sys-stat-num {
  color: var(--wb-foc-lime);
}
.wb-sys--focus .wb-sys-stat-lbl {
  color: #e2e8f0;
}
.wb-sys--focus .wb-sys-about__visual {
  border: 1px solid rgba(156, 207, 63, 0.16);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.48);
}
.wb-sys--focus .wb-sys-about__visual img {
  filter: contrast(1.06) saturate(0.82) brightness(0.7);
  opacity: 0.9;
}
.wb-sys--focus .wb-sys-about__visual::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(156, 207, 63, 0.12);
  background:
    linear-gradient(90deg, rgba(6, 8, 10, 0.42) 0%, transparent 46%),
    linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.65) 100%),
    radial-gradient(ellipse at 66% 40%, transparent 46%, rgba(0, 0, 0, 0.52) 100%);
}
.wb-sys--focus .wb-sys-price__tier {
  background: rgba(10, 12, 16, 0.92);
  border: 1px solid rgba(71, 85, 105, 0.45);
  color: #f1f5f9;
  box-shadow: 0 0 0 1px rgba(156, 207, 63, 0.12), 0 16px 46px rgba(0, 0, 0, 0.5);
}
.wb-sys--focus .wb-sys-price__tier--hit {
  background: linear-gradient(165deg, rgba(40, 55, 22, 0.95) 0%, rgba(8, 10, 14, 0.98) 100%);
  border: 1px solid rgba(200, 232, 119, 0.45);
  box-shadow: 0 0 0 1px rgba(156, 207, 63, 0.22), 0 24px 60px rgba(156, 207, 63, 0.12);
  transform: scale(1.02);
}
@media (max-width: 900px) {
  .wb-sys--focus .wb-sys-price__tier--hit {
    transform: none;
  }
}
.wb-sys--focus .wb-sys-price__amt {
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus .wb-sys-check {
  border-color: var(--wb-foc-lime);
  color: var(--wb-foc-lime);
}
.wb-sys--focus .wb-sys-carousel__btn {
  background: rgba(156, 207, 63, 0.12);
  border-color: rgba(200, 232, 119, 0.38);
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus .wb-sys-carousel__dot {
  border-color: rgba(156, 207, 63, 0.35);
  background: rgba(12, 14, 18, 0.9);
}
.wb-sys--focus .wb-sys-carousel__dot--active {
  background: linear-gradient(135deg, var(--wb-foc-lime-deep), var(--wb-foc-lime));
  border-color: rgba(248, 250, 252, 0.55);
  box-shadow: 0 0 0 3px rgba(156, 207, 63, 0.2), 0 0 16px rgba(156, 207, 63, 0.28);
}
.wb-sys--focus.wb-sys-contact .wb-sys-contact-split {
  background: rgba(8, 10, 14, 0.96);
  border-radius: 18px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(156, 207, 63, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}
.wb-sys--focus .wb-sys-contact__line a {
  color: var(--wb-foc-lime-bright);
}
.wb-sys--focus .wb-sys-contact__ico--svg {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  background: rgba(156, 207, 63, 0.1);
  border: 1px solid rgba(156, 207, 63, 0.28);
  color: var(--wb-foc-lime);
}
.wb-sys--focus .wb-sys-contact__form input,
.wb-sys--focus .wb-sys-contact__form textarea {
  border: 1px solid rgba(71, 85, 105, 0.55);
  background: rgba(4, 5, 8, 0.85);
  color: #f8fafc;
}
.wb-sys--focus.wb-sys-footer {
  background: #020203;
  border-top-color: rgba(156, 207, 63, 0.2);
}
.wb-sys--focus .wb-sys-footer a {
  color: var(--wb-foc-lime);
}
.wb-sys--focus .wb-sys-footer__social-link {
  background: rgba(156, 207, 63, 0.12);
  border-color: rgba(156, 207, 63, 0.28);
  color: var(--wb-foc-lime-bright);
}

/* ENERGY reference (SET 4): orange #ff6600, split hero, ring icons, light map */
.wb-sys-brand--energyfit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.1em;
  font-weight: 900;
  font-size: 0.72rem;
  text-decoration: none;
  text-transform: uppercase;
}
.wb-sys-brand--energyfit .wb-sys-brand__en {
  color: #1c1917;
}
.wb-sys-brand--energyfit .wb-sys-brand__fit {
  color: #ff6600;
  margin-left: 0.08em;
}
.wb-sys-brand__mark--en .wb-ds-ico--en-nav {
  width: 1.15rem;
  height: 1.15rem;
  color: #ff6600;
  filter: drop-shadow(0 2px 8px rgba(255, 102, 0, 0.28));
}

.wb-sys-eng-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-h2--eng-kicker {
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #1c1917;
  text-transform: capitalize;
}
.wb-sys-eng-pricing__head .wb-sys-eyebrow,
.wb-sys-eng-features__head .wb-sys-eyebrow,
.wb-sys-eng-about__head .wb-sys-eyebrow,
.wb-sys-eng-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.18em;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.62rem;
}

.wb-sys-price__badge--eng {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 2;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #e65c00, #ff6600 52%, #ff8533);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 102, 0, 0.35);
}

.wb-sys-h1--eng-display {
  margin: 0;
  line-height: 0.98;
}
.wb-sys-eng-hero-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.12em;
}
.wb-sys-eng-hero-row {
  display: block;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: clamp(1.85rem, 4.5vw, 3.1rem);
  color: #1c1917;
}
.wb-sys-eng-hero-row--accent {
  color: #ff6600;
  font-size: clamp(2.1rem, 5vw, 3.55rem);
}

.wb-sys-eng-hero {
  padding: 0;
  min-height: min(76vh, 40rem);
  overflow: hidden;
}
.wb-sys-eng-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr);
  min-height: min(76vh, 40rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-eng-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-eng-hero__imgCol {
    min-height: 15rem;
    order: -1;
  }
}
.wb-sys-eng-hero__copyCol {
  padding: clamp(2.25rem, 5vw, 3.75rem) clamp(1rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 0;
  background:
    radial-gradient(ellipse 65% 55% at 8% 20%, rgba(255, 102, 0, 0.07), transparent 52%),
    linear-gradient(180deg, #fff 0%, #fffaf5 100%);
}
.wb-sys-eng-hero__copyCol::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  background:
    linear-gradient(118deg, transparent 35%, rgba(255, 102, 0, 0.04) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cpath fill='%23ff6600' fill-opacity='0.07' d='M0 36L36 0l36 36-36 36z'/%3E%3C/svg%3E");
  background-size: auto, 64px 64px;
}
.wb-sys-eng-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-eng-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5eb 0%, #ffe8d6 45%, #fff 100%);
}
.wb-sys-eng-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
}
.wb-sys-eng-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(95deg, #fffaf7 0%, rgba(255, 250, 247, 0.5) 24%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 78% 40%, rgba(255, 102, 0, 0.18), transparent 58%),
    linear-gradient(165deg, rgba(255, 102, 0, 0.1) 0%, transparent 42%);
}

.wb-sys-stats--eng .wb-sys-stat-num {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-weight: 900;
  font-size: inherit;
}
.wb-sys-stats--eng .wb-sys-stat-val {
  color: #1c1917;
}
.wb-sys-stats--eng .wb-sys-stat-plus {
  color: #ff6600;
  font-weight: 900;
}
.wb-sys-stats--eng .wb-sys-stat-lbl {
  color: #64748b;
  font-weight: 600;
}

.wb-sys-about__visual--en {
  border-radius: 1.15rem;
  overflow: hidden;
  box-shadow: 0 16px 42px rgba(28, 25, 23, 0.1);
}
.wb-sys-about__visual--en img {
  border-radius: inherit;
}

.wb-sys-carousel--eng {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--eng .wb-sys-carousel__slide img {
  border-radius: 14px;
  border-color: rgba(255, 102, 0, 0.22);
  box-shadow: 0 10px 28px rgba(28, 25, 23, 0.07);
}
.wb-sys-carousel--eng .wb-sys-carousel__btn {
  background: #ff6600;
  border-color: rgba(230, 92, 0, 0.55);
  color: #fff;
  box-shadow: 0 8px 22px rgba(255, 102, 0, 0.35);
}
.wb-sys-carousel--eng .wb-sys-carousel__btn:hover {
  background: #e65c00;
  border-color: #cc5200;
}
.wb-sys-carousel--eng .wb-sys-carousel__dot {
  border-color: rgba(255, 102, 0, 0.4);
  background: #fff;
}
.wb-sys-carousel--eng .wb-sys-carousel__dot--active {
  background: #ff6600;
  border-color: #ff8533;
  box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.22);
}

.wb-sys-map--eng-light {
  position: relative;
  background: #f8fafc;
  border: 1px solid rgba(203, 213, 225, 0.55);
  box-shadow: 0 12px 36px rgba(28, 25, 23, 0.06);
  border-radius: 16px;
  overflow: hidden;
}
.wb-sys-map--eng-light iframe {
  position: relative;
  z-index: 1;
  filter: saturate(0.55) contrast(0.96) brightness(1.06) sepia(0.12) hue-rotate(-8deg);
  min-height: 260px;
  opacity: 0.93;
}
.wb-sys-map--eng-light::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.35rem;
  height: 2.35rem;
  margin: -1.175rem 0 0 -1.175rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, #ff6600, #e65c00);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.95), 0 10px 28px rgba(255, 102, 0, 0.45);
  pointer-events: none;
}

.wb-sys-footer__logo--energyfit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  letter-spacing: 0.1em;
  font-weight: 900;
  font-size: 0.72rem;
  text-transform: uppercase;
}
.wb-sys-footer__logo--energyfit .wb-sys-brand__en {
  color: #1c1917;
}
.wb-sys-footer__logo--energyfit .wb-sys-brand__fit {
  color: #ff6600;
}
.wb-sys-footer__logo-mark--en .wb-ds-ico--en-nav {
  width: 1.05rem;
  height: 1.05rem;
  color: #ff6600;
}

/* ========== ENERGY — light + orange ========== */
.wb-sys--energy {
  font-family: Inter, system-ui, sans-serif;
  --wb-eng-orange: #ff6600;
  --wb-eng-orange-deep: #e65c00;
}
.wb-sys--energy.wb-sys-nav {
  background: linear-gradient(180deg, #fffaf5 0%, rgba(255, 255, 255, 0.97) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 102, 0, 0.2);
  box-shadow: 0 6px 24px rgba(255, 102, 0, 0.06);
}
.wb-sys--energy .wb-sys-brand:not(.wb-sys-brand--energyfit) {
  color: #1c1917;
}
.wb-sys--energy .wb-sys-nav__links a {
  color: #57534e;
}
.wb-sys--energy .wb-sys-nav__links a:hover {
  color: var(--wb-eng-orange);
}
.wb-sys--energy .wb-sys-btn {
  background: linear-gradient(135deg, var(--wb-eng-orange-deep), var(--wb-eng-orange) 50%, #ff8533);
  color: #fff;
  border-color: rgba(255, 102, 0, 0.35);
  box-shadow: 0 8px 26px rgba(255, 102, 0, 0.32);
}
.wb-sys--energy .wb-sys-btn:hover {
  filter: brightness(1.04);
}
.wb-sys--energy.wb-sys-hero {
  background: linear-gradient(180deg, #fff7ed 0%, #fff 50%, #ffedd5 100%);
  color: #1c1917;
}
.wb-sys--energy.wb-sys-eng-hero {
  background: #fff;
  padding: 0;
}
.wb-sys--energy .wb-sys-hero__figure {
  box-shadow: 0 22px 48px rgba(255, 102, 0, 0.12);
  border: 1px solid rgba(253, 186, 116, 0.65);
}
.wb-sys--energy .wb-sys-eng-hero .wb-sys-btn--ghost {
  background: #fff;
  color: #1c1917;
  border: 1px solid rgba(214, 211, 209, 0.95);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}
.wb-sys--energy .wb-sys-eng-hero .wb-sys-btn--ghost:hover {
  border-color: rgba(255, 102, 0, 0.45);
  color: var(--wb-eng-orange-deep);
}
.wb-sys--energy .wb-sys-eyebrow {
  color: var(--wb-eng-orange);
  font-weight: 800;
}
.wb-sys--energy .wb-sys-lead {
  color: #57534e;
}
.wb-sys--energy .wb-sys-btn--ghost {
  color: #c2410c;
  border-color: rgba(251, 146, 60, 0.45);
}
.wb-sys--energy.wb-sys-section {
  background: linear-gradient(180deg, #fff 0%, #fffaf7 100%);
  color: #1c1917;
}
.wb-sys--energy .wb-sys-sub {
  color: #57534e;
}
.wb-sys--energy .wb-sys-feature {
  background: #fff;
  border: 1px solid rgba(254, 215, 170, 0.75);
  box-shadow: 0 4px 18px rgba(255, 102, 0, 0.05);
}
.wb-sys--energy .wb-sys-feature:hover {
  box-shadow: 0 16px 40px rgba(255, 102, 0, 0.1);
  border-color: rgba(255, 102, 0, 0.28);
}
.wb-sys--energy.wb-sys-section--features .wb-sys-feature__icon {
  background: #fff;
  color: var(--wb-eng-orange);
  border: 2px solid var(--wb-eng-orange);
  box-shadow: none;
}
.wb-sys--energy.wb-sys-section--features .wb-sys-feature__title {
  font-weight: 800;
  color: #1c1917;
}
.wb-sys--energy .wb-sys-feature__desc {
  color: #57534e;
}
.wb-sys--energy .wb-sys-stat-block {
  background: rgba(255, 247, 237, 0.65);
  border: 1px solid rgba(255, 102, 0, 0.15);
}
.wb-sys--energy .wb-sys-stats:not(.wb-sys-stats--eng) .wb-sys-stat-num {
  color: var(--wb-eng-orange-deep);
}
.wb-sys--energy .wb-sys-stats:not(.wb-sys-stats--eng) .wb-sys-stat-lbl {
  color: #9a3412;
}
.wb-sys--energy .wb-sys-about__visual:not(.wb-sys-about__visual--en) {
  border: 1px solid rgba(254, 215, 170, 0.9);
  box-shadow: 0 14px 36px rgba(255, 102, 0, 0.08);
}
.wb-sys--energy .wb-sys-price__tier {
  background: #fff;
  border: 1px solid rgba(254, 215, 170, 0.85);
  color: #1c1917;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(28, 25, 23, 0.05);
}
.wb-sys--energy .wb-sys-price__tier--hit {
  background: linear-gradient(165deg, #fffaf5, #fff);
  border: 2px solid var(--wb-eng-orange);
  box-shadow: 0 20px 48px rgba(255, 102, 0, 0.14);
  transform: scale(1.02);
}
@media (max-width: 900px) {
  .wb-sys--energy .wb-sys-price__tier--hit {
    transform: none;
  }
}
.wb-sys--energy .wb-sys-price__amt {
  color: #1c1917;
  font-weight: 800;
}
.wb-sys--energy .wb-sys-price__tier .wb-sys-eyebrow {
  color: var(--wb-eng-orange);
  font-weight: 800;
}
.wb-sys--energy .wb-sys-price__per {
  color: #78716c;
  font-weight: 600;
}
.wb-sys--energy .wb-sys-check {
  border-color: rgba(255, 102, 0, 0.45);
  background: rgba(255, 102, 0, 0.08);
  color: var(--wb-eng-orange);
}
.wb-sys--energy .wb-sys-carousel:not(.wb-sys-carousel--eng) .wb-sys-carousel__btn {
  background: #fff;
  border-color: rgba(251, 146, 60, 0.4);
  color: #9a3412;
}
.wb-sys--energy.wb-sys-contact .wb-sys-contact-split {
  background: #fffaf5;
  border-radius: 18px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(254, 215, 170, 0.85);
}
.wb-sys--energy .wb-sys-contact__line a {
  color: var(--wb-eng-orange);
}
.wb-sys--energy .wb-sys-contact__ico--svg {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  background: rgba(255, 102, 0, 0.1);
  border: 1px solid rgba(255, 102, 0, 0.35);
  color: var(--wb-eng-orange);
}
.wb-sys--energy .wb-sys-contact__form input,
.wb-sys--energy .wb-sys-contact__form textarea {
  border: 1px solid rgba(214, 211, 209, 0.95);
  background: #fff;
  color: #1c1917;
  border-radius: 10px;
}
.wb-sys--energy.wb-sys-footer {
  border-top-color: rgba(255, 102, 0, 0.18);
  background: linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%);
}
.wb-sys--energy .wb-sys-footer a {
  color: var(--wb-eng-orange);
}
.wb-sys--energy .wb-sys-footer a:hover {
  color: var(--wb-eng-orange-deep);
}
.wb-sys--energy .wb-sys-footer__social-link {
  background: rgba(255, 102, 0, 0.12);
  color: #ffedd5;
}
.wb-sys-footer--eng {
  background: #f5f5f4 !important;
  border-top: 1px solid rgba(214, 211, 209, 0.9);
}
.wb-sys-footer--eng .wb-sys-footer__title {
  color: #1c1917;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.62rem;
}
.wb-sys-footer--eng .wb-sys-footer__copy {
  color: #78716c;
}
.wb-sys-footer--eng .wb-sys-footer__social-link {
  background: #ff6600;
  color: #fff;
  border: none;
  border-radius: 999px;
}
.wb-sys-footer--eng .wb-sys-footer__social-link:hover {
  background: #e65c00;
  color: #fff;
}
.wb-sys-footer--eng .wb-sys-footer__list a {
  color: #57534e;
}
.wb-sys-footer--eng .wb-sys-footer__list a:hover {
  color: var(--wb-eng-orange);
}

/* PRIME reference (SET 5): violet split hero, slab sections, night map */
.wb-sys-brand--primefit {
  display: inline-flex;
  align-items: center;
  gap: 0;
  letter-spacing: 0.11em;
  font-weight: 900;
  font-size: 0.74rem;
  text-decoration: none;
  text-transform: uppercase;
}
.wb-sys-brand--primefit .wb-sys-brand__prm {
  color: #faf5ff;
}
.wb-sys-brand--primefit .wb-sys-brand__fitness {
  color: #d8b4fe;
  margin-left: 0.12em;
}
.wb-sys-brand__mark--prm .wb-ds-ico--prm-nav {
  color: #e9d5ff;
  filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.45));
}

.wb-sys-prm-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-h2--prm-kicker {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 900;
}
.wb-sys-prm-pricing__head .wb-sys-eyebrow,
.wb-sys-prm-features__head .wb-sys-eyebrow,
.wb-sys-prm-about__head .wb-sys-eyebrow,
.wb-sys-prm-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.2em;
}

.wb-sys-price__badge--prm {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 2;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #7e22ce, #c084fc);
  color: #fff;
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.45);
}

.wb-sys-prm-hero {
  padding: 0;
  min-height: min(82vh, 44rem);
}
.wb-sys-prm-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  min-height: min(82vh, 44rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-prm-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-prm-hero__imgCol {
    min-height: 15rem;
    order: -1;
  }
}
.wb-sys-prm-hero__copyCol {
  padding: clamp(2.5rem, 6vw, 4.25rem) clamp(1rem, 4vw, 2.25rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #07030f;
  position: relative;
  z-index: 0;
}
.wb-sys-prm-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-prm-hero__copyCol::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(90deg, transparent 48%, rgba(7, 3, 15, 0.88) 100%);
}
@media (max-width: 900px) {
  .wb-sys-prm-hero__copyCol::after {
    display: none;
  }
}
.wb-sys-prm-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: #000;
}
.wb-sys-prm-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
  filter: contrast(1.08) saturate(0.75) brightness(0.62) hue-rotate(-6deg);
  opacity: 0.9;
}
.wb-sys-prm-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, #07030f 0%, rgba(7, 3, 15, 0.5) 30%, transparent 56%),
    linear-gradient(180deg, rgba(76, 29, 149, 0.12) 0%, rgba(0, 0, 0, 0.78) 100%),
    radial-gradient(ellipse 88% 62% at 70% 45%, transparent 34%, rgba(12, 3, 24, 0.9) 100%);
}

.wb-sys-carousel--prm {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--prm .wb-sys-carousel__slide img {
  border-color: rgba(109, 40, 217, 0.35);
  filter: contrast(1.05) saturate(0.78) brightness(0.72) hue-rotate(-4deg);
}

.wb-sys-map--prm-night {
  position: relative;
  background: #06020d;
  border: 1px solid rgba(168, 85, 247, 0.22);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
.wb-sys-map--prm-night iframe {
  position: relative;
  z-index: 1;
  filter: grayscale(1) contrast(1.05) brightness(0.48) invert(0.04);
  min-height: 260px;
  opacity: 0.9;
}
.wb-sys-map--prm-night::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.35rem;
  height: 2.35rem;
  margin: -1.175rem 0 0 -1.175rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, #a855f7, #6b21a8);
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.25), 0 0 28px rgba(192, 132, 252, 0.55);
  pointer-events: none;
}

.wb-sys-footer__logo--primefit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  letter-spacing: 0.11em;
  font-weight: 900;
  font-size: 0.72rem;
  text-transform: uppercase;
}
.wb-sys-footer__logo--primefit .wb-sys-brand__prm {
  color: #faf5ff;
}
.wb-sys-footer__logo--primefit .wb-sys-brand__fitness {
  color: #d8b4fe;
}
.wb-sys-footer__logo-mark--prm .wb-ds-ico--prm-nav {
  width: 1.05rem;
  height: 1.05rem;
  color: #e9d5ff;
}

/* ========== PRIME — SET 5 dark + violet ========== */
.wb-sys--prime {
  font-family: Montserrat, system-ui, -apple-system, sans-serif;
  --wb-prm-violet: #a855f7;
  --wb-prm-glow: #e879f9;
  --wb-prm-deep: #4c1d95;
}
.wb-sys--prime.wb-sys-nav {
  background: rgba(8, 4, 18, 0.96);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(168, 85, 247, 0.22);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.55);
}
.wb-sys--prime .wb-sys-brand:not(.wb-sys-brand--primefit) {
  color: #faf5ff;
}
.wb-sys--prime .wb-sys-nav__links a {
  color: #e2e8f0;
}
.wb-sys--prime .wb-sys-nav__links a:hover {
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-btn {
  background: linear-gradient(135deg, #6b21a8, var(--wb-prm-violet) 48%, #d8b4fe);
  color: #fff;
  border-color: rgba(233, 213, 254, 0.45);
  box-shadow: 0 10px 32px rgba(109, 40, 217, 0.42);
  font-weight: 800;
}
.wb-sys--prime.wb-sys-hero {
  background: radial-gradient(58% 48% at 88% 8%, rgba(168, 85, 247, 0.2), transparent 52%),
    linear-gradient(168deg, #05010c 0%, #12081f 45%, #07030f 100%);
  color: #f5f3ff;
}
.wb-sys--prime.wb-sys-prm-hero {
  background: #05010c;
  padding: 0;
  overflow: hidden;
}
.wb-sys--prime .wb-sys-hero__figure {
  box-shadow: 0 28px 70px rgba(109, 40, 217, 0.22), 0 0 0 1px rgba(168, 85, 247, 0.14);
}
.wb-sys--prime .wb-sys-eyebrow {
  color: var(--wb-prm-glow);
  font-weight: 800;
}
.wb-sys--prime .wb-sys-h2 {
  color: #faf5ff;
}
.wb-sys--prime .wb-sys-lead {
  color: #ddd6fe;
}
.wb-sys--prime .wb-sys-btn--ghost {
  color: #faf5ff;
  border-color: rgba(233, 213, 254, 0.42);
  background: rgba(255, 255, 255, 0.04);
}
.wb-sys--prime .wb-sys-btn--ghost:hover {
  border-color: rgba(232, 121, 249, 0.65);
  color: #fce7f3;
}
.wb-sys--prime.wb-sys-section {
  background: #0a0514;
  color: #ede9fe;
  border-radius: 1.75rem;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1.1rem;
  max-width: 72rem;
  border: 1px solid rgba(109, 40, 217, 0.18);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.42);
}
@media (max-width: 780px) {
  .wb-sys--prime.wb-sys-section {
    margin-left: 0.55rem;
    margin-right: 0.55rem;
    border-radius: 1.25rem;
  }
}
.wb-sys--prime .wb-sys-sub {
  color: #c4b5fd;
}
.wb-sys--prime .wb-sys-feature__title {
  color: #f0abfc;
  font-weight: 800;
}
.wb-sys--prime .wb-sys-feature {
  background: linear-gradient(165deg, rgba(24, 12, 40, 0.92), rgba(8, 4, 18, 0.98));
  border: 1px solid rgba(139, 92, 246, 0.22);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.42);
}
.wb-sys--prime .wb-sys-feature:hover {
  border-color: rgba(232, 121, 249, 0.38);
}
.wb-sys--prime .wb-sys-feature__icon {
  background: rgba(88, 28, 135, 0.35);
  color: #f5d0fe;
  border: 1px solid rgba(167, 139, 250, 0.35);
}
.wb-sys--prime .wb-sys-feature__icon .wb-ds-ico {
  color: #fce7f3;
}
.wb-sys--prime .wb-sys-feature__desc {
  color: #c4b5fd;
}
.wb-sys--prime .wb-sys-stat-block {
  background: rgba(76, 29, 149, 0.22);
  border: 1px solid rgba(167, 139, 250, 0.22);
}
.wb-sys--prime .wb-sys-stat-num {
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-stat-lbl {
  color: #e9d5ff;
}
.wb-sys--prime .wb-sys-about__visual {
  border: 1px solid rgba(139, 92, 246, 0.22);
  box-shadow: 0 24px 58px rgba(49, 10, 80, 0.4);
}
.wb-sys--prime .wb-sys-about__visual img {
  filter: contrast(1.05) saturate(0.72) brightness(0.66) hue-rotate(-8deg);
  opacity: 0.9;
}
.wb-sys--prime .wb-sys-about__visual::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.14);
  background:
    linear-gradient(90deg, rgba(10, 5, 20, 0.45) 0%, transparent 46%),
    linear-gradient(180deg, transparent 38%, rgba(0, 0, 0, 0.66) 100%),
    radial-gradient(ellipse at 64% 38%, transparent 44%, rgba(12, 3, 24, 0.55) 100%);
}
.wb-sys--prime .wb-sys-price__tier .wb-sys-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
}
.wb-sys--prime .wb-sys-price__tier {
  background: rgba(16, 8, 32, 0.9);
  border: 1px solid rgba(109, 40, 217, 0.32);
  color: #f5f3ff;
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.1), 0 18px 50px rgba(0, 0, 0, 0.48);
}
.wb-sys--prime .wb-sys-price__tier--hit {
  background: linear-gradient(165deg, rgba(76, 29, 149, 0.95) 0%, rgba(12, 6, 24, 0.98) 100%);
  border: 1px solid rgba(232, 121, 249, 0.48);
  box-shadow: 0 0 0 1px rgba(192, 132, 252, 0.2), 0 26px 62px rgba(109, 40, 217, 0.28);
  transform: scale(1.02);
}
@media (max-width: 900px) {
  .wb-sys--prime .wb-sys-price__tier--hit {
    transform: none;
  }
}
.wb-sys--prime .wb-sys-price__amt {
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-check {
  border-color: var(--wb-prm-violet);
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-carousel__btn {
  background: rgba(76, 29, 149, 0.38);
  border-color: rgba(192, 132, 252, 0.42);
  color: #fce7f3;
}
.wb-sys--prime .wb-sys-carousel__dot {
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(10, 5, 20, 0.92);
}
.wb-sys--prime .wb-sys-carousel__dot--active {
  background: linear-gradient(135deg, #6b21a8, var(--wb-prm-violet));
  border-color: rgba(248, 250, 252, 0.5);
  box-shadow: 0 0 0 3px rgba(126, 34, 206, 0.22), 0 0 18px rgba(192, 132, 252, 0.35);
}
.wb-sys--prime.wb-sys-contact .wb-sys-contact-split {
  background: rgba(14, 8, 28, 0.95);
  border-radius: 20px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(109, 40, 217, 0.28);
  box-shadow: 0 20px 52px rgba(0, 0, 0, 0.45);
}
.wb-sys--prime .wb-sys-contact__line a {
  color: #f0abfc;
}
.wb-sys--prime .wb-sys-contact__ico--svg {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  background: rgba(88, 28, 135, 0.28);
  border: 1px solid rgba(192, 132, 252, 0.28);
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-contact__form input,
.wb-sys--prime .wb-sys-contact__form textarea {
  border: 1px solid rgba(109, 40, 217, 0.42);
  background: rgba(6, 3, 14, 0.82);
  color: #faf5ff;
}
.wb-sys--prime.wb-sys-footer {
  background: #05010c;
  border-top-color: rgba(168, 85, 247, 0.22);
}
.wb-sys--prime .wb-sys-footer a {
  color: var(--wb-prm-glow);
}
.wb-sys--prime .wb-sys-footer__social-link {
  background: rgba(88, 28, 135, 0.28);
  border-color: rgba(167, 139, 250, 0.28);
  color: #fce7f3;
}

/* SPORTY reference (SET 6): cyan #00A3AD, split hero, card sections, B&W gallery */
.wb-sys-brand--sportygym {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.06em;
  font-weight: 900;
  font-size: 0.78rem;
  text-decoration: none;
  text-transform: none;
}
.wb-sys-brand--sportygym .wb-sys-brand__spo {
  color: #0f172a;
  text-transform: uppercase;
}
.wb-sys-brand--sportygym .wb-sys-brand__gymnam {
  color: #64748b;
  font-weight: 700;
  margin-left: 0.12em;
}
.wb-sys-brand__mark--spo .wb-ds-ico--spo-nav {
  width: 1.15rem;
  height: 1.15rem;
  color: #00a3ad;
  filter: drop-shadow(0 2px 8px rgba(0, 163, 173, 0.22));
}

.wb-sys-spo-nav .wb-sys-nav__inner--bar {
  max-width: 76rem;
}

.wb-sys-h2--spo-kicker {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.wb-sys-spo-pricing__head .wb-sys-eyebrow,
.wb-sys-spo-features__head .wb-sys-eyebrow,
.wb-sys-spo-about__head .wb-sys-eyebrow,
.wb-sys-spo-contact__head .wb-sys-eyebrow {
  letter-spacing: 0.18em;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.62rem;
}

.wb-sys-h1--spo-display {
  margin: 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.08;
  font-size: clamp(1.65rem, 3.8vw, 2.65rem);
  color: #0f172a;
}

.wb-sys-spo-hero {
  padding: 0;
  min-height: min(74vh, 40rem);
  overflow: hidden;
}
.wb-sys-spo-hero__shell {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr);
  min-height: min(74vh, 40rem);
  align-items: stretch;
}
@media (max-width: 900px) {
  .wb-sys-spo-hero__shell {
    grid-template-columns: 1fr;
    min-height: unset;
  }
  .wb-sys-spo-hero__imgCol {
    min-height: 15rem;
    order: -1;
  }
}
.wb-sys-spo-hero__copyCol {
  padding: clamp(2.25rem, 5vw, 3.75rem) clamp(1rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 0;
  background: #fff;
}
.wb-sys-spo-hero__copyCol > * {
  position: relative;
  z-index: 1;
}
.wb-sys-spo-hero__imgCol {
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}
.wb-sys-spo-hero__imgCol img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center 30%;
  display: block;
}
.wb-sys-spo-hero__imgCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.65) 28%, transparent 55%),
    linear-gradient(180deg, rgba(248, 249, 250, 0.2) 0%, rgba(248, 249, 250, 0.85) 100%);
}

.wb-sys-stats--spo .wb-sys-stat-num {
  color: #00a3ad;
  font-weight: 900;
}
.wb-sys-stats--spo .wb-sys-stat-lbl {
  color: #0f172a;
  font-weight: 600;
}

.wb-sys-about__visual--spo {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
}
.wb-sys-about__visual--spo img {
  border-radius: inherit;
}

.wb-sys-carousel--spo {
  padding-bottom: 2.25rem;
}
.wb-sys-carousel--spo .wb-sys-carousel__slide img {
  border-radius: 12px;
  border: 1px solid rgba(203, 213, 225, 0.55);
  filter: grayscale(1) contrast(1.05) brightness(0.95);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.wb-sys-carousel--spo .wb-sys-carousel__btn {
  background: #00a3ad;
  border-color: rgba(0, 131, 139, 0.55);
  color: #fff;
  box-shadow: 0 8px 22px rgba(0, 163, 173, 0.32);
}
.wb-sys-carousel--spo .wb-sys-carousel__btn:hover {
  background: #00838b;
  border-color: #006d74;
}
.wb-sys-carousel--spo .wb-sys-carousel__dot {
  border-color: rgba(0, 163, 173, 0.35);
  background: #fff;
}
.wb-sys-carousel--spo .wb-sys-carousel__dot--active {
  background: #00a3ad;
  border-color: #33b8c0;
  box-shadow: 0 0 0 3px rgba(0, 163, 173, 0.2);
}

.wb-sys-map--spo-light {
  position: relative;
  background: #f1f5f9;
  border: 1px solid rgba(203, 213, 225, 0.55);
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  overflow: hidden;
}
.wb-sys-map--spo-light iframe {
  position: relative;
  z-index: 1;
  filter: saturate(0.5) contrast(0.96) brightness(1.08);
  min-height: 260px;
  opacity: 0.92;
}
.wb-sys-map--spo-light::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.35rem;
  height: 2.35rem;
  margin: -1.175rem 0 0 -1.175rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, #00a3ad, #00838b);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.95), 0 10px 28px rgba(0, 163, 173, 0.4);
  pointer-events: none;
}

.wb-sys-footer__logo--sportygym {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  letter-spacing: 0.06em;
  font-weight: 900;
  font-size: 0.76rem;
}
.wb-sys-footer__logo--sportygym .wb-sys-brand__spo {
  color: #0f172a;
  text-transform: uppercase;
}
.wb-sys-footer__logo--sportygym .wb-sys-brand__gymnam {
  color: #64748b;
  font-weight: 700;
}
.wb-sys-footer__logo-mark--spo .wb-ds-ico--spo-nav {
  width: 1.05rem;
  height: 1.05rem;
  color: #00a3ad;
}

/* ========== SPORTY — SET 6 light + cyan #00A3AD ========== */
.wb-sys--sporty {
  font-family: Inter, system-ui, sans-serif;
  --wb-spo-teal: #00a3ad;
  --wb-spo-teal-deep: #00838b;
  --wb-spo-surface: #f8f9fa;
}
.wb-sys--sporty.wb-sys-nav {
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.05);
}
.wb-sys--sporty .wb-sys-brand:not(.wb-sys-brand--sportygym) {
  color: #0f172a;
}
.wb-sys--sporty .wb-sys-nav__links a {
  color: #475569;
}
.wb-sys--sporty .wb-sys-nav__links a:hover {
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-btn {
  background: linear-gradient(135deg, var(--wb-spo-teal-deep), var(--wb-spo-teal) 52%, #33b8c0);
  color: #fff;
  border-color: rgba(0, 163, 173, 0.35);
  box-shadow: 0 8px 26px rgba(0, 163, 173, 0.28);
}
.wb-sys--sporty .wb-sys-btn:hover {
  filter: brightness(1.04);
}
.wb-sys--sporty.wb-sys-hero {
  background: var(--wb-spo-surface);
  color: #0f172a;
}
.wb-sys--sporty.wb-sys-spo-hero {
  background: var(--wb-spo-surface);
  padding: 0;
}
.wb-sys--sporty .wb-sys-spo-hero .wb-sys-btn--ghost {
  color: var(--wb-spo-teal-deep);
  border: 2px solid rgba(0, 163, 173, 0.45);
  background: #fff;
}
.wb-sys--sporty .wb-sys-spo-hero .wb-sys-btn--ghost:hover {
  border-color: var(--wb-spo-teal);
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-hero__figure {
  box-shadow: 0 22px 50px rgba(0, 163, 173, 0.12);
  border: 1px solid rgba(203, 213, 225, 0.75);
}
.wb-sys--sporty .wb-sys-eyebrow {
  color: var(--wb-spo-teal);
  font-weight: 800;
}
.wb-sys--sporty .wb-sys-lead {
  color: #64748b;
}
.wb-sys--sporty .wb-sys-btn--ghost {
  color: var(--wb-spo-teal-deep);
  border-color: rgba(0, 163, 173, 0.4);
}
.wb-sys--sporty.wb-sys-section {
  background: #fff;
  color: #0f172a;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 10px 34px rgba(15, 23, 42, 0.06);
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.9rem;
}
@media (max-width: 780px) {
  .wb-sys--sporty.wb-sys-section {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    border-radius: 12px;
  }
}
.wb-sys--sporty .wb-sys-sub {
  color: #64748b;
}
.wb-sys--sporty .wb-sys-feature {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}
.wb-sys--sporty .wb-sys-feature:hover {
  box-shadow: 0 14px 36px rgba(0, 163, 173, 0.1);
  border-color: rgba(0, 163, 173, 0.22);
}
.wb-sys--sporty.wb-sys-section--features .wb-sys-feature__icon {
  background: #e6f7f8;
  color: var(--wb-spo-teal);
  border: 1px solid rgba(0, 163, 173, 0.22);
  box-shadow: none;
}
.wb-sys--sporty.wb-sys-section--features .wb-sys-feature__title {
  font-weight: 800;
  color: #0f172a;
}
.wb-sys--sporty .wb-sys-feature__desc {
  color: #64748b;
}
.wb-sys--sporty .wb-sys-stat-block {
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.95);
}
.wb-sys--sporty .wb-sys-stats:not(.wb-sys-stats--spo) .wb-sys-stat-num {
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-stats:not(.wb-sys-stats--spo) .wb-sys-stat-lbl {
  color: #475569;
}
.wb-sys--sporty .wb-sys-about__visual:not(.wb-sys-about__visual--spo) {
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
}
.wb-sys--sporty .wb-sys-price__tier {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: #0f172a;
  border-radius: 14px;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.05);
}
.wb-sys--sporty .wb-sys-price__tier--hit {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-top: 4px solid var(--wb-spo-teal);
  box-shadow: 0 18px 48px rgba(0, 163, 173, 0.12);
  transform: scale(1.02);
}
@media (max-width: 900px) {
  .wb-sys--sporty .wb-sys-price__tier--hit {
    transform: none;
  }
}
.wb-sys--sporty .wb-sys-price__amt {
  color: #0f172a;
  font-weight: 800;
}
.wb-sys--sporty .wb-sys-price__tier .wb-sys-eyebrow {
  color: var(--wb-spo-teal);
  font-weight: 800;
}
.wb-sys--sporty .wb-sys-price__per {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}
.wb-sys--sporty .wb-sys-check {
  border-color: rgba(0, 163, 173, 0.4);
  background: rgba(0, 163, 173, 0.08);
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-carousel:not(.wb-sys-carousel--spo) .wb-sys-carousel__btn {
  background: #fff;
  border-color: rgba(0, 163, 173, 0.35);
  color: var(--wb-spo-teal-deep);
}
.wb-sys--sporty.wb-sys-contact .wb-sys-contact-split {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem 1.35rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05);
}
.wb-sys--sporty .wb-sys-contact__line a {
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-contact__ico--svg {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  background: rgba(0, 163, 173, 0.1);
  border: 1px solid rgba(0, 163, 173, 0.28);
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-contact__form input,
.wb-sys--sporty .wb-sys-contact__form textarea {
  border: 1px solid rgba(203, 213, 225, 0.95);
  background: #fff;
  color: #0f172a;
  border-radius: 10px;
}
.wb-sys--sporty.wb-sys-footer {
  background: #fff;
  border-top-color: rgba(226, 232, 240, 0.95);
}
.wb-sys--sporty .wb-sys-footer a {
  color: var(--wb-spo-teal);
}
.wb-sys--sporty .wb-sys-footer a:hover {
  color: var(--wb-spo-teal-deep);
}
.wb-sys--sporty .wb-sys-footer__social-link {
  background: rgba(0, 163, 173, 0.1);
  color: var(--wb-spo-teal);
  border: 1px solid rgba(0, 163, 173, 0.25);
}
.wb-sys-footer--spo {
  background: #f8f9fa !important;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
}
.wb-sys-footer--spo .wb-sys-footer__title {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.62rem;
}
.wb-sys-footer--spo .wb-sys-footer__copy {
  color: #64748b;
}
.wb-sys-footer--spo .wb-sys-footer__social-link {
  background: transparent;
  color: var(--wb-spo-teal);
  border: 1px solid rgba(0, 163, 173, 0.35);
}
.wb-sys-footer--spo .wb-sys-footer__social-link:hover {
  background: rgba(0, 163, 173, 0.08);
  color: var(--wb-spo-teal-deep);
}
.wb-sys-footer--spo .wb-sys-footer__list a {
  color: #475569;
}
.wb-sys-footer--spo .wb-sys-footer__list a:hover {
  color: var(--wb-spo-teal);
}

/* ========== CYBERFIT — cyberpunk neon (#050505 · #9c0084 · #ff00ff · #2b43b5 · #00f0ff) ========== */
.wb-sys--cyberfit {
  --wb-cyb-bg: #050505;
  --wb-cyb-surface: rgba(12, 10, 18, 0.72);
  --wb-cyb-magenta-deep: #9c0084;
  --wb-cyb-magenta-hot: #ff00ff;
  --wb-cyb-blue: #2b43b5;
  --wb-cyb-cyan: #00f0ff;
  --wb-cyb-violet: #6b21a8;
  --wb-cyb-text: #f1f5f9;
  --wb-cyb-muted: rgba(226, 232, 240, 0.72);
  font-family: Rajdhani, system-ui, sans-serif;
  color: var(--wb-cyb-text);
  background: var(--wb-cyb-bg);
}

.wb-ds-ico--cyb-nav {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--wb-cyb-cyan);
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.55));
}

.wb-sys--cyberfit.wb-sys-nav {
  background: rgba(5, 5, 8, 0.82);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  border-bottom: 1px solid rgba(0, 240, 255, 0.22);
  box-shadow: 0 0 28px rgba(255, 0, 255, 0.12);
}
.wb-sys--cyberfit .wb-sys-nav__links a {
  color: rgba(248, 250, 252, 0.82);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.68rem;
}
.wb-sys--cyberfit .wb-sys-nav__links a:hover {
  color: #fff;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.55);
}

.wb-sys-brand--cyberfit {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  letter-spacing: 0.12em;
}
.wb-sys-brand__mark--cyb {
  display: inline-flex;
}
.wb-sys-brand__cyb {
  color: #fff;
  font-weight: 800;
}
.wb-sys-brand__fitneon {
  color: var(--wb-cyb-magenta-hot);
  font-weight: 800;
  text-shadow:
    0 0 12px rgba(255, 0, 255, 0.75),
    0 0 28px rgba(156, 0, 132, 0.45);
}

.wb-sys--cyberfit .wb-sys-btn,
.wb-sys--cyberfit button.wb-sys-btn:not(.wb-sys-btn--ghost),
.wb-sys--cyberfit a.wb-sys-btn:not(.wb-sys-btn--ghost) {
  background: linear-gradient(90deg, var(--wb-cyb-magenta-deep) 0%, var(--wb-cyb-magenta-hot) 55%, #c026d3 100%);
  color: #fff !important;
  -webkit-text-fill-color: #fff;
  border: 1px solid rgba(255, 0, 255, 0.45);
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
  box-shadow:
    0 0 18px rgba(255, 0, 255, 0.35),
    0 8px 28px rgba(156, 0, 132, 0.35);
}
.wb-sys--cyberfit .wb-sys-btn:hover,
.wb-sys--cyberfit button.wb-sys-btn:not(.wb-sys-btn--ghost):hover,
.wb-sys--cyberfit a.wb-sys-btn:not(.wb-sys-btn--ghost):hover {
  filter: brightness(1.08);
  box-shadow:
    0 0 22px rgba(255, 0, 255, 0.5),
    0 10px 32px rgba(156, 0, 132, 0.4);
}

/* Pricing CTAs: per-tier neon (default magenta above is for nav/hero/contact). */
.wb-sys-cyb-price__tier--cyan button.wb-sys-btn:not(.wb-sys-btn--ghost),
.wb-sys-cyb-price__tier--cyan a.wb-sys-btn:not(.wb-sys-btn--ghost) {
  background: linear-gradient(90deg, #155e75 0%, #0e7490 35%, var(--wb-cyb-cyan) 70%, #22d3ee 100%) !important;
  color: #f0fdfa !important;
  -webkit-text-fill-color: #f0fdfa;
  border-color: rgba(0, 240, 255, 0.55) !important;
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.45),
    0 8px 26px rgba(8, 145, 178, 0.35) !important;
}
.wb-sys-cyb-price__tier--cyan button.wb-sys-btn:not(.wb-sys-btn--ghost):hover,
.wb-sys-cyb-price__tier--cyan a.wb-sys-btn:not(.wb-sys-btn--ghost):hover {
  filter: brightness(1.06);
  box-shadow:
    0 0 26px rgba(0, 240, 255, 0.55),
    0 10px 30px rgba(8, 145, 178, 0.42) !important;
}

.wb-sys-cyb-price__tier--magenta button.wb-sys-btn:not(.wb-sys-btn--ghost),
.wb-sys-cyb-price__tier--magenta a.wb-sys-btn:not(.wb-sys-btn--ghost) {
  background: linear-gradient(90deg, var(--wb-cyb-magenta-deep) 0%, var(--wb-cyb-magenta-hot) 55%, #c026d3 100%) !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff;
  border-color: rgba(255, 0, 255, 0.5) !important;
  box-shadow:
    0 0 20px rgba(255, 0, 255, 0.42),
    0 8px 28px rgba(156, 0, 132, 0.38) !important;
}
.wb-sys-cyb-price__tier--magenta button.wb-sys-btn:not(.wb-sys-btn--ghost):hover,
.wb-sys-cyb-price__tier--magenta a.wb-sys-btn:not(.wb-sys-btn--ghost):hover {
  filter: brightness(1.08);
  box-shadow:
    0 0 26px rgba(255, 0, 255, 0.55),
    0 10px 32px rgba(156, 0, 132, 0.45) !important;
}

.wb-sys-cyb-price__tier--violet button.wb-sys-btn:not(.wb-sys-btn--ghost),
.wb-sys-cyb-price__tier--violet a.wb-sys-btn:not(.wb-sys-btn--ghost) {
  background: linear-gradient(90deg, #4c1d95 0%, var(--wb-cyb-violet) 48%, #a78bfa 100%) !important;
  color: #faf5ff !important;
  -webkit-text-fill-color: #faf5ff;
  border-color: rgba(167, 139, 250, 0.6) !important;
  box-shadow:
    0 0 22px rgba(107, 33, 168, 0.48),
    0 8px 28px rgba(76, 29, 149, 0.38) !important;
}
.wb-sys-cyb-price__tier--violet button.wb-sys-btn:not(.wb-sys-btn--ghost):hover,
.wb-sys-cyb-price__tier--violet a.wb-sys-btn:not(.wb-sys-btn--ghost):hover {
  filter: brightness(1.06);
  box-shadow:
    0 0 28px rgba(167, 139, 250, 0.5),
    0 10px 34px rgba(76, 29, 149, 0.42) !important;
}
.wb-sys--cyberfit .wb-sys-btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.12);
}
.wb-sys--cyberfit .wb-sys-btn--ghost:hover {
  border-color: var(--wb-cyb-cyan);
  color: var(--wb-cyb-cyan);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.25);
}

/* Slim premium accent (replaces internal “theme ID” bar in shipped templates) */
.wb-sys-cyb-hero__toprail {
  height: 3px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #9c0084, #ff00ff, #2b43b5, #00f0ff, #9c0084);
  background-size: 200% 100%;
  opacity: 0.95;
  box-shadow: 0 0 18px rgba(255, 0, 255, 0.35);
}

.wb-sys-cyb-hero {
  padding: 0;
  background: var(--wb-cyb-bg);
  position: relative;
  overflow: hidden;
}
.wb-sys-cyb-hero__stage {
  position: relative;
  min-height: min(78vh, 44rem);
}
.wb-sys-cyb-hero__media {
  position: absolute;
  inset: 0;
}
.wb-sys-cyb-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 24%;
  display: block;
  filter: contrast(1.14) saturate(1.28) brightness(0.88) hue-rotate(-8deg);
}
/* Hero media also uses .wb-sys-cyb-imgfx; imgfx sets height:auto which collapses absolute hero fill */
.wb-sys-cyb-hero__media.wb-sys-cyb-imgfx {
  border-radius: 0;
}
.wb-sys-cyb-hero__media.wb-sys-cyb-imgfx > img {
  width: 100%;
  height: 100%;
  min-height: 100%;
  max-height: none;
  object-fit: cover;
  object-position: center 30%;
}
.wb-sys-cyb-hero__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(5, 5, 10, 0.94) 0%, rgba(5, 5, 12, 0.55) 48%, rgba(5, 5, 14, 0.28) 100%),
    linear-gradient(185deg, rgba(156, 0, 132, 0.22) 0%, transparent 38%, rgba(0, 240, 255, 0.1) 100%);
}
.wb-sys-cyb-hero__content {
  position: relative;
  z-index: 2;
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(3.25rem, 9vw, 5.5rem) clamp(0.85rem, 3vw, 1.35rem);
  text-align: center;
}
.wb-sys-cyb-hero__content .wb-sys-actions {
  justify-content: center;
}
.wb-sys-cyb-hero__content .wb-sys-lead--cyb {
  margin-left: auto;
  margin-right: auto;
}
.wb-sys--cyberfit .wb-sys-cyb-hero .wb-sys-eyebrow {
  color: var(--wb-cyb-cyan);
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.45);
}
.wb-sys-h1--cyb {
  font-family: Orbitron, system-ui, sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.05;
  font-size: clamp(1.85rem, 4.5vw, 3.1rem);
  color: #fff;
  text-shadow:
    0 0 20px rgba(255, 0, 255, 0.35),
    0 0 40px rgba(43, 67, 181, 0.35);
  margin: 0 0 0.65rem;
}
.wb-sys-lead--cyb {
  color: var(--wb-cyb-muted);
  max-width: 36rem;
}

.wb-sys-cyb-imgfx {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}
.wb-sys-cyb-imgfx > img {
  display: block;
  width: 100%;
  height: auto;
  vertical-align: middle;
  filter: contrast(1.12) saturate(1.22) brightness(0.9) hue-rotate(-6deg);
}
.wb-sys-cyb-imgfx::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    125deg,
    rgba(156, 0, 132, 0.4) 0%,
    rgba(43, 67, 181, 0.28) 45%,
    rgba(0, 240, 255, 0.16) 100%
  );
  mix-blend-mode: soft-light;
}
.wb-sys-cyb-imgfx::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.45);
}

.wb-sys-cyb-about {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(0.85rem, 3vw, 1.35rem);
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 0, 255, 0.08), transparent 55%), var(--wb-cyb-bg);
}
.wb-sys-cyb-about__card {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(1.25rem, 3vw, 2.25rem);
  align-items: center;
  padding: clamp(1.35rem, 3vw, 2rem);
  border-radius: 18px;
  border: 1px solid rgba(255, 0, 255, 0.45);
  background: rgba(10, 8, 16, 0.55);
  box-shadow:
    0 0 0 1px rgba(0, 240, 255, 0.12) inset,
    0 0 28px rgba(255, 0, 255, 0.22),
    0 24px 60px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
@media (max-width: 900px) {
  .wb-sys-cyb-about__card {
    grid-template-columns: 1fr;
  }
}
.wb-sys-h2--cyb {
  font-family: Orbitron, system-ui, sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 0 18px rgba(255, 0, 255, 0.35);
}
.wb-sys-sub--cyb {
  color: var(--wb-cyb-muted);
}
.wb-sys-stats--cyb .wb-sys-stat-num {
  color: #fff;
  font-weight: 900;
  font-family: Orbitron, sans-serif;
}
.wb-sys-stats--cyb .wb-sys-stat-lbl {
  color: var(--wb-cyb-cyan);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.62rem;
}

.wb-sys-cyb-features__head .wb-sys-eyebrow,
.wb-sys-cyb-pricing__head .wb-sys-eyebrow,
.wb-sys-cyb-contact__head .wb-sys-eyebrow {
  color: var(--wb-cyb-magenta-hot);
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.45);
}
.wb-sys--cyberfit.wb-sys-section .wb-sys-section__head .wb-sys-eyebrow {
  color: var(--wb-cyb-magenta-hot);
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.45);
}
.wb-sys-section--features.wb-sys--cyberfit {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(0.85rem, 3vw, 1.35rem);
  background: var(--wb-cyb-bg);
}

.wb-sys-cyb-feature-grid {
  max-width: 72rem;
  margin: 1.75rem auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.85rem, 2vw, 1.35rem);
}
@media (max-width: 900px) {
  .wb-sys-cyb-feature-grid {
    grid-template-columns: 1fr;
  }
}
.wb-sys-cyb-feature {
  padding: 1.35rem 1.15rem;
  border-radius: 16px;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.08);
  text-align: center;
}
.wb-sys-cyb-feature__icon {
  width: 3.25rem;
  height: 3.25rem;
  margin: 0 auto 0.75rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 0, 255, 0.35);
  background: radial-gradient(circle at 30% 20%, rgba(255, 0, 255, 0.2), rgba(43, 67, 181, 0.15));
  box-shadow: 0 0 18px rgba(255, 0, 255, 0.25);
  color: var(--wb-cyb-cyan);
}
.wb-sys-cyb-feature__icon .wb-ds-ico--feature {
  width: 1.45rem;
  height: 1.45rem;
}
.wb-sys-cyb-feature__title {
  margin: 0 0 0.45rem;
  font-family: Orbitron, sans-serif;
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
}
.wb-sys-cyb-feature__desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--wb-cyb-muted);
}

.wb-sys--cyberfit.wb-sys-section#pricing {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(0.85rem, 3vw, 1.35rem);
  background: linear-gradient(180deg, rgba(43, 67, 181, 0.08), transparent 35%), var(--wb-cyb-bg);
}
.wb-sys-cyb-price {
  max-width: 72rem;
  margin: 1.75rem auto 0;
}
.wb-sys-cyb-price .wb-sys-price__tier {
  background: rgba(8, 6, 14, 0.65);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.wb-sys-cyb-price__tier--cyan {
  border: 1px solid rgba(0, 240, 255, 0.55) !important;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.18);
}
.wb-sys-cyb-price__tier--magenta {
  border: 1px solid rgba(255, 0, 255, 0.65) !important;
  box-shadow:
    0 0 26px rgba(255, 0, 255, 0.28),
    0 0 0 1px rgba(156, 0, 132, 0.35) inset;
}
.wb-sys-cyb-price__tier--violet {
  border: 1px solid rgba(107, 33, 168, 0.85) !important;
  box-shadow: 0 0 18px rgba(43, 67, 181, 0.35);
}
.wb-sys-price__badge--cyb {
  background: linear-gradient(90deg, var(--wb-cyb-magenta-deep), var(--wb-cyb-magenta-hot));
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 14px rgba(255, 0, 255, 0.45);
}
.wb-sys-cyb-price__amt--cyan {
  color: var(--wb-cyb-cyan) !important;
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.45);
}
.wb-sys-cyb-price__amt--magenta {
  color: var(--wb-cyb-magenta-hot) !important;
  text-shadow: 0 0 16px rgba(255, 0, 255, 0.5);
}
.wb-sys-cyb-price__amt--violet {
  color: #c084fc !important;
  text-shadow: 0 0 14px rgba(107, 33, 168, 0.55);
}
.wb-sys--cyberfit .wb-sys-price__list {
  color: rgba(241, 245, 249, 0.88);
}
.wb-sys--cyberfit .wb-sys-cyb-price .wb-sys-card__title {
  color: #f8fafc;
}
.wb-sys--cyberfit .wb-sys-cyb-price .wb-sys-eyebrow {
  color: rgba(248, 250, 252, 0.88);
}
.wb-sys--cyberfit .wb-sys-check {
  border-color: var(--wb-cyb-cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.25);
}

.wb-sys--cyberfit.wb-sys-section#gallery {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(0.85rem, 3vw, 1.35rem);
  background: var(--wb-cyb-bg);
}
.wb-sys-cyb-gallery {
  max-width: 72rem;
  margin: 1.75rem auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
}
@media (max-width: 720px) {
  .wb-sys-cyb-gallery {
    grid-template-columns: 1fr;
  }
}
.wb-sys-cyb-gallery__cell {
  margin: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 0, 255, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}
.wb-sys-cyb-gallery__cell img {
  width: 100%;
  height: 100%;
  min-height: 11rem;
  object-fit: cover;
  display: block;
}

.wb-sys-map--cyb-neon {
  position: relative;
  max-width: 72rem;
  margin: 1.75rem auto 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.35);
  background: rgba(5, 5, 10, 0.85);
  box-shadow:
    0 0 24px rgba(255, 0, 255, 0.2),
    0 0 0 1px rgba(156, 0, 132, 0.25) inset;
}
.wb-sys-map--cyb-neon iframe {
  display: block;
  width: 100%;
  min-height: 280px;
  border: 0;
  filter: saturate(0.55) contrast(1.08) brightness(0.72) hue-rotate(12deg);
  opacity: 0.92;
}
.wb-sys-map--cyb-neon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.5rem;
  height: 2.5rem;
  margin: -1.25rem 0 0 -1.25rem;
  z-index: 2;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(145deg, var(--wb-cyb-magenta-hot), var(--wb-cyb-magenta-deep));
  box-shadow:
    0 0 0 3px rgba(5, 5, 8, 0.9),
    0 0 22px rgba(255, 0, 255, 0.75),
    0 0 48px rgba(255, 0, 255, 0.35);
  pointer-events: none;
}

.wb-sys--cyberfit.wb-sys-section#contact {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(0.85rem, 3vw, 1.35rem);
  background: radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0, 240, 255, 0.08), transparent 55%), var(--wb-cyb-bg);
}
.wb-sys-cyb-contact-split {
  max-width: 72rem;
  margin: 1.75rem auto 0;
}
.wb-sys--cyberfit .wb-sys-cyb-contact-split {
  background: rgba(10, 8, 16, 0.55);
  border-radius: 18px;
  border: 1px solid rgba(0, 240, 255, 0.22);
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.1);
  padding: clamp(1.35rem, 3.2vw, 2.15rem);
  gap: clamp(1.5rem, 4vw, 2.75rem);
}
.wb-sys--cyberfit .wb-sys-contact__line a {
  color: var(--wb-cyb-cyan);
}
.wb-sys--cyberfit .wb-sys-contact__ico--svg {
  border-radius: 999px;
  border: 1px solid rgba(255, 0, 255, 0.35);
  background: rgba(255, 0, 255, 0.1);
  color: var(--wb-cyb-magenta-hot);
  box-shadow: 0 0 12px rgba(255, 0, 255, 0.25);
}
.wb-sys-cyb-contact__form input,
.wb-sys-cyb-contact__form textarea {
  background: rgba(5, 5, 10, 0.65) !important;
  color: #f8fafc !important;
  border: 1px solid rgba(0, 240, 255, 0.45) !important;
  border-radius: 10px !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.12);
}
.wb-sys-cyb-contact__form input::placeholder,
.wb-sys-cyb-contact__form textarea::placeholder {
  color: rgba(226, 232, 240, 0.45);
}
.wb-sys-cyb-contact__form input:focus,
.wb-sys-cyb-contact__form textarea:focus {
  outline: none;
  border-color: var(--wb-cyb-magenta-hot) !important;
  box-shadow: 0 0 16px rgba(255, 0, 255, 0.25);
}

.wb-sys-footer__logo--cyberfit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.wb-sys-footer__logo-mark--cyb .wb-ds-ico--cyb-nav {
  width: 1.1rem;
  height: 1.1rem;
}
.wb-sys-footer__cyb-gradient {
  font-family: Orbitron, sans-serif;
  font-weight: 900;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--wb-cyb-cyan), var(--wb-cyb-magenta-hot));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.35));
}
.wb-sys-footer__tag--cyb {
  color: var(--wb-cyb-muted);
}
.wb-sys-footer__social-link--cyb {
  border-radius: 999px;
  border: 1px solid rgba(0, 240, 255, 0.35) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--wb-cyb-cyan) !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
}
.wb-sys-footer__social-link--cyb:hover {
  color: var(--wb-cyb-magenta-hot) !important;
  border-color: rgba(255, 0, 255, 0.55) !important;
  box-shadow: 0 0 16px rgba(255, 0, 255, 0.35);
}

.wb-sys-footer--cyb {
  background: #030306 !important;
  border-top: 1px solid rgba(255, 0, 255, 0.25) !important;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.5);
}
.wb-sys-footer--cyb .wb-sys-footer__title {
  color: rgba(248, 250, 252, 0.85);
  font-family: Orbitron, sans-serif;
  letter-spacing: 0.12em;
}
.wb-sys-footer--cyb .wb-sys-footer__list a {
  color: rgba(226, 232, 240, 0.78);
}
.wb-sys-footer--cyb .wb-sys-footer__list a:hover {
  color: var(--wb-cyb-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
}
.wb-sys-footer--cyb .wb-sys-footer__copy {
  color: rgba(148, 163, 184, 0.85);
}

/* ========== GLASSMORPH — white/blue frosted panels ========== */
.wb-sys--glassmorph {
  --wb-gls-bg: #f2f6ff;
  --wb-gls-bg-2: #e7efff;
  --wb-gls-text: #1f2a44;
  --wb-gls-muted: #5c6f96;
  --wb-gls-blue: #5a82ff;
  --wb-gls-blue-2: #79bcff;
  --wb-gls-line: rgba(113, 149, 255, 0.28);
  --wb-gls-card: rgba(255, 255, 255, 0.62);
  font-family: Inter, 'Segoe UI', system-ui, sans-serif;
  color: var(--wb-gls-text);
}

.wb-sys--glassmorph.wb-sys-nav {
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(113, 149, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 26px rgba(66, 110, 207, 0.1);
}
.wb-sys-brand--glassmorph .wb-sys-brand__gls {
  color: #273b73;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.69rem;
}
.wb-sys--glassmorph .wb-sys-nav__links a {
  color: #4e6393;
}
.wb-sys--glassmorph .wb-sys-nav__links a:hover {
  color: var(--wb-gls-blue);
}

.wb-sys-gls-themebar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.55rem 1.1rem;
  padding: 0.45rem clamp(0.85rem, 3vw, 1.35rem);
  background: linear-gradient(90deg, rgba(122, 168, 255, 0.12), rgba(90, 130, 255, 0.08), rgba(125, 200, 255, 0.12));
  border-bottom: 1px solid rgba(113, 149, 255, 0.2);
}
.wb-sys-gls-themebar__id {
  color: #4265d4;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  font-size: 0.68rem;
}
.wb-sys-gls-themebar__meta {
  color: #5a6f99;
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.wb-sys-gls-themebar__swatches {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.wb-sys-gls-themebar__swatches i {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  background: var(--gls-swatch, #dfe9ff);
  border: 1px solid rgba(122, 151, 226, 0.55);
  box-shadow: 0 2px 8px rgba(122, 151, 226, 0.35);
}

.wb-sys-gls-hero {
  padding: 0;
  background: linear-gradient(180deg, var(--wb-gls-bg) 0%, var(--wb-gls-bg-2) 100%);
}
.wb-sys-gls-hero__shell {
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(0.85rem, 3vw, 1.35rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
}
@media (max-width: 900px) {
  .wb-sys-gls-hero__shell {
    grid-template-columns: 1fr;
  }
}
.wb-sys-h1--gls-display {
  margin: 0 0 0.65rem;
  font-size: clamp(1.8rem, 4.5vw, 2.7rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1b2f5d;
}
.wb-sys--glassmorph .wb-sys-eyebrow {
  color: #5f86ff;
}
.wb-sys-lead--gls {
  color: var(--wb-gls-muted);
}

.wb-sys-gls-imgfx {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(138, 167, 240, 0.45);
  box-shadow:
    0 12px 35px rgba(98, 132, 222, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.35) inset;
}
.wb-sys-gls-imgfx > img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02) brightness(1.04);
}
.wb-sys-gls-imgfx::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.34), rgba(122, 178, 255, 0.08) 45%, rgba(90, 130, 255, 0.14));
}

.wb-sys-gls-about {
  background: linear-gradient(180deg, var(--wb-gls-bg-2) 0%, #f4f8ff 100%);
}
.wb-sys-gls-about__card {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  padding: clamp(1.1rem, 3vw, 1.75rem);
  border-radius: 20px;
  background: var(--wb-gls-card);
  border: 1px solid rgba(113, 149, 255, 0.26);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 16px 36px rgba(92, 121, 196, 0.15);
}
@media (max-width: 900px) {
  .wb-sys-gls-about__card {
    grid-template-columns: 1fr;
  }
}
.wb-sys-h2--gls-kicker {
  color: #244284;
}
.wb-sys-sub--gls {
  color: var(--wb-gls-muted);
}
.wb-sys-stats--gls .wb-sys-stat-block {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(121, 156, 241, 0.34);
}
.wb-sys-stats--gls .wb-sys-stat-num {
  color: #4c74ee;
}
.wb-sys-stats--gls .wb-sys-stat-lbl {
  color: #566a93;
}

.wb-sys-section--features.wb-sys--glassmorph,
.wb-sys--glassmorph.wb-sys-section#pricing,
.wb-sys--glassmorph.wb-sys-section#gallery,
.wb-sys--glassmorph.wb-sys-section#contact {
  background: linear-gradient(180deg, #f5f9ff 0%, #edf3ff 100%);
}
.wb-sys-grid4--gls .wb-sys-feature--gls {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(113, 149, 255, 0.3);
  box-shadow: 0 10px 28px rgba(96, 125, 196, 0.13);
}
.wb-sys-grid4--gls .wb-sys-feature__icon {
  border: 1px solid rgba(113, 149, 255, 0.38);
  background: linear-gradient(145deg, rgba(90, 130, 255, 0.16), rgba(125, 200, 255, 0.18));
  color: #4569dc;
}
.wb-sys-grid4--gls .wb-sys-feature__title {
  color: #25478f;
}
.wb-sys-grid4--gls .wb-sys-feature__desc {
  color: #5d7097;
}

.wb-sys--glassmorph .wb-sys-btn {
  background: linear-gradient(135deg, #6f8cff 0%, #79bcff 100%);
  border: 1px solid rgba(89, 130, 246, 0.48);
  color: #fff;
  box-shadow: 0 10px 24px rgba(92, 132, 235, 0.35);
}
.wb-sys--glassmorph .wb-sys-btn:hover {
  filter: brightness(1.05);
}
.wb-sys--glassmorph .wb-sys-btn--ghost {
  background: rgba(255, 255, 255, 0.62);
  color: #4567d5;
  border: 1px solid rgba(113, 149, 255, 0.38);
  box-shadow: none;
}

.wb-sys-gls-price .wb-sys-price__tier--gls {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(113, 149, 255, 0.3);
  box-shadow: 0 10px 28px rgba(96, 125, 196, 0.13);
}
.wb-sys-price__tier--gls-hit {
  border-color: rgba(90, 130, 255, 0.55) !important;
  box-shadow: 0 14px 34px rgba(90, 130, 255, 0.25);
}
.wb-sys-price__badge--gls {
  background: linear-gradient(135deg, #6f8cff, #79bcff);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
}

.wb-sys-gls-gallery {
  max-width: 72rem;
  margin: 1.75rem auto 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}
@media (max-width: 840px) {
  .wb-sys-gls-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .wb-sys-gls-gallery {
    grid-template-columns: 1fr;
  }
}
.wb-sys-gls-gallery__cell {
  margin: 0;
  border-radius: 12px;
}
.wb-sys-gls-gallery__cell img {
  width: 100%;
  height: 100%;
  min-height: 10rem;
  object-fit: cover;
}

.wb-sys-map--gls-light {
  max-width: 72rem;
  margin: 1.75rem auto 0;
  border: 1px solid rgba(113, 149, 255, 0.28);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(96, 125, 196, 0.14);
}
.wb-sys-map--gls-light iframe {
  min-height: 260px;
  filter: saturate(0.85) contrast(0.98) brightness(1.03);
}

.wb-sys-gls-contact-split {
  max-width: 72rem;
  margin: 1.75rem auto 0;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(113, 149, 255, 0.28);
  border-radius: 18px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 14px 34px rgba(96, 125, 196, 0.14);
  padding: clamp(1.35rem, 3.2vw, 2.15rem);
  gap: clamp(1.5rem, 4vw, 2.75rem);
}
.wb-sys--glassmorph .wb-sys-contact__ico--svg {
  border-radius: 999px;
  border: 1px solid rgba(113, 149, 255, 0.34);
  background: rgba(122, 173, 255, 0.17);
  color: #486ce1;
}
.wb-sys-gls-contact__form input,
.wb-sys-gls-contact__form textarea {
  background: rgba(255, 255, 255, 0.86) !important;
  border: 1px solid rgba(113, 149, 255, 0.3) !important;
  color: #284377 !important;
}
.wb-sys-gls-contact__form input:focus,
.wb-sys-gls-contact__form textarea:focus {
  border-color: rgba(90, 130, 255, 0.75) !important;
  box-shadow: 0 0 0 3px rgba(113, 149, 255, 0.2);
}

.wb-sys-footer--gls {
  background: rgba(246, 250, 255, 0.95) !important;
  border-top: 1px solid rgba(113, 149, 255, 0.25);
}
.wb-sys-footer__logo--glassmorph .wb-sys-footer__gls-wordmark {
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #3a5cc2;
}
.wb-sys-footer__tag--gls {
  color: #5d7097;
}
.wb-sys-footer__social-link--gls {
  border: 1px solid rgba(113, 149, 255, 0.35) !important;
  background: rgba(122, 173, 255, 0.16) !important;
  color: #486ce1 !important;
}
.wb-sys-footer__social-link--gls:hover {
  background: rgba(90, 130, 255, 0.2) !important;
  color: #2d4fb4 !important;
}
.wb-sys-footer--gls .wb-sys-footer__list a {
  color: #5d7097;
}
.wb-sys-footer--gls .wb-sys-footer__list a:hover {
  color: #486ce1;
}
.wb-sys-footer--gls .wb-sys-footer__copy {
  color: #6f81a8;
}
`;
