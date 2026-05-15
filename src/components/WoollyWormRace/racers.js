// Racer data for the Woolly Worm Championship.
//
// SWAPPING IN KID PHOTOS:
//   Set avatarUrl to an image path, e.g. avatarUrl: '/photos/luca.jpg'
//   Drop the image in /public/photos/ — that's the only change needed per kid.
//
// WORM COLORS:
//   wormBody / wormBand use an authentic woolly-worm brown/black palette.
//   `color` (bright) is used only for the kid's avatar circle + lane badges.

export const RACERS = [
  {
    id: 'luca',
    kid: 'Luca',
    wormName: 'Luca Brrr-asi',
    // Avatar circle color (bright, for identification)
    color: '#B91C1C',
    textColor: '#FEF2F2',
    // Authentic worm body: dark brown + near-black bands
    wormBody: '#5C2E0A',
    wormBand: '#1A0804',
    avatarUrl: '/avatars/luca.jpg',
  },
  {
    id: 'isla',
    kid: 'Isla',
    wormName: 'Isla of Wool',
    color: '#92400E',
    textColor: '#FEF3C7',
    // Lightest worm: tan/caramel body with warm dark-brown bands
    wormBody: '#C4895A',
    wormBand: '#5C2E0A',
    avatarUrl: '/avatars/isla.jpg',
  },
  {
    id: 'kameron',
    kid: 'Kameron',
    wormName: 'Kam-Anchor Leg',
    color: '#15803D',
    textColor: '#F0FDF4',
    // Rust/reddish-brown body, very dark bands
    wormBody: '#8B3A0F',
    wormBand: '#2D1000',
    avatarUrl: '/avatars/kameron.jpg',
  },
  {
    id: 'kinze',
    kid: 'Kinze',
    wormName: 'Kinze the Caterpillar Killer',
    color: '#DB2777',
    textColor: '#FDF2F8',
    // Deep rich brown body, charcoal-black bands
    wormBody: '#4A2210',
    wormBand: '#1C0C04',
    avatarUrl: '/avatars/kinze.jpg',
  },
  {
    id: 'carter',
    kid: 'Carter',
    wormName: 'Carter the Cold Front',
    color: '#0369A1',
    textColor: '#F0F9FF',
    // Medium brown with a slight cool undertone, dark bands
    wormBody: '#6B5040',
    wormBand: '#26180E',
    avatarUrl: '/avatars/carter.jpg',
  },
  {
    id: 'jack',
    kid: 'Jack',
    wormName: 'Jack Frost',
    color: '#475569',
    textColor: '#F8FAFC',
    // Lightest-brown with a cool-gray tint, dark-brown bands
    wormBody: '#9A8472',
    wormBand: '#3A2A1C',
    avatarUrl: '/avatars/jack.jpg',
  },
]
