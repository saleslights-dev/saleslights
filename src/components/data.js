export const PAGES = ['home', 'founder', 'services', 'studio', 'contact'];

// Slots in the client strip. Fewer than BRANDS, which is what leaves a pool for
// the swapper to draw from.
// Five, not seven. The swapper picks a replacement from the brands NOT
// currently on screen, so with SLOT_COUNT equal to BRANDS.length the pool is
// empty and every slot fades out and back in showing the same logo -- a blink
// with no swap. Five on screen leaves a real pool of two.
export const SLOT_COUNT = 5;

export const TABS = [
  { label: 'Home', key: 'home' },
  // Second, not last. If the asset is the operator, the credibility has to land
  // before the pitch rather than after it.
  { label: 'Founder', key: 'founder' },
  { label: 'Services', key: 'services' },
  { label: 'Studio', key: 'studio' },
  { label: 'Contact', key: 'contact' },
];

// w/h are the box the mark fills inside its slot — they differ per logo so
// wordmarks and stacked marks read at the same optical weight.
// The real client list. The previous nine were logos of companies that were
// never Saleslights clients, which Nick flagged directly.
//
// Only AdRem and Video Funker publish a usable wordmark; the other five expose
// nothing but a square favicon, so those are set typographically in one weight
// and one colour rather than faked up from icons. Dropping a real logo in at
// public/brand-orange/<id>.png replaces any of them with no code change.
//
// h is tuned per mark, not shared: the marks have different aspect ratios and
// a single value would make the long ones tower over the short ones.
export const BRANDS = [
  // The real client list, using each company's OWN logo pulled from their site.
  // Files are whatever the source published -- SVG where the site inlines or
  // serves one, PNG otherwise -- so `file` carries the extension rather than it
  // being assumed. They are masked, not drawn, so their source colours do not
  // matter and a replacement needs no editing first.
  //
  // h differs a lot here because two of these are square marks and five are
  // wordmarks; a shared value would make the square ones tiny.
  { id: 'adrem', file: 'adrem.svg', alt: 'AdRem', w: '100%', h: '62%' },
  { id: 'thesherpa', file: 'thesherpa.png', alt: 'The Sherpa', w: '100%', h: '86%' },
  { id: 'parcle', file: 'parcle.svg', alt: 'Parcle', w: '100%', h: '52%' },
  { id: 'findurlawyer', file: 'findurlawyer.png', alt: 'FindUrLawyer', w: '100%', h: '54%' },
  { id: 'videofunker', file: 'videofunker.png', alt: 'Video Funker', w: '100%', h: '52%' },
  { id: 'valdera', file: 'valdera.svg', alt: 'Valdera', w: '100%', h: '48%' },
  { id: 'siguro', file: 'siguro.svg', alt: 'Siguro', w: '100%', h: '50%' },
];

// Drawn from the founder bio. The page is one fixed screen, so this is the
// distillation rather than the whole document: the arc on the left, the three
// numbers that carry it on the right.
// Drawn from the founder bio. Earlier passes kept the driest facts and cut the
// document's best writing to make things fit; these are the lines that actually
// carry it, with the concrete proof restored.
export const FOUNDER = {
  eyebrow: 'Founder, Saleslights · GTM Engineer · Entrepreneur',
  headline: 'Built by an Operator. Not an Agency.',
  // Set explicitly: measured wrapping puts "Not" on the second line, which the
  // portrait then cuts to "OPERATOR. NO".
  // Four lines, not three. At full size "Not an Agency." is ~624px and the
  // figure's opaque body begins around 510, so it was still being cut to
  // "NOT AN AGEN". Split, every line clears the portrait and reads whole.
  headlineLines: ['Built by an', 'Operator.', 'Not an', 'Agency.'],
  // The PDF's triple "He had been…" is a crescendo that works after three
  // paragraphs of narrative. At the top of a page it opens on a pronoun with no
  // antecedent, in past perfect with nothing before it. Same idea, stated once.
  lede:
    "Nick Krause has spent his career figuring out how complex technology gets bought — as the enterprise seller, as the advisor, and as the founder who lived with the consequences when a GTM strategy didn't work.",
  payoff: 'Saleslights is the product of those experiences.',
  career: [
    {
      at: 'Enterprise technology sales',
      note:
        'Washington D.C. A book from zero — including one of the largest cloud infrastructure transactions of its kind, for a genomics organisation managing hundreds of petabytes.',
    },
    {
      at: 'Forrester Research',
      note:
        'A multimillion-dollar government practice from no existing book — DHS, ICE and CBP. Biometric Entry/Exit research designed to save taxpayers millions.',
    },
    {
      // The client is not named on the record. Nick's instruction, and the work
      // described below is why: JSOC, Navy SEALs and Apache training.
      at: 'Top Secret Defense Contractor',
      note:
        'Founded 2021 on CMMC and government cybersecurity. Seven people and a $150M+ defense contractor supporting JSOC, Navy SEALs and Apache training. Acquired.',
    },
    {
      at: 'Saleslights',
      note:
        "Positioning through to revenue as one GTM operating system. The objective isn't activity — it's commercial movement.",
    },
  ],
  ledger: ['$0 → $7M', 'Multimillion', '$150M+', 'Now'],
  stats: [
    // The hero is the one metric that does not age. $7M is fixed at a job he
    // left; 45 days is what the method produces now and stays true — or
    // improves — as the business grows. The historical figures keep their
    // place in the card.
    {
      value: '45 days',
      label: 'From engagement to enterprise conversations — with organisations including MLB, BNY and Travelers.',
    },
    { value: '$150M+', label: 'Defense contractor won and later acquired' },
    { value: '45 days', label: 'To enterprise conversations on new engagements' },
  ],
  credentials: [
    'Forrester', 'DHS', 'ICE', 'CBP', 'NIST', 'SPAWAR', 'MLB', 'BNY', 'Travelers',
  ],
};

