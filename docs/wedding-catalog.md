# Wedding catalog v0.1.0

Routes: /catalogo/ → /catalogo/boda/ → minimalista/ or editorial/.
Plain HTML/CSS and ES modules. Serve the repository root using any static HTTP server (for example python3 -m http.server 8000). No build step. Absolute paths assume the existing caele.mx root deployment.

## Data contract
js/wedding/data.js contains a JSON-serializable schemaVersion: 1 object shared by both designs. Event identity and UTC dates are separate from the invitation identity and maxPasses. media contains replaceable URLs and alternative text. Dress code, its illustration, gift registries and branding also live in this object.
startsAt and deadlineAt must be ISO 8601 UTC strings ending in Z. timeZone stores the venue IANA zone for future editing; display uses the device zone through Intl.DateTimeFormat. Remaining time uses epoch subtraction, independent of display zone. Passed dates clamp to zero.
getInvitation and confirmAttendance in service.js are the replacement points for the future API. The API must authorize invitation access, validate the assigned pass limit and deadline server-side, and make confirmation idempotent. Never use client maxPasses as authorization. Do not expose all guests in public JSON.
Demo RSVP changes only the current view, without network submission or persistence. Reload resets it. The UI explicitly labels this as a demonstration.

## Review limitations
Attached caele-elegante-fiel.svg and caele-favicon-elegante.svg could not be read with the available tools. Footer layout follows the reference but currently uses existing repository branding. Replace branding.logo and branding.favicon after adding the exact supplied assets. No substitute logo was fabricated.
Remote Unsplash photos are illustrative, are not the generated mockup photos, and may depict different couples. Replace with the client's consistent licensed gallery through JSON. Venue is fictional; Maps currently searches the sample city. Registry URLs are generic demo destinations.
No browser or filesystem execution tool was available. Model checks ran in the JavaScript runtime: future countdown, elapsed dates, UTC validation, date rollover in Tokyo, and pass limits. Browser layout, image loading, keyboard interaction and visual parity still require review at mobile and desktop widths.

## Manual review
- Open all routes via the catalog and directly, including refresh.
- Check 360px, 768px and 1440px widths, focus visibility and reduced motion.
- Switch device zone; check date rollover while countdown remains the same.
- Confirm 1 or 2 passes; check success message and reset on reload.
- Test deadline in past and zero passes; controls must be disabled.
- Replace exact branding assets and inspect footer against reference.
