export type Plan = "free" | "paid";
export type MoneyMode = "simple" | "advanced";
export type TimeOfDay = "morning" | "day" | "evening" | "night";

export type Settings = {
  outcomeLabel: string;
  budgetsPerOutcome: {
    budgetMoneyPerOutcome: number;
    budgetHoursPerOutcome: number;
    budgetEffortPerOutcome: number;
  };
  moneyInputModeDefault: MoneyMode;
  includeDuringTimeDefault: boolean;
  freeResetUsed: boolean;
  plan: Plan;
};

export type PartnerProfile = {
  id: string;
  nickname: string;
  age?: number;
  sexOrGender?: string;
  whereMet?: string;
  goal?: string;
  notes?: string;
  redFlagsNotes?: string;
  looks: number;
  personality: number;
  hot: number;
  drama: number;
  redFlags: number;
  greenFlags: number;
};

export type DateEntry = {
  id: string;
  partnerId: string;
  date: string;
  quickName: string;
  location: {
    country?: string;
    city?: string;
    district?: string;
    venue: string;
  };
  timeOfDay: TimeOfDay;
  timePrepMinutes: number;
  timeCommuteMinutes: number;
  timeDuringMinutes: number;
  includeDuringTime: boolean;
  moneyMode: MoneyMode;
  moneyTotal: number;
  moneyFood: number;
  moneyDrinks: number;
  moneyTickets: number;
  moneyGifts: number;
  moneyTips: number;
  moneyOther: number;
  mentalEffort: number;
  sexEnjoyment: number;
  hotOverride: number | null;
  dramaOverride: number | null;
  redFlagsOverride: number | null;
  greenFlagsOverride: number | null;
  outcomeCount: number;
  notes?: string;
};

export type AchievementKey =
  | "free-nuts"
  | "lousy-receipt"
  | "zen-master"
  | "commuter-tax"
  | "wallet-damage"
  | "green-flag-magnet"
  | "fire-alarm"
  | "budget-sniper"
  | "getting-cheaper";

export type ComputedEntry = DateEntry & {
  partnerNickname: string;
  fiscalCost: number;
  timeCostHardHours: number;
  timeCostSoftHours: number;
  timeCostHours: number;
  effortCost: number;
  cpnMoney: number | null;
  cpnTime: number | null;
  cpnEffort: number | null;
  projectedCostRatio: number;
  costRatio: number | null;
  riskIndex: number;
  adjustedCostRatio: number | null;
  valueIndex: number;
  pursuitScore: number;
  hotEffective: number;
  dramaEffective: number;
  redFlagsEffective: number;
  greenFlagsEffective: number;
  traffic: "green" | "orange" | "red" | "pending";
};

export type AppState = {
  settings: Settings;
  partners: PartnerProfile[];
  entries: DateEntry[];
};
