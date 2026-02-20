import { AchievementKey, ComputedEntry, DateEntry, PartnerProfile, Settings } from "@/lib/types";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const average = (...nums: number[]) => nums.reduce((s, n) => s + n, 0) / Math.max(1, nums.length);

export function computeEntry(entry: DateEntry, partner: PartnerProfile | undefined, settings: Settings): ComputedEntry {
  const fiscalCost =
    entry.moneyMode === "simple"
      ? Math.max(0, entry.moneyTotal)
      : Math.max(0, entry.moneyFood + entry.moneyDrinks + entry.moneyTickets + entry.moneyGifts + entry.moneyTips + entry.moneyOther);

  // IMPORTANT PRODUCT RULE: we never multiply time by money and never convert hours to euros.
  const timeCostHardHours = (Math.max(0, entry.timePrepMinutes) + Math.max(0, entry.timeCommuteMinutes)) / 60;
  const timeCostSoftHours = Math.max(0, entry.timeDuringMinutes) / 60;
  const timeCostHours = timeCostHardHours + (entry.includeDuringTime ? timeCostSoftHours : 0);
  const effortCost = clamp(entry.mentalEffort, 0, 10);

  const cpnMoney = entry.outcomeCount > 0 ? fiscalCost / entry.outcomeCount : null;
  const cpnTime = entry.outcomeCount > 0 ? timeCostHours / entry.outcomeCount : null;
  const cpnEffort = entry.outcomeCount > 0 ? effortCost / entry.outcomeCount : null;

  const projectedCPNMoney = fiscalCost;
  const projectedCPNTime = timeCostHours;
  const projectedCPNEffort = effortCost;

  const rMoneyProjected = projectedCPNMoney / Math.max(1, settings.budgetsPerOutcome.budgetMoneyPerOutcome);
  const rTimeProjected = projectedCPNTime / Math.max(0.1, settings.budgetsPerOutcome.budgetHoursPerOutcome);
  const rEffortProjected = projectedCPNEffort / Math.max(0.1, settings.budgetsPerOutcome.budgetEffortPerOutcome);

  const projectedCostRatio = average(rMoneyProjected, rTimeProjected, rEffortProjected);

  const rMoney = cpnMoney !== null ? cpnMoney / Math.max(1, settings.budgetsPerOutcome.budgetMoneyPerOutcome) : null;
  const rTime = cpnTime !== null ? cpnTime / Math.max(0.1, settings.budgetsPerOutcome.budgetHoursPerOutcome) : null;
  const rEffort = cpnEffort !== null ? cpnEffort / Math.max(0.1, settings.budgetsPerOutcome.budgetEffortPerOutcome) : null;
  const costRatio = rMoney !== null && rTime !== null && rEffort !== null ? average(rMoney, rTime, rEffort) : null;

  const hotEffective = entry.hotOverride ?? partner?.hot ?? 5;
  const dramaEffective = entry.dramaOverride ?? partner?.drama ?? 5;
  const redFlagsEffective = entry.redFlagsOverride ?? partner?.redFlags ?? 5;
  const greenFlagsEffective = entry.greenFlagsOverride ?? partner?.greenFlags ?? 5;

  const riskRaw = 0.45 * dramaEffective + 0.85 * redFlagsEffective - 0.65 * greenFlagsEffective;
  const riskIndex = clamp(riskRaw / 10, 0, 1);

  const adjustedCostRatio = costRatio !== null ? costRatio * (1 + 0.6 * riskIndex) : null;
  const valueIndex = clamp(entry.sexEnjoyment, 0, 10) / 10;
  const pursuitScore = Math.round((100 * valueIndex) / Math.max(0.1, adjustedCostRatio ?? projectedCostRatio * (1 + 0.6 * riskIndex)));

  const traffic: ComputedEntry["traffic"] =
    adjustedCostRatio === null ? "pending" : adjustedCostRatio < 0.85 ? "green" : adjustedCostRatio <= 1.1 ? "orange" : "red";

  return {
    ...entry,
    partnerNickname: partner?.nickname ?? "Unknown",
    fiscalCost,
    timeCostHardHours,
    timeCostSoftHours,
    timeCostHours,
    effortCost,
    cpnMoney,
    cpnTime,
    cpnEffort,
    projectedCostRatio,
    costRatio,
    riskIndex,
    adjustedCostRatio,
    valueIndex,
    pursuitScore,
    hotEffective,
    dramaEffective,
    redFlagsEffective,
    greenFlagsEffective,
    traffic
  };
}

