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
  "Soon-To-Be-Named",
];

const funnyFoodPromptFilenames = [
  "prompt-potion",
  "context-casserole",
  "prompt-pickle",
  "inspiration-soup",
  "token-taco",
  "prompt-pretzel",
  "brain-burrito",
  "prompt-parfait",
  "mind-meatball",
  "idea-icecream",
  "prompt-pancake",
  "genius-gumbo",
  "creativity-cupcake",
  "neural-nuggets",
  "prompt-pizza",
  "context-cocktail",
  "thought-trifle",
  "prompt-popsicle",
  "wisdom-waffle",
  "insight-ice-cream",
  "knowledge-kebab",
  "concept-cookie",
  "brainstorm-burger",
  "idea-italian-ice",
  "thought-taco",
];

export const getRandomUntitledPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * titlePlaceholders.length);
  return titlePlaceholders[randomIndex];
};

export const getRandomFoodFilename = () => {
  const randomIndex = Math.floor(
    Math.random() * funnyFoodPromptFilenames.length,
  );
  return `${funnyFoodPromptFilenames[randomIndex]}.md`;
};
