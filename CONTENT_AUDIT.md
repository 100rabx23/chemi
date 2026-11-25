# CONTENT AUDIT — chemilinx.in (inspected 2026-11-25, read-only)

Pages found (via nav/footer): Home, Products, About, Our Founders, Testimonials, Contact, Privacy Policy, Terms & Conditions. A "Shipping Details" footer link exists but has no distinct page content captured. The live site is WordPress/Elementor, built by "STPL" (footer credit). The live site was not modified.

## Company facts (verified on live site)
- Name: Chemilinx. Tagline (logo): "Linking Chemistry with Lives". Also: "Where Chemistry Meets Possibility", "Where Chemistry Meets Global Excellence".
- Self-description: a chemical **distribution** company ("not just a chemical distribution company; we're your trusted partner"). Mission: redefine chemical distribution; blend experience and youth. Global vision: aspire to be a global leader serving industries worldwide.
- Core values: Excellence, Innovation, Responsibility, Collaboration (descriptions copied into `server/prisma/seed-data.ts`).
- "Why Chemilinx" headings only: Infinite Horizons, One Destination / Pioneers of Progress / Unwavering Commitment to Excellence / Innovation Beyond Imagination (no body text on live site).
- Founders: **Vikram Sengar** – Founder & CEO; **Shiva Singh Rajput** – Chief, Paint Thinners, Solvents & Acids. (No photos/bios captured.)

## Contact (verified)
- Address: 315, Golden Square, Ankleshwar – Valia Rd, GIDC, Gujarat 393002 (Google Maps link on site points to Ankleshwar GIDC, Gujarat 393001 — **inconsistent pincode: 393002 vs 393001, needs client confirmation**).
- Phone: +91 8866865578
- Emails: info@chemilinx.in, sales@chemilinx.in, exports@chemilinx.in
- Social: Facebook (Chemilinx-118692213263685), Instagram (chemilinx_official), LinkedIn (company profile). Twitter icon present, no URL captured.

## Product catalogue (verified names + descriptions from /products)
| Category | Products |
|---|---|
| Fragrance Solutions | Benzyl Acetate, Benzyl Alcohol, Cinnamic Aldehyde, Cinnamic Alcohol, Hydroxy Citronellol, Methyl Salicylate, Octyl Salicylate |
| Versatile Solvents | Ethyl Acetate, C-9 |
| Enhancing Plasticizers | Di Ethyl Phthalate, Di Octyl Adipate, Benzyl Benzoate, Di Methyl Phthalate |
| Paint Thinners | Nitrocellulose Thinner, General Purpose Thinner, Polyurethane Thinner |
| Additional Products | Hydrogen Peroxide, Sodium Hypochlorite, Hydrochloric Acid 30–35% (Water White), Sulfuric Acid 98% (Water White) |
| Minerals that Shape Industries | Calcined Kaolin, China Clay/Kaolin, Bleaching Earth/Activated Bentonite (listed twice on live site; deduplicated), Activated Carbon/Charcoal, Silica Sand |

Home page also mentions "Natural Essential Oils" as a category tile but **no essential-oil products are listed** on /products. Treated as an open question; not seeded as a category.
Only the one-line descriptions on the live site are used. No CAS numbers, grades, purity, packaging, pricing or safety data were published → none invented. Only stated figures (HCl 30–35%, H2SO4 98%) are recorded as the "grade" shown in the product name.

## Testimonials (published on live site, NOT independently verified)
Sarita Verma (Dir. R&D, "Bharat BioTech"), Yashodharman (Mgr Sales & Ops, Lucknow Organics), Rajat Joshi (Production Mgr, Kaveri Chemicals). The live site's testimonial section uses stock profile imagery, and the wording is generic. **Not shown publicly by default.** They are stored in the DB (`Testimonial`-style entries in SiteSetting `testimonials`, `visible:false`) and can be switched on from the admin once the client confirms permission/authenticity.

## Statistics
Home page has animated counters ("Established", "Happy Clients & Growing", "% Satisfaction") whose values are JS-generated and could not be verified. **Not used.**

## Legal pages
Privacy Policy (last updated 16/12/2023) and Terms (contains a "[Your Jurisdiction]" placeholder and the typo'd email `info@chemlinx.in`) — Privacy text reused with corrected email; Terms flagged for client/legal review. Terms not in the requested page list; a stub page is not built (see open questions).

## Assets
Downloaded to `web/public/images`: logo (png, 1280×335), six category images (low-res, 16–25 KB), a lab flask hero image, a worker-in-plant photo (800×533), a lab image, a cleaning-bottle image. **Licensing/provenance unknown** (file names suggest Unsplash/stock). Quality is too low for cinematic full-bleed use. `logo-leaf.png` returned 404. No per-product photos exist.

## Missing content / questions for the client
1. Certifications, licences (GST, IEC, ISO, REACH…) – none published. None shown.
2. Industries served – not stated on the live site; the Industries page uses only application areas named in the product descriptions (paints & coatings, fragrance/personal care, plastics & rubber, ceramics, edible-oil refining, water/filtration, glass, healthcare/disinfection, fertiliser/batteries/chemical processing).
3. Year established, team size, capacities, warehouses, export countries.
4. Address pincode (393001 vs 393002) and verified map pin.
5. Per-product specs (CAS, grade, packaging), SDS/TDS documents, photos.
6. Permission to publish the three testimonials; logo vector source; image licences.
7. Whether "Natural Essential Oils" is an active category.
8. Terms & Conditions text, jurisdiction, shipping details.
9. Production SMTP account and business notification address.
