'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BRANDS,
  CALENDLY_BOOK,
  EMAIL,
  FOUNDER,
  LINKEDIN,
  PAGES,
  SERVICES,
  STUDIO_LEDE,
  STUDIO_PILLARS,
  TABS,
} from './data';
import SplitHeadline from './SplitHeadline';
import useLogoSwapper from './useLogoSwapper';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Ambient motion is meaningless without a hovering pointer, and on touch it is
// pure battery cost.
function hasFinePointer() {
  return !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
}

// Below this the page scrolls rather than filling one fixed screen, so <main>
// is as tall as its content. Parking the headline at the centre of that would
// drop it far below the fold instead of framing it. Matches the CSS breakpoint.
function isNarrow() {
  return !!(window.matchMedia && window.matchMedia('(max-width: 820px)').matches);
}

// Deliberately small — peak displacement is RADIUS * PULL / 4, about 10px.
// The pull should register before it can be named.
const MAGNET_RADIUS = 90;
const MAGNET_PULL = 0.45;

// One mark per studio zone, matching the badges in the render itself. Stroked
// rather than filled so they sit at the same weight as the hairlines around
// them, and they inherit colour from the row.
const PILLAR_ICONS = {
  strategy: (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.3" />
      <path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3" strokeLinecap="round" />
    </svg>
  ),
  authority: (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="9" r="3.7" />
      <path d="M5.2 20.6a6.9 6.9 0 0 1 13.6 0" strokeLinecap="round" />
    </svg>
  ),
  outreach: (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M21.4 2.6 2.6 9.8l7.1 2.9 2.9 7.1z" />
      <path d="M9.7 12.7 21.4 2.6" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3.6 20.4h16.8" opacity=".45" />
      <path d="M5.6 17.4v-4.2M10.4 17.4V9M15.2 17.4v-5.6M20 17.4V5.4" />
    </svg>
  ),
};

