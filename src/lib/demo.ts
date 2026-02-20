import { v4 as uuidv4 } from "uuid";
import { AppState, DateEntry, PartnerProfile, Settings } from "@/lib/types";

export const defaultSettings: Settings = {
  outcomeLabel: "sex",
  budgetsPerOutcome: {
    budgetMoneyPerOutcome: 50,
    budgetHoursPerOutcome: 2,
    budgetEffortPerOutcome: 5
  },
  moneyInputModeDefault: "simple",
  includeDuringTimeDefault: false,
  freeResetUsed: false,
  plan: "free"
};

export function makeDemoPartner(): PartnerProfile {
  return {
    id: uuidv4(),
    nickname: "Squirrel Queen",
    age: 27,
    sexOrGender: "woman",
    whereMet: "Tinder",
    goal: "dating",
    notes: "Funny, smart, occasionally late.",
    redFlagsNotes: "Owns 14 houseplants named after exes.",
    looks: 8,
    personality: 7,
    hot: 8,
    drama: 6,
    redFlags: 5,
    greenFlags: 7
  };
}

export function makeDemoEntries(partnerId: string): DateEntry[] {
  const now = Date.now();
  return [
    {
      id: uuidv4(),
      partnerId,
      date: new Date(now - 1000 * 60 * 60 * 24 * 14).toISOString(),
      quickName: "Cocktails & chaos",
      location: { venue: "Barrel & Bloom", city: "Berlin", district: "Mitte", country: "DE" },
      timeOfDay: "evening",
      timePrepMinutes: 35,
      timeCommuteMinutes: 50,
      timeDuringMinutes: 120,
      includeDuringTime: false,
      moneyMode: "simple",
      moneyTotal: 74,
      moneyFood: 0,
      moneyDrinks: 0,
      moneyTickets: 0,
      moneyGifts: 0,
      moneyTips: 0,
      moneyOther: 0,
      mentalEffort: 7,
      sexEnjoyment: 4,
      hotOverride: null,
      dramaOverride: 7,
      redFlagsOverride: null,
      greenFlagsOverride: null,
      outcomeCount: 0,
      notes: "Great banter. Zero scoreboard movement."
    },
    {
      id: uuidv4(),
      partnerId,
      date: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      quickName: "Pasta diplomacy",
      location: { venue: "Nonna Mia", city: "Berlin", district: "Neukölln", country: "DE" },
      timeOfDay: "night",
      timePrepMinutes: 20,
      timeCommuteMinutes: 30,
      timeDuringMinutes: 180,
      includeDuringTime: true,
      moneyMode: "advanced",
      moneyTotal: 0,
      moneyFood: 32,
      moneyDrinks: 18,
      moneyTickets: 0,
      moneyGifts: 0,
      moneyTips: 5,
      moneyOther: 0,
      mentalEffort: 5,
      sexEnjoyment: 8,
      hotOverride: null,
      dramaOverride: null,
      redFlagsOverride: 4,
      greenFlagsOverride: 8,
      outcomeCount: 1,
      notes: "Excellent negotiation outcome."
    },
    {
      id: uuidv4(),
      partnerId,
      date: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      quickName: "Free park date",
      location: { venue: "Riverside Park", city: "Berlin", district: "Kreuzberg", country: "DE" },
      timeOfDay: "day",
      timePrepMinutes: 10,
      timeCommuteMinutes: 65,
      timeDuringMinutes: 90,
      includeDuringTime: false,
      moneyMode: "simple",
      moneyTotal: 0,
      moneyFood: 0,
      moneyDrinks: 0,
      moneyTickets: 0,
      moneyGifts: 0,
      moneyTips: 0,
      moneyOther: 0,
      mentalEffort: 2,
      sexEnjoyment: 7,
      hotOverride: 9,
      dramaOverride: 5,
      redFlagsOverride: 2,
      greenFlagsOverride: 9,
      outcomeCount: 1,
      notes: "Sunset diffused all nonsense."
    }
  ];
}

export function makeInitialState(): AppState {
  const partner = makeDemoPartner();
  return {
    settings: defaultSettings,
    partners: [partner],
    entries: makeDemoEntries(partner.id)
  };
}
