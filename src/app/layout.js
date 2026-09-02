import './globals.css';

/* The canonical origin, in one place.

   metadataBase is what turns the relative paths below into the absolute URLs
   Open Graph and Twitter both require. Without it Next emits a warning and the
   card falls back to a bare link, which is what a paste into LinkedIn or Slack
   looked like before this. Env-overridable so a staging deploy does not
   advertise itself as the live site. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://saleslights.com';

const DESCRIPTION =
  'Saleslights is a New York based growth consultancy for teams that need pipeline, not advice. We build the go to market machine, run it, and report on it every week.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  /* The title was the bare word "Saleslights", which tells a search result
     nothing and wastes the strongest ranking signal on the page. The template
     covers any page added later without each one repeating the brand. */
  title: {
    default: 'Saleslights | New York growth consultancy',
    template: '%s | Saleslights',
  },
  description: DESCRIPTION,
  applicationName: 'Saleslights',
  authors: [{ name: 'Nick Krause' }],
  creator: 'Nick Krause',
  publisher: 'Saleslights',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Saleslights',
    url: SITE_URL,
    title: 'Saleslights | New York growth consultancy',
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saleslights | New York growth consultancy',
    description: DESCRIPTION,
  },
  /* Stated rather than left to the default, because this is the one page the
     whole site has and it must be indexed. `max-image-preview: large` is what
     lets the generated card show at full width in a result. */
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'business',
};

/* The organisation, for search engines and anything that reads structured data.

   A consultancy that trades on being findable in New York had no machine
   readable identity at all: no name, no address region, no founder, no profile
   to connect the brand to. This is the cheapest possible fix and the one most
   likely to be read. */
const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organization`,
  name: 'Saleslights',
  url: SITE_URL,
  description: DESCRIPTION,
  email: 'nkrause@saleslights.com',
  areaServed: 'US',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
  founder: {
    '@type': 'Person',
    name: 'Nick Krause',
    jobTitle: 'Founder',
    sameAs: 'https://linkedin.com/in/nicholas-krause',
  },
  sameAs: ['https://linkedin.com/in/nicholas-krause'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  // suppressHydrationWarning: the boot script in <head> stamps data-boot on
  // <html> before React hydrates, so the server markup and the live DOM
  // legitimately differ by that one attribute and React would log a mismatch
  // on every deep-link load. It covers this element's own attributes only —
  // it does not reach the tree inside.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The latin cut serves both weights the site uses. Preloading it means
            the 56px headline never paints in the fallback face and reflows. */}
        <link
          rel="preload"
          href="/fonts/instrument-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* The headline ships hidden so it can't paint in the wrong place before
            the intro runs. Without JS that intro never comes, so give it back. */}
        <noscript>
          <style>{`[data-reveal='on'] .sl-h1-plain{visibility:visible}`}</style>
        </noscript>
        {/* The site is one pre-rendered document with hash routing, so reloading
            on /#services still ships Home's markup — and the browser paints it,
            skyline and hero video and all, before React can swap the view. No
            amount of effect ordering helps: that paint happens before hydration.
            This runs first instead, and marks the document so the CSS can put
            the loader up in place of a view the visitor did not ask for.

            Only the four deep pages: with no hash, an unknown one, or #home,
            nothing is set and Home keeps exactly the intro it has. Keep this
            list in step with PAGES in components/data.js. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var h=(location.hash||'').slice(1);" +
              "if(h&&['founder','services','studio','contact'].indexOf(h)>-1)" +
              "document.documentElement.setAttribute('data-boot','deep');}catch(e){}})();",
          }}
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          // JSON.stringify escaped for the one sequence that can close a script
          // block early and turn the rest of the document into markup.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORG_JSON_LD).replace(/</g, '\u003c'),
          }}
        />
      </body>
    </html>
  );
}
