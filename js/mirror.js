/**
 *  Nametable Mirroring describes the layout of the NES' 2x2 background nametable graphics. Nametable mirroring affects
 *  what is shown past the right and bottom edges of the current nametable. When mirroring is enabled for a particular
 *  axis (horizontal and/or vertical), the coordinates simply wrap around on the current nametable. A background "mirrored"
 *  in this way is repeated, not flipped. When mirroring is disabled, a second nametable is used. Some common
 *  combinations of mirroring:
 *    - Horizontal mirroring: A vertical arrangement of the nametables results in horizontal mirroring, which makes a 32x60 tilemap.
 *      This is most commonly used for games which only scroll vertically or in all directions.
 *    - Vertical mirroring: A horizontal arrangement of the nametables results in vertical mirroring, which makes a 64x30 tilemap.
 *      This is most commonly used for games which only scroll horizontally.
 *    - Single-Screen mirroring: Only available with certain mappers resulting in two 32x30 tilemaps.
 *
 */
export const Mirror = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  HARDWARE: "hardware",
  SINGLE_SCREEN_LOW: "single screen low",
  SINGLE_SCREEN_HIGH: "single screen high"
});
