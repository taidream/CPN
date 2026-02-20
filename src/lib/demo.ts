import { v4 as uuidv4 } from "uuid";
import { Entry, Settings } from "@/lib/types";

export const defaultSettings: Settings = {
  cpnBudget: 120,
  valuePerHour: 25,
  valuePerEffortPoint: 8,
  weights: {
    attractivenessWeight: 40,
    personalityWeight: 35,
    sexEnjoymentWeight: 25
  },
  memeMode: true,
  blurMode: false
};

export const demoEntries = (): Entry[] => {
  const now = new Date();
  return [
    {
      id: uuidv4(),
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      moneySpent: 78,
      timeSpentHours: 4,
      mentalEffort: 7,
      attractiveness: 9,
      personality: 6,
      sexEnjoyment: 7,
      nuts: 0,
      hotScore: 9,
      crazyScore: 8,
      notes: "Fancy drinks + deep lore dump"
    },
    {
      id: uuidv4(),
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      moneySpent: 40,
      timeSpentHours: 3,
      mentalEffort: 5,
      attractiveness: 8,
      personality: 7,
      sexEnjoyment: 8,
      nuts: 1,
      hotScore: 8,
      crazyScore: 5,
      notes: "Home-cooked pasta redemption arc"
    },
    {
      id: uuidv4(),
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      moneySpent: 25,
      timeSpentHours: 2,
      mentalEffort: 3,
      attractiveness: 8,
      personality: 8,
      sexEnjoyment: 9,
      nuts: 2,
      hotScore: 8,
      crazyScore: 4,
      notes: "Movie night + excellent vibes"
    }
  ];
};
