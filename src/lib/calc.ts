import { Entry, EntryComputed, Settings } from "@/lib/types";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeWeights = (settings: Settings) => {
  const { attractivenessWeight, personalityWeight, sexEnjoymentWeight } = settings.weights;
  const total = Math.max(1, attractivenessWeight + personalityWeight + sexEnjoymentWeight);
  return {
    attractivenessWeight: attractivenessWeight / total,
    personalityWeight: personalityWeight / total,
    sexEnjoymentWeight: sexEnjoymentWeight / total
  };
};

export function computeEntry(entry: Entry, settings: Settings): EntryComputed {
  const normalizedWeights = normalizeWeights(settings);

  // baseCost = moneySpent + (timeSpentHours * valuePerHour) + (mentalEffort * valuePerEffortPoint)
  const baseCost =
    entry.moneySpent +
    entry.timeSpentHours * settings.valuePerHour +
    entry.mentalEffort * settings.valuePerEffortPoint;

  // rewardScore = weighted average of attractiveness/personality/sexEnjoyment (0–10 scale)
  const rewardScore =
    entry.attractiveness * normalizedWeights.attractivenessWeight +
    entry.personality * normalizedWeights.personalityWeight +
    entry.sexEnjoyment * normalizedWeights.sexEnjoymentWeight;

  // hotCrazyRisk = clamp((crazyScore - (hotScore * 0.7)) / 10, 0, 1)
  const hotCrazyRisk = clamp((entry.crazyScore - entry.hotScore * 0.7) / 10, 0, 1);

  // adjustedCost = baseCost * (1 + hotCrazyRisk * 0.8)
  // risk can add up to +80% cost
  const adjustedCost = baseCost * (1 + hotCrazyRisk * 0.8);

  // CPN per entry: if nuts > 0 => adjustedCost / nuts, else pending
  const cpn = entry.nuts > 0 ? adjustedCost / entry.nuts : null;

  return {
    ...entry,
    baseCost,
    rewardScore,
    hotCrazyRisk,
    adjustedCost,
    cpn
  };
}

export function computeAll(entries: Entry[], settings: Settings) {
  const computed = [...entries]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((entry) => computeEntry(entry, settings));

  const totalAdjustedCost = computed.reduce((sum, entry) => sum + entry.adjustedCost, 0);
  const totalNuts = computed.reduce((sum, entry) => sum + entry.nuts, 0);
  const totalCostPerNut = totalAdjustedCost / Math.max(1, totalNuts);

  const firstNutIndex = computed.findIndex((entry) => entry.nuts > 0);
  const icon = firstNutIndex === -1 ? totalAdjustedCost : computed.slice(0, firstNutIndex).reduce((s, e) => s + e.adjustedCost, 0);
  const afterFirst = firstNutIndex === -1 ? [] : computed.slice(firstNutIndex + 1).filter((entry) => entry.nuts > 0);
  const avgAfterFirst = afterFirst.length > 0 ? afterFirst.reduce((s, e) => s + (e.cpn ?? 0), 0) / afterFirst.length : 0;
  const tcpn = icon + avgAfterFirst * (firstNutIndex === -1 ? 0 : computed.length - (firstNutIndex + 1));

  const rollingCpn = computed.map((_, i) => {
    const window = computed.slice(Math.max(0, i - 2), i + 1);
    const cost = window.reduce((s, e) => s + e.adjustedCost, 0);
    const nuts = window.reduce((s, e) => s + e.nuts, 0);
    return {
      date: computed[i].date,
      rollingCpn: cost / Math.max(1, nuts)
    };
  });

  const trendWindow = rollingCpn.slice(-3);
  const trendingUp = trendWindow.length >= 2 ? trendWindow[trendWindow.length - 1].rollingCpn > trendWindow[0].rollingCpn : false;

  return {
    computed,
    totalAdjustedCost,
    totalNuts,
    totalCostPerNut,
    icon,
    tcpn,
    rollingCpn,
    trendingUp
  };
}

export function cpnColor(cpn: number, budget: number): "green" | "orange" | "red" {
  if (cpn < budget * 0.85) return "green";
  if (cpn <= budget * 1.1) return "orange";
  return "red";
}
