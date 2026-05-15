// Shared constants for race geometry — imported by RaceTrack and the race engine.
// If you change WORM_SIZE or WORM_RACE_SEGMENTS, WIN_PROGRESS updates automatically.

export const STRING_HEIGHT = 320          // px — visual height of each string

export const WORM_SIZE = 40               // size prop passed to racing Worm SVGs
export const WORM_RACE_SEGMENTS = 4       // segments prop for racing worms

// Replicate Worm.jsx's height formula so WIN_PROGRESS stays in sync
const segH = WORM_SIZE * 0.9
const totalH = WORM_RACE_SEGMENTS * segH * 0.68 + WORM_SIZE * 0.65
export const WORM_SVG_HEIGHT = Math.ceil(totalH + 10) // 110 px

// Progress value (0–1) at which the worm HEAD (top of SVG) reaches the top of
// the string container — i.e., crosses the finish line.
// Derivation: headTop = STRING_HEIGHT*(1-p) - WORM_SVG_HEIGHT = 0  →  p = (STRING_HEIGHT - WORM_SVG_HEIGHT) / STRING_HEIGHT
export const WIN_PROGRESS = (STRING_HEIGHT - WORM_SVG_HEIGHT) / STRING_HEIGHT  // ≈ 0.656
