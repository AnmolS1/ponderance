// Registry that drives /privacy and /terms. One entry per user-facing product.
// The pages render a service only when: status !== 'planned' && audience !== 'household'.
// Adding a product later = add an entry here (+ a SUBPROCESSORS / PROVIDER_DISCLOSURES entry if
// it brings a new processor or sign-in provider), then flip status to 'live'. No page redesign.
//
// Not listed here, on purpose:
//  • Infra only Anmol touches — Sonarr, Radarr, Prowlarr, Lidarr, Bazarr, qBittorrent, Gluetun,
//    Flaresolverr, Mosquitto, Zigbee2MQTT, Pi-hole, Home Assistant, Portainer, Beszel, etc.
//  • Local desktop tools that keep no data for us — Spotify2MP3, spoti_data.

export type AuthProvider =
  | 'none' // no accounts (draw-and-download, open page)
  | 'local' // the app's own username/password (Jellyfin, Immich)
  | 'google' // Google OAuth  → triggers the Google Limited-Use disclosure
  | 'spotify' // Spotify OAuth → triggers the Spotify Developer-Policy disclosure
  | 'cloudflare-access' // Cloudflare Access identity
  | 'oidc'; // generic OpenID Connect

export type Audience = 'public' | 'invited' | 'household';
// 'device' = a native client app that runs entirely on the user's device and has no
// backend of ours; it talks only to a server the user themselves runs.
export type Status = 'live' | 'beta' | 'planned';

/** Where money is taken for a paid tier. Drives the per-storefront cancel/refund prose. */
export type Storefront = 'apple' | 'lemonsqueezy';

/**
 * An OPTIONAL paid tier, as data rather than prose. /terms derives its subscriptions clause
 * from this, and /support interpolates `price` — so the number lives in exactly one place.
 * Adding a second paid product is an entry here, not an edit to either page.
 *
 * IMPORTANT: the presence of this field means the service *offers* a subscription, NOT that
 * the service costs money. Every service here is free to use; Calque is free to download
 * (App Store price $0.00, no non-subscription in-app purchases — checked against App Store
 * Connect 2026-07-28) and Plus is an add-on. Prose derived from this must not imply
 * otherwise, which is exactly the mistake the first draft of §01 made.
 */
export interface Commercial {
  /** e.g. 'Calque Plus' */
  plan: string;
  /**
   * Human price line covering every length the subscription is sold in:
   * '$2.99/month or $23.99/year'. Mirrors the ASC subscription group — Calque Plus is one
   * group with two auto-renewable SKUs (calque_plus_monthly, calque_plus_yearly).
   */
  price: string;
  /** What the paid tier actually provides, one line. */
  provides: string;
  /** Where money is taken, and therefore who handles refunds. */
  storefronts: Storefront[];
}

export interface LegalService {
  id: string;
  name: string;
  url?: string;
  status: Status;
  audience: Audience;
  hosting: 'cloudflare' | 'self-hosted' | 'desktop' | 'device';
  /** One plain-English line for the per-service block heading. */
  summary: string;
  auth: AuthProvider;
  /** Personal data this service actually touches — keep specific and true. */
  collects: string[];
  /** ids into SUBPROCESSORS below. */
  subprocessors: string[];
  userContent?: boolean; // user creates/uploads/stores content
  publicSharing?: boolean; // public gallery / shareable links / remix
  /** Set only on a service with a paid tier. Absent === free. */
  commercial?: Commercial;
  /**
   * End-to-end encrypted: the server holds ciphertext it cannot read. A flag rather than
   * an inference from `notes`, because /terms has to branch on it — the standard
   * "licence to display your content" grant is impossible for an E2EE service, and
   * asserting it would contradict the product's whole claim.
   */
  e2ee?: boolean;
  notes?: string; // anything special (e.g. Immich face data)
}

