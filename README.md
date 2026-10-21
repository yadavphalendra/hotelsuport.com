# HotelSuport — Static Website

Static hotel-enquiry website (HTML/CSS/JS only) for **www.hotelsuport.com**, built for GitHub Pages. No backend, database or build step.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Homepage: photo hero, hotel booking-bar enquiry form, stay types, 3 steps, services, tips, FAQ |
| `reserve-by-phone.html` | Lean Google Ads landing page (no main menu, `noindex`) |
| `hotel-booking-help.html`, `about.html`, `faq.html`, `contact.html` | Main pages |
| `privacy-policy.html`, `terms-and-conditions.html`, `cancellation-policy.html`, `disclaimer.html` | Legal pages |
| `404.html` | Not-found page |
| `assets/css/styles.css` | Styles (brand tokens at top) |
| `assets/js/main.js` | Menu, forms, date rules, call-click tracking. **`SITE_CONFIG` at the top.** |
| `assets/img/photos/` | Hotel photography (see credits) |

## Brand
- Wine `#6E1F2F` · Brass `#B8924F` · Espresso `#2A211B` · Ivory `#FAF6EF`
- Fonts: Playfair Display (headings), Jost (body)
- Logo: `assets/img/logo.svg` / `logo-mark.svg` (arched doorway with service dome)

## Changing the phone number
The phone number appears in three formats. Find and replace all three across every `.html` file and `assets/js/main.js`:
| Find | Replace with (example for 888-555-0123) |
|---|---|
| `877-523-1664` | `888-555-0123` |
| `+18775231664` | `+18885550123` |
| `+1-877-523-1664` | `+1-888-555-0123` |

Also regenerate `assets/img/og-image.png` (the social sharing image shows the number), or ask for it to be regenerated.

## Deploy to GitHub Pages
1. Push this folder to the root of its own GitHub repository.
2. **Settings → Pages → Deploy from a branch** → `main` / `(root)`.
3. The `CNAME` file is set to `www.hotelsuport.com`. At the registrar add:
   - `CNAME` record: `www` → `<github-username>.github.io`
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. In **Settings → Pages**, enter `www.hotelsuport.com` as the custom domain, wait for the DNS check, then tick **Enforce HTTPS**.

## Before launch
- **Forms:** delivered to support@hotelsuport.com via FormSubmit (no account or password). After going live, submit one test enquiry. Click the "Activate Form" email that arrives in that inbox, then test again. Forms don't send from pages opened directly from disk (file:///).
- **Tracking:** paste the Google tag / Google Ads snippet where each page has the comment `<!-- Google tag (gtag.js) ... -->`. Events `phone_call_click`, `email_click` and `generate_lead` are already sent.

## Photo credits
Photos are from Unsplash (free for commercial use under the Unsplash License, no attribution required). They are illustrative and do not depict any specific property, as the site's disclaimer states. Source IDs: 1542314831-068cd1dbfeeb, 1520250497591-112f2f40a3f4, 1566073771259-6a8506099945, 1590490360182-c33d57733427, 1611892440504-42a792e24d32, 1571896349842-33c89424de2d, 1551882547-ff40c63fe5fa, 1582719478250-c89cae4dc85b (https://unsplash.com/photos/<id>).
