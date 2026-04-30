/**
 * Ready-made sections for local gyms — inserted from Tools → Gym blocks.
 * Uses microdata where helpful; styles are self-contained for the canvas.
 */

export const BUSINESS_SNIPPET_IDS = ['location', 'lead', 'schedule', 'contactStrip'] as const;
export type BusinessSnippetId = (typeof BUSINESS_SNIPPET_IDS)[number];

export const BUSINESS_SNIPPET_LABELS: Record<BusinessSnippetId, { title: string; hint: string }> = {
  location: {
    title: 'Visit us (map + hours)',
    hint: 'Address, hours, map embed placeholder, directions link',
  },
  lead: {
    title: 'Get a call back',
    hint: 'Opens your enquiry flow (same as other “Join” buttons on the site)',
  },
  schedule: {
    title: 'Class timetable',
    hint: 'Edit the table — replace with your real times',
  },
  contactStrip: {
    title: 'Call · WhatsApp · Email',
    hint: 'One row of tap-to-call and message links',
  },
};

export const BUSINESS_SNIPPETS_HTML: Record<BusinessSnippetId, string> = {
  location: `
<section class="wb-biz wb-biz-location" data-wb-section-type="Contact" style="padding:56px 20px;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start;">
    <div style="flex:1 1 280px;min-width:240px;">
    <div itemscope itemtype="https://schema.org/LocalBusiness">
      <h2 itemprop="name" style="margin:0 0 12px;font-size:1.35rem;font-weight:800;color:#fff;">Your gym name</h2>
      <p style="margin:0 0 8px;font-size:0.95rem;line-height:1.5;opacity:0.95;">
        <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
          <span itemprop="streetAddress">123 Main Street</span>,
          <span itemprop="addressLocality">Your town</span>
        </span>
      </p>
      <p style="margin:0 0 6px;font-size:0.9rem;"><strong>Hours</strong></p>
      <ul style="margin:0;padding-left:1.1rem;font-size:0.88rem;line-height:1.55;opacity:0.92;">
        <li>Mon–Fri 6:00 – 21:00</li>
        <li>Sat–Sun 8:00 – 18:00</li>
      </ul>
    </div>
    </div>
    <div style="flex:1 1 280px;min-width:240px;">
      <p style="margin:0 0 8px;font-size:0.85rem;opacity:0.85;">Map — paste your Google Maps embed URL in Basics on the frame below.</p>
      <iframe title="Gym location map" src="about:blank" loading="lazy" style="width:100%;min-height:220px;border:1px solid #334155;border-radius:10px;background:#1e293b;display:block;"></iframe>
      <p style="margin:12px 0 0;">
        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;font-weight:600;font-size:0.9rem;">Get directions →</a>
      </p>
    </div>
  </div>
</section>`.trim(),

  lead: `
<section class="wb-biz wb-biz-lead" data-wb-section-type="Custom" style="padding:56px 20px;background:linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%);font-family:system-ui,sans-serif;">
  <div style="max-width:520px;margin:0 auto;text-align:center;position:relative;">
    <h2 style="margin:0 0 10px;font-size:1.4rem;font-weight:800;color:#0f172a;">We’ll call you back</h2>
    <p style="margin:0 0 20px;font-size:0.95rem;color:#475569;line-height:1.5;">Leave your details in our secure form — no spam, just a quick chat about membership.</p>
    <button type="button" class="wb-sys-btn" data-wb-open="enquiry" style="padding:12px 28px;border-radius:999px;border:0;background:#2563eb;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">Request a call</button>
    <p style="margin:16px 0 0;font-size:0.75rem;color:#64748b;">Bots are ignored — use the real button above.</p>
    <div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
      <label>Leave blank<input type="text" name="company_website" tabindex="-1" autocomplete="off" /></label>
    </div>
  </div>
</section>`.trim(),

  schedule: `
<section class="wb-biz wb-biz-schedule" data-wb-section-type="Services" style="padding:56px 20px;background:#fff;font-family:system-ui,sans-serif;color:#0f172a;">
  <div style="max-width:800px;margin:0 auto;">
    <h2 style="margin:0 0 8px;font-size:1.35rem;font-weight:800;text-align:center;">Class timetable</h2>
    <p style="margin:0 0 20px;text-align:center;font-size:0.88rem;color:#64748b;">Edit the cells below. If your app offers live schedules later, you can replace this block.</p>
    <div style="overflow:auto;border:1px solid #e2e8f0;border-radius:10px;">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead><tr style="background:#f1f5f9;"><th style="padding:10px;text-align:left;">Time</th><th style="padding:10px;text-align:left;">Class</th><th style="padding:10px;text-align:left;">Coach</th></tr></thead>
        <tbody>
          <tr><td style="padding:10px;border-top:1px solid #e2e8f0;">06:30</td><td style="padding:10px;border-top:1px solid #e2e8f0;">HIIT</td><td style="padding:10px;border-top:1px solid #e2e8f0;">Alex</td></tr>
          <tr><td style="padding:10px;border-top:1px solid #e2e8f0;">09:00</td><td style="padding:10px;border-top:1px solid #e2e8f0;">Yoga</td><td style="padding:10px;border-top:1px solid #e2e8f0;">Sam</td></tr>
          <tr><td style="padding:10px;border-top:1px solid #e2e8f0;">18:00</td><td style="padding:10px;border-top:1px solid #e2e8f0;">Strength</td><td style="padding:10px;border-top:1px solid #e2e8f0;">Jordan</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>`.trim(),

  contactStrip: `
<section class="wb-biz wb-biz-contact-strip" data-wb-section-type="Contact" style="padding:20px;font-family:system-ui,sans-serif;background:#1e293b;color:#e2e8f0;">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;gap:16px 28px;justify-content:center;align-items:center;font-size:0.95rem;">
    <a href="tel:+15551234567" style="color:#fff;font-weight:700;text-decoration:none;">📞 (555) 123-4567</a>
    <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" style="color:#4ade80;font-weight:700;text-decoration:none;">WhatsApp</a>
    <a href="mailto:hello@yourgym.com" style="color:#93c5fd;font-weight:600;text-decoration:none;">hello@yourgym.com</a>
  </div>
  <p style="margin:10px 0 0;text-align:center;font-size:0.75rem;opacity:0.75;">Tap to edit phone numbers and email in Basics.</p>
</section>`.trim(),
};
