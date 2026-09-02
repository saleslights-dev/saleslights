/* sitemap.xml, generated into ./out at build time.

   The site is ONE document with hash routing — /#founder and the rest are not
   separate URLs and must not be listed as though they were, or the sitemap
   promises pages that return the same HTML and the duplicates get discounted.
   So this lists exactly what exists: the root. */

/* force-static is required by `output: export`: a route handler is dynamic by
   default, and the export refuses to emit one it cannot resolve at build time.
   Without this the whole build fails rather than skipping the file. */
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://saleslights.com';

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
