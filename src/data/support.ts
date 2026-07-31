// Registry that drives /support and /support/[app]. One entry per product a stranger
// might need help with. Identity (name, status, audience) is NOT restated here — it is
// read from legal-services.ts by `id`, so a product is described in exactly one place.
//
// A product gets a support page when it has an entry here AND its LegalService is
// neither `planned` nor `household`. Adding a product later = one entry + the existing
// legal registry entry. No page redesign.
//
// Everything written here is checked against the shipping app. If a step names a button,
// that button exists today. App Review guideline 1.5 rejects a support page that sends a
// reviewer to a control that isn't there.

import { SERVICES, type Commercial, type LegalService } from './legal-services';

/**
 * Paid-tier facts are read from legal-services.ts, never retyped. /terms has to state the
 * price verbatim for App Review guideline 3.1.2, so a second copy here is a copy that can
 * disagree with the binding one — and the support page is where a confused subscriber looks
 * first. Throws rather than falling back: a missing tier should fail the build, not render
 * a page that quietly omits the price.
 */
const commercialOf = (id: string): Commercial => {
  const c = SERVICES.find((s) => s.id === id)?.commercial;
  if (!c) throw new Error(`support.ts: service "${id}" has no commercial tier to quote`);
  return c;
};

const CALQUE_PLUS = commercialOf('calque');

export type Platform = 'ios' | 'ipados' | 'macos' | 'watchos' | 'web';

/** Chip label per platform — shared by the hub and the per-app page. */
export const PLATFORM_LABEL: Record<Platform, string> = {
  ios: 'iPhone',
  ipados: 'iPad',
  macos: 'Mac',
  watchos: 'Apple Watch',
  web: 'Web',
};

export interface SupportFAQ {
  q: string;
  /** 1–3 sentences. Plain English. Rendered as HTML — links, <code>, <strong> only. */
  a: string;
}

export interface SupportProcedure {
  title: string;
  /** Rendered as HTML, same narrow allowance as SupportFAQ.a. */
  steps: string[];
}

export interface SupportLink {
  label: string;
  href: string;
}

export interface SupportEntry {
  /** MUST match a LegalService.id in legal-services.ts. */
  id: string;
  /** One line in the user's words: what the app does for them. */
  blurb: string;
  platforms: Platform[];
  /** e.g. 'iOS 17 or later', 'Any modern browser', 'A glance server you run'. */
  requirements: string[];
  /** Where to get it / open it. App Store, TestFlight, web app, source. */
  links: SupportLink[];
  faqs: SupportFAQ[];
  /** Ordered fixes for the failures that actually happen. */
  troubleshooting?: SupportProcedure[];
  /** Paid tiers only. `manage` is a list of concrete steps per storefront. */
  billing?: { tiers: string; manage: SupportProcedure[]; refunds: string };
  /** How to delete an account / clear data. Required reading for anything with sign-in. */
  dataAndDeletion: string[];
  /** First-reply window shown next to the contact form. */
  responseTime: string;
  /** Rendered as HTML, same narrow allowance as SupportFAQ.a. */
  knownIssues?: string[];
}

/**
 * Real Apple IDs, read from App Store Connect (team G2KBQH7KWT) on 2026-07-28.
 * `https://apps.apple.com/app/id<ID>` 301s to the localized listing for an app that
 * is on sale, and 404s for one still in Prepare for Submission — so an id is listed
 * in an entry's `links` only once that app is actually live. A dead Support-URL link
 * is one of the things App Review rejects, so this list is a checklist, not a set of
 * links: when a state below changes, add the link to that entry and redeploy.
 *
 *   calque          — 1.0 Prepare for Submission  → NOT linked yet
 *   flatfold        — 1.0 Prepare for Submission (iOS + macOS) → NOT linked yet
 *   foldlight       — 1.0 on sale, iOS + macOS    → linked
 *   homelab-glance  — 1.1 on sale iOS + macOS; 1.2 iOS in review → linked
 *   kaleidoscope    — 1.1 on sale, iOS           → linked
 */
export const APP_STORE_ID: Record<string, string> = {
  calque: '6789638641',
  flatfold: '6793349838',
  foldlight: '6789642391',
  'homelab-glance': '6788969780',
  kaleidoscope: '6791431695',
};