export default function SalesLights() {
  const [page, setPage] = useState('home');
  const [service, setService] = useState(0);
  const [fading, setFading] = useState(false);

  // Intro: the headline is parked dead centre of <main>, holds, then glides
  // back to its column position while the rest of the chrome fades in.
  const [intro, setIntro] = useState(true);
  const [homeT, setHomeT] = useState('none');
  const [homeMoving, setHomeMoving] = useState(false);

  // Starts true so the server-rendered HTML already carries the pre-intro
  // state. Rendering the headline visible and hiding it after hydration means
  // it paints in the left column first and then jumps to centre when the intro
  // takes over. Reduced motion turns this back off. `play` waits until the
  // headline is wherever it is going to rise from.
  const [revealHeadline, setRevealHeadline] = useState(true);
  const [playHeadline, setPlayHeadline] = useState(false);
  // The Home entrance is a page-load event. Arriving from another tab is
  // navigation, so the headline is placed rather than replayed — re-running a
  // nine-tenths-of-a-second masked rise on every return reads as a stutter.
  const [homeInstant, setHomeInstant] = useState(false);

  const slots = useLogoSwapper();

  const mainRef = useRef(null);
  const homeH1Ref = useRef(null);
  const pageRef = useRef(page);
  const pageTimer = useRef(null);
  const introTimers = useRef([]);
  const introRafs = useRef([]);
  const introPositioned = useRef(false);
  const hoverTimer = useRef(null);
  const bootTimer = useRef(null);

  const glowRef = useRef(null);
  const renderRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const magnetsRef = useRef([]);

  // Selecting on raw mouseenter fires a content change for every row the
  // cursor crosses, so travelling 01 → 05 flickers through three services
  // nobody asked for. The delay lets the row you settle on win.
  const hoverService = useCallback((i) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setService(i), 80);
  }, []);

  const pickService = useCallback((i) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setService(i);
  }, []);

  useEffect(() => { pageRef.current = page; }, [page]);


  // Drops straight to the finished page: chrome visible, headline home and
  // unmasked. Every failure path lands here rather than part-way through.
  const settleHome = useCallback(() => {
    introTimers.current.forEach(clearTimeout);
    introTimers.current = [];
    setIntro(false);
    setHomeT('none');
    setHomeMoving(false);
    setPlayHeadline(true);
  }, []);

  const startIntro = useCallback(() => {
    introTimers.current.forEach(clearTimeout);
    introTimers.current = [];
    introPositioned.current = false;
    setIntro(true);
    setHomeT('none');
    setHomeMoving(false);
    setPlayHeadline(false);

    // A background tab runs no frames, so the rAF chain below may never fire.
    // Timers still run, so this guarantees the page can't sit blank waiting for
    // an intro that will never start. An overture nobody saw is no loss.
    introTimers.current.push(
      setTimeout(() => {
        if (!introPositioned.current) settleHome();
      }, 400)
    );

    // Two frames so the headline has been laid out at its resting position
    // before we measure the offset to the centre.
    introRafs.current.push(
      requestAnimationFrame(() => {
        introRafs.current.push(
          requestAnimationFrame(() => {
            const el = homeH1Ref.current;
            const main = mainRef.current;
            if (!el || !main) {
              settleHome();
              return;
            }
            introPositioned.current = true;
            const a = el.getBoundingClientRect();
            const b = main.getBoundingClientRect();
            const dx = b.left + b.width / 2 - (a.left + a.width / 2);
            const dy = b.top + b.height / 2 - (a.top + a.height / 2);
            setHomeT(`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`);
            setPlayHeadline(true);

            introTimers.current.push(
              setTimeout(() => {
                setHomeMoving(true);
                introTimers.current.push(
                  setTimeout(() => {
                    setIntro(false);
                    setHomeT('none');
                  }, 30)
                );
              // The line reveal lands at ~0.99s, so the original 1500 left half a
              // second of nothing happening before the glide. This holds just
              // long enough to read the headline, then moves.
              }, 1150)
            );
          })
        );
      })
    );
  }, []);

  // Every arrival at Home routes through here. The centre-park overture is a
  // page-load event: it runs on load and on every refresh, but clicking Home
  // from another view is navigation, so that just settles.
  //
  // `viaNav` is a parameter rather than a consumed ref on purpose — StrictMode
  // double-invokes mount effects in dev, so a one-shot flag would be spent by
  // the first pass and the second would skip the intro entirely.
  const enterHome = useCallback(
    (viaNav) => {
      const reduced = prefersReducedMotion();
      setRevealHeadline(!reduced);
      setHomeInstant(!!viaNav);

      if (reduced || viaNav || isNarrow()) {
        settleHome();
        return;
      }
      startIntro();
    },
    [settleHome, startIntro]
  );

  const go = useCallback(
    (target) => (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (target !== pageRef.current) {
        if (pageTimer.current) clearTimeout(pageTimer.current);
        setFading(true);
        pageTimer.current = setTimeout(() => {
          setPage(target);
          setFading(false);
          if (target === 'home') enterHome(true);
          // Was 560ms of blank screen on every nav click. The outgoing view now
          // leaves upward in 300ms and the incoming one rises to meet it.
        }, 300);
      }
      try {
        window.history.replaceState(null, '', '#' + target);
      } catch (err) {
        /* history is unavailable on file:// — navigation still works */
      }
    },
    [enterHome]
  );

  useIsoLayoutEffect(() => {
    const fromHash = (window.location.hash || '').replace('#', '');
    const initial = PAGES.indexOf(fromHash) > -1 ? fromHash : 'home';
    if (initial === 'home') {
      enterHome();
    } else {
      setPage(initial);
      setIntro(false);
    }

    // The head script raised the loader; this is the only thing that lowers it.
    // Held for a beat first — hydration can land in well under 100ms, and a
    // loader that appears and vanishes that fast reads as a flicker, which is
    // the problem it was added to solve. The view underneath is already
    // mounted and running its own entrances behind the fade, so this reads as
    // a hand-off rather than a wait.
    const root = document.documentElement;
    if (root.getAttribute('data-boot') === 'deep') {
      bootTimer.current = setTimeout(() => root.removeAttribute('data-boot'), 460);
    }

    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const i = PAGES.indexOf(pageRef.current);
        const n = (i + (e.key === 'ArrowRight' ? 1 : PAGES.length - 1)) % PAGES.length;
        go(PAGES[n])();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      // Read through the refs at teardown: startIntro swaps the timer array on
      // every replay, so a value captured here would go stale.
      introTimers.current.forEach(clearTimeout);
      introRafs.current.forEach(cancelAnimationFrame);
      if (pageTimer.current) clearTimeout(pageTimer.current);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      // StrictMode runs this effect twice in dev. Without clearing the attribute
      // here the second pass finds it already gone and never schedules a lower,
      // leaving the loader up for good.
      if (bootTimer.current) clearTimeout(bootTimer.current);
      document.documentElement.removeAttribute('data-boot');
    };
  }, [go, enterHome]);

  const chromeOp = page === 'home' && intro ? 0 : 1;
  // One loop for the background field, the cursor ring and the magnetism —
  // three effects reading a single pointer position, updated once per frame.
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return undefined;

    const root = document.documentElement;
    root.setAttribute('data-cursor', 'on');

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let rx = tx;
    let ry = ty;
    let armed = false;

    // State lives on <html> so both cursor parts read it from one class write.
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!armed) {
        // Jump the ring to the first known position instead of flying in
        // from the middle of the screen.
        armed = true;
        rx = tx;
        ry = ty;
        root.classList.add('sl-pointer-on');
      }
    };
    const onOut = () => root.classList.remove('sl-pointer-on');
    const onIn = () => { if (armed) root.classList.add('sl-pointer-on'); };
    const onOver = (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('a,button')) root.classList.add('sl-pointer-link');
      // The cursor is drawn in ink. Over an inked surface it would vanish, so
      // it flips to paper for as long as it is inside one.
      if (e.target.closest('[data-cursor-invert]')) root.classList.add('sl-pointer-invert');
    };
    const onLeaveTarget = (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('a,button')) root.classList.remove('sl-pointer-link');
      if (e.target.closest('[data-cursor-invert]')) root.classList.remove('sl-pointer-invert');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onOut);
    document.addEventListener('mouseenter', onIn);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onLeaveTarget);

    let raf = 0;
    const loop = () => {
      // Light answers the pointer. The original author's 0.055 trailed so far
      // behind the cursor that the whole page read as sluggish.
      cx += (tx - cx) * 0.11;
      cy += (ty - cy) * 0.11;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      }


      // The studio render drifts against the pointer. Entrance animations play
      // once and the page is inert again; this keeps answering for as long as
      // someone is on it. Null on every view but Studio. The entrance runs on
      // the wrapper, not here — two writers on one transform fight, and the
      // animation would win and pin the drift at zero.
      if (renderRef.current) {
        const nx = cx / window.innerWidth - 0.5;
        const ny = cy / window.innerHeight - 0.5;
        renderRef.current.style.transform =
          `translate3d(${(nx * -13).toFixed(1)}px,${(ny * -11).toFixed(1)}px,0)`;
      }

      // The dot is pinned exactly to the pointer — an aim point that lags reads
      // as a broken cursor. Only the ring is allowed to trail.
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      }
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      }

      for (let i = 0; i < magnetsRef.current.length; i += 1) {
        const m = magnetsRef.current[i];
        // Reads a cached centre. Measuring here would force a synchronous
        // layout for every magnet on every frame — the whole site felt slow
        // because of it.
        const dx = tx - m.cx;
        const dy = ty - m.cy;
        const near = dx * dx + dy * dy < MAGNET_RADIUS * MAGNET_RADIUS;
        if (near) {
          // Falls off to zero at the edge of the radius, otherwise the link
          // would jump ~20px the instant the cursor crossed the boundary.
          const f = (1 - Math.hypot(dx, dy) / MAGNET_RADIUS) * MAGNET_PULL;
          const nx = +(dx * f).toFixed(1);
          const ny = +(dy * f).toFixed(1);
          if (nx !== m.x || ny !== m.y) {
            m.x = nx;
            m.y = ny;
            if (!m.held) {
              m.held = true;
              m.el.style.transition = 'color .22s ease';
            }
            m.el.style.transform = `translate3d(${nx}px,${ny}px,0)`;
          }
        } else if (m.held) {
          // Eased on release, tracked directly on approach.
          m.held = false;
          m.x = 0;
          m.y = 0;
          m.el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1), color .22s ease';
          m.el.style.transform = '';
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onOut);
      document.removeEventListener('mouseenter', onIn);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onLeaveTarget);
      cancelAnimationFrame(raf);
      root.removeAttribute('data-cursor');
      root.classList.remove('sl-pointer-on', 'sl-pointer-link', 'sl-pointer-invert');
    };
  }, []);

  // Re-collected per view: each page renders its own set of magnetic links.
  // Centres are measured here, not in the frame loop, so the loop never has to
  // touch layout.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-magnetic]'));

    const measure = () => {
      magnetsRef.current = els.map((el) => {
        // Any pull already applied would otherwise be baked into the centre.
        el.style.transform = '';
        const r = el.getBoundingClientRect();
        return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2, x: 0, y: 0, held: false };
      });
    };

    measure();
    // The entrance animations are still moving these on the first pass, so take
    // the reading that matters once everything has landed.
    const settle = setTimeout(measure, 1200);
    window.addEventListener('resize', measure);

    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', measure);
      els.forEach((el) => { el.style.transform = ''; });
      magnetsRef.current = [];
    };
  }, [page]);

  const chromeTrans = intro ? 'none' : 'opacity .8s ease .5s';
  const chromeTransLate = intro ? 'none' : 'opacity .8s ease .62s';
  const homeTrans = homeMoving ? 'transform 1.05s cubic-bezier(.16,1,.3,1)' : 'none';
  const active = SERVICES[service] || SERVICES[0];

  return (
    <>
      {/* Sibling of .sl-root, not a child: the root is what fades out under the
          loader, and an element inside it would fade with it. Always in the
          markup so it is already painted when the head script marks the
          document — mounting it from React would be too late. */}
      <div className="sl-boot" aria-hidden="true">
        <img className="sl-boot-mark" src="/logo-light.png" alt="" />
        <span className="sl-boot-rail" />
      </div>

    <div className="sl-root">
      <div className="sl-bg" aria-hidden="true">
        <div className="sl-bg-glow" ref={glowRef} />
        <div className="sl-bg-grain" />
      </div>
      <div className="sl-cursor-dot" ref={cursorRef} aria-hidden="true">
        <i />
      </div>
      <div className="sl-cursor-ring" ref={ringRef} aria-hidden="true">
        <i />
      </div>

      <header className="sl-header" style={{ opacity: chromeOp, transition: chromeTrans }}>
        <a href="#home" onClick={go('home')} className="sl-brand">
          <img src="/logo-light.png" alt="Saleslights" />
        </a>
        <nav className="sl-nav">
          {TABS.map((t) => (
            <a
              key={t.key}
              href={'#' + t.key}
              onClick={go(t.key)}
              className={page === t.key ? 'is-active' : undefined}
            >
              {t.label}
            </a>
          ))}
        </nav>
      </header>

      <main ref={mainRef} className={'sl-main' + (fading ? ' is-leaving' : '')}>
        {/* Mounted on every page and hidden with a class rather than unmounted.
            Tearing down the <video> on each nav made the browser rebuild and
            re-decode it on the way back, which is the hitch you see returning
            to Home. Kept alive, the loop is simply revealed again. */}
        <div
          className={page === 'home' ? 'sl-hero-media' : 'sl-hero-media is-off'}
          aria-hidden="true"
        >
            <video
              className="sl-hero-video"
              ref={(el) => {
                if (!el) return;
                // React can leave the muted attribute out of the markup it
                // emits, and an unmuted video is never allowed to autoplay.
                // Setting it on the node is the only reliable way.
                el.muted = true;
                if (el.paused) el.play().catch(() => {});
              }}
              autoPlay
              loop
              playsInline
              preload="auto"
              poster="/hero-poster.webp"
            >
              <source src="/hero-loop.webm" type="video/webm" />
              <source src="/hero-loop.mp4" type="video/mp4" />
            </video>
            {/* Shown in place of the loop under reduced motion. A real element
                rather than a background on the wrapper, so it inherits the same
                box and the same left-edge fade as the video it replaces. */}
            <img className="sl-hero-poster" src="/hero-poster.webp" alt="" />
        </div>
        <div
          className={page === 'home' ? 'sl-hero-scrim' : 'sl-hero-scrim is-off'}
          aria-hidden="true"
        />

        {page === 'home' && (
          <div className="sl-grid sl-grid-home">
            <SplitHeadline
              innerRef={homeH1Ref}
              className="sl-h1"
              style={{ transform: homeT, transition: homeTrans, opacity: 1 }}
              reveal={revealHeadline}
              play={playHeadline}
              instant={homeInstant}
              text="We turn a good product into revenue."
            />
            <div className="sl-home-copy" style={{ opacity: chromeOp, transition: chromeTransLate }}>
              <p className="sl-lede">
                Saleslights is a New York based growth consultancy for teams that need pipeline, not
                advice. We build the go to market machine, run it, and report on it every week.
              </p>
              <div className="sl-cta-row">
                <a
                  href={CALENDLY_BOOK}
                  target="_blank"
                  rel="noopener"
                  className="sl-cta"
                  data-magnetic=""
                >
                  Book a call
                </a>
                <a href="#services" onClick={go('services')} className="sl-cta-sub" data-magnetic="">
                  See the services
                </a>
              </div>
            </div>
          </div>
        )}

        {page === 'founder' && (
          <div className="sl-stage">
            <SplitHeadline
              as="h2"
              className="sl-claim"
              reveal={revealHeadline}
              play
              text={FOUNDER.headline}
              fixedLines={FOUNDER.headlineLines}
            />
            <div className="sl-bars" aria-hidden="true">
              {[26, 38, 52, 44, 30, 20].map((h, i) => (
                <i key={i} style={{ height: `${h}px` }} />
              ))}
            </div>
            <div className="sl-floor" aria-hidden="true" />

            {/* The entrance rides a wrapper, not the image: the pointer loop
                writes transform to the img every frame, so an animation there
                would be overwritten on the first mouse move. Same split the
                Studio render uses. */}
            <div className="sl-figure">
              <div className="sl-fig-in">
                <img ref={renderRef} src="/nick-duotone.webp" alt="Nick Krause" />
              </div>
            </div>

            {/* Thesis, then the arc as a two-by-two so the notes can carry
                real detail without running off the screen, then the payoff the
                whole page has been building to. */}
            {/* Same lit panel the Services and Contact cards use, so all three
                pages share one object language instead of this page alone
                being bare hairlines. */}
            <div className="sl-ledger">
              <span className="sl-led-beam" aria-hidden="true" />
              <div className="sl-led-card">
              <p className="sl-thesis">{FOUNDER.lede}</p>
              <div className="sl-led-grid">
                {FOUNDER.career.map((c, i) => (
                  <div
                    key={c.at}
                    className="sl-led-row"
                    style={{
                      animation: `slin .8s ${(0.32 + i * 0.07).toFixed(2)}s cubic-bezier(.16,1,.3,1) both`,
                    }}
                  >
                    <div className="sl-led-head">
                      <span className="sl-led-at">{c.at}</span>
                      <b className="sl-led-num">{FOUNDER.ledger[i]}</b>
                    </div>
                    <p className="sl-led-note">{c.note}</p>
                  </div>
                ))}
              </div>
              <div className="sl-led-foot">
                <p className="sl-payoff">{FOUNDER.payoff}</p>
              </div>
              </div>
            </div>

            {/* No manufactured hero number. This bio has no single blockbuster
                figure — $7M is modest, $150M+ is a customer's size, 45 days
                needs a caption. What it has is names a reader recognises in
                under a second, which is faster credibility than any statistic
                here. The figures keep their place in the card, where they have
                the context that makes them mean something. */}
            <div className="sl-bigstat">
              <div className="sl-eyebrow">{FOUNDER.eyebrow}</div>
              <div className="sl-org-label">Work has spanned</div>
              <div className="sl-orgs">
                {FOUNDER.credentials.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>

          </div>
        )}

        {page === 'services' && (
          <div className="sl-grid">
            <div>
              <div className="sl-services-list">
                {SERVICES.map((s, i) => (
                  <button
                    type="button"
                    key={s.num}
                    onClick={() => pickService(i)}
                    onMouseEnter={() => hoverService(i)}
                    onFocus={() => pickService(i)}
                    aria-pressed={service === i}
                    className={'sl-service' + (service === i ? ' is-active' : '')}
                    style={{
                      animation: `slin .8s ${(i * 0.08).toFixed(2)}s cubic-bezier(.16,1,.3,1) both`,
                    }}
                  >
                    <span className="sl-service-num">{s.num}</span>
                    <span className="sl-service-title">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div key={'svc-' + service} className="sl-service-panel">
              {/* Same three-part rim as the Contact card: a ring, a light
                  rotating behind it, and the panel on top masking the middle,
                  so only the edge is ever lit. */}
              <span className="sl-service-beam" aria-hidden="true" />
              <div className="sl-service-card">
                <p className="sl-service-body">{active.body}</p>
                <div className="sl-points">
                  {active.points.map((pt) => (
                    <div key={pt} className="sl-point">
                      {pt}
                    </div>
                  ))}
                </div>
                <a href="#contact" onClick={go('contact')} className="sl-service-cta" data-magnetic="">
                  Talk to us about this
                </a>
              </div>
            </div>
          </div>
        )}

        {page === 'studio' && (
          <div className="sl-grid sl-grid-studio">
            <div className="sl-studio-render">
              <div className="sl-studio-render-in">
                <img
                  ref={renderRef}
                  src="/studio-render.webp"
                  alt="Isometric cutaway of the Saleslights studio floor, divided into strategy, authority, outreach and pipeline zones"
                />
              </div>
            </div>
            <div className="sl-studio-copy">
              <SplitHeadline
                as="h2"
                className="sl-h2"
                reveal={revealHeadline}
                play
                text="Inside the Studio"
              />
              <p className="sl-studio-lede">{STUDIO_LEDE}</p>
              <div className="sl-pillars">
                {STUDIO_PILLARS.map((p, i) => (
                  <div
                    key={p.key}
                    className="sl-pillar"
                    style={{
                      animation: `slin .8s ${(0.34 + i * 0.09).toFixed(2)}s cubic-bezier(.16,1,.3,1) both`,
                    }}
                  >
                    <span className="sl-pillar-icon" aria-hidden="true">
                      {PILLAR_ICONS[p.key]}
                    </span>
                    <div className="sl-pillar-text">
                      <div className="sl-pillar-title">{p.title}</div>
                      <p className="sl-pillar-body">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {page === 'contact' && (
          <div className="sl-grid">
            <div>
              <SplitHeadline
                as="h2"
                className="sl-contact-h2"
                reveal={revealHeadline}
                play
                text="Tell us what you sell and who buys it."
              />
              <div className="sl-h2-rule" aria-hidden="true" />
              <p className="sl-contact-p">
                Twenty minutes, no deck. You will leave knowing whether we can move your pipeline and
                what it would take.
              </p>
              {/* The face belongs on the surface where someone decides whether
                  to give up half an hour, not on a page they may never open. */}
              <div className="sl-who">
                <div className="sl-who-photo">
                  <img src="/nick-krause.png" alt="Nick Krause" />
                </div>
                <div className="sl-who-text">
                  <div className="sl-who-name">Nick Krause</div>
                  <div className="sl-who-role">Founder</div>
                  <a href={LINKEDIN} target="_blank" rel="noopener" className="sl-who-link">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <div className="sl-book-frame">
              <span className="sl-book-beam" aria-hidden="true" />
              <div className="sl-book">
              <p className="sl-book-brand">Saleslights</p>
              <p className="sl-book-title">30 minutes with Nick Krause</p>
              <p className="sl-book-role">Founder</p>
              <div className="sl-book-rows">
                <div className="sl-book-row">
                  <span>Duration</span>
                  <b>30 min</b>
                </div>
                <div className="sl-book-row">
                  <span>Format</span>
                  <b>Web conferencing</b>
                </div>
              </div>
              <p className="sl-book-meta">
                Web conferencing details provided upon confirmation.
              </p>
              <a
                href={CALENDLY_BOOK}
                target="_blank"
                rel="noopener"
                className="sl-book-cta"
                data-magnetic=""
              >
                Choose a time
              </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="sl-logos">
        <div className="sl-logos-inner">
          {slots.map((sl, i) => {
            const b = BRANDS[sl.idx];
            return (
              <div key={i} className="sl-logo-slot">
                <div
                  role="img"
                  aria-label={b.alt}
                  title={b.alt}
                  className={`sl-logo${sl.visible ? '' : ' is-out'}`}
                  style={{
                    width: b.w,
                    height: b.h,
                    backgroundImage: `url("/brand-orange/${b.id}.png")`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <footer className="sl-footer" style={{ opacity: chromeOp, transition: chromeTrans }}>
        <span />
        <div className="sl-footer-links">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span>2026</span>
        </div>
      </footer>
    </div>
    </>
  );
}
