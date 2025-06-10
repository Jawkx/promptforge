const titlePlaceholders = [
  "Nameless Nugget",
  "Untitled Sparkle",
  "Mystery Mew",
  "Give Me A Name, Please?",
  "Whatchamacallit",
  "Pipsqueak Page",
  "Cloudy Canvas",
  "Whisper Doc",
  "Little Doodle",
  "Blush Blank",
  "No-Name Nook",
  "Soon-To-Be-Named"
]

export const getRandomUntitledPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * titlePlaceholders.length);
  return titlePlaceholders[randomIndex];
}