/** Locale-neutral store URL; Apple redirects it to the visitor's storefront. */
export const appStoreUrl = (id: string): string => `https://apps.apple.com/app/id${APP_STORE_ID[id]}`;

/**
 * Calque's App Store listing. Null until the app is actually on sale: a placeholder
 * link that 404s is worse to a reviewer than no link at all. On approval, change this
 * to `appStoreUrl('calque')` and redeploy — the page renders the row only when set.
 */
export const CALQUE_APP_STORE_URL: string | null = null;

/** One shared first-reply promise — kept honest, and identical on every page. */
const REPLY_2_DAYS = 'A first reply within two business days, from anmol@ponderance.dev.';

export const SUPPORT: SupportEntry[] = [
  // ── Calque ──────────────────────────────────────────────────────────────────
  {
    id: 'calque',
    blurb:
      'Point your camera at a paper calendar; Calque reads the dates and hands you events you can drop into your own calendar.',
    platforms: ['ios', 'ipados', 'web'],
    requirements: [
      'iPhone or iPad running iOS 17 or later, for the app.',
      'Any modern browser, for the web app at calque.ponderance.dev.',
      'No account is needed to scan on your device. Sign in with Apple or Google only if you want Calque Plus, or the same plan in both places.',
      'Permission to add events, the first time you send a scan to a calendar on your device.',
    ],
    links: [
      ...(CALQUE_APP_STORE_URL ? [{ label: 'Calque on the App Store', href: CALQUE_APP_STORE_URL }] : []),
      { label: 'Calque on the web', href: 'https://calque.ponderance.dev' },
      { label: 'Privacy for Calque', href: 'https://ponderance.dev/privacy#svc-calque' },
      { label: 'Terms for Calque', href: 'https://ponderance.dev/terms#svc-calque' },
    ],
    faqs: [
      {
        q: 'What kind of photo works best?',
        a: 'Flatten the page, get the whole month grid inside the frame, and shoot straight down in even light. The two things that break a scan are a shadow falling across the grid and a page curling away at the spine.',
      },
      {
        q: 'The dates came out under the wrong month.',
        a: 'A paper grid often does not say which month it is in a way a camera can read. On the review screen, set the calendar’s month above the list — every event re-maps to it at once, so you fix this in one tap rather than event by event.',
      },
      {
        q: 'How does Calque decide between AM and PM?',
        a: 'When a time is written with no am/pm, Calque infers it from the words around it — breakfast reads as morning, dinner as evening. Any time it had to guess is drawn with a dashed underline; tap it to flip that event between AM and PM.',
      },
      {
        q: 'Does my photo leave my device?',
        a: 'On the free on-device engine, no — the image never leaves. On Calque Plus with the cloud engine, the image is sent to Google Gemini for text recognition and is deleted within 24 hours. Either way the events themselves are never stored on our servers.',
      },
      {
        q: 'Where do the events actually go?',
        a: 'Nowhere until you say so. From the review screen you either add the selected events to a calendar on your device, or share a standard <code>.ics</code> file you can open in any calendar app.',
      },
      {
        q: 'Why is my scan history missing on my other device?',
        a: 'History is local on purpose: on the phone it lives on the phone, on the web it lives in that one browser. It also prunes itself — the default keeps 7 days, and you can choose 1, 7, 30 days, or forever.',
      },
      {
        q: 'Where do I change how long history is kept?',
        a: 'On iPhone: Account → Scan history → Keep for. On the web: the History page. Changing it never uploads anything; it only decides when old scans are deleted from that device.',
      },
      {
        q: 'I bought Plus on my iPhone. Does it work on the web too?',
        a: 'Yes. Plus belongs to your Calque account rather than to one device, so sign in on the iPhone where you bought it and sign in on the web with that same Apple or Google account, and Plus follows you.',
      },
      {
        q: 'How do I restore a purchase?',
        a: 'Open the Plus screen in the app and tap <strong>Restore Purchases</strong>, making sure the iPhone is signed into the same Apple Account that paid. If it still says Free after a minute, use the steps under “Plus didn’t unlock after I paid”.',
      },
      {
        q: 'What does the free tier actually give me?',
        a: 'Unlimited scanning with the on-device engine, the full review-and-edit screen, adding to your calendars, and <code>.ics</code> export. Plus adds the cloud engine, which reads messier handwriting and awkward lighting, capped at 200 scans a month.',
      },
    ],
    troubleshooting: [
      {
        title: 'The scan found no events',
        steps: [
          'Tap Retake and shoot again flat-on, with the whole grid in frame and no shadow across it — this fixes most empty scans on its own.',
          'Check that the rows you care about are inside the frame; a month whose last week is cropped off comes back short, not wrong.',
          'If the handwriting is faint or slanted, switch engines: Account → Scan engine → Cloud (Plus). The cloud engine reads messier pages than the on-device one.',
          'Still empty? Email anmol@ponderance.dev and attach the photo — a page that defeats the parser is a bug worth seeing.',
        ],
      },
      {
        title: 'Plus didn’t unlock after I paid',
        steps: [
          'Open the Plus screen and tap Restore Purchases.',
          'Confirm the iPhone is signed into the same Apple Account that made the purchase — a family member’s Apple Account is the usual culprit.',
          'Give the receipt a minute and reopen the app; App Store receipts occasionally arrive late.',
          'If you are checking on the web, make sure you are signed into the same Calque account you used on the phone.',
          'Still Free? Email anmol@ponderance.dev with the purchase date and which store you bought from (App Store or the web), and it gets fixed by hand.',
        ],
      },
      {
        title: 'Events landed at the wrong time',
        steps: [
          'Look for a dashed underline on the time — that marks an AM/PM Calque had to infer. Tap it to flip the event by twelve hours.',
          'Check the month set above the review list; a right time under a wrong month reads as the wrong date.',
          'Tap the event to edit its time directly if the paper itself was ambiguous.',
          'If everything is uniformly off by whole hours, check the time zone of the device you added the events on — Calque writes local times into your calendar.',
        ],
      },
    ],
    billing: {
      tiers: `The free tier scans entirely on your device, with no account and no limit. ${CALQUE_PLUS.plan} is ${CALQUE_PLUS.price} and adds ${CALQUE_PLUS.provides}.`,
      manage: [
        {
          title: 'On iPhone or iPad',
          steps: [
            'In Calque: Account → Manage subscription, which opens Apple’s own subscription sheet.',
            'Or, outside the app: Settings → tap your name → Subscriptions → Calque → Cancel Subscription.',
            'Cancelling leaves Plus active until the end of the period you already paid for.',
          ],
        },
        {
          title: 'On the web',
          steps: [
            'Sign in at calque.ponderance.dev and go to Account → Manage subscription, which opens the Lemon Squeezy customer portal.',
            'Cancel or change the plan there; Lemon Squeezy is the merchant of record for web subscriptions.',
            'The button appears only if you bought on the web. If Plus came from the App Store, manage it on your iPhone instead — Apple, not Lemon Squeezy, holds that subscription.',
          ],
        },
      ],
      refunds:
        'App Store purchases are refunded by Apple, at reportaproblem.apple.com — Anmol genuinely cannot issue those. For a web subscription, email anmol@ponderance.dev and the refund is started through Lemon Squeezy.',
    },
    dataAndDeletion: [
      'Scan history lives on your device or in your browser, never on our servers, and deletes itself on the retention window you choose (1, 7, or 30 days, or forever; 7 by default).',
      'Extracted events — the titles, dates, and times — are never stored server-side. They exist on your device and in whatever calendar you add them to.',
      'Cloud (Plus) scans send the image to Google Gemini for text recognition, and it is deleted within 24 hours.',
      'Delete the whole account from Account → Delete account, in the app or on the web. That removes the sign-in record and the subscription link.',
      'Deleting your account does not cancel an App Store subscription — cancel that with Apple first, using the steps above.',
    ],
    responseTime: REPLY_2_DAYS,
    knownIssues: [
      'Adding events straight into Google Calendar in one tap is not switched on yet — it is waiting on Google’s review of the calendar permission. Until then, add events to a calendar on your device or share the <code>.ics</code> file from the review screen.',
    ],
  },

  // ── FoldLight ───────────────────────────────────────────────────────────────
  {
    id: 'foldlight',
    blurb:
      'Turn the lights on your own Home Assistant from a widget, without opening an app first.',
    platforms: ['ios', 'ipados', 'macos'],
    requirements: [
      'iPhone or iPad running iOS 17 or later, or a Mac running macOS 14 or later.',
      'A Home Assistant server you run and can reach from the device — FoldLight has no server of its own.',
      'A long-lived access token from Home Assistant (your profile → Security → Long-lived access tokens).',
      'Nothing at all, if you only want to look around: the bundled demo data makes every screen work with no server.',
    ],
    links: [
      { label: 'FoldLight on the App Store', href: appStoreUrl('foldlight') },
      { label: 'FoldLight on GitHub', href: 'https://github.com/AnmolS1/FoldLight' },
      { label: 'Privacy for FoldLight', href: 'https://ponderance.dev/privacy#svc-foldlight' },
      { label: 'Terms for FoldLight', href: 'https://ponderance.dev/terms#svc-foldlight' },
    ],
    faqs: [
      {
        q: 'Where do the server address and token go?',
        a: 'Settings → Home Assistant. The Base URL is the address you use in a browser (including the port, e.g. <code>https://homeassistant.local:8123</code>), and the token goes in Long-lived access token. The token is kept in the system Keychain, not in a file and not with us.',
      },
      {
        q: 'How do I make a token?',
        a: 'In Home Assistant, open your profile, go to the Security tab, and create a long-lived access token at the bottom. Copy it once — Home Assistant will not show it again.',
      },
      {
        q: 'I just want to see what it looks like.',
        a: 'Turn on Settings → Use mock data. Every screen and widget then runs on bundled sample lights and never contacts a server.',
      },
      {
        q: 'Why does my widget show old state?',
        a: 'iOS decides when a widget may refresh, so a widget can lag the app by minutes; tapping a control updates it immediately. If it is stuck rather than merely stale, open the app once — that re-shares fresh state with the widgets.',
      },
      {
        q: 'How do the widgets know my server?',
        a: 'The app and its widgets share one private App Group on your device, so the address, token, and your preferences are written once and read by both. Nothing crosses the network to get there.',
      },
      {
        q: 'It works at home but not on cellular.',
        a: 'That is the usual shape of a LAN-only Home Assistant. Either expose it properly over HTTPS, or put both your phone and your server on the same VPN or Tailscale network and use that address as the Base URL.',
      },
      {
        q: 'My light isn’t listed.',
        a: 'FoldLight lists every <code>light.*</code> entity your token can see. If one is missing, it is missing from Home Assistant’s side or the token lacks access to it — check it in Home Assistant first, then Settings → Test connection.',
      },
      {
        q: 'What do you know about my setup?',
        a: 'Nothing. There is no server of ours, no analytics, and no crash reporting, so a support email needs you to describe the symptom — what you tapped, what happened, and what Test connection says.',
      },
    ],
    troubleshooting: [
      {
        title: 'Test connection fails',
        steps: [
          'Open the same Base URL in a browser on the same device. If the browser cannot reach it, the app cannot either — this is a network problem, not an app problem.',
          'Include the scheme and port exactly as your browser does (<code>https://</code> or <code>http://</code>, and <code>:8123</code> if that is how you reach it).',
          'Re-paste the token: a token copied with a trailing space, or one that was revoked in Home Assistant, fails the same way.',
          'Toggle Use mock data on and off — if the app works on mock data, the app is fine and the connection is the problem.',
        ],
      },
      {
        title: 'A widget won’t respond to taps',
        steps: [
          'Open the app once and confirm the same light responds there.',
          'Check that the server is reachable from the device right now; a widget tap that cannot reach the server fails quietly.',
          'Remove the widget and add it again — this re-reads the shared configuration.',
          'On macOS, make sure the app has been launched at least once since installing, or the widget is never registered.',
        ],
      },
    ],
    dataAndDeletion: [
      'There is no account to delete — FoldLight never creates one, because there is no server of ours to hold it.',
      'The Home Assistant address, your access token, and your widget preferences live only on your device.',
      'Deleting the app removes all of it, Keychain entry included. Nothing survives elsewhere, because nothing was ever sent anywhere.',
      'To cut access from the other side, revoke the long-lived token in Home Assistant — that instantly invalidates it everywhere it was used.',
    ],
    responseTime: REPLY_2_DAYS,
  },

  // ── Homelab Glance ──────────────────────────────────────────────────────────
  {
    id: 'homelab-glance',
    blurb:
      'See your homelab at a glance — containers, health, and start/stop/restart, from widgets on your phone or Mac.',
    platforms: ['ios', 'ipados', 'macos'],
    requirements: [
      'iPhone or iPad running iOS 17 or later, or a Mac running macOS 14 or later.',
      'The open-source glance aggregator running on your own server (a small Docker container) — there is no server of ours in the path.',
      'The aggregator’s WIDGET_TOKEN, plus its CONTROL_TOKEN if you want start, stop, and restart rather than read-only.',
      'Nothing at all, to try it: the bundled demo data makes every screen work with no server.',
    ],
    links: [
      { label: 'Homelab Glance on the App Store', href: appStoreUrl('homelab-glance') },
      { label: 'Homelab Glance on GitHub', href: 'https://github.com/AnmolS1/homelab-glance' },
      { label: 'Privacy for Homelab Glance', href: 'https://ponderance.dev/privacy#svc-homelab-glance' },
      { label: 'Terms for Homelab Glance', href: 'https://ponderance.dev/terms#svc-homelab-glance' },
    ],
    faqs: [
      {
        q: 'Where do the address and tokens go?',
        a: 'Settings → Aggregator. Base URL is the address of your glance aggregator, Widget token is its WIDGET_TOKEN, and Control token is its CONTROL_TOKEN. Both tokens are kept in the system Keychain.',
      },
      {
        q: 'Why is start/stop/restart greyed out?',
        a: 'Those actions need the control token, which is separate from the widget token on purpose — read access and write access are different keys. Add the CONTROL_TOKEN in Settings → Aggregator and the controls light up.',
      },
      {
        q: 'I just want to see what it looks like.',
        a: 'Turn on Settings → Use mock data. Every card, widget, and control then runs on bundled sample data and never contacts a server.',
      },
      {
        q: 'Why does my widget show old data?',
        a: 'iOS budgets how often widgets may refresh, so a widget can trail the app by minutes. Opening the app refreshes it immediately and re-shares the current state with every widget.',
      },
      {
        q: 'How do the widgets reach my server?',
        a: 'The app and its widgets share one private App Group on the device, so the address, tokens, and your card layout are written once and read by both. The widget then talks to your server directly.',
      },
      {
        q: 'It works at home but not away.',
        a: 'A LAN-only aggregator is unreachable off your network by design. Expose it over HTTPS, or put your device and server on the same VPN or Tailscale network and use that address as the Base URL.',
      },
      {
        q: 'Which containers show up?',
        a: 'Whatever your aggregator reports. Choose which of them appear, reorder them, and set widget defaults in Settings → Manage cards.',
      },
      {
        q: 'What do you know about my setup?',
        a: 'Nothing. No server of ours, no analytics, no crash reporting — so a support email needs you to describe the symptom, including what Settings → Test connection reports.',
      },
    ],
    troubleshooting: [
      {
        title: 'Test connection fails',
        steps: [
          'Open the same Base URL in a browser on the same device — if that fails, the app is not the problem.',
          'Include the scheme and port exactly as your browser does.',
          'Re-paste the widget token; a rotated or truncated token fails identically to a wrong address.',
          'Toggle Use mock data on and off — working on mock data narrows the problem to the connection.',
        ],
      },
      {
        title: 'Cards are empty or a container is missing',
        steps: [
          'Check the aggregator directly: if it does not report the container, the app cannot show it.',
          'Open Settings → Manage cards and confirm the container is not simply switched off there.',
          'Pull to refresh in the app, which forces a fresh fetch rather than a cached one.',
          'Confirm the widget token still has access — a rotated token shows as an empty dashboard, not an error.',
        ],
      },
    ],
    dataAndDeletion: [
      'There is no account to delete — Homelab Glance never creates one.',
      'The aggregator address, both tokens, and your card layout live only on your device.',
      'Deleting the app removes all of it, Keychain entries included.',
      'To cut access from the other side, rotate WIDGET_TOKEN and CONTROL_TOKEN on your aggregator.',
    ],
    responseTime: REPLY_2_DAYS,
  },

  // ── Kaleidoscope ────────────────────────────────────────────────────────────
  {
    id: 'kaleidoscope',
    blurb: 'Draw into a mirror and get a symmetrical piece back — in the browser, or on your iPhone.',
    platforms: ['ios', 'ipados', 'web'],
    requirements: [
      'Any modern browser, for the web version. A trackpad, mouse, or touchscreen all work.',
      'iPhone or iPad running iOS 17 or later, for the app.',
      'An account only if you want to save to the gallery: Google on the web, Google or Apple in the app. Drawing and downloading work signed out.',
    ],
    links: [
      { label: 'Kaleidoscope on the App Store', href: appStoreUrl('kaleidoscope') },
      { label: 'Open Kaleidoscope on the web', href: 'https://kaleidoscope.ponderance.dev' },
      { label: 'Privacy for Kaleidoscope', href: 'https://ponderance.dev/privacy#svc-kaleidoscope' },
      { label: 'Terms for Kaleidoscope', href: 'https://ponderance.dev/terms#svc-kaleidoscope' },
    ],
    faqs: [
      {
        q: 'Do I have to sign in?',
        a: 'Only to save. You can draw and download an image without an account; signing in is what gives a piece somewhere to live. The web offers Google; the app offers Google or Sign in with Apple.',
      },
      {
        q: 'Do the app and the website share one gallery?',
        a: 'Yes — the app talks to the same kaleidoscope.ponderance.dev the website does, so a piece saved on your phone shows up when you sign into the web with the same account. Signing in with Apple in the app and Google on the web makes two separate accounts, so pick one and stay with it.',
      },
      {
        q: 'How do I add the home-screen widget?',
        a: 'Touch and hold the home screen, tap +, and find Kaleidoscope. Then touch and hold the placed widget → Edit Widget to choose how often it rotates, from every 5 minutes to once a day. Tapping the widget opens that piece in the app.',
      },
      {
        q: 'Who can see what I save?',
        a: 'Each piece has a visibility: public shows in the gallery, unlisted is reachable only by its link, private is yours alone. You can change it after saving.',
      },
      {
        q: 'How do I delete a piece?',
        a: 'Open your gallery and use Delete on the piece. It is immediate and cannot be undone.',
      },
      {
        q: 'How do I delete my whole account?',
        a: 'Email <a href="mailto:anmol@ponderance.dev">anmol@ponderance.dev</a> from the address you signed in with and it is deleted by hand, along with everything saved under it. There is no self-serve button for this yet.',
      },
      {
        q: 'My drawing disappeared after I refreshed.',
        a: 'An unsaved canvas is not kept anywhere — the refresh discarded it. Save before you leave, or download the image.',
      },
    ],
    dataAndDeletion: [
      'Signing in with Google shares your name, email, profile picture, and Google account id; Sign in with Apple, in the app, shares an account identifier and whatever you chose to share at the prompt. No password ever reaches us.',
      'A saved piece stores its stroke data, a rendered image, your title, the visibility you chose, and timestamps.',
      'Deleting a piece removes it and its image.',
      'Deleting the account is by email today — see the question above — and takes everything saved under it with it.',
    ],
    responseTime: REPLY_2_DAYS,
    knownIssues: [
      'There is no self-serve “delete my account” button in the interface yet; the email route above does the same job.',
    ],
  },

  // ── FlatFold ────────────────────────────────────────────────────────────────
  {
    id: 'flatfold',
    blurb:
      'An end-to-end encrypted messenger where the server holds nothing it can read — including your history.',
    platforms: ['ios', 'ipados', 'macos', 'web'],
    requirements: [
      'iPhone or iPad running iOS 15 or later, or a Mac running macOS 12 or later, for the app.',
      'Any modern browser, for the web app at flatfold.ponderance.dev.',
      'A username and a password you can remember. The password is the key — read the next section before you pick one.',
      'The exact username of anyone you want to talk to; there is no directory to search.',
    ],
    links: [
      { label: 'Open FlatFold', href: 'https://flatfold.ponderance.dev' },
      { label: 'What the server can and cannot see', href: 'https://flatfold.ponderance.dev/transparency' },
      { label: 'Threat model (source)', href: 'https://github.com/AnmolS1/FlatFold/blob/prod/docs/THREAT_MODEL.md' },
      { label: 'Privacy for FlatFold', href: 'https://ponderance.dev/privacy#svc-flatfold' },
      { label: 'Terms for FlatFold', href: 'https://ponderance.dev/terms#svc-flatfold' },
    ],
    faqs: [
      {
        q: 'I forgot my password. How do I get back in?',
        a: 'You cannot, and neither can Anmol. Your messages and contacts are encrypted with a key derived from your password, which never leaves your device — so there is no reset, no escrow, and no backup. A forgotten password means that history is gone for good; the only way forward is a new account.',
      },
      {
        q: 'Why is that the design?',
        a: 'A reset link would mean the server could hand your history to whoever holds your email — which is exactly the power this app is built not to have. The unrecoverable password is the price of the server being unable to read anything.',
      },
      {
        q: 'How do I add someone?',
        a: 'Type their exact username. There is no directory and no search, because a searchable list of users is itself a leak — so you need to get the username from them some other way.',
      },
      {
        q: 'Can I read my old messages on a new device?',
        a: 'Sign in with the same username and password and your history decrypts locally on that device. Anything that only existed on a device you no longer have, and was never synced, stays there.',
      },
      {
        q: 'What does the server actually store?',
        a: 'Your username, a verifier derived from your password (not the password), the public keys you publish, and undelivered messages as ciphertext — deleted once your device confirms delivery, and in every case within 14 days. The <a href="https://flatfold.ponderance.dev/transparency">transparency page</a> spells this out.',
      },
      {
        q: 'Do notifications leak my messages?',
        a: 'No. If you turn them on, the push subscription carries no message content — only that something arrived.',
      },
    ],
    troubleshooting: [
      {
        title: 'A message won’t send',
        steps: [
          'Check that the recipient username is exact — a near-miss is a different account, not an error.',
          'Reload the page: the encrypted session is re-established on load, and a stale tab is the most common cause.',
          'Confirm the other person has signed in at least once, so they have published the public keys your device needs.',
          'If it still fails, email anmol@ponderance.dev with the time and your username. Never send your password — it is not useful to anyone, including Anmol.',
        ],
      },
    ],
    dataAndDeletion: [
      'Your messages, contacts, and history are encrypted on your device with a key derived from your password and never leave it in readable form.',
      'The server keeps your username, a password verifier, your public keys, and ciphertext waiting for delivery — nothing it can read.',
      'Undelivered messages are deleted once your device confirms it received them, and in every case within 14 days. Attachments are deleted once fetched.',
      'IP addresses are never logged.',
      'To delete an account, email anmol@ponderance.dev from a device signed into it. The encrypted history on your own device goes when you clear that browser’s storage.',
    ],
    responseTime: REPLY_2_DAYS,
    knownIssues: [
      'There is no password reset and there never will be — this is the design, not a missing feature. Write your password down somewhere safe.',
    ],
  },

  // ── Invited, self-hosted services ───────────────────────────────────────────
  {
    id: 'jellyfin',
    blurb: 'The private media server for invited friends and family, running on Anmol’s own hardware.',
    platforms: ['web'],
    requirements: [
      'An invitation — accounts are created by Anmol, not by signing up.',
      'A browser, or any Jellyfin client app pointed at jellyfin.ponderance.dev.',
    ],
    links: [
      { label: 'Open Jellyfin', href: 'https://jellyfin.ponderance.dev' },
      { label: 'Privacy for Jellyfin', href: 'https://ponderance.dev/privacy#svc-jellyfin' },
      { label: 'Terms for Jellyfin', href: 'https://ponderance.dev/terms#svc-jellyfin' },
    ],
    faqs: [
      {
        q: 'How do I get an account?',
        a: 'Ask Anmol. This is a private server for people he knows; there is no sign-up form and no waiting list.',
      },
      {
        q: 'I forgot my password.',
        a: 'Email <a href="mailto:anmol@ponderance.dev">anmol@ponderance.dev</a> and it is reset by hand. There is no self-serve reset on this server.',
      },
      {
        q: 'A library looks empty.',
        a: 'Libraries are per-account, so an empty one usually means it is not shared with you rather than that it is broken. Say which library you expected and it gets checked.',
      },
      {
        q: 'Playback keeps stalling.',
        a: 'Try a lower quality in the player first — most stalls are the server transcoding for a format your device cannot play directly. If a specific title always stalls, name it in an email.',
      },
    ],
    dataAndDeletion: [
      'Your account is a username and a password stored hashed by Jellyfin.',
      'The server records playback history, client and device information, and the session IP address.',
      'Email anmol@ponderance.dev to have the account and its history deleted.',
    ],
    responseTime: REPLY_2_DAYS,
  },
  {
    id: 'immich',
    blurb: 'The private photo library for invited friends and family, running on Anmol’s own hardware.',
    platforms: ['web'],
    requirements: [
      'An invitation — accounts are created by Anmol, not by signing up.',
      'A browser, or the Immich app pointed at immich.ponderance.dev.',
    ],
    links: [
      { label: 'Open Immich', href: 'https://immich.ponderance.dev' },
      { label: 'Privacy for Immich', href: 'https://ponderance.dev/privacy#svc-immich' },
      { label: 'Terms for Immich', href: 'https://ponderance.dev/terms#svc-immich' },
    ],
    faqs: [
      {
        q: 'How do I get an account?',
        a: 'Ask Anmol. There is no sign-up; accounts are made one at a time for people he knows.',
      },
      {
        q: 'I forgot my password.',
        a: 'Email <a href="mailto:anmol@ponderance.dev">anmol@ponderance.dev</a> and it is reset by hand.',
      },
      {
        q: 'My library looks empty.',
        a: 'Each account sees only its own uploads and whatever has been shared with it. A large first upload also takes a while to finish processing before thumbnails appear.',
      },
      {
        q: 'Does anything about my photos leave the server?',
        a: 'No. Face grouping and search features are computed on Anmol’s own machine and are never sent to a third party; Cloudflare only carries the traffic.',
      },
      {
        q: 'Can I turn off face recognition for my photos?',
        a: 'Ask, and it is switched off for your account. Faces and photo locations are the most sensitive things here, which is why they are worth asking about.',
      },
    ],
    dataAndDeletion: [
      'Your account is a username and a password stored hashed by Immich.',
      'Photos and videos you upload keep their embedded metadata, including EXIF location if the camera recorded it.',
      'Face groupings and search features are derived on the server itself and never sent anywhere.',
      'Delete individual items from the app, or email anmol@ponderance.dev to have the whole account and its uploads removed.',
    ],
    responseTime: REPLY_2_DAYS,
  },
];

