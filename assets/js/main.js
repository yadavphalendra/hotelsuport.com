/* ==========================================================================
   HotelSuport — site script (no dependencies, static-host friendly)
   ========================================================================== */

/*
 * SITE CONFIGURATION
 * formEndpoint: GitHub Pages cannot process forms, so enquiries are relayed by
 * FormSubmit (formsubmit.co) to the support inbox. The FIRST submission after the
 * site goes live triggers a one-time activation email to that inbox; click
 * "Activate Form" and every later enquiry is delivered. No account or password
 * is needed. Any service that accepts a JSON POST (e.g. Formspree) also works.
 * If a submission fails, the visitor sees a message asking them to call, with an
 * optional "Email us instead" button (nothing opens automatically).
 * Note: FormSubmit only works on a live website (http/https), not on pages opened
 * directly from disk (file:///).
 */
var SITE_CONFIG = {
  formEndpoint: "https://formsubmit.co/ajax/support@hotelsuport.com",
  phoneDisplay: "877-360-4334",
  phoneHref: "tel:+18773604334",
  email: "support@hotelsuport.com"
};

(function () {
  "use strict";

  /* ---------- Analytics helpers (works once Google tag / GTM is added) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(eventName, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: eventName }, params));
    if (typeof window.gtag === "function") window.gtag("event", eventName, params);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href^='tel:'], a[href^='mailto:']");
    if (!link) return;
    var isTel = link.getAttribute("href").indexOf("tel:") === 0;
    track(isTel ? "phone_call_click" : "email_click", {
      link_location: link.getAttribute("data-loc") || "page",
      page_path: location.pathname
    });
  });

  /* ---------- Header: mobile nav + scrolled shadow ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Destination suggestions (datalist) ---------- */
  var CITIES = [
    "New York, NY", "Las Vegas, NV", "Orlando, FL", "Miami, FL", "Los Angeles, CA", "San Francisco, CA",
    "San Diego, CA", "Chicago, IL", "Washington, DC", "Boston, MA", "Nashville, TN", "New Orleans, LA",
    "Atlanta, GA", "Dallas, TX", "Houston, TX", "Austin, TX", "San Antonio, TX", "Denver, CO",
    "Phoenix, AZ", "Scottsdale, AZ", "Seattle, WA", "Portland, OR", "Honolulu, HI", "Maui, HI",
    "Anaheim, CA", "Palm Springs, CA", "Key West, FL", "Tampa, FL", "Fort Lauderdale, FL", "Charleston, SC",
    "Savannah, GA", "Myrtle Beach, SC", "Philadelphia, PA", "Baltimore, MD", "Minneapolis, MN",
    "Salt Lake City, UT", "Park City, UT", "Aspen, CO", "Lake Tahoe, CA", "Sedona, AZ", "Branson, MO",
    "Gatlinburg, TN", "Niagara Falls, NY", "Anchorage, AK", "San Juan, PR",
    "Cancun, Mexico", "Toronto, Canada", "Vancouver, Canada", "London, UK", "Paris, France",
    "Rome, Italy", "Barcelona, Spain", "Dubai, UAE", "Tokyo, Japan", "Bangkok, Thailand", "Bali, Indonesia"
  ];
  var dl = document.getElementById("destinations");
  if (dl && !dl.options.length) {
    var frag = document.createDocumentFragment();
    CITIES.forEach(function (c) { var o = document.createElement("option"); o.value = c; frag.appendChild(o); });
    dl.appendChild(frag);
  }

  /* ---------- Stay dates: check-out must follow check-in ---------- */
  function isoDate(d) {
    var c = new Date(d.getTime());
    c.setMinutes(c.getMinutes() - c.getTimezoneOffset());
    return c.toISOString().slice(0, 10);
  }
  document.querySelectorAll("form[data-hotel-form]").forEach(function (form) {
    var inEl = form.querySelector("[name='check_in']");
    var outEl = form.querySelector("[name='check_out']");
    var today = isoDate(new Date());
    if (inEl) inEl.min = today;
    if (outEl) outEl.min = today;
    if (inEl && outEl) {
      inEl.addEventListener("change", function () {
        if (!inEl.value) return;
        var next = new Date(inEl.value + "T12:00:00");
        next.setDate(next.getDate() + 1);
        outEl.min = isoDate(next);
        if (outEl.value && outEl.value <= inEl.value) outEl.value = "";
      });
    }
  });

  /* ---------- Submission ---------- */
  var LABELS = {
    destination: "Destination", hotel_pref: "Hotel or area preference", check_in: "Check-in", check_out: "Check-out",
    rooms: "Rooms", guests: "Guests", purpose: "Trip purpose", name: "Name", phone: "Phone", email: "Email",
    subject: "Topic", booking_ref: "Reservation number", message: "Message", best_time: "Best time to call", consent: "Consent to contact"
  };

  function summarize(form) {
    var lines = [];
    new FormData(form).forEach(function (value, key) {
      if (key === "website" || key === "consent" || !String(value).trim()) return;
      lines.push((LABELS[key] || key) + ": " + value);
    });
    return lines.join("\n");
  }

  function mailtoFor(form) {
    var subject = form.getAttribute("data-subject") || "Website enquiry";
    var nameField = form.querySelector("[name='name']");
    if (nameField && nameField.value) subject += " – " + nameField.value;
    var body = summarize(form) + "\n\nSent from: " + location.href;
    return "mailto:" + SITE_CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  var modal = document.getElementById("form-modal");
  var lastFocus = null;
  function openModal(failed, form) {
    if (!modal) return;
    var title = modal.querySelector("[data-modal-title]");
    var note = modal.querySelector("[data-modal-note]");
    var emailBtn = modal.querySelector(".m-email");
    modal.classList.toggle("is-error", !!failed);
    if (title) title.textContent = failed ? "We couldn't send your enquiry" : "Enquiry received";
    if (note) {
      note.textContent = failed
        ? "Sorry, something went wrong while sending your details. Please call us and a reservations agent will help you right away, or email us your enquiry."
        : "Thank you. A reservations agent will contact you about your stay. For the quickest help, call us now.";
    }
    if (emailBtn && form) emailBtn.href = mailtoFor(form);
    lastFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    var close = modal.querySelector(".modal-close");
    if (close) close.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });
  }

  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var hp = form.querySelector("[name='website']");
      if (hp && hp.value) return; // spam honeypot

      var btn = form.querySelector("[type='submit']");
      track("generate_lead", { form_id: form.id || "enquiry", page_path: location.pathname });

      if (!SITE_CONFIG.formEndpoint) { openModal(true, form); return; }
      if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = "Sending…"; }
      var payload = {};
      new FormData(form).forEach(function (value, key) {
        if (key === "website") return;
        payload[LABELS[key] || key] = value;
      });
      payload._subject = (form.getAttribute("data-subject") || "Website enquiry") + " – " + (payload.Name || "");
      payload._template = "table";
      payload._captcha = "false";
      if (payload.Email) payload._replyto = payload.Email;
      payload["Submitted from"] = location.href;
      fetch(SITE_CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json().catch(function () { return {}; });
        })
        .then(function (json) {
          if (json && (json.success === false || json.success === "false")) throw new Error(json.message || "Not delivered");
          form.reset();
          openModal(false);
        })
        .catch(function () { openModal(true, form); })
        .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; } });
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