export function computeAll(entries: DateEntry[], partners: PartnerProfile[], settings: Settings) {
  const byId = new Map(partners.map((p) => [p.id, p]));
  const computed = [...entries]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((entry) => computeEntry(entry, byId.get(entry.partnerId), settings));

  const totalFiscalCost = computed.reduce((s, e) => s + e.fiscalCost, 0);
  const totalTimeHours = computed.reduce((s, e) => s + e.timeCostHours, 0);
  const totalEffort = computed.reduce((s, e) => s + e.effortCost, 0);
  const totalOutcomes = computed.reduce((s, e) => s + e.outcomeCount, 0);

  const totalCpnMoney = totalFiscalCost / Math.max(1, totalOutcomes);
  const totalCpnTime = totalTimeHours / Math.max(1, totalOutcomes);
  const totalCpnEffort = totalEffort / Math.max(1, totalOutcomes);

  const outcomeDates = computed.filter((e) => e.outcomeCount > 0 && e.adjustedCostRatio !== null);
  const trendUp = outcomeDates.length >= 3 ? (outcomeDates.at(-1)?.adjustedCostRatio ?? 0) > (outcomeDates.at(-3)?.adjustedCostRatio ?? 0) : false;

  const latest = computed.at(-1);
  const decision = !latest
    ? "No data"
    : latest.pursuitScore >= 90 && latest.riskIndex < 0.4 && !trendUp
      ? "Continue"
      : latest.pursuitScore <= 55 || latest.riskIndex > 0.7 || trendUp
        ? "Cut"
        : "Pause";

  const monthly = aggregateBy(computed, (d) => `${new Date(d.date).getFullYear()}-${String(new Date(d.date).getMonth() + 1).padStart(2, "0")}`);
  const weekly = aggregateBy(computed, (d) => `${new Date(d.date).getFullYear()}-W${weekNumber(new Date(d.date))}`);

  const achievements = computeAchievements(computed);

  return {
    computed,
    latest,
    totalFiscalCost,
    totalTimeHours,
    totalEffort,
    totalOutcomes,
    totalCpnMoney,
    totalCpnTime,
    totalCpnEffort,
    trendUp,
    decision,
    monthly,
    weekly,
    achievements
  };
}

function aggregateBy(entries: ComputedEntry[], keyFn: (e: ComputedEntry) => string) {
  const acc = new Map<string, { label: string; fiscal: number; time: number; effort: number; outcomes: number }>();
  entries.forEach((e) => {
    const key = keyFn(e);
    const v = acc.get(key) ?? { label: key, fiscal: 0, time: 0, effort: 0, outcomes: 0 };
    v.fiscal += e.fiscalCost;
    v.time += e.timeCostHours;
    v.effort += e.effortCost;
    v.outcomes += e.outcomeCount;
    acc.set(key, v);
  });
  return [...acc.values()];
}

function weekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function computeAchievements(entries: ComputedEntry[]): AchievementKey[] {
  const keys = new Set<AchievementKey>();
  if (entries.some((e) => e.outcomeCount > 0 && e.fiscalCost === 0)) keys.add("free-nuts");
  if (entries.some((e) => e.outcomeCount === 0)) keys.add("lousy-receipt");
  if (entries.some((e) => e.mentalEffort <= 2)) keys.add("zen-master");
  if (entries.some((e) => e.timeCommuteMinutes >= 60)) keys.add("commuter-tax");
  if (entries.some((e) => e.fiscalCost >= 200)) keys.add("wallet-damage");
  if (entries.filter((e) => e.greenFlagsEffective >= 8).length >= 3) keys.add("green-flag-magnet");
  if (entries.some((e) => e.dramaEffective >= 9)) keys.add("fire-alarm");
  if (entries.some((e) => e.adjustedCostRatio !== null && e.adjustedCostRatio >= 0.8 && e.adjustedCostRatio <= 0.9 && e.outcomeCount > 0)) keys.add("budget-sniper");
  const last3Outcomes = entries.filter((e) => e.outcomeCount > 0 && e.adjustedCostRatio !== null).slice(-3);
  if (last3Outcomes.length === 3 && (last3Outcomes[0].adjustedCostRatio ?? 9) > (last3Outcomes[1].adjustedCostRatio ?? 9) && (last3Outcomes[1].adjustedCostRatio ?? 9) > (last3Outcomes[2].adjustedCostRatio ?? 9)) {
    keys.add("getting-cheaper");
  }
  return [...keys];
}
