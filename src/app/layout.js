import './globals.css';

export const metadata = {
  title: 'Saleslights',
  description:
    'Saleslights is a New York based growth consultancy for teams that need pipeline, not advice. We build the go to market machine, run it, and report on it every week.',
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
      <body>{children}</body>
    </html>
  );
}
