# G5b: verify the iPhone 18 Pro Max spec our 3D model uses

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/iphone-18-pro-max-specs.md with a table skeleton (field, our value, verdict, published value, source URL). After EVERY field you check, rewrite that file. Last night's run spent its whole step cap exploring and was killed with nothing written.** Edit nothing else; never download files into the project; no helper scripts.

Below is the spec file our Remotion model was built from. For each field, open apple.com/iphone-18-pro/specs/ (read_url_content, once) and Apple's Accessory Design Guidelines or Human Interface Guidelines only if a field needs it. Verdicts: VERIFIED (matches, cite), CORRECTED (give the published value and URL), UNVERIFIABLE (no official source; say what you checked). Never estimate a value yourself. End the file with a Final report line.

```ts
/** Millimetres unless stated. Source evidence checked 2026-10-05.
 * VERIFIED means explicitly published, not inferred from a silhouette.
 * Keepout envelopes are NOT necessarily the visible optical/glass boundaries.
 * Coordinates: x from left, y from top in the face being viewed. Model: 1 unit = 10 mm.
 */
export type Sourced<T> = {
  value: T;
  status: "VERIFIED" | "UNVERIFIED";
  source: string;
  note?: string;
};
const apple = "https://www.apple.com/iphone-18-pro/specs/";
const drawing =
  "https://developer.apple.com/download/files/accessories/dimensional-drawings/iphone-18-pro-max.pdf";
const verified = <T>(value: T, source = apple, note?: string): Sourced<T> => ({
  value,
  status: "VERIFIED",
  source,
  note,
});
const estimate = <T>(value: T, note: string): Sourced<T> => ({
  value,
  status: "UNVERIFIED",
  source: drawing,
  note,
});
export const iphone18ProMax = {
  height: verified(163.4),
  width: verified(78.0),
  depth: verified(8.75),
  drawingBody: verified(
    { height: 163.43, width: 77.98 },
    drawing,
    "Sheet 1. Marketing specs rounded to one decimal.",
  ),
  displayDiagonalInches: verified(6.9),
  displayRectangleDiagonalInches: verified(6.86),
  displayResolution: verified({ width: 1320, height: 2868 }),
  displayActiveArea: verified(
    { width: 72.86, height: 158.31 },
    drawing,
    "Sheet 1.",
  ),
  bodyCornerRadius: estimate(
    13.9,
    "Circular approximation of the continuous profile in sheet 1 detail A. Not a published circular radius.",
  ),
  displayCornerRadius: estimate(
    11.7,
    "Circular approximation. Sheet 4 radii describe keepouts, not the active display.",
  ),
  dynamicIsland: estimate(
    { width: 15.68, height: 6.07, centerX: 38.99, centerY: 7.91 },
    "Sheet 1 and sheet 3 front-camera keepout used as a visible pill approximation. Optical boundary not dimensioned.",
  ),
  cameraPlateau: estimate(
    { width: 73.0, height: 43.2, centerX: 38.99, centerY: 23.99, radius: 12.0 },
    "Silhouette estimate from sheet 1 detail D, not explicitly dimensioned.",
  ),
  cameraPlateauRise: verified(
    2.78,
    drawing,
    "Sheet 1: back plate to camera plateau.",
  ),
  cameraGlassRise: verified(
    2.11,
    drawing,
    "Sheet 1: camera plateau to rear camera glass.",
  ),
  lensDiameter: verified(16.58, drawing, "Sheet 1 detail D: 3x diameter."),
  lensCenters: verified(
    [
      { x: 14.37, y: 14.37 },
      { x: 14.37, y: 33.61 },
      { x: 32.49, y: 23.99 },
    ],
    drawing,
    "Sheet 1 detail D. Rear view coordinates.",
  ),
  flash: verified(
    { x: 64.16, y: 13.82, diameter: 6.9 },
    drawing,
    "Sheet 1 detail D.",
  ),
  lidar: verified(
    { x: 64.16, y: 34.16, diameter: 6.9 },
    drawing,
    "Sheet 1 detail D.",
  ),
  rearMic: verified(
    { x: 64.16, y: 23.99, diameter: 1.15 },
    drawing,
    "Sheet 1 detail D.",
  ),
  sideButtons: verified(
    [
      {
        name: "action",
        side: "left",
        centerY: 34.28,
        length: 6.9,
        width: 2.66,
        protrusion: 0.45,
      },
      {
        name: "volume-up",
        side: "left",
        centerY: 48.43,
        length: 11.2,
        width: 2.66,
        protrusion: 0.45,
      },
      {
        name: "volume-down",
        side: "left",
        centerY: 62.63,
        length: 11.2,
        width: 2.66,
        protrusion: 0.45,
      },
      {
        name: "side",
        side: "right",
        centerY: 55.53,
        length: 17.7,
        width: 2.66,
        protrusion: 0.45,
      },
      {
        name: "camera-control",
        side: "right",
        centerY: 111.82,
        length: 17.1,
        width: 3.03,
        protrusion: 0.0,
      },
    ] as const,
    drawing,
    "Sheet 1. y measured from top; rounded button profiles are simplified.",
  ),
  frameFinish: verified("Aluminum unibody design"),
  frontFinish: verified("Ceramic Shield 2 front"),
  backFinish: verified("Ceramic Shield back"),
  finishNames: verified(["Black", "Silver", "Glacier", "Burgundy"] as const),
  // Apple publishes names, not these calibrated material swatches.
  finishColors: estimate(
    { Black: "#343538", Silver: "#c9cbd0", Burgundy: "#643444" },
    "Art-directed sRGB swatches. Apple does not publish PBR albedo or roughness values.",
  ),
  brushedTreatment: estimate(
    { metalness: 1, roughness: 0.34, anisotropy: 0.35 },
    "Requested studio treatment, not a measured physical finish.",
  ),
} as const;
export type IPhoneFinish = keyof typeof iphone18ProMax.finishColors.value;

```
