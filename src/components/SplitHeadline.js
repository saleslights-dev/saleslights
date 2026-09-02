'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Line breaks depend on the real font metrics, so measuring before Instrument
// Sans arrives splits the headline at the wrong words. The timeout keeps a
// font that never loads from holding the reveal hostage.
function whenFontsReady(timeout) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);
}

/**
 * Renders a headline whose rendered lines each rise out of their own mask, and
 * whose words lift individually on hover once that reveal has finished.
 *
 * The lines aren't hardcoded — a hidden copy of the text, one span per word,
 * is measured by `offsetTop` and consecutive words sharing a top become a
 * line. That keeps the reveal correct at any viewport width and re-splits on
 * resize. With `reveal` off the plain text renders untouched.
 */
export default function SplitHeadline({
  text,
  // Measured line breaks are greedy, so a headline whose second line is
  // shorter than its third can never be split the way it reads best. When that
  // happens the caller supplies the lines and measurement is skipped.
  fixedLines,
  reveal,
  play,
  // Renders the split lines already in place: same markup, same word spans, so
  // hover lift and the per-word accent colours survive — only the entrance is
  // skipped. Used when Home is re-entered by navigation rather than by load.
  instant,
  innerRef,
  className,
  style,
  stagger = 0.09,
  delay = 0,
  as: Tag = 'h1',
}) {
  const words = text.split(' ');
  const [lines, setLines] = useState(null);
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(!!instant);
  const wordRefs = useRef([]);

  useIsoLayoutEffect(() => {
    if (!reveal) {
      setLines(null);
      return undefined;
    }
    if (fixedLines && fixedLines.length) {
      setLines(fixedLines);
      return undefined;
    }
    let cancelled = false;

    const measure = () => {
      const grouped = [];
      let top = null;
      for (let i = 0; i < words.length; i += 1) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const t = el.offsetTop;
        if (top === null || Math.abs(t - top) > 1) {
          grouped.push([]);
          top = t;
        }
        grouped[grouped.length - 1].push(words[i]);
      }
      if (cancelled) return;
      // If measuring produced nothing there is no split to animate. Give up on
      // the effect rather than leave the plain text hidden behind a mask that
      // will never be filled.
      if (!grouped.length) setFailed(true);
      else setLines(grouped.map((g) => g.join(' ')));
    };

    // Already-cached fonts let us split before the first paint, so returning
    // to Home never flashes an empty headline.
    if (document.fonts && document.fonts.status === 'loaded') measure();
    else whenFontsReady(800).then(() => { if (!cancelled) measure(); });

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [reveal, text, fixedLines]);

  // The per-line masks that make the reveal possible would also clip a word
  // lifting on hover, so they are dropped once the rise has finished.
  useEffect(() => {
    if (instant || !reveal || !play || !lines) return undefined;
    const ms = (0.9 + (lines.length - 1) * stagger) * 1000 + 120;
    const t = setTimeout(() => setRevealed(true), ms);
    return () => clearTimeout(t);
  }, [instant, reveal, play, lines, stagger]);

  return (
    <Tag
      ref={innerRef}
      className={className}
      style={style}
      data-reveal={reveal && !failed ? 'on' : undefined}
      data-play={play ? 'on' : undefined}
      data-instant={instant ? 'on' : undefined}
      data-revealed={revealed ? 'on' : undefined}
    >
      {reveal && !failed && (
        <span className="sl-h1-measure" aria-hidden="true">
          {words.map((w, i) => (
            <span
              key={`${w}-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
            >
              {w + ' '}
            </span>
          ))}
        </span>
      )}

      {reveal && !failed && lines ? (
        lines.map((line, i) => (
          <span className="sl-line" key={`${line}-${i}`}>
            <span style={{ animationDelay: `${(delay + i * stagger).toFixed(2)}s` }}>
              {line.split(' ').map((w, j) => (
                <Fragment key={`${w}-${j}`}>
                  {j > 0 ? ' ' : null}
                  <span className="sl-word" data-w={w}>{w}</span>
                </Fragment>
              ))}
            </span>
          </span>
        ))
      ) : (
        <span className="sl-h1-plain">{text}</span>
      )}
    </Tag>
  );
}
