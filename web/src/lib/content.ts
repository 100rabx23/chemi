// Static copy. Every statement here is sourced from the existing chemilinx.in (see CONTENT_AUDIT.md)
// or derived directly from the product descriptions published there.

export const values = [
  { title: 'Excellence', text: 'We hold ourselves to the highest standards of quality, integrity, and professionalism. Excellence is not an option; it’s our standard practice.' },
  { title: 'Innovation', text: 'We foster a culture of innovation, encouraging our team to explore new frontiers, embrace change, and continuously improve our processes and products.' },
  { title: 'Responsibility', text: 'Environmental and social responsibility are integral to our business. We are dedicated to reducing our environmental footprint, upholding ethical business practices, and making a positive impact on the communities we touch.' },
  { title: 'Collaboration', text: 'We believe in the power of collaboration. By working closely with our clients, suppliers, and partners, we create a synergy that drives mutual success.' },
];

export const founders = [
  { name: 'Vikram Sengar', role: 'Founder & CEO' },
  { name: 'Shiva Singh Rajput', role: 'Chief — Paint Thinners, Solvents & Acids' },
];

/** Industries are derived only from applications named in Chemilinx's own product descriptions. */
export const industries = [
  { id: 'coatings', icon: 'paintbrush', title: 'Paints, Coatings & Adhesives', blurb: 'Solvents and thinners for formulating, thinning and finishing coatings.',
    basis: 'Ethyl Acetate is described as widely used in paints, coatings and adhesives; the three thinners target nitrocellulose, polyurethane and general coatings.',
    products: ['ethyl-acetate', 'nitrocellulose-thinner', 'general-purpose-thinner', 'polyurethane-thinner', 'calcined-kaolin'] },
  { id: 'fragrance', icon: 'flower', title: 'Fragrance, Perfumery & Personal Care', blurb: 'Aroma chemicals and fixatives for perfumes, lotions, cosmetics and sunscreens.',
    basis: 'Descriptions cite perfumes, lotions, cosmetics, sunscreens and personal care products.',
    products: ['benzyl-acetate', 'benzyl-alcohol', 'cinnamic-aldehyde', 'cinnamic-alcohol', 'hydroxy-citronellol', 'octyl-salicylate', 'benzyl-benzoate'] },
  { id: 'plastics', icon: 'layers', title: 'Plastics, Rubber & Polymers', blurb: 'Plasticizers that add flexibility and durability to plastics and synthetic rubber.',
    basis: 'Descriptions cite flexible plastics, synthetic rubber and polymer materials.',
    products: ['di-ethyl-phthalate', 'di-octyl-adipate', 'di-methyl-phthalate', 'china-clay-kaolin'] },
  { id: 'ceramics', icon: 'factory', title: 'Ceramics, Glass & Paper', blurb: 'Industrial minerals used as raw materials in ceramics, glass and paper.',
    basis: 'Descriptions cite ceramics, coatings, paper and glass production.',
    products: ['calcined-kaolin', 'china-clay-kaolin', 'silica-sand'] },
  { id: 'food', icon: 'droplets', title: 'Edible Oil Refining & Beverage Clarification', blurb: 'Bleaching earth for refining edible oils and clarifying beverages.',
    basis: 'Bleaching Earth/Activated Bentonite is described as used in refining of edible oils and as a clarifying agent in the beverage industry.',
    products: ['bleaching-earth-activated-bentonite'] },
  { id: 'filtration', icon: 'filter', title: 'Filtration & Purification', blurb: 'Activated carbon for filtration and purification processes.',
    basis: 'Activated Carbon/Charcoal is described with extensive applications in filtration and purification processes.',
    products: ['activated-carbon-charcoal'] },
  { id: 'cleaning', icon: 'spray', title: 'Cleaning, Disinfection & Healthcare', blurb: 'Oxidising and disinfecting chemicals, and salicylates for topical analgesics.',
    basis: 'Descriptions cite disinfection, cleaning, healthcare applications and topical analgesic products.',
    products: ['hydrogen-peroxide', 'sodium-hypochlorite', 'methyl-salicylate'] },
  { id: 'process', icon: 'flask', title: 'Chemical Processing & Manufacturing', blurb: 'Acids and hydrocarbon solvents for industrial cleaning, pH control and manufacturing.',
    basis: 'Descriptions cite industrial cleaning, pH control, chemical processing, fertilizer production and battery acid.',
    products: ['hydrochloric-acid-30-35-water-white', 'sulfuric-acid-98-water-white', 'c-9'] },
] as const;