export const SERVICES: LegalService[] = [
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    url: 'https://kaleidoscope.ponderance.dev',
    status: 'live',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'A drawing toy with an optional saved gallery — in the browser and as an iPhone & iPad app.',
    // Two sign-in providers: Google on the web, Google or Apple in the iOS app. The registry's
    // `auth` is single-valued, so it stays 'google' to render the required Google Limited-Use
    // disclosure; Apple sign-in is disclosed in `collects` and in the `apple` sub-processor.
    auth: 'google',
    collects: [
      'Google profile shared at sign-in: name, email, profile picture, Google account id (no password)',
      'Sign in with Apple, offered in the iOS app: the account identifier Apple issues, plus the name and email you choose to share (Apple can relay a private address instead of your real one). No password reaches us',
      'saved pieces: stroke data, a rendered image, your title, chosen visibility, timestamps',
    ],
    subprocessors: ['google', 'apple', 'cloudflare'],
    userContent: true,
    publicSharing: true,
    notes:
      'One account and one gallery behind both front ends: the iOS app talks to the same Cloudflare backend as the website. Signing in with Apple in the app and Google on the web creates two separate accounts.',
  },
  {
    id: 'calque',
    name: 'Calque',
    url: 'https://calque.ponderance.dev',
    status: 'live',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'Turn a photo of a paper calendar into device calendar events — on the web and as an iOS app.',
    // Two sign-in providers (Google + Apple); the registry's `auth` is single-valued, so it is set to
    // 'google' to render the required Google Limited-Use disclosure, and Apple sign-in is disclosed in
    // `collects` and in the `apple` sub-processor. `userContent` is intentionally left unset: extracted
    // events are never stored on our servers, so the "licence to host your content" terms note must not apply.
    auth: 'google',
    collects: [
      'account: your Google or Apple sign-in — the provider shares basic profile fields such as name, email, and an account identifier; no password reaches us',
      'Plus-tier scans: the calendar image you upload is sent to Google Gemini for text recognition (OCR) and is deleted from our servers within 24 hours',
      'extracted events (titles, dates, and times) are never stored on our servers — they live only on your device or in your browser',
      'optional Google Calendar connection: if you choose to add events straight to Google Calendar, we store an OAuth token scoped only to calendar.events (never a password) so events can be written on your behalf; you can revoke it any time in the app or at myaccount.google.com, and the events are written directly to your calendar, never stored on our servers',
      'payments: subscription billing is handled by Lemon Squeezy on the web and by Apple In-App Purchase on iOS; we receive only the confirmation and status needed to unlock Plus, never your card details',
    ],
    subprocessors: ['google', 'gemini', 'apple', 'lemonsqueezy', 'cloudflare'],
    commercial: {
      plan: 'Calque Plus',
      price: '$2.99/month or $23.99/year',
      provides: 'cloud text recognition, with 200 scans a month',
      storefronts: ['apple', 'lemonsqueezy'],
    },
    notes:
      'Operated by Anmol Saxena (sole operator, pre-LLC). Web app on Cloudflare plus a native iOS app. Calendar images go to Gemini only for OCR and are deleted within 24h; extracted event content is never stored server-side. Sign-in via Google and Apple. Optional Google Calendar export stores a calendar.events-scoped OAuth token (revocable in-app or at myaccount.google.com); events are inserted directly and never stored server-side. Payments via Lemon Squeezy (web) and Apple In-App Purchase (iOS).',
  },
  {
    id: 'homelab-glance',
    name: 'Homelab Glance',
    url: 'https://github.com/AnmolS1/homelab-glance',
    status: 'live', // on sale on the App Store, iOS + macOS (id 6788969780)
    audience: 'public',
    hosting: 'device',
    summary:
      'An iOS & macOS dashboard for the open-source “glance” aggregator you run on your own server — cards, widgets, Live Activities, and container start/stop/restart. No account with us.',
    auth: 'none',
    collects: [
      'Nothing reaches us — Homelab Glance has no server of ours, no analytics, and no tracking.',
      'On your device only: the server address and access/control tokens you enter (kept in the system Keychain) and your card/widget layout, shared with the app’s widgets through a private App Group.',
      'The app connects only to the glance server you run; that traffic goes straight to your own machine.',
    ],
    subprocessors: [],
    notes:
      'Native client app; no backend of ours. The aggregator it talks to is open-source and self-hosted by you. Ships with a demo mode so every screen works with sample data and never needs a server.',
  },
  {
    id: 'foldlight',
    name: 'FoldLight',
    url: 'https://github.com/AnmolS1/FoldLight',
    status: 'live', // on sale on the App Store, iOS + macOS (id 6789642391)
    audience: 'public',
    hosting: 'device',
    summary:
      'A widget-first iOS & macOS app that controls the lights on your own Home Assistant server. No account with us.',
    auth: 'none',
    collects: [
      'Nothing reaches us — FoldLight has no server of ours, no analytics, and no tracking.',
      'On your device only: the Home Assistant address and access token you enter (token kept in the system Keychain) and your widget/preset preferences, shared with the app’s widgets through a private App Group.',
      'The app connects only to the Home Assistant server you point it at; that traffic goes straight to your own machine.',
    ],
    subprocessors: [],
    notes:
      'Native client app; no backend of ours. Ships with a demo mode so every screen and widget works with sample lights and never needs a server.',
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    url: 'https://jellyfin.ponderance.dev',
    status: 'live',
    audience: 'invited',
    hosting: 'self-hosted',
    summary: 'A private media server for invited friends and family.',
    auth: 'local',
    collects: [
      'account: the username and password you set (stored hashed by Jellyfin)',
      'playback history, client/device info, and IP address for the session',
    ],
    subprocessors: ['cloudflare'],
    notes:
      'Self-hosted on Anmol’s hardware; Cloudflare only carries traffic (tunnel/CDN). The media libraries are Anmol’s; accounts exist so invited people can watch.',
  },
  {
    id: 'immich',
    name: 'Immich',
    url: 'https://immich.ponderance.dev',
    status: 'live',
    audience: 'invited',
    hosting: 'self-hosted',
    summary: 'A private photo library for invited friends and family.',
    auth: 'local',
    collects: [
      'account: the username and password you set (stored hashed by Immich)',
      'photos and videos you upload, plus their embedded metadata (including EXIF location, if present)',
      'machine-learning–derived data computed on our own server: face groupings and search features',
    ],
    subprocessors: ['cloudflare'],
    userContent: true,
    notes:
      'Sensitive: face recognition + photo location. All ML runs locally on Anmol’s server and is not sent to any third party; Cloudflare only carries traffic.',
  },
  {
    id: 'ntfy',
    name: 'ntfy',
    url: 'https://ntfy.ponderance.dev',
    status: 'live',
    audience: 'household',
    hosting: 'self-hosted',
    summary: 'A lightweight push-notification service.',
    auth: 'local',
    collects: [
      'account/topic access you’re given',
      'notification messages you publish and device tokens used to deliver them',
      'IP address for delivery',
    ],
    subprocessors: ['cloudflare'],
    notes:
      'ntfy is personal-only, audience is "household" to drop it from the public pages.',
  },

  // ── Coming online (auth being added) — kept here so launch is just `status: 'live'`. ──
  {
    id: 'antinode',
    name: 'Antinode',
    url: 'https://antinode.ponderance.dev',
    status: 'planned', // T12 in antinode-plan flips this to 'live' on launch day
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'A music visualizer that listens in your browser and gives the sound a shape.',
    auth: 'spotify',
    collects: [
      'the audio you let it hear: a dropped file, your mic, a loopback device, or a shared browser tab. Analyzed in your browser for levels and rhythm, drawn to the screen, and let go. Never recorded, never sent anywhere, there is no server to send it to',
      'if you connect Spotify (optional, and capped by Spotify at a handful of invited accounts): the profile Spotify shares at sign-in, plus your currently-playing track and position, read about once a second to label and sync the visuals. Read and dropped, not stored',
      'sign-in tokens live in your browser and nowhere else. There is no account with us',
    ],
    subprocessors: ['spotify', 'cloudflare'],
    notes:
      'A static page on Cloudflare, nothing of yours passes through it. The visualizer needs no account and works with any audio you can route into it. Spotify connect exists so it can name what you are hearing, and Spotify limits development apps to five invited accounts, so that part is invite-only. Not our choice. Formerly listed here as Audio Visualizer.',
  },
  {
    id: 'sister-isles',
    name: 'Sister Isles',
    status: 'planned',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'A cozy multiplayer life-sim; each island is a Cloudflare Durable Object.',
    auth: 'cloudflare-access',
    collects: ['identity from Cloudflare Access', 'your island/session state stored in Cloudflare D1'],
    subprocessors: ['cloudflare'],
  },
  {
    id: 'ironshell',
    name: 'IronShell',
    url: 'https://github.com/AnmolS1/IronShell',
    status: 'planned',
    audience: 'public',
    hosting: 'self-hosted',
    summary: 'A web service that repairs broken 3D-print STL meshes.',
    auth: 'google',
    collects: ['account/identity once sign-in is added', 'STL files you upload and the repair-job metadata'],
    subprocessors: ['cloudflare'],
    userContent: true,
    notes: 'uses an S3-compatible store + Postgres job queue.',
  },
  {
    id: 'clowder',
    name: 'Clowder',
    status: 'planned',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'A co-op survival game about a clowder of cats.',
    auth: 'oidc', // TODO confirm when multiplayer accounts land
    collects: ['account/identity once accounts are added', 'game/save state'],
    subprocessors: ['cloudflare'],
    notes: 'TODO concept stage; revisit data when it has real accounts.',
  },
  {
    id: 'weeboweebo',
    name: 'weeboweebo',
    status: 'live',
    audience: 'household',
    hosting: 'cloudflare',
    summary: 'A private rich-communication app for Anmol’s family.',
    auth: 'local',
    collects: ['messages and family account info'],
    subprocessors: ['cloudflare'],
    notes:
      'household-only → excluded from the public pages by the render rule. Listed for completeness; flip audience to "invited" only if it’s ever opened beyond family.',
  },
  {
    id: 'flatfold',
    name: 'FlatFold',
    url: 'https://flatfold.ponderance.dev',
    status: 'live',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'An end-to-end encrypted messenger. The server stores no messages it can read.',
    auth: 'local',
    // Deliberately specific: for an E2EE product the substantive claim is what
    // is NOT here. No message plaintext, no contact lists, no IP logs.
    collects: [
      'account: your username, a verifier derived from your password (never the password itself), and when the account was made',
      'the public keys you publish, so other people can start an encrypted conversation with you',
      'messages waiting to be delivered, as ciphertext nobody here can read. Deleted once your device confirms it got them, and in every case within 14 days',
      'attachments, encrypted, under random ids. Deleted once the recipient fetches them',
      'a push subscription from your browser, if you turn notifications on. The notification carries no message content',
      'the time a waiting message arrived, rounded to the minute',
    ],
    subprocessors: ['cloudflare'],
    userContent: true,
    publicSharing: false,
    e2ee: true,
    notes:
      'Your messages, your contact list and your history are encrypted on your device with a key derived from your password, and they never leave it. The server cannot read them, and neither can Anmol. The honest cost of that: forget your password and it is gone, because there is no key escrow, no backup and no reset. You add people by typing their exact username, so there is no directory to browse. IPs are never logged. The /transparency page and docs/THREAT_MODEL.md in the public repo spell out what this design gives up in exchange.',
  },
];

