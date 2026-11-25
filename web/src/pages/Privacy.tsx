import { useSEO } from '../lib/seo';
import { Container, PageHero } from '../components/ui';

// Text adapted from the existing chemilinx.in policy (last updated 16/12/2023), with the contact address
// corrected to info@chemilinx.in and a paragraph added describing the forms on this site.
// Recommend legal review before launch.
const sections: [string, string[]][] = [
  ['Introduction', ['Welcome to Chemilinx. This Privacy Policy is designed to help you understand how we collect, use, disclose, and safeguard your personal information. By accessing or using this website, you agree to the terms of this Privacy Policy.']],
  ['Information we collect', ['We collect the personal information you submit through our quotation request and contact forms — such as your name, company name, email address, phone number, the products and quantities you ask about, and your message.', 'We may also collect non-personal technical information, such as IP addresses and browser type, to protect the site against abuse and to keep it running reliably.']],
  ['How we use your information', ['We use the information to respond to your quotation requests and enquiries, to provide and improve our services, and for legal or compliance purposes. Your details are stored in our database and are visible only to authorised Chemilinx staff.']],
  ['Cookies and similar technologies', ['The public website does not set tracking cookies. A secure session cookie is used only for authorised staff who sign in to the administration area.']],
  ['Third-party links and services', ['This site may link to third-party websites (for example social networks) and embeds a Google Maps view on the contact page. We are not responsible for the privacy practices or content of those third parties.']],
  ['Information security', ['We employ reasonable security measures to protect your personal information from unauthorised access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.']],
  ['Your choices', ['You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at info@chemilinx.in.']],
  ['Updates to this policy', ['We may update this Privacy Policy periodically. The latest version will be posted on this page. Your continued use of the site after any changes constitutes your acceptance of those changes.']],
  ['Contact us', ['If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at info@chemilinx.in.']],
];

const id = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function Privacy() {
  useSEO({ title: 'Privacy Policy', description: 'How Chemilinx collects, uses and protects personal information submitted through this website.' });
  return (
    <>
      <PageHero eyebrow="Legal" lines={['Privacy', 'policy.']} intro="Based on the policy last updated 16/12/2023." />
      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <nav aria-label="Contents" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-32 border-l border-navy/20">
            {sections.map(([h], i) => <li key={h}><a href={`#${id(h)}`} className="-ml-px block border-l-2 border-transparent py-2 pl-4 text-sm text-ink-soft transition-colors hover:border-emerald hover:text-navy"><span className="label mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>{h}</a></li>)}
          </ol>
        </nav>
        <div className="max-w-3xl lg:col-span-8 lg:col-start-5">
          {sections.map(([h, ps], i) => (
            <section key={h} id={id(h)} className="scroll-mt-28 border-t border-navy/20 py-10 first:border-t-0 first:pt-0">
              <h2 className="display-sm"><span className="label mr-4 tabular-nums !text-emerald-dark">{String(i + 1).padStart(2, '0')}</span>{h}</h2>
              {ps.map((p) => <p key={p} className="mt-4 leading-relaxed text-ink-soft">{p}</p>)}
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
