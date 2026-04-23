/**
 * Lightweight lead + enquiry modals for custom / visual-builder gym HTML.
 * Crystal gym pages set on <body>: data-wb-public-gym-slug, data-wb-api-base, data-wb-service-enquiry-path
 * (see CrystalBusinessPage). Triggers: [data-wb-open="join|visit|trial|enquiry"].
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var STYLE_ID = 'wb-native-lead-modal-styles';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readCfg() {
    var b = document.body;
    return {
      slug: (b.getAttribute('data-wb-public-gym-slug') || '').trim(),
      apiBase: (b.getAttribute('data-wb-api-base') || '').replace(/\/$/, ''),
      servicePath: (b.getAttribute('data-wb-service-enquiry-path') || '').trim(),
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.wb-nlm-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px;animation:wbNlmFade .22s ease-out}' +
      '@keyframes wbNlmFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes wbNlmPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}' +
      '.wb-nlm-dialog{max-width:440px;width:100%;max-height:92vh;overflow:auto;background:#fff;border-radius:16px;box-shadow:0 24px 64px rgba(15,23,42,.25);animation:wbNlmPop .28s cubic-bezier(.2,.8,.2,1);font-family:system-ui,-apple-system,sans-serif}' +
      '.wb-nlm-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e2e8f0}' +
      '.wb-nlm-title{margin:0;font-size:1.05rem;font-weight:700;color:#0f172a}' +
      '.wb-nlm-x{border:0;background:transparent;font-size:1.4rem;line-height:1;cursor:pointer;color:#64748b;padding:4px 8px;border-radius:8px}' +
      '.wb-nlm-x:hover{background:#f1f5f9;color:#0f172a}' +
      '.wb-nlm-body{padding:16px}' +
      '.wb-nlm-field{margin-bottom:12px}' +
      '.wb-nlm-field label{display:block;font-size:.72rem;font-weight:600;color:#475569;margin-bottom:4px}' +
      '.wb-nlm-field input,.wb-nlm-field select,.wb-nlm-field textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:.9rem}' +
      '.wb-nlm-field textarea{min-height:88px;resize:vertical}' +
      '.wb-nlm-err{color:#b91c1c;font-size:.78rem;margin:0 0 8px}' +
      '.wb-nlm-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}' +
      '.wb-nlm-btn{border:0;border-radius:10px;padding:10px 16px;font-weight:600;cursor:pointer;font-size:.88rem}' +
      '.wb-nlm-btn--ghost{background:#f1f5f9;color:#334155}' +
      '.wb-nlm-btn--primary{background:#2563eb;color:#fff}' +
      '.wb-nlm-done{text-align:center;padding:8px 0 4px}' +
      '.wb-nlm-done h3{margin:0 0 8px;font-size:1.1rem;color:#0f172a}' +
      '.wb-sys-contact__feedback{margin:0 0 10px;font-size:.82rem;line-height:1.4}' +
      '.wb-sys-contact__feedback--err{color:#b91c1c}' +
      '.wb-sys-contact__feedback--ok{color:#15803d}' +
      '.wb-sys-contact__feedback--muted{color:#64748b}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function closeOverlay(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  function openShell(title, innerHtml, onMount) {
    ensureStyles();
    var overlay = document.createElement('div');
    overlay.className = 'wb-nlm-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML =
      '<div class="wb-nlm-dialog" role="dialog" aria-modal="true">' +
      '<div class="wb-nlm-head"><h2 class="wb-nlm-title">' +
      esc(title) +
      '</h2><button type="button" class="wb-nlm-x" aria-label="Close">&times;</button></div>' +
      '<div class="wb-nlm-body">' +
      innerHtml +
      '</div></div>';
    function kill() {
      closeOverlay(overlay);
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) kill();
    });
    overlay.querySelector('.wb-nlm-x').addEventListener('click', kill);
    document.body.appendChild(overlay);
    if (typeof onMount === 'function') onMount(overlay, kill);
    return overlay;
  }

  function digits10(v) {
    var d = String(v || '').replace(/\D/g, '');
    return d.length >= 10 ? d.slice(-10) : d;
  }

  function postLead(slug, apiBase, body) {
    var url = apiBase + '/businesses/public/' + encodeURIComponent(slug) + '/crystal-leads/';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  }

  function postServiceEnquiry(apiBase, path, payload) {
    var p = path.charAt(0) === '/' ? path : '/' + path;
    var url = apiBase + p;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  function ensurePhoneFieldOnContactForm(form) {
    if (form.querySelector('input[name="phone"]')) return;
    var email = form.querySelector('input[type="email"], input[name="email"]');
    if (!email) return;
    var ph = document.createElement('input');
    ph.type = 'tel';
    ph.name = 'phone';
    ph.placeholder = 'Phone (10 digits)';
    ph.setAttribute('inputmode', 'numeric');
    ph.setAttribute('autocomplete', 'tel');
    email.insertAdjacentElement('afterend', ph);
  }

  function getOrCreateContactFormFeedback(form) {
    var el = form.querySelector('.wb-sys-contact__feedback');
    if (!el) {
      el = document.createElement('p');
      el.className = 'wb-sys-contact__feedback';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      form.insertBefore(el, form.firstChild);
    }
    return el;
  }

  function submitInlineContactForm(form) {
    ensureStyles();
    var c = readCfg();
    if (!c.apiBase || !c.servicePath) {
      window.alert('Service enquiry is not configured on this page.');
      return;
    }
    ensurePhoneFieldOnContactForm(form);
    var fb = getOrCreateContactFormFeedback(form);
    var nameEl = form.querySelector('[name="name"]');
    var emailEl = form.querySelector('[name="email"]');
    var phoneEl = form.querySelector('[name="phone"]');
    var msgEl = form.querySelector('[name="message"]');
    var name = nameEl ? nameEl.value.trim() : '';
    var email = emailEl ? emailEl.value.trim() : '';
    var phone = phoneEl ? digits10(phoneEl.value) : '';
    var message = msgEl ? msgEl.value.trim() : '';
    if (name.length < 2 || email.length < 5 || phone.length !== 10 || message.length < 3) {
      fb.className = 'wb-sys-contact__feedback wb-sys-contact__feedback--err';
      fb.textContent =
        'Please enter your name, a valid email, a 10-digit mobile number, and a short message (at least 3 characters).';
      return;
    }
    var btn =
      form.querySelector('button[type="submit"]') || form.querySelector('button.wb-sys-btn--block');
    if (form._wbEnquirySubmitting) return;
    form._wbEnquirySubmitting = true;
    fb.className = 'wb-sys-contact__feedback wb-sys-contact__feedback--muted';
    fb.textContent = 'Sending…';
    if (btn) {
      btn.disabled = true;
      if (!btn.getAttribute('data-wb-btn-label')) btn.setAttribute('data-wb-btn-label', btn.textContent);
      btn.textContent = 'Sending…';
    }
    postServiceEnquiry(c.apiBase, c.servicePath, { name: name, email: email, phone: phone, message: message })
      .then(function (r) {
        form._wbEnquirySubmitting = false;
        if (btn) {
          btn.disabled = false;
          var lab = btn.getAttribute('data-wb-btn-label');
          if (lab) btn.textContent = lab;
        }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        fb.className = 'wb-sys-contact__feedback wb-sys-contact__feedback--ok';
        fb.textContent = 'Thanks — your message was sent. We will get back to you shortly.';
        if (nameEl) nameEl.value = '';
        if (emailEl) emailEl.value = '';
        if (phoneEl) phoneEl.value = '';
        if (msgEl) msgEl.value = '';
      })
      .catch(function () {
        form._wbEnquirySubmitting = false;
        if (btn) {
          btn.disabled = false;
          var lab = btn.getAttribute('data-wb-btn-label');
          if (lab) btn.textContent = lab;
        }
        fb.className = 'wb-sys-contact__feedback wb-sys-contact__feedback--err';
        fb.textContent = 'Could not send right now. Please try again or use phone / email above.';
      });
  }

  function joinModal() {
    var c = readCfg();
    if (!c.slug || !c.apiBase) {
      window.alert('Live gym page is not configured for lead capture (missing slug or API base).');
      return;
    }
    var html =
      '<p class="wb-nlm-err" id="wb-nlm-err" style="display:none"></p>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-name">Name</label><input id="wb-nlm-name" autocomplete="name" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-phone">Mobile (10 digits)</label><input id="wb-nlm-phone" inputmode="numeric" autocomplete="tel" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-focus">Training focus</label><select id="wb-nlm-focus"><option value="">Choose…</option>' +
      '<option value="strength">Strength &amp; muscle</option><option value="weight_loss">Weight loss &amp; conditioning</option>' +
      '<option value="general">General fitness &amp; health</option><option value="classes">Classes / group training</option>' +
      '<option value="explore">Still exploring options</option></select></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-freq">How often you plan to train</label><select id="wb-nlm-freq"><option value="">Choose…</option>' +
      '<option value="1-2">Around 1–2 days a week</option><option value="3-4">Around 3–4 days a week</option>' +
      '<option value="5+">5 or more days a week</option><option value="unsure">Not sure yet</option></select></div>' +
      '<div class="wb-nlm-actions"><button type="button" class="wb-nlm-btn wb-nlm-btn--ghost" data-wb-nlm-cancel>Cancel</button>' +
      '<button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-submit>Send</button></div>';
    openShell('Join now', html, function (overlay, kill) {
      var err = overlay.querySelector('#wb-nlm-err');
      overlay.querySelector('[data-wb-nlm-cancel]').addEventListener('click', kill);
      overlay.querySelector('[data-wb-nlm-submit]').addEventListener('click', function () {
        var name = overlay.querySelector('#wb-nlm-name').value.trim();
        var phone = digits10(overlay.querySelector('#wb-nlm-phone').value);
        var focus = overlay.querySelector('#wb-nlm-focus').value;
        var frequency = overlay.querySelector('#wb-nlm-freq').value;
        if (name.length < 2 || phone.length !== 10 || !focus || !frequency) {
          err.style.display = 'block';
          err.textContent = 'Please fill all fields with a valid 10-digit mobile number.';
          return;
        }
        err.style.display = 'none';
        var body = {
          lead_type: 'join_now',
          business_slug: c.slug,
          submitted_at_ms: Date.now(),
          name: name,
          phone: phone,
          focus: focus,
          frequency: frequency,
        };
        postLead(c.slug, c.apiBase, body).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          overlay.querySelector('.wb-nlm-body').innerHTML =
            '<div class="wb-nlm-done"><h3>Thank you</h3><p style="margin:0;color:#475569;font-size:.9rem">We received your details. The gym will follow up soon.</p>' +
            '<div class="wb-nlm-actions" style="justify-content:center;margin-top:16px"><button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-close>Close</button></div></div>';
          overlay.querySelector('[data-wb-nlm-close]').addEventListener('click', kill);
        }).catch(function () {
          err.style.display = 'block';
          err.textContent = 'Could not send right now. Please try again or use WhatsApp / phone in the contact section.';
        });
      });
    });
  }

  function visitModal() {
    var c = readCfg();
    if (!c.slug || !c.apiBase) {
      window.alert('Live gym page is not configured for lead capture.');
      return;
    }
    var html =
      '<p class="wb-nlm-err" id="wb-nlm-err" style="display:none"></p>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-name">Name</label><input id="wb-nlm-name" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-phone">Mobile (10 digits)</label><input id="wb-nlm-phone" inputmode="numeric" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-when">Preferred day / time</label><input id="wb-nlm-when" placeholder="e.g. Saturday morning" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-notes">Notes (optional)</label><textarea id="wb-nlm-notes"></textarea></div>' +
      '<div class="wb-nlm-actions"><button type="button" class="wb-nlm-btn wb-nlm-btn--ghost" data-wb-nlm-cancel>Cancel</button>' +
      '<button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-submit>Request visit</button></div>';
    openShell('Plan a visit', html, function (overlay, kill) {
      var err = overlay.querySelector('#wb-nlm-err');
      overlay.querySelector('[data-wb-nlm-cancel]').addEventListener('click', kill);
      overlay.querySelector('[data-wb-nlm-submit]').addEventListener('click', function () {
        var name = overlay.querySelector('#wb-nlm-name').value.trim();
        var phone = digits10(overlay.querySelector('#wb-nlm-phone').value);
        var when = overlay.querySelector('#wb-nlm-when').value.trim();
        var notes = overlay.querySelector('#wb-nlm-notes').value.trim();
        if (name.length < 2 || phone.length !== 10 || when.length < 3) {
          err.style.display = 'block';
          err.textContent = 'Please add your name, a 10-digit mobile, and when you would like to visit.';
          return;
        }
        err.style.display = 'none';
        var body = {
          lead_type: 'plan_visit',
          business_slug: c.slug,
          submitted_at_ms: Date.now(),
          name: name,
          phone: phone,
          preferred_when: when,
          notes: notes,
        };
        postLead(c.slug, c.apiBase, body).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          overlay.querySelector('.wb-nlm-body').innerHTML =
            '<div class="wb-nlm-done"><h3>Visit request sent</h3><p style="margin:0;color:#475569;font-size:.9rem">The team will confirm your visit.</p>' +
            '<div class="wb-nlm-actions" style="justify-content:center;margin-top:16px"><button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-close>Close</button></div></div>';
          overlay.querySelector('[data-wb-nlm-close]').addEventListener('click', kill);
        }).catch(function () {
          err.style.display = 'block';
          err.textContent = 'Could not send. Try again later.';
        });
      });
    });
  }

  function trialModal() {
    var c = readCfg();
    if (!c.slug || !c.apiBase) {
      window.alert('Live gym page is not configured for lead capture.');
      return;
    }
    var html =
      '<p class="wb-nlm-err" id="wb-nlm-err" style="display:none"></p>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-name">Name</label><input id="wb-nlm-name" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-phone">Mobile (10 digits)</label><input id="wb-nlm-phone" inputmode="numeric" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-when">When can you come in?</label><input id="wb-nlm-when" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-interests">Interests (comma-separated)</label><input id="wb-nlm-interests" placeholder="strength, classes" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-notes">Notes</label><textarea id="wb-nlm-notes"></textarea></div>' +
      '<div class="wb-nlm-actions"><button type="button" class="wb-nlm-btn wb-nlm-btn--ghost" data-wb-nlm-cancel>Cancel</button>' +
      '<button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-submit>Book trial</button></div>';
    openShell('Book a free trial', html, function (overlay, kill) {
      var err = overlay.querySelector('#wb-nlm-err');
      overlay.querySelector('[data-wb-nlm-cancel]').addEventListener('click', kill);
      overlay.querySelector('[data-wb-nlm-submit]').addEventListener('click', function () {
        var name = overlay.querySelector('#wb-nlm-name').value.trim();
        var phone = digits10(overlay.querySelector('#wb-nlm-phone').value);
        var when = overlay.querySelector('#wb-nlm-when').value.trim();
        var interestsRaw = overlay.querySelector('#wb-nlm-interests').value.trim();
        var notes = overlay.querySelector('#wb-nlm-notes').value.trim();
        if (name.length < 2 || phone.length !== 10 || when.length < 3) {
          err.style.display = 'block';
          err.textContent = 'Please complete name, phone, and visit timing.';
          return;
        }
        var interests = interestsRaw
          ? interestsRaw.split(',').map(function (s) {
              return s.trim();
            }).filter(Boolean)
          : [];
        err.style.display = 'none';
        var body = {
          lead_type: 'book_free_trial',
          business_slug: c.slug,
          submitted_at_ms: Date.now(),
          name: name,
          phone: phone,
          visit_when: when,
          interests: interests,
          notes: notes,
        };
        postLead(c.slug, c.apiBase, body).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          overlay.querySelector('.wb-nlm-body').innerHTML =
            '<div class="wb-nlm-done"><h3>Request received</h3><p style="margin:0;color:#475569;font-size:.9rem">We will contact you to confirm your trial.</p>' +
            '<div class="wb-nlm-actions" style="justify-content:center;margin-top:16px"><button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-close>Close</button></div></div>';
          overlay.querySelector('[data-wb-nlm-close]').addEventListener('click', kill);
        }).catch(function () {
          err.style.display = 'block';
          err.textContent = 'Could not send. Try again later.';
        });
      });
    });
  }

  function enquiryModal() {
    var c = readCfg();
    if (!c.apiBase || !c.servicePath) {
      window.alert('Service enquiry is not configured on this page.');
      return;
    }
    var html =
      '<p class="wb-nlm-err" id="wb-nlm-err" style="display:none"></p>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-name">Name</label><input id="wb-nlm-name" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-email">Email</label><input id="wb-nlm-email" type="email" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-phone">Phone (10 digits)</label><input id="wb-nlm-phone" inputmode="numeric" /></div>' +
      '<div class="wb-nlm-field"><label for="wb-nlm-msg">Message</label><textarea id="wb-nlm-msg"></textarea></div>' +
      '<div class="wb-nlm-actions"><button type="button" class="wb-nlm-btn wb-nlm-btn--ghost" data-wb-nlm-cancel>Cancel</button>' +
      '<button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-submit>Send enquiry</button></div>';
    openShell('Enquiry', html, function (overlay, kill) {
      var err = overlay.querySelector('#wb-nlm-err');
      overlay.querySelector('[data-wb-nlm-cancel]').addEventListener('click', kill);
      overlay.querySelector('[data-wb-nlm-submit]').addEventListener('click', function () {
        var name = overlay.querySelector('#wb-nlm-name').value.trim();
        var email = overlay.querySelector('#wb-nlm-email').value.trim();
        var phone = digits10(overlay.querySelector('#wb-nlm-phone').value);
        var message = overlay.querySelector('#wb-nlm-msg').value.trim();
        if (name.length < 2 || email.length < 5 || phone.length !== 10 || message.length < 3) {
          err.style.display = 'block';
          err.textContent = 'Please enter name, email, a 10-digit phone, and a short message.';
          return;
        }
        err.style.display = 'none';
        var payload = { name: name, email: email, phone: phone, message: message };
        postServiceEnquiry(c.apiBase, c.servicePath, payload).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          overlay.querySelector('.wb-nlm-body').innerHTML =
            '<div class="wb-nlm-done"><h3>Thanks</h3><p style="margin:0;color:#475569;font-size:.9rem">Your enquiry was sent.</p>' +
            '<div class="wb-nlm-actions" style="justify-content:center;margin-top:16px"><button type="button" class="wb-nlm-btn wb-nlm-btn--primary" data-wb-nlm-close>Close</button></div></div>';
          overlay.querySelector('[data-wb-nlm-close]').addEventListener('click', kill);
        }).catch(function () {
          err.style.display = 'block';
          err.textContent = 'Could not send. Try again later.';
        });
      });
    });
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-wb-open]') : null;
      if (!el) return;
      var kind = (el.getAttribute('data-wb-open') || '').trim().toLowerCase();
      if (!kind) return;
      e.preventDefault();
      if (kind === 'join') joinModal();
      else if (kind === 'visit') visitModal();
      else if (kind === 'trial') trialModal();
      else if (kind === 'enquiry') {
        var cform = el.closest('form.wb-sys-contact__form');
        if (cform) {
          submitInlineContactForm(cform);
          return;
        }
        enquiryModal();
      }
    },
    false
  );

  document.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!form || form.nodeName !== 'FORM' || !form.classList.contains('wb-sys-contact__form')) return;
      e.preventDefault();
      submitInlineContactForm(form);
    },
    true
  );
})();
