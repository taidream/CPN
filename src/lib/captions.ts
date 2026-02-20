export const zoneCaptions: Record<string, string[]> = {
  "hot-highdrama": ["10/10 face card, 11/10 plot twists.", "Ferrari energy, check-engine light on.", "Elite chemistry, premium chaos surcharge."],
  "hot-lowdrama": ["This is the mythical green-zone baddie.", "Smooth vibes, no jump scares.", "Attractive and stable? Rare drop."],
  "cold-highdrama": ["Low heat, high sirens. Tactical retreat.", "This feels like paying for stress.", "Boredom plus chaos is evil math."],
  "cold-lowdrama": ["Peaceful, low volatility, maybe friend arc.", "Calm and affordable, not blockbuster.", "Stable but not setting your soul on fire."]
};

export function pickCaption(hot: number, drama: number) {
  const key = `${hot >= 6 ? "hot" : "cold"}-${drama >= 6 ? "highdrama" : "lowdrama"}`;
  const pool = zoneCaptions[key] ?? zoneCaptions["hot-lowdrama"];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const achievementMeta = {
  "free-nuts": "👑 Free Nuts",
  "lousy-receipt": "🧾 Lousy Receipt",
  "zen-master": "🧘 Zen Master",
  "commuter-tax": "🚇 Commuter Tax",
  "wallet-damage": "💸 Wallet Damage",
  "green-flag-magnet": "🍀 Green Flag Magnet",
  "fire-alarm": "🚨 Fire Alarm",
  "budget-sniper": "🎯 Budget Sniper",
  "getting-cheaper": "📉 Getting Cheaper"
} as const;
