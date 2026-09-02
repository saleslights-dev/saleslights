import { ImageResponse } from 'next/og';

/**
 * The card people actually see when the link is pasted.
 *
 * There was no og:image at all, so a link to this site shared into LinkedIn,
 * Slack or a DM rendered as a bare grey box with a domain under it — for a
 * consultancy whose whole pitch is authority and outbound, the one asset that
 * gets seen most before anyone visits.
 *
 * Generated at build time rather than shipped as a binary, so the wording stays
 * in the repository and edits happen in code review instead of in Figma. The
 * export is fully static, so this runs once during `next build` and lands in
 * ./out as a real PNG.
 *
 * No webfont is loaded here on purpose. Fetching one at build time is a network
 * dependency on every build, and the fallback renders this weight cleanly.
 */
export const runtime = 'nodejs';
/* Same requirement as robots and sitemap: `output: export` will not emit a
   route it cannot resolve at build time, and refuses the whole build without
   this rather than skipping the image. */
export const dynamic = 'force-static';
export const alt = 'Saleslights — New York growth consultancy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #081733 0%, #0a1d3d 45%, #10294f 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Mark and wordmark, drawn rather than imported so this file has no
            asset dependency that could go missing. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#f5821f',
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 30, letterSpacing: 2, fontWeight: 700 }}>
            SALESLIGHTS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: -2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>We turn a good product</span>
            <span>
              into <span style={{ color: '#f5821f' }}>revenue.</span>
            </span>
          </div>
          <div style={{ fontSize: 28, color: '#94a9c6', display: 'flex' }}>
            New York growth consultancy · Pipeline, not advice
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#94a9c6',
          }}
        >
          <div style={{ width: 60, height: 3, background: '#f5821f', display: 'flex' }} />
          <span>saleslights.com</span>
        </div>
      </div>
    ),
    size
  );
}
