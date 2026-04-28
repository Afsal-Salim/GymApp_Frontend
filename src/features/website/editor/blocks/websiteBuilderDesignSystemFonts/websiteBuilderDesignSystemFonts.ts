/**
 * Design-system Google Fonts. Use {@link WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF}
 * in HTML `<link rel="stylesheet" …>` for reliable loading in iframes; use
 * {@link WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT} as the **first** rules in a `<style>`
 * block (no other rules may precede `@import` in CSS).
 */
export const WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Oswald:wght@500;600;700&family=Orbitron:wght@500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Space+Grotesk:wght@400;500;600;700&display=swap';

export const WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT = `@import url('${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF}');
`;