const byId = new Map(SERVICES.map((s) => [s.id, s] as const));

export interface SupportedProduct {
  entry: SupportEntry;
  service: LegalService;
}

/** Products that get a support page: registry entry + a listed, non-planned service. */
export const supportedProducts = (): SupportedProduct[] =>
  SUPPORT.flatMap((entry) => {
    const service = byId.get(entry.id);
    // Deliberate hard failure: a typo'd id must break the build, not silently drop a
    // product whose Support URL is already live in App Store Connect.
    if (!service) throw new Error(`support.ts: unknown service id "${entry.id}"`);
    if (service.status === 'planned' || service.audience === 'household') return [];
    return [{ entry, service }];
  });

/** True when a product is a native app rather than a web-only one. */
export const isApp = (entry: SupportEntry): boolean =>
  entry.platforms.some((p) => p !== 'web');

/**
 * Hub grouping. Order is the order of a stranger's likelihood of being here:
 * the App Store apps first, then the public web toys, then the invited services.
 */
export const supportGroups = (): { id: string; title: string; blurb: string; items: SupportedProduct[] }[] => {
  const all = supportedProducts();
  return [
    {
      id: 'apps',
      title: 'Apps',
      blurb: 'Native apps for iPhone, iPad, and Mac.',
      items: all.filter((p) => p.service.audience !== 'invited' && isApp(p.entry)),
    },
    {
      id: 'web',
      title: 'On the web',
      blurb: 'Open in a browser; nothing to install.',
      items: all.filter((p) => p.service.audience !== 'invited' && !isApp(p.entry)),
    },
    {
      id: 'private',
      title: 'Private services',
      blurb: 'Self-hosted, for invited friends and family. Not open to sign up.',
      items: all.filter((p) => p.service.audience === 'invited'),
    },
  ].filter((g) => g.items.length > 0);
};

/** Every id with a support page — used by /api/inquiry to label support mail. */
export const SUPPORT_IDS: readonly string[] = supportedProducts().map(({ entry }) => entry.id);