export const SERVICES = [
  {
    num: '01',
    title: 'Cold calling that books meetings',
    body: 'Trained callers work your list every day. We rewrite the scripts each week based on what earns a yes.',
    points: [
      'Dedicated callers, never a shared pool',
      'List building and data verification',
      'Calls recorded, objections logged',
      'Meetings booked into your calendar',
    ],
  },
  {
    num: '02',
    title: 'Personalised outreach, automated',
    body: 'Sequences triggered by real buying signals, written per account instead of per template.',
    points: [
      'Signals: hiring, funding, tooling changes',
      'Email and LinkedIn in one sequence',
      'Deliverability infrastructure managed for you',
      'Every account read by a human before send',
    ],
  },
  {
    num: '03',
    title: 'AI-enabled search',
    body: 'Content and technical work built to rank in search and get cited by answer engines. We publish it and keep iterating.',
    points: [
      'Entity and topic architecture',
      'Programmatic pages at scale',
      'Technical fixes shipped, not recommended',
      'Measured against pipeline, not traffic',
    ],
  },
  {
    num: '04',
    title: 'Product maintenance and upkeep',
    body: 'We keep the site fast, the funnel working and the integrations alive, so revenue stops leaking out of the back.',
    points: [
      'Landing pages and site performance',
      'Onboarding and lifecycle flows',
      'Integrations and analytics kept healthy',
      'A fixed monthly scope for ongoing fixes',
    ],
  },
  {
    num: '05',
    title: 'Revenue operations',
    body: 'A CRM that reflects reality, and reporting you can defend in a board meeting.',
    points: [
      'CRM setup, cleanup and routing',
      'Attribution and forecasting',
      'A written weekly report',
      'Playbooks documented and handed over',
    ],
  },
];

// The four zones the studio render is divided into. Copy is taken verbatim
// from the brand board so the page and the artwork say the same thing.
export const STUDIO_PILLARS = [
  {
    key: 'strategy',
    title: 'Strategy',
    body: 'We build your GTM strategy, buyer positioning, and content that earns attention.',
  },
  {
    key: 'authority',
    title: 'Authority',
    body: 'We create founder-led content that builds trust, credibility, and inbound momentum.',
  },
  {
    key: 'outreach',
    title: 'Outreach',
    body: 'We run targeted outbound across LinkedIn, email, and calls to open real conversations.',
  },
  {
    key: 'pipeline',
    title: 'Pipeline',
    body: "We book qualified meetings and provide weekly reporting on what's working.",
  },
];

export const STUDIO_LEDE =
  'A full-funnel growth engine built for authority and pipeline.';

export const CALENDLY_BOOK = 'https://calendly.com/nkrause-tvw8/30min?back=1&month=2026-08';
export const CALENDLY_EMBED =
  'https://calendly.com/nkrause-tvw8/30min?hide_gdpr_banner=1&hide_landing_page_details=1&background_color=f6f5f1&text_color=171614&primary_color=171614';
export const LINKEDIN = 'https://linkedin.com/in/nicholas-krause';
export const EMAIL = 'nkrause@saleslights.com';
