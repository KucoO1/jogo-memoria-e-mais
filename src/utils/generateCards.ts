export const themes = {
  animals: ["🐶", "🐱", "🐭", "🐹", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁"],
  food: ["🍕", "🍔", "🍟", "🌭", "🍣", "🍩", "🍪", "🍫", "🍿", "🥐"],
  transport: ["🚗", "🚕", "🚙", "🚌", "🚎", "🚓", "🚑", "🚒", "🚜", "🚲"],
} as const;

// tipo das chaves ("animals" | "food" | "transport")
export type ThemeKey = keyof typeof themes;

export function generateCards(size: number, theme: ThemeKey) {
  const emojis = themes[theme];
  const neededPairs = (size * size) / 2;

  const selected = emojis.slice(0, neededPairs);
  const cards = [...selected, ...selected]
    .sort(() => Math.random() - 0.5)
    .map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false,
    }));

  return cards;
}
