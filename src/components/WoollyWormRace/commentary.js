// Commentary templates — Adam Binder style live race commentary.
// Variables: {leader}, {challenger}, {worm1}, {worm2}, {worm}

export const INTRO_LINES = [
  "Folks, this is the moment we've all been waiting for. Six worms. One string. One champion. Take it away, Adam!",
  "Welcome to the 2026 Family Trip Woolly Worm Championship! I'm Adam Binder and have I got a race for you!",
  "Banner Elk, Banner Elk, Banner Elk — it's RACE TIME!",
]

export const START_LINES = [
  "On your mark... get set... GO!",
  "And we are UNDERWAY here at the 2026 Family Trip Race!",
  "The crowd is on their feet — let's see who's got legs today!",
]

export const EARLY_LEAD_LINES = [
  "And they're off! {leader} jumps out to an early lead!",
  "{leader} looking strong right out of the gate!",
  "Oh my — {leader} is absolutely FLYING up that string!",
  "Early mover: {leader}! This worm means business!",
]

export const MID_RACE_LINES = [
  "{worm} is making a move on the outside!",
  "Folks, {worm} is taking the scenic route up there...",
  "{worm} is wiggling like there's a thousand-dollar bounty on the line!",
  "Merryweather is going WILD in the crowd right now!",
  "{worm} doesn't look like much but don't count 'em out!",
  "We've got some serious wiggling happening in lane {lane}!",
  "{worm1} and {worm2} are absolutely neck and neck, folks!",
  "It's anybody's race! {worm1} and {worm2} trading the lead!",
  "{worm} takes a little breather — you can do it, buddy!",
  "The crowd is going absolutely NUTS over here!",
  "Half way there — {leader} holding on up front!",
  "{worm} is giving {leader} everything they've got!",
  "I've been doing this 49 years and I have NEVER seen wiggling like this!",
]

export const LEAD_CHANGE_LINES = [
  "WAIT — {worm} just surged past {leader}! NEW LEADER!",
  "OH! {worm} has taken the lead! Unbelievable!",
  "The crowd gasps — {worm} has come from NOWHERE!",
  "LEAD CHANGE! {worm} is now in front! What a race!",
  "{worm} blows past {leader}! This race is far from over!",
]

export const FINAL_STRETCH_LINES = [
  "Down the stretch they come!",
  "We are in the FINAL STRETCH, folks!",
  "Someone is about to make history right here in Banner Elk!",
  "This is it! The finish line is RIGHT THERE!",
]

export const WINNER_LINES = [
  "And your 2026 Family Trip Woolly Worm Champion is... {winner}!",
  "{winner} WINS IT! {winner} WINS THE WHOLE THING!",
  "PUT IT IN THE BOOKS — {winner} is your 2026 champion!",
  "Worm raced by {kid} takes the crown! What a day! What a race!",
]

// Pick a random line from a template array and fill in variables
export function pickLine(templates, vars = {}) {
  const template = templates[Math.floor(Math.random() * templates.length)]
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}
