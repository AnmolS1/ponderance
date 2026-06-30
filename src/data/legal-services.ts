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
export type Status = 'live' | 'beta' | 'planned';

export interface LegalService {
  id: string;
  name: string;
  url?: string;
  status: Status;
  audience: Audience;
  hosting: 'cloudflare' | 'self-hosted' | 'desktop';
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
      'TODO confirm before publish. Sensitive: face recognition + photo location. All ML runs locally on Anmol’s server and is not sent to any third party; Cloudflare only carries traffic.',
  },
  {
    id: 'ntfy',
    name: 'ntfy',
    url: 'https://ntfy.ponderance.dev',
    status: 'live',
    audience: 'invited',
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
      'TODO confirm what ntfy actually stores and whether topics are auth’d or open; if it ends up personal-only, set audience to "household" to drop it from the public pages.',
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
    notes: 'TODO confirm scopes + whether anything is persisted before going live.',
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
    auth: 'oidc', // TODO confirm provider (likely Google) when sign-in is added
    collects: ['account/identity once sign-in is added', 'STL files you upload and the repair-job metadata'],
    subprocessors: ['cloudflare'],
    userContent: true,
    notes: 'TODO confirm auth provider + storage (uses an S3-compatible store + Postgres job queue).',
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
