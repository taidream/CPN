export type Entry = {
  id: string;
  date: string;
  moneySpent: number;
  timeSpentHours: number;
  mentalEffort: number;
  attractiveness: number;
  personality: number;
  sexEnjoyment: number;
  nuts: number;
  hotScore: number;
  crazyScore: number;
  notes?: string;
};

export type Settings = {
  cpnBudget: number;
  valuePerHour: number;
  valuePerEffortPoint: number;
  weights: {
    attractivenessWeight: number;
    personalityWeight: number;
    sexEnjoymentWeight: number;
  };
  memeMode: boolean;
  blurMode: boolean;
};

export type EntryComputed = Entry & {
  baseCost: number;
  rewardScore: number;
  hotCrazyRisk: number;
  adjustedCost: number;
  cpn: number | null;
};
