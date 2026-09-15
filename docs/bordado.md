# Bordado · v0.1.2

Independent mobile-first template at `/catalogo/boda/bordado/`, based on the approved asymmetric textile composition. Existing templates are unchanged.

Content: `js/wedding/bordado-data.js`, exposed through the existing service adapter. Schedule supports multiple venues and UTC instants; presentation uses the device timezone. RSVP is a simulation, not persisted and not sent to a server. All guest authorization and pass validation must also live server-side when connecting the API.

Motion: introductory seam, delayed names, asynchronous bird tilts, one-shot contact photo/card entrances, scroll-linked itinerary seam, animated accordions and confirmation check. Flowers and textile stay static. Live reduced-motion preference changes are respected. Bird motion currently animates each complete cutout rather than independently articulated heads/tails.

## Assets

Generated with the built-in image-generation tool; original raster outputs converted to optimized project assets:
- `assets/wedding/bordado/garland.webp`: transparent horizontal raised-thread floral garland, coral daisies, mustard flowers, teal/olive leaves, gold stems; no birds/text/background. Approved mobile design used as style reference.
- `assets/wedding/bordado/bird.webp`: isolated embroidered songbird facing right, coral head, teal wing, mustard belly/tail, realistic raised silk stitches, transparent background.
- `assets/wedding/bordado/linen.webp`: seamless deep bottle-green woven linen, evenly lit, fine threads, no folds, objects or text.
- `assets/wedding/bordado/couple.jpg`: fictional couple, ivory lace and green suit, forehead kiss, warm garden light, candid 3:2 editorial portrait.

Gallery side images and venue/registry links are demonstration content; replace in the data module for a real invitation.

## Verification

`node --experimental-vm-modules tests/bordado.cjs`

Checks syntax, API-shaped data, UTC conversion across dates, expired countdown, pass limits, RSVP deadline and local assets. Browser visual review intentionally omitted at the user's request. No changes to production or merge are performed.
