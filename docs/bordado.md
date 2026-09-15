# Bordado · v0.1.2

Independent mobile-first template at `/catalogo/boda/bordado/`, based on the approved asymmetric textile composition. Existing templates are unchanged.

Content: `js/wedding/bordado-data.js`, exposed through the existing service adapter. Schedule supports multiple venues and UTC instants; presentation uses the device timezone. RSVP is a simulation, not persisted and not sent to a server. All guest authorization and pass validation must also live server-side when connecting the API.

Motion: introductory seam, delayed names, one-shot contact photo/card entrances, scroll-linked itinerary seam, animated accordions and confirmation check. Flowers and textile stay static. Birds now use eight registered sprite poses: four head positions and four wing positions. Each six-second cycle includes visible perched sway, head turns, takeoff, flight beyond the invitation edge, turn, return and landing. Birds have staggered starts. Motion pauses when its section leaves the viewport or the tab is hidden; reduced-motion shows a stationary bird. The original cutout remains as fallback if the sprite cannot load.

All four wedding templates share `js/wedding/footer.js` and `css/invitation-footer.css`: Developed by, the actual Cáele logo, tagline and copyright. Bordado's closing garland is decoration above this shared footer.

## Assets

Generated with the built-in image-generation tool; original raster outputs converted to optimized project assets:
- `assets/wedding/bordado/garland.webp`: transparent horizontal raised-thread floral garland, coral daisies, mustard flowers, teal/olive leaves, gold stems; no birds/text/background. Approved mobile design used as style reference.
- `assets/wedding/bordado/bird.webp`: isolated embroidered songbird facing right, coral head, teal wing, mustard belly/tail, realistic raised silk stitches, transparent background.
- `assets/wedding/bordado/bird-poses.webp`: generated 4-column × 2-row sprite sheet based on that bird. Top row: neutral, head down, looking back, head up. Bottom row: four wing positions with feet tucked. Fixed body registration and colors; a second image-generation pass removed the painted checkerboard to produce real alpha transparency. Converted to WebP at 1280 × 640 (320px per pose).
- `assets/wedding/bordado/linen.webp`: seamless deep bottle-green woven linen, evenly lit, fine threads, no folds, objects or text.
- `assets/wedding/bordado/couple.jpg`: fictional couple, ivory lace and green suit, forehead kiss, warm garden light, candid 3:2 editorial portrait.

Gallery side images and venue/registry links are demonstration content; replace in the data module for a real invitation.

## Verification

`node --experimental-vm-modules tests/bordado.cjs`

Checks syntax, API-shaped data, UTC conversion across dates, expired countdown, pass limits, RSVP deadline and local assets. Browser visual review intentionally omitted at the user's request. No changes to production or merge are performed.
