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
    summary: 'A browser drawing toy with an optional saved gallery.',
    auth: 'google',
    collects: [
      'Google profile shared at sign-in: name, email, profile picture, Google account id (no password)',
      'saved pieces: stroke data, a rendered image, your title, chosen visibility, timestamps',
    ],
    subprocessors: ['google', 'cloudflare'],
    userContent: true,
    publicSharing: true,
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
      'payments: subscription billing is handled by Lemon Squeezy on the web and by Apple In-App Purchase on iOS; we receive only the confirmation and status needed to unlock Plus, never your card details',
    ],
    subprocessors: ['google', 'gemini', 'apple', 'lemonsqueezy', 'cloudflare'],
    notes:
      'Operated by Anmol Saxena (sole operator, pre-LLC). Web app on Cloudflare plus a native iOS app. Calendar images go to Gemini only for OCR and are deleted within 24h; extracted event content is never stored server-side. Sign-in via Google and Apple. Payments via Lemon Squeezy (web) and Apple In-App Purchase (iOS).',
  },
  {
    id: 'homelab-glance',
    name: 'Homelab Glance',
    url: 'https://github.com/AnmolS1/homelab-glance',
    status: 'beta',
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
    status: 'beta',
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
    id: 'audio-visualizer',
    name: 'Audio Visualizer',
    url: 'https://github.com/AnmolS1/audio_visualizer',
    status: 'planned',
    audience: 'public',
    hosting: 'cloudflare',
    summary: 'A Spotify-aware visualizer that follows your playback in real time.',
    auth: 'spotify',
    collects: [
      'Spotify profile shared at sign-in',
      'your currently-playing track and playback position (read in real time, not stored)',
    ],
    subprocessors: ['spotify', 'cloudflare'],
    notes: 'no secure scopes needed',
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
];

export interface SubProcessor {
  id: string;
  name: string;
  role: string;
  privacy: string;
  dataPolicy?: string;
}

export const SUBPROCESSORS: Record<string, SubProcessor> = {
  google: {
    id: 'google',
    name: 'Google LLC',
    role: 'Sign-in (OAuth) for services that offer Google login',
    privacy: 'https://policies.google.com/privacy',
    dataPolicy: 'https://developers.google.com/terms/api-services-user-data-policy',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify AB',
    role: 'Sign-in and playback data for the Audio Visualizer',
    privacy: 'https://www.spotify.com/legal/privacy-policy/',
    dataPolicy: 'https://developer.spotify.com/policy',
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare, Inc.',
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
    role: 'Text recognition (OCR) on Plus-tier calendar images for Calque; images are deleted within 24 hours and are not used to train models on the paid API',
    privacy: 'https://policies.google.com/privacy',
    dataPolicy: 'https://ai.google.dev/gemini-api/terms',
  },
  apple: {
    id: 'apple',
    name: 'Apple Inc.',
    role: 'Sign in with Apple and In-App Purchase billing on iOS for Calque',
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
