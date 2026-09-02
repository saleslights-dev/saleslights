/* robots.txt, generated into ./out at build time.

   There was none, so crawlers had no sitemap pointer and no statement of
   intent. Everything is allowed: this is a four-view marketing site with
   nothing private in it, and the only thing worth saying is where the sitemap
   lives. */

/* force-static is required by `output: export`: a route handler is dynamic by
   default, and the export refuses to emit one it cannot resolve at build time.
   Without this the whole build fails rather than skipping the file. */
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://saleslights.com';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
