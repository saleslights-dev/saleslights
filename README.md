<div align="center">

# Saleslights

**A New York growth consultancy for teams that need pipeline, not advice.**
Marketing site: one screen, five views, no scrolling on desktop.

[![Live](https://img.shields.io/badge/live-saleslights.com-f5821f)](https://saleslights.com)
![Next](https://img.shields.io/badge/next-15.4-black)
![React](https://img.shields.io/badge/react-19-61dafb)
![Static](https://img.shields.io/badge/output-static%20export-brightgreen)

</div>

---

## What this is

A fully static marketing site. `next build` emits `./out`, servable from any
CDN or file host. **No server, no API routes, no database, no data fetching, and
no environment variables at all** — which is why this repository can safely be
public.

The five views (Home, Founder, Services, Studio, Contact) are **one document**
with hash routing, not five pages. On desktop the page is a fixed non-scrolling
viewport sized to fit exactly once; below 820px it becomes an ordinary scrolling
document.

---

## Running it locally

```bash
npm install
npm run dev      # :3000
npm run build    # emits ./out
```

There is nothing to configure. No `.env` file exists or is needed.

---

## Repository layout

```
saleslights/
├── src/
│   ├── app/
│   │   ├── layout.js            metadata, JSON-LD, the deep-link boot script
│   │   ├── globals.css          the whole design system
│   │   ├── icon.svg             favicon
│   │   ├── opengraph-image.js   the share card, generated at build
│   │   ├── robots.js  sitemap.js
│   └── components/
│       ├── SalesLights.js       every view, the router, the pointer loop
│       ├── SplitHeadline.js     word-split headline animation
│       ├── useLogoSwapper.js    the rotating client strip
│       └── data.js              all copy, tabs, brands, founder bio
└── public/                      brand marks, portraits, hero video
```

**`data.js` is where the words live.** Copy changes almost never need a
component touched.

---

## Deploying

```bash
ssh root@2.25.162.218 'bash /root/deploy-saleslights-site.sh'
```

No GitHub Action — this one is deployed by hand. The script pulls `main`,
builds, and swaps the output, keeping the previous build at
`/var/www/saleslights-site.prev` for rollback.

| | |
|---|---|
| Host | `2.25.162.218` (Hostinger, shared with Video Funker) |
| Docroot | `/var/www/saleslights-site` |
| Build repo | `/opt/saleslights-site` |
| Staging URL | `srv1725443.hstgr.cloud` (same files, useful for checking a deploy) |
| SSL | Let's Encrypt, auto-renewing, covers apex and `www` |

> The deploy script still health-checks `app.saleslights.com`, an app that was
> removed. Every deploy ends with a warning about it. Harmless, worth deleting.

> [!IMPORTANT]
> **The server pulls this repo over plain HTTPS with no credentials.** It works
> only because the repository is public. If it is ever made private, the deploy
> breaks immediately and the error will not say why — add a deploy key or token
> at the same time.

---

## SEO

Handled through Next's metadata API in `layout.js`: title template, canonical,
Open Graph, Twitter card, and `ProfessionalService` JSON-LD carrying the New York
address and founder.

The **share card is generated at build time** by `opengraph-image.js` as a real
1200×630 PNG, so the wording lives in the repository and changes in review
rather than in a design tool.

`robots.js` and `sitemap.js` are emitted as static files. All three routes need
`export const dynamic = 'force-static'` — `output: export` refuses the entire
build without it rather than skipping them.

**The sitemap lists only the root, on purpose.** This is one document with hash
routing, so listing `/#founder` and friends would promise pages that return
identical HTML and earn a duplicate-content discount.

---

## Things that will surprise you

**No global `box-sizing: border-box`.** Deliberate, because the approved design
sizes several elements by content box. Any new element with `width: 100%` plus
padding must set `box-sizing` itself, or it will run past its container — this
has already cut a chevron off a menu row.

**The pointer loop writes `transform` every frame** to the studio render and the
founder portrait. Never put a CSS transition or animation on those elements: two
writers on one property fight, and the animation wins by pinning the drift at
zero. Entrance animations ride a wrapper instead.

**The founder claim deliberately passes *under* the portrait.** That crossing is
the device. Readable text — the eyebrow, the credential chips — must not, so
they are capped to the clear strip beside it. The portrait is sized by *height*,
so its width depends on the viewport's height; the card and the cap are locked
to one shared constant so the gutter holds at every size.

**Deep links do not select a view on load.** Opening `/#founder` directly serves
Home. The hash only works when a nav link is clicked. Known, unfixed.
