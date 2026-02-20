const captions = {
  green: {
    safe: [
      "Spreadsheet says this is financially romantic.",
      "CPN lower than delivery fees. Elite efficiency.",
      "This connection is basically a value ETF.",
      "Budget happy, heart happy.",
      "High ROI, low chaos, keep cooking.",
      "Boy math certified: sustainable fun.",
      "This is what responsible delusion looks like.",
      "Green light and goodnight."
    ],
    mixed: [
      "Cute and chaotic, but still under budget.",
      "You are surfing risk and still winning.",
      "A little turbulence, still profitable.",
      "Hazard lights off, playlist on.",
      "You can fix nothing, but numbers look fine.",
      "Mild chaos, premium memories.",
      "Proceed with hydration and boundaries.",
      "Good value, keep both eyes open."
    ]
  },
  orange: {
    safe: [
      "Borderline budget behavior. Tighten up.",
      "Romance inflation detected.",
      "Numbers say chill, feelings say spend.",
      "This is a yellow card from finance bro court.",
      "Fun is up, efficiency is wobbling.",
      "Maybe switch steakhouse to tacos.",
      "Decent vibes, expensive logistics.",
      "You are one impulse buy from red zone."
    ],
    mixed: [
      "Attractive chaos tax is kicking in.",
      "This graph is flirting with regret.",
      "Budget alarm: medium screaming.",
      "Pause and renegotiate expectations.",
      "Chaos + costs = cardio for your wallet.",
      "Receipts are starting to look cinematic.",
      "Potential lore, questionable economics.",
      "Cute but costly—manage the burn rate."
    ]
  },
  red: {
    safe: [
      "CPN went supernova. Abort mission.",
      "Wallet says no even if group chat says yes.",
      "This is not dating, this is venture burn.",
      "Hard cut before your savings file a complaint.",
      "Red zone romance: dramatic and expensive.",
      "Fun ratio collapsed. Reboot strategy.",
      "You are paying luxury prices for normal outcomes.",
      "Numbers are shouting; listen respectfully."
    ],
    mixed: [
      "Hot-crazy premium reached legendary levels.",
      "Risk-adjusted cuddles are not penciling out.",
      "This is plot-driven spending.",
      "The meme is funny, the CPN is not.",
      "Call timeout. Protect peace and payroll.",
      "Budget funeral with premium seating.",
      "High chaos, low value, maximum lore.",
      "Cut losses, keep dignity."
    ]
  }
} as const;

export function getCaption(cpnColor: "green" | "orange" | "red", risky: boolean): string {
  const pool = risky ? captions[cpnColor].mixed : captions[cpnColor].safe;
  return pool[Math.floor(Math.random() * pool.length)];
}