export interface SubProcessor {
  id: string;
  /** Legal entity name, shown in the Services table. */
  name: string;
  /**
   * Name for running prose, where the legal entity reads badly — a comma-separated
   * sentence containing "Cloudflare, Inc." is ambiguous about where the list breaks.
   * Falls back to `name`.
   */
  short?: string;
  role: string;
  privacy: string;
  dataPolicy?: string;
}

export const SUBPROCESSORS: Record<string, SubProcessor> = {
  google: {
    id: 'google',
    name: 'Google LLC',
    short: 'Google',
    role: 'Sign-in (OAuth) for services that offer Google login',
    privacy: 'https://policies.google.com/privacy',
    dataPolicy: 'https://developers.google.com/terms/api-services-user-data-policy',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify AB',
    short: 'Spotify',
    role: 'Sign-in and playback metadata for Antinode',
    privacy: 'https://www.spotify.com/legal/privacy-policy/',
    dataPolicy: 'https://developer.spotify.com/policy',
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare, Inc.',
    short: 'Cloudflare',
    role: 'Hosting, database (D1), object storage (R2), CDN/tunnel, bot-protection (Turnstile), and cookieless Web Analytics',
    privacy: 'https://www.cloudflare.com/privacypolicy/',
  },
  resend: {
    id: 'resend',
    name: 'Resend',
    role: 'Delivers contact-form email',
    privacy: 'https://resend.com/legal/privacy-policy',
  },
  gemini: {
    id: 'gemini',
    name: 'Google (Gemini API)',
    short: 'Google Gemini',
    role: 'Text recognition (OCR) on Plus-tier calendar images for Calque; images are deleted within 24 hours and are not used to train models on the paid API',
    privacy: 'https://policies.google.com/privacy',
    dataPolicy: 'https://ai.google.dev/gemini-api/terms',
  },
  apple: {
    id: 'apple',
    name: 'Apple Inc.',
    short: 'Apple',
    role: 'Sign in with Apple in the iOS apps (Calque, Kaleidoscope), and In-App Purchase billing on iOS for Calque',
    privacy: 'https://www.apple.com/legal/privacy/',
  },
  lemonsqueezy: {
    id: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    role: 'Merchant of record and payment processor for Calque’s web (Plus) subscriptions',
    privacy: 'https://www.lemonsqueezy.com/privacy',
  },
};

// Provider → the affirmation block the privacy page renders for any LIVE service using it.
export const PROVIDER_DISCLOSURES: Partial<Record<AuthProvider, { label: string; link: string; body: string }>> = {
  google: {
    label: 'Google sign-in',
    link: 'https://developers.google.com/terms/api-services-user-data-policy',
    body: 'Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including its Limited Use requirements: we do not use Google user data to serve advertising, to determine creditworthiness or for lending; we do not sell it to data brokers or others; and we do not use it to develop, train, or improve generalized AI or machine-learning models.',
  },
  spotify: {
    label: 'Spotify sign-in',
    link: 'https://developer.spotify.com/policy',
    body: 'Where you connect Spotify, we follow the Spotify Developer Policy and use the Spotify data shared with us only to power the visualizer in real time; we do not store, sell, or repurpose it.',
  },
};

/** Services actually shown on /privacy and /terms. */
export const listedServices = (): LegalService[] =>
  SERVICES.filter((s) => s.status !== 'planned' && s.audience !== 'household');
