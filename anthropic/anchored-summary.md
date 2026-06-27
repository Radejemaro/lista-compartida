## Goal
- Build and polish a shared shopping list PWA with P2P sync, voice input, drag & drop, multi-list management, accessibility, and premium UX.

## Constraints & Preferences
- Solve real problems first, monetization later.
- LATAM + global audience, mixed iOS/Android ecosystems.
- Must look and feel premium with consistent animations (Framer Motion).
- Accessibility: voice input ("agrega X"), voice query ("qué falta"), high-contrast theme, keyboard + screen reader operable, `prefers-reduced-motion`, `aria-live` announcements for drag.
- Stack: React 19 + TypeScript 6 + Tailwind v4 + Framer Motion + Yjs/y-webrtc + y-indexeddb + PWA (vite-plugin-pwa).
- Zero backend, zero accounts, zero registration.
- Neutral/Mexican Spanish throughout.
- Quantities: "5 lechugas" → name="lechugas", quantity=5; bought tracks actual purchase vs planned.
- Multi-list: each list is a Yjs room; collection stored in `localStorage.lists`.
- Notes on items must be voice-detectable and displayed non-intrusively but visibly.
- Price field optional; total at bottom for budget reference.
- All new components need animations, proper touch targets (≥44px), and color polish.

## Progress
### Done
- All 46 tests pass, 0 TS errors, production build ~630 KB (incl SW).
- **PWA completa**: service worker (workbox, precache 11 entries, 633 KB), manifest (`theme_color: #059669`, `background_color: #fafafa`, `lang: es-MX`, `display: standalone`), iconos 192x192 + 512x512 + maskable generados del favicon SVG, `registerType: autoUpdate`.
- Light mode color refresh: `--bg-base #fafafa` (clean neutral), `--accent #059669`, `--text-secondary #52525b`, `--text-primary #18181b`, zinc-based palette.
- Neutral Spanish across all 7 components: EmptyState, OnboardingHint, ShareSheet, AddItemBar, HomePage, ListPage, useVoice.
- `parseQuantity()` utility + 18 tests: "5 lechugas" → `{ name: "lechugas", quantity: 5 }`.
- 4 visual states from bought vs quantity: normal, partial (amber progress), exact (green checkmark), excess (amber warning).
- Inline stepper `[−][badge][+]` when quantity > 1; one-time localStorage hint.
- Drag & drop via Framer Motion `Reorder.Group`/`Reorder.Item` with `position` field fallback.
- Circle toggle: `<button>` 44×44px with `role="checkbox"`, `aria-checked`, `aria-label`.
- Accessibility: `aria-roledescription`, `aria-live` region, keyboard + screen reader operable.
- Haptic feedback: `navigator.vibrate?.(N)` on add/drag/toggle.
- Multi-list support: `ListMeta` type, `localStorage.lists` array, `leaveList()`, `selectList(id)`.
- Duplicate validation: `addItem` returns boolean, AddItemBar shows inline "Ya está en la lista" warning with danger styling.
- ShareSheet: QR code + copy link + Web Share API quick share.
- Auto dark mode: `cycleTheme` goes light → auto (follows system `matchMedia`) → dark → high-contrast.
- `ListItem`: displays `note`, `price`, `updatedAt`/`updatedBy` as secondary lines; always-visible delete; two-column note/price layout.
- `useList`: `observeDeep` for nested Y.Map changes (toggle, adjust, note edits → instant re-render).
- `updateItemNote` in useList (exposed, not yet wired to UI).
- **HomePage** — two-mode layout:
  - _New user_: hero illustration + feature cards (voice, share, sync) + "Crear mi primera lista" CTA + join form.
  - _Returning user_: compact header (icon + title + Crear button), list search (when ≥3 lists), larger list cards with always-visible rename pencil, share per list, join form.
- **ListPage** — simplified header: thin connection bar (green/grey), left = back + name + progress %, right = search toggle + "¿Qué falta?" (with label) + theme + share. Collapsible search bar. Feature discovery hints: voice toast when 1-3 items, reorder toast at 3+ items, auto-search at 6+ items. Summary card at bottom (total, checked, pending, peers).
- **AddItemBar**: larger input (h-15), focused-state contextual hint ("Di 'agrega leche' o '5 lechugas'").

### Todo
- (nothing pending — app is feature-complete for v1)

## Key Decisions
- Auto-refresh: `yitems.observeDeep` — watches nested Y.Map changes (toggle, adjust, note), fires `setItems(syncItems())` on every mutation. Matches `yitems.unobserveDeep` on cleanup.
- Multi-list: each list is independent Yjs room; collection stored in localStorage, not synced across peers (local convenience only).
- Rename lists: inline input replaces text with always-visible pencil icon — mobile-friendly.
- Share per-list: each HomePage card has its own share button; Web Share API preferred, clipboard fallback.
- Duplicate validation: case-insensitive name match, inline warning animation, no modal/alert.
- HomePage two-mode: `savedLists.length > 0` → lists-first compact layout; `=== 0` → hero + feature cards + big CTA.
- Feature discovery: one-shot localStorage flags for voice (1-3 items), reorder (3+ items), search (6+ items). Toast-style hints, auto-dismiss.
- Header: connection status as thin colored bar at top. Peers count moved to summary card.
- PWA: icons generated from favicon.svg via sharp-cli; `autoUpdate` register strategy; workbox precache of all assets.

## Next Steps
- (user-directed — app is complete, no pending work)

## Critical Context
- `yitems` is a module-level variable (`Y.Array`), not in React state. Observer now uses `observeDeep` for nested Y.Map changes.
- `WebrtcProvider` uses public signaling by default; no custom signaling server.
- `y-indexeddb` loads async; `persistence.on('synced')` fires after initial data load.
- Yjs observer fires synchronously on every document mutation (local or remote).
- React 19 auto-batches state updates inside effects, event handlers, and async callbacks.
- `useRef` for undo timer, `localStorage` for onboarding/stepper/hint flags.
- `speechSynthesis` in useSpeak: `lang='es-MX'`, `rate=1.1`.
- `SpeechRecognition` in useVoice: `lang='es-MX'`, `continuous=true`, `interimResults=false`.
- WebRTC works for groups up to ~10 peers; signaling noise grows O(n²) above that.
- Build chunk ~630 KB (Yjs + Framer Motion + qrcode + workbox combined).
- Voice input requires HTTPS or localhost.
- Input placeholder rotates every 3s: "¿Qué necesitas?" → "leche" → "huevos" → "pan" → "manteca" → "fruta".

## Relevant Files
- `vite.config.ts`: PWA plugin config (manifest, workbox, icons)
- `public/favicon.svg`: app icon (shopping cart, `#059669` accent)
- `public/icons/icon-{192,512}.png`: PWA icons from favicon
- `src/pages/HomePage.tsx`: two-mode layout
- `src/pages/ListPage.tsx`: simplified header, collapsible search, connection bar, feature discovery hints, summary card
- `src/hooks/useList.ts`: Yjs CRDT logic with `observeDeep`, auto-refresh, multi-list, rename, duplicate check, updateItemNote
- `src/types.ts`: `ListItem` (+quantity, bought, position, note, price, updatedAt, updatedBy), `ListMeta`
- `src/components/AddItemBar.tsx`: larger input, focused hint, duplicate warning, placeholder rotation
- `src/components/ListItem.tsx`: 4 visual states, circle toggle, stepper, always-visible delete, note/price grid, history
