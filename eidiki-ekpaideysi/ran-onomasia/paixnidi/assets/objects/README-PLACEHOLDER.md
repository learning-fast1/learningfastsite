# DEVELOPMENT PLACEHOLDERS — not real assessment assets

The 5 SVG files in this folder (`apple.svg`, `hen.svg`, `vase.svg`, `gift.svg`,
`ball.svg`) are **temporary, self-authored, crude line-art placeholders**,
each carrying a visible diagonal "PLACEHOLDER" watermark. They exist only so
the RAN Objects flow can be built, tested, and smoke-tested end-to-end before
final imagery is approved. They must **not** be used in a real administration
and must **not** be treated as final visual design.

## Proposed spec for the final replacement assets

- **Format:** SVG preferred (crisp at any size, small file size, no
  compression artifacts); PNG with transparency is an acceptable fallback if
  SVG isn't practical for a given illustration style.
- **Filenames:** exactly `apple.<ext>`, `hen.<ext>`, `vase.<ext>`,
  `gift.<ext>`, `ball.<ext>` in this folder — the internal stimulus IDs are
  fixed and the app resolves images by this convention
  (`assets/objects/<id>.svg`, see `renderStimulus()` in `js/ran_ui.js`).
  Changing the extension requires a matching one-line change there.
- **Canvas / aspect ratio:** square canvas (1:1), e.g. 256×256 or 512×512,
  so all 5 objects sit inside an identical bounding box — the on-page
  stimulus box itself is a fixed 64×64px square (`.ran-stimulus` in
  `css/ran.css`) and images are scaled into it via `object-fit: contain`,
  never distorted or stretched.
- **Transparency:** transparent background required — the app supplies its
  own stimulus tile background/border, the image should show only the
  object itself with no baked-in background color or shape.
- **No text/labels:** the image must not contain any text, letters, or
  written labels of any kind (this would leak the expected answer or bias
  naming).
- **Style:** simple, high-contrast, unambiguous silhouette/illustration —
  clearly and immediately identifiable as ONE specific object, avoiding
  designs that could plausibly be named two different common ways in Greek
  (e.g. a cup that could be called ποτήρι or κούπα, a notebook that could be
  called τετράδιο or βιβλίο). Each of the 5 final images should strongly and
  unambiguously cue exactly one expected Greek word:
  - apple → μήλο
  - hen → κότα
  - vase → βάζο
  - gift → δώρο
  - ball → μπάλα
- **Visual weight:** roughly similar visual "ink density"/size across all 5
  images so no single stimulus is easier to spot at a glance than the
  others purely from image weight/contrast.
- **Source:** should be commissioned/drawn or licensed for this project —
  not downloaded ad hoc from the open internet — consistent with the
  instruction not to invent final assets without separate visual approval.

Once final assets are approved and dropped into this folder under the exact
filenames above, delete the 5 placeholder SVGs and this README.
