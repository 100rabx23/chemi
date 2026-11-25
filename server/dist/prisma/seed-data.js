// All product names/descriptions are copied from https://chemilinx.in/products (see CONTENT_AUDIT.md).
// No CAS numbers, grades, prices or safety data were published, so none are invented here.
export const categories = [
    { slug: 'fragrance-solutions', name: 'Fragrance Solutions', tagline: 'Elevate products with captivating scents like Benzyl Acetate and Cinnamic Aldehyde.', imageUrl: '/images/cat-fragrance.jpg' },
    { slug: 'versatile-solvents', name: 'Versatile Solvents', tagline: 'Essential solvents for blending and dissolving substances.', imageUrl: '/images/cat-solvents.jpg' },
    { slug: 'enhancing-plasticizers', name: 'Enhancing Plasticizers', tagline: 'Add flexibility and durability to plastics and rubber.', imageUrl: '/images/cat-plasticizers.jpg' },
    { slug: 'paint-thinners', name: 'Paint Thinners', tagline: 'Achieve perfect coating consistency with specialized thinners.', imageUrl: '/images/cat-thinners.webp' },
    { slug: 'additional-products', name: 'Additional Products', tagline: 'Versatile industrial essentials for various sectors.', imageUrl: '/images/cat-additional.jpg' },
    { slug: 'industrial-minerals', name: 'Minerals that Shape Industries', tagline: 'Key components for ceramics, purification, and more.', imageUrl: '/images/cat-additional.jpg' },
];
export const products = [
    { category: 'fragrance-solutions', name: 'Benzyl Acetate', description: 'A versatile chemical with a sweet, floral scent, often used as a fragrance enhancer.', featured: true },
    { category: 'fragrance-solutions', name: 'Benzyl Alcohol', description: 'Known for its mild, pleasant aroma, commonly used in perfumes, lotions, and cosmetics.' },
    { category: 'fragrance-solutions', name: 'Cinnamic Aldehyde', description: 'An aromatic compound with a warm, spicy odor, often used in perfumery.' },
    { category: 'fragrance-solutions', name: 'Cinnamic Alcohol', description: 'Known for its sweet, balsamic scent, used in a variety of fragrances and flavors.' },
    { category: 'fragrance-solutions', name: 'Hydroxy Citronellol', description: 'A floral-scented compound often found in fragrances and personal care products.' },
    { category: 'fragrance-solutions', name: 'Methyl Salicylate', description: 'Known for its wintergreen aroma, commonly used in topical analgesic products.' },
    { category: 'fragrance-solutions', name: 'Octyl Salicylate', description: 'A chemical compound with a mild, fruity scent, used in sunscreens and cosmetic products.' },
    { category: 'versatile-solvents', name: 'Ethyl Acetate', description: 'A fast-evaporating solvent widely used in paints, coatings, and adhesives.', featured: true },
    { category: 'versatile-solvents', name: 'C-9', description: 'A hydrocarbon solvent known for its versatility in various industrial applications.' },
    { category: 'enhancing-plasticizers', name: 'Di Ethyl Phthalate', description: 'A plasticizer commonly used to enhance the flexibility and durability of plastics.' },
    { category: 'enhancing-plasticizers', name: 'Di Octyl Adipate', description: 'A plasticizer that imparts flexibility to various materials, including plastics and synthetic rubber.' },
    { category: 'enhancing-plasticizers', name: 'Benzyl Benzoate', description: 'A fragrance fixative with a sweet, balsamic scent, used in various personal care products.' },
    { category: 'enhancing-plasticizers', name: 'Di Methyl Phthalate', description: 'A versatile plasticizer used in the production of flexible plastics and other polymer materials.' },
    { category: 'paint-thinners', name: 'Nitrocellulose Thinner', description: 'A specialized thinner used in the formulation of nitrocellulose-based coatings and lacquers.', featured: true },
    { category: 'paint-thinners', name: 'General Purpose Thinner', description: 'A versatile thinner suitable for a wide range of coatings and paints.' },
    { category: 'paint-thinners', name: 'Polyurethane Thinner', description: 'A thinner designed for use with polyurethane-based coatings, providing excellent flow and leveling properties.' },
    { category: 'additional-products', name: 'Hydrogen Peroxide', description: 'A powerful oxidizing agent used in various industrial and healthcare applications.' },
    { category: 'additional-products', name: 'Sodium Hypochlorite', description: 'Commonly known as bleach, used for disinfection and cleaning purposes.' },
    { category: 'additional-products', name: 'Hydrochloric Acid 30–35% (Water White)', description: 'A clear, colorless solution of hydrogen chloride in water, commonly used in industrial cleaning, pH control, and chemical processing.', specs: [{ label: 'Concentration (as listed)', value: '30–35%' }, { label: 'Appearance (as listed)', value: 'Water White' }] },
    { category: 'additional-products', name: 'Sulfuric Acid 98% (Water White)', description: 'A highly concentrated, clear, and colorless liquid used in battery acid, fertilizer production, and various chemical manufacturing processes.', specs: [{ label: 'Concentration (as listed)', value: '98%' }, { label: 'Appearance (as listed)', value: 'Water White' }] },
    { category: 'industrial-minerals', name: 'Calcined Kaolin', description: 'A versatile industrial mineral used in ceramics, coatings, and paper industries.' },
    { category: 'industrial-minerals', name: 'China Clay/Kaolin', description: 'A clay mineral with various applications, including ceramics, rubber, and cosmetics.' },
    { category: 'industrial-minerals', name: 'Bleaching Earth/Activated Bentonite', description: 'Used in the refining of edible oils and as a clarifying agent in the beverage industry.' },
    { category: 'industrial-minerals', name: 'Activated Carbon/Charcoal', description: 'Highly porous carbon material with extensive applications in filtration and purification processes.' },
    { category: 'industrial-minerals', name: 'Silica Sand', description: 'A key material in glass production and various industrial applications.' },
];
export const settings = {
    contact: {
        companyName: 'Chemilinx',
        address: '315, Golden Square, Ankleshwar - Valia Rd, GIDC, Gujarat 393002',
        phone: '+91 8866865578',
        emailGeneral: 'info@chemilinx.in',
        emailSales: 'sales@chemilinx.in',
        emailExports: 'exports@chemilinx.in',
        facebook: 'https://www.facebook.com/Chemilinx-118692213263685/',
        instagram: 'https://instagram.com/chemilinx_official',
        linkedin: 'https://www.linkedin.com/in/chemilinx-linking-chemistry-with-lives-5a75a81b4',
        mapQuery: 'Golden Square, Ankleshwar GIDC, Gujarat',
    },
    notifications: { notifyEmail: '' },
    // Published on the old site but unverified: hidden until the client confirms. See CONTENT_AUDIT.md.
    testimonials: {
        visible: false,
        items: [
            { name: 'Sarita Verma', role: 'Director of Research & Development', company: 'Bharat BioTech', quote: 'Chemilinx has been an integral partner in our journey of constant innovation. Their commitment to excellence aligns seamlessly with our values at Bharat BioTech. The quality of solvents and plasticizers has significantly elevated our R&D projects.' },
            { name: 'Yashodharman', role: 'Manager - Sales and Operations', company: 'Lucknow Organics', quote: 'Collaboration with Chemilinx has enabled us to unlock tremendous potential in multiple areas of our operations. Their insights into the Fragrance market and the ability to execute fine business transactions have been impressive and exciting.' },
            { name: 'Rajat Joshi', role: 'Production Manager', company: 'Kaveri Chemicals', quote: 'At Kaveri Chemicals, we rely on Chemilinx for the reliable supply of essential chemicals. Their dedication to delivering top-notch products, especially in the paint thinner category, has streamlined our production processes.' },
        ],
    },
};
