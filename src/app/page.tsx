"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { pickCaption, achievementMeta } from "@/lib/captions";
import { computeAll } from "@/lib/calc";
import { defaultSettings } from "@/lib/demo";
import { exportStateJson, importStateJson, loadState, resetState, saveState } from "@/lib/storage";
import { AppState, DateEntry, MoneyMode, PartnerProfile, Settings, TimeOfDay } from "@/lib/types";

const tabs = ["Partner", "Log Date", "Dashboard", "Analytics", "Entries", "Achievements", "Settings"] as const;

const blankPartner = (): PartnerProfile => ({
  id: uuidv4(),
  nickname: "",
  age: undefined,
  sexOrGender: "",
  whereMet: "",
  goal: "",
  notes: "",
  redFlagsNotes: "",
  looks: 5,
  personality: 5,
  hot: 5,
  drama: 5,
  redFlags: 5,
  greenFlags: 5
});

const blankDate = (partnerId: string, settings: Settings): DateEntry => ({
  id: uuidv4(),
  partnerId,
  date: new Date().toISOString().slice(0, 10),
  quickName: "",
  location: { venue: "", country: "", city: "", district: "" },
  timeOfDay: "evening",
  timePrepMinutes: 0,
  timeCommuteMinutes: 0,
  timeDuringMinutes: 0,
  includeDuringTime: settings.includeDuringTimeDefault,
  moneyMode: settings.moneyInputModeDefault,
  moneyTotal: 0,
  moneyFood: 0,
  moneyDrinks: 0,
  moneyTickets: 0,
  moneyGifts: 0,
  moneyTips: 0,
  moneyOther: 0,
  mentalEffort: 5,
  sexEnjoyment: 5,
  hotOverride: null,
  dramaOverride: null,
  redFlagsOverride: null,
  greenFlagsOverride: null,
  outcomeCount: 0,
  notes: ""
});

const sliderText = {
  hot: ["Grandpa mode", "Greek god"],
  drama: ["Zen monk", "Fire alarm"],
  redFlags: ["Clean record", "Interpol ping"],
  greenFlags: ["Meh", "Wife energy"],
  looks: ["Looks like trouble", "Head-turner"],
  personality: ["NPC", "Unreal vibe"],
  mentalEffort: ["Effortless", "Emotional CrossFit"],
  sexEnjoyment: ["Tax audit", "Life upgrade"]
};

export default function Home() {
  const [state, setState] = useState<AppState>({ settings: defaultSettings, partners: [], entries: [] });
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Log Date");
  const [partnerDraft, setPartnerDraft] = useState<PartnerProfile>(blankPartner());
  const [entryDraft, setEntryDraft] = useState<DateEntry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    partnerId: "all",
    range: "all",
    weekday: "all",
    timeOfDay: "all",
    search: ""
  });
  const [panic, setPanic] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const storyRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setPartnerDraft(loaded.partners[0] ?? blankPartner());
    setEntryDraft(blankDate(loaded.partners[0]?.id ?? "", loaded.settings));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveState(state), 250);
    return () => clearTimeout(timer);
  }, [state]);

  const activePartner = state.partners[0];

  useEffect(() => {
    if (activePartner && (!entryDraft || !entryDraft.partnerId)) {
      setEntryDraft(blankDate(activePartner.id, state.settings));
    }
  }, [activePartner, entryDraft, state.settings]);

  const stats = useMemo(() => computeAll(state.entries, state.partners, state.settings), [state]);
  const latest = stats.latest;
  const caption = pickCaption(latest?.hotEffective ?? 5, latest?.dramaEffective ?? 5);

  const filteredEntries = useMemo(() => {
    return stats.computed.filter((e) => {
      const date = new Date(e.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const passPartner = filters.partnerId === "all" || e.partnerId === filters.partnerId;
      const passRange =
        filters.range === "all" ||
        (filters.range === "month" && date >= monthAgo) ||
        (filters.range === "year" && date >= yearAgo);
      const passWeekday = filters.weekday === "all" || String(date.getDay()) === filters.weekday;
      const passTime = filters.timeOfDay === "all" || e.timeOfDay === filters.timeOfDay;
      const haystack = `${e.quickName} ${e.location.venue} ${e.location.city ?? ""} ${e.location.country ?? ""}`.toLowerCase();
      const passSearch = !filters.search || haystack.includes(filters.search.toLowerCase());
      return passPartner && passRange && passWeekday && passTime && passSearch;
    });
  }, [stats.computed, filters]);

  const timelineData = filteredEntries.map((e) => ({
    date: new Date(e.date).toLocaleDateString(),
    fiscal: Number(e.fiscalCost.toFixed(2)),
    time: Number(e.timeCostHours.toFixed(2)),
    effort: Number(e.effortCost.toFixed(2)),
    cpnMoney: Number((e.cpnMoney ?? 0).toFixed(2)),
    cpnTime: Number((e.cpnTime ?? 0).toFixed(2)),
    cpnEffort: Number((e.cpnEffort ?? 0).toFixed(2)),
    pursuit: e.pursuitScore
  }));

  const venueBoard = useMemo(() => {
    const map = new Map<string, { venue: string; avg: number; count: number }>();
    filteredEntries.forEach((e) => {
      const prev = map.get(e.location.venue) ?? { venue: e.location.venue, avg: 0, count: 0 };
      prev.avg = (prev.avg * prev.count + (e.adjustedCostRatio ?? e.projectedCostRatio)) / (prev.count + 1);
      prev.count += 1;
      map.set(e.location.venue, prev);
    });
    return [...map.values()].sort((a, b) => a.avg - b.avg);
  }, [filteredEntries]);

  const weekdaySummary = useMemo(() => {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return names.map((name, i) => {
      const group = filteredEntries.filter((e) => new Date(e.date).getDay() === i);
      const avg = group.length ? group.reduce((s, e) => s + e.pursuitScore, 0) / group.length : 0;
      return { day: name, count: group.length, avg: Number(avg.toFixed(1)) };
    });
  }, [filteredEntries]);

  const decisionCopy =
    stats.decision === "Continue"
      ? "Continue: solid value, low drama tax."
      : stats.decision === "Cut"
        ? "Cut: your wallet says no and your peace agrees."
        : "Pause: mixed signals, run another low-cost test date.";

  const onSavePartner = (e: FormEvent) => {
    e.preventDefault();
    if (!partnerDraft.nickname.trim()) return;
    if (state.settings.plan === "free" && state.partners.length >= 1 && !state.partners.find((p) => p.id === partnerDraft.id)) return;
    setState((old) => {
      const exists = old.partners.some((p) => p.id === partnerDraft.id);
      const partners = exists ? old.partners.map((p) => (p.id === partnerDraft.id ? partnerDraft : p)) : [...old.partners, partnerDraft];
      return { ...old, partners };
    });
  };

  const moneyTotalFromAdvanced = (d: DateEntry) => d.moneyFood + d.moneyDrinks + d.moneyTickets + d.moneyGifts + d.moneyTips + d.moneyOther;

  const onSaveEntry = (e: FormEvent) => {
    e.preventDefault();
    if (!entryDraft || !entryDraft.quickName.trim() || !entryDraft.location.venue.trim()) return;
    if (state.settings.plan === "free" && state.entries.length >= 5 && !editingId) return;

    const payload: DateEntry = {
      ...entryDraft,
      id: editingId ?? uuidv4(),
      date: new Date(entryDraft.date).toISOString(),
      moneyTotal: entryDraft.moneyMode === "advanced" ? moneyTotalFromAdvanced(entryDraft) : entryDraft.moneyTotal
    };

    setState((old) => {
      const entries = editingId ? old.entries.map((x) => (x.id === editingId ? payload : x)) : [payload, ...old.entries];
      return { ...old, entries };
    });
    setEditingId(null);
    setEntryDraft(blankDate(activePartner?.id ?? "", state.settings));
  };

  const exportPng = async (name: string, el: HTMLDivElement | null) => {
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: "#020617", scale: 2 });
    const a = document.createElement("a");
    a.download = `${name}-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const resetAll = () => {
    if (state.settings.plan === "free" && state.settings.freeResetUsed) return;
    const fresh = resetState();
    setState((s) => ({ ...fresh, settings: { ...fresh.settings, freeResetUsed: s.settings.plan === "free" ? true : false, plan: s.settings.plan } }));
  };

  const importBackup = async (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importStateJson(file);
      setState(imported);
    } catch {
      alert("Invalid JSON backup file.");
    }
  };

  if (panic) {
    return (
      <main className="min-h-screen bg-emerald-50 p-10 text-emerald-900">
        <h1 className="text-4xl font-black">Totally Normal Gardening Club</h1>
        <p className="mt-3 max-w-2xl">This is a very normal page about gardening and nothing suspicious is happening. We discuss compost, tulips, and emotional hydration for ferns.</p>
        <button className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white" onClick={() => setPanic(false)}>Return to CPN HQ</button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 pb-20 md:p-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-black">BOY MATH: Cost per Nut (CPN) V2</h1>
          <p className="text-sm text-slate-300">No time*money. Ever. We track € + hours + effort separately and normalize to budgets.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPanic(true)} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-black">Panic Button</button>
          <button onClick={() => exportStateJson(state)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold">Export JSON</button>
          <label className="cursor-pointer rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold">Import JSON<input type="file" accept="application/json" className="hidden" onChange={importBackup} /></label>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab ? "bg-fuchsia-500" : "bg-slate-800"}`}>{tab}</button>
        ))}
      </div>

      {activeTab === "Partner" && (
        <section className="card space-y-3">
          <p className="text-sm">Active profile label: <span className="font-bold">Squirrel</span>. Free: 1 partner. Paid: unlimited.</p>
          <form onSubmit={onSavePartner} className="grid gap-3 md:grid-cols-3">
            {[
              ["nickname", "Nickname*"],
              ["age", "Age"],
              ["sexOrGender", "Sex/Gender"],
              ["whereMet", "Where met"],
              ["goal", "Goal"]
            ].map(([k, label]) => (
              <div key={k}><label className="label">{label}</label><input className="input" value={String((partnerDraft as Record<string, string | number | undefined>)[k] ?? "")} onChange={(e) => setPartnerDraft((p) => ({ ...p, [k]: k === "age" ? Number(e.target.value || 0) || undefined : e.target.value }))} /></div>
            ))}
            {(["looks", "personality", "hot", "drama", "redFlags", "greenFlags"] as const).map((k) => (
              <Slider key={k} label={k === "hot" ? "Hot" : k === "drama" ? "Drama" : k === "redFlags" ? "Red Flags" : k === "greenFlags" ? "Green Flags" : k === "looks" ? "Looks" : "Personality"} value={partnerDraft[k]} minLabel={sliderText[k][0]} maxLabel={sliderText[k][1]} onChange={(v) => setPartnerDraft((p) => ({ ...p, [k]: v }))} />
            ))}
            <button className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-black md:col-span-3" type="submit">Save Partner</button>
          </form>
          <button onClick={resetAll} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold">Reset (free: {state.settings.freeResetUsed ? "used" : "1 left"})</button>
          {state.settings.freeResetUsed && state.settings.plan === "free" && <p className="text-sm text-amber-300">Free reset spent. Upgrade for unlimited resets.</p>}
        </section>
      )}

      {activeTab === "Log Date" && entryDraft && (
        <section className="card">
          <form onSubmit={onSaveEntry} className="grid gap-3 md:grid-cols-3">
            <div><label className="label">Date*</label><input type="date" className="input" value={entryDraft.date.slice(0, 10)} onChange={(e) => setEntryDraft((d) => d && ({ ...d, date: e.target.value }))} /></div>
            <div><label className="label">Quick name*</label><input className="input" placeholder="Cafe, walk..." value={entryDraft.quickName} onChange={(e) => setEntryDraft((d) => d && ({ ...d, quickName: e.target.value }))} /></div>
            <div><label className="label">Venue*</label><input className="input" value={entryDraft.location.venue} onChange={(e) => setEntryDraft((d) => d && ({ ...d, location: { ...d.location, venue: e.target.value } }))} /></div>
            {(["country", "city", "district"] as const).map((k) => <div key={k}><label className="label">{k}</label><input className="input" value={entryDraft.location[k] ?? ""} onChange={(e) => setEntryDraft((d) => d && ({ ...d, location: { ...d.location, [k]: e.target.value } }))} /></div>)}
            <div><label className="label">Time of day</label><select className="input" value={entryDraft.timeOfDay} onChange={(e) => setEntryDraft((d) => d && ({ ...d, timeOfDay: e.target.value as TimeOfDay }))}><option>morning</option><option>day</option><option>evening</option><option>night</option></select></div>
            <div><label className="label">Money mode</label><select className="input" value={entryDraft.moneyMode} onChange={(e) => setEntryDraft((d) => d && ({ ...d, moneyMode: e.target.value as MoneyMode }))}><option value="simple">simple</option><option value="advanced">advanced</option></select></div>
            {entryDraft.moneyMode === "simple" ? (
              <div className="md:col-span-3"><label className="label">Money total (€) — include everything: food, drinks, gifts, tickets, tips...</label><input type="number" min={0} className="input" value={entryDraft.moneyTotal} onChange={(e) => setEntryDraft((d) => d && ({ ...d, moneyTotal: Number(e.target.value) }))} /></div>
            ) : (
              <>
                {(["moneyFood", "moneyDrinks", "moneyTickets", "moneyGifts", "moneyTips", "moneyOther"] as const).map((k) => <div key={k}><label className="label">{k}</label><input type="number" min={0} className="input" value={entryDraft[k]} onChange={(e) => setEntryDraft((d) => d && ({ ...d, [k]: Number(e.target.value) }))} /></div>)}
                <div className="md:col-span-3 text-sm text-slate-300">Auto total: €{moneyTotalFromAdvanced(entryDraft).toFixed(2)}</div>
              </>
            )}
            <div><label className="label">Prep minutes</label><input type="number" className="input" value={entryDraft.timePrepMinutes} onChange={(e) => setEntryDraft((d) => d && ({ ...d, timePrepMinutes: Number(e.target.value) }))} /></div>
            <div><label className="label">Commute minutes (sum of all commuting)</label><input type="number" className="input" value={entryDraft.timeCommuteMinutes} onChange={(e) => setEntryDraft((d) => d && ({ ...d, timeCommuteMinutes: Number(e.target.value) }))} /></div>
            <div><label className="label">During minutes</label><input type="number" className="input" value={entryDraft.timeDuringMinutes} onChange={(e) => setEntryDraft((d) => d && ({ ...d, timeDuringMinutes: Number(e.target.value) }))} /></div>
            <label className="text-sm md:col-span-3"><input type="checkbox" checked={entryDraft.includeDuringTime} onChange={(e) => setEntryDraft((d) => d && ({ ...d, includeDuringTime: e.target.checked }))} /> Include during-time in CPN_time</label>
            <Slider label="Mental effort" value={entryDraft.mentalEffort} minLabel={sliderText.mentalEffort[0]} maxLabel={sliderText.mentalEffort[1]} onChange={(v) => setEntryDraft((d) => d && ({ ...d, mentalEffort: v }))} />
            <Slider label="Sex enjoyment" value={entryDraft.sexEnjoyment} minLabel={sliderText.sexEnjoyment[0]} maxLabel={sliderText.sexEnjoyment[1]} onChange={(v) => setEntryDraft((d) => d && ({ ...d, sexEnjoyment: v }))} />
            <div><label className="label">Outcome count ({state.settings.outcomeLabel})</label><input type="number" min={0} max={10} className="input" value={entryDraft.outcomeCount} onChange={(e) => setEntryDraft((d) => d && ({ ...d, outcomeCount: Number(e.target.value) }))} /></div>
            <details className="md:col-span-3 rounded-lg border border-slate-700 p-3">
              <summary className="cursor-pointer text-sm font-semibold">Advanced: override partner sliders for this date</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">{(["hotOverride", "dramaOverride", "redFlagsOverride", "greenFlagsOverride"] as const).map((k) => <div key={k}><label className="label">{k} (blank = use partner)</label><input type="number" min={0} max={10} className="input" value={entryDraft[k] ?? ""} onChange={(e) => setEntryDraft((d) => d && ({ ...d, [k]: e.target.value === "" ? null : Number(e.target.value) }))} /></div>)}</div>
            </details>
            <div className="md:col-span-3"><label className="label">Notes</label><textarea className="input min-h-24" value={entryDraft.notes} onChange={(e) => setEntryDraft((d) => d && ({ ...d, notes: e.target.value }))} /></div>
            <button className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-black md:col-span-3" type="submit">{editingId ? "Update Date" : "Save Date"}</button>
            {state.settings.plan === "free" && state.entries.length >= 5 && !editingId && <p className="text-sm text-amber-300 md:col-span-3">Free plan max 5 dates reached. Upgrade to paid for unlimited.</p>}
          </form>
        </section>
      )}

      {activeTab === "Dashboard" && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card" ref={receiptRef}>
            <h3 className="font-bold">CPN quick view</h3>
            <p>€/{state.settings.outcomeLabel}: <b>{stats.totalCpnMoney.toFixed(2)}</b></p>
            <p>hours/{state.settings.outcomeLabel}: <b>{stats.totalCpnTime.toFixed(2)}</b></p>
            <p>effort/{state.settings.outcomeLabel}: <b>{stats.totalCpnEffort.toFixed(2)}</b></p>
            <p>Pursuit score: <b>{latest?.pursuitScore ?? 0}</b></p>
            <p className="text-xs text-slate-300">Tooltip: We never multiply time by money. We normalize €, hours, effort against budgets.</p>
            {latest?.outcomeCount === 0 && <p className="mt-2 text-sm text-amber-300">I went on the date and all I got was friendzone and this lousy receipt.</p>}
            <button className="mt-3 rounded bg-fuchsia-500 px-3 py-2 text-sm font-bold" onClick={() => exportPng("lousy-receipt", receiptRef.current)}>Share Lousy Receipt PNG</button>
          </div>
          <div className="card">
            <h3 className="font-bold">Cost breakdown</h3>
            <p>All-time money: €{stats.totalFiscalCost.toFixed(2)}</p>
            <p>All-time time: {stats.totalTimeHours.toFixed(1)}h</p>
            <p>All-time effort: {stats.totalEffort.toFixed(1)}</p>
            <p>Total outcomes: {stats.totalOutcomes}</p>
            <p className="mt-2 text-sm">This month entries: {stats.monthly.at(-1)?.label ?? "n/a"}</p>
          </div>
          <div className="card">
            <h3 className="font-bold">Decision helper</h3>
            <p className="mt-2 text-3xl font-black">{stats.decision}</p>
            <p className="mt-2 text-sm">{decisionCopy}</p>
            <p className="mt-2 text-xs">Pricing tease: €9.69/mo • €96/year • €169 lifetime</p>
          </div>
          <div className="card md:col-span-3" ref={posterRef}>
            <h3 className="font-bold">Hot–Crazy Poster</h3>
            <p className="text-sm text-slate-300">X=Hot, Y=Drama (yes, we still call it Hot–Crazy for the meme.)</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid stroke="#334155" />
                  <XAxis dataKey="hotEffective" type="number" domain={[0, 10]} />
                  <YAxis dataKey="dramaEffective" type="number" domain={[0, 10]} />
                  <Tooltip formatter={(v) => String(v)} labelFormatter={(_, payload) => payload?.[0]?.payload?.quickName ?? "date"} />
                  <Scatter data={stats.computed} fill="#e879f9" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm">{caption}</p>
            <button className="mt-3 rounded bg-fuchsia-500 px-3 py-2 text-sm font-bold" onClick={() => exportPng("hot-crazy-poster", posterRef.current)}>Share Hot–Crazy Poster PNG</button>
          </div>
          <div className="md:col-span-3 grid gap-3 md:grid-cols-4">
            {["Spend/Time/Effort", "Outcomes + best/worst", "Most common zone", "Fun badge earned"].map((title, i) => (
              <div key={title} ref={storyRefs[i]} className="card aspect-[9/16] h-[380px]"><p className="text-xs uppercase">Weekly recap {i + 1}</p><h4 className="text-xl font-black">{title}</h4><p className="mt-3 text-sm">{i === 0 ? `€${stats.weekly.at(-1)?.fiscal.toFixed(0) ?? 0} • ${stats.weekly.at(-1)?.time.toFixed(1) ?? 0}h • ${stats.weekly.at(-1)?.effort.toFixed(1) ?? 0} effort` : i === 1 ? `Outcomes: ${stats.weekly.at(-1)?.outcomes ?? 0}` : i === 2 ? caption : `Latest badge: ${achievementMeta[stats.achievements.at(-1) ?? "lousy-receipt"]}`}</p></div>
            ))}
          </div>
          <button className="w-fit rounded bg-emerald-500 px-3 py-2 font-bold text-black md:col-span-3" onClick={async () => { for (let i = 0; i < storyRefs.length; i++) await exportPng(`weekly-recap-${i+1}`, storyRefs[i].current); }}>Share Weekly Recap PNG Set</button>
        </section>
      )}

      {activeTab === "Analytics" && (
        <section className="grid gap-4">
          <div className="card grid gap-3 md:grid-cols-5">
            <select className="input" value={filters.partnerId} onChange={(e) => setFilters((f) => ({ ...f, partnerId: e.target.value }))}><option value="all">All partners</option>{state.partners.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}</select>
            <select className="input" value={filters.range} onChange={(e) => setFilters((f) => ({ ...f, range: e.target.value }))}><option value="all">All time</option><option value="month">Last month</option><option value="year">Last year</option></select>
            <select className="input" value={filters.weekday} onChange={(e) => setFilters((f) => ({ ...f, weekday: e.target.value }))}><option value="all">All weekdays</option>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=><option key={d} value={String(i)}>{d}</option>)}</select>
            <select className="input" value={filters.timeOfDay} onChange={(e) => setFilters((f) => ({ ...f, timeOfDay: e.target.value }))}><option value="all">All times</option><option value="morning">Morning</option><option value="day">Day</option><option value="evening">Evening</option><option value="night">Night</option></select>
            <input className="input" placeholder="Search location..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>

          <div className="card h-72"><h3 className="font-bold">Timeline: FiscalCost / Time / Effort</h3><ResponsiveContainer width="100%" height="90%"><LineChart data={timelineData}><CartesianGrid stroke="#334155" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line dataKey="fiscal" stroke="#22c55e" /><Line dataKey="time" stroke="#60a5fa" /><Line dataKey="effort" stroke="#f472b6" /></LineChart></ResponsiveContainer></div>
          <div className="card h-72"><h3 className="font-bold">Per-outcome CPN family</h3><ResponsiveContainer width="100%" height="90%"><LineChart data={timelineData}><CartesianGrid stroke="#334155" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line dataKey="cpnMoney" stroke="#facc15" /><Line dataKey="cpnTime" stroke="#34d399" /><Line dataKey="cpnEffort" stroke="#fb7185" /></LineChart></ResponsiveContainer></div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card"><h3 className="font-bold">Weekday heatmap summary</h3>{weekdaySummary.map((w) => <div key={w.day} className="mt-2 flex justify-between text-sm"><span>{w.day}</span><span>{"🟩".repeat(Math.min(10, Math.round(w.avg / 10))) || "⬜"}</span><span>{w.avg}</span></div>)}</div>
            <div className="card"><h3 className="font-bold">Location leaderboard (best → worst)</h3>{venueBoard.slice(0, 7).map((v) => <p key={v.venue} className="mt-2 text-sm">{v.venue}: ratio {v.avg.toFixed(2)} ({v.count} dates)</p>)}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card"><h3 className="font-bold">Best dates</h3>{[...filteredEntries].sort((a,b)=>b.pursuitScore-a.pursuitScore).slice(0,3).map((e)=><p key={e.id} className="mt-2 text-sm">{e.quickName} @ {e.location.venue} — score {e.pursuitScore}</p>)}</div>
            <div className="card"><h3 className="font-bold">Worst dates</h3>{[...filteredEntries].sort((a,b)=>a.pursuitScore-b.pursuitScore).slice(0,3).map((e)=><p key={e.id} className="mt-2 text-sm">{e.quickName} @ {e.location.venue} — score {e.pursuitScore}</p>)}</div>
          </div>
        </section>
      )}

      {activeTab === "Entries" && (
        <section className="card space-y-2">
          {stats.computed.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-800 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{new Date(e.date).toLocaleDateString()} • {e.quickName} @ {e.location.venue}</p>
                <p className={`rounded px-2 py-1 text-xs font-bold ${e.traffic === "green" ? "bg-emerald-500 text-black" : e.traffic === "orange" ? "bg-amber-400 text-black" : e.traffic === "red" ? "bg-rose-500" : "bg-slate-600"}`}>{e.traffic.toUpperCase()}</p>
              </div>
              <p className="text-sm">outcomes: {e.outcomeCount} • pursuit: {e.pursuitScore} • enjoyment: {e.sexEnjoyment}/10</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded bg-slate-700 px-3 py-1 text-xs" onClick={() => { setEditingId(e.id); setActiveTab("Log Date"); setEntryDraft({ ...e, date: e.date.slice(0,10) }); }}>Edit</button>
                <button className="rounded bg-rose-600 px-3 py-1 text-xs" onClick={() => setState((old) => ({ ...old, entries: old.entries.filter((x) => x.id !== e.id) }))}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "Achievements" && (
        <section className="grid gap-3 md:grid-cols-3">
          {stats.achievements.map((key) => (
            <AchievementCard key={key} title={achievementMeta[key]} onShare={exportPng} />
          ))}
          {stats.achievements.length === 0 && <div className="card">Log dates to unlock badges.</div>}
        </section>
      )}

      {activeTab === "Settings" && (
        <section className="card grid gap-3 md:grid-cols-3">
          <div><label className="label">Outcome label</label><input className="input" value={state.settings.outcomeLabel} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, outcomeLabel: e.target.value } }))} /></div>
          <div><label className="label">Budget money / outcome (€)</label><input type="number" className="input" value={state.settings.budgetsPerOutcome.budgetMoneyPerOutcome} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, budgetsPerOutcome: { ...s.settings.budgetsPerOutcome, budgetMoneyPerOutcome: Number(e.target.value) } } }))} /></div>
          <div><label className="label">Budget hours / outcome</label><input type="number" step="0.1" className="input" value={state.settings.budgetsPerOutcome.budgetHoursPerOutcome} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, budgetsPerOutcome: { ...s.settings.budgetsPerOutcome, budgetHoursPerOutcome: Number(e.target.value) } } }))} /></div>
          <div><label className="label">Budget effort / outcome</label><input type="number" step="0.1" className="input" value={state.settings.budgetsPerOutcome.budgetEffortPerOutcome} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, budgetsPerOutcome: { ...s.settings.budgetsPerOutcome, budgetEffortPerOutcome: Number(e.target.value) } } }))} /></div>
          <div><label className="label">Default money mode</label><select className="input" value={state.settings.moneyInputModeDefault} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, moneyInputModeDefault: e.target.value as MoneyMode } }))}><option value="simple">simple</option><option value="advanced">advanced</option></select></div>
          <div><label className="label">Plan (dev toggle)</label><select className="input" value={state.settings.plan} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, plan: e.target.value as Settings["plan"] } }))}><option value="free">free</option><option value="paid">paid</option></select></div>
          <label className="text-sm md:col-span-3"><input type="checkbox" checked={state.settings.includeDuringTimeDefault} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, includeDuringTimeDefault: e.target.checked } }))} /> Default include during-time</label>
          <p className="text-sm md:col-span-3">Pricing (display only): €9.69 / month • €96 / year • €169 lifetime</p>
        </section>
      )}

      <footer className="mt-8 text-xs text-slate-400">Run: npm install && npm run dev</footer>
    </main>
  );
}

function Slider({ label, value, onChange, minLabel, maxLabel }: { label: string; value: number; onChange: (v: number) => void; minLabel: string; maxLabel: string }) {
  return (
    <div>
      <label className="label">{label}: {value}</label>
      <input className="w-full" type="range" min={0} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="flex justify-between text-[11px] text-slate-400"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

function AchievementCard({ title, onShare }: { title: string; onShare: (name: string, el: HTMLDivElement | null) => Promise<void> }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="card">
      <p className="text-2xl font-black">{title}</p>
      <p className="text-sm text-slate-300">Unlocked by your elite/tragic boy math behavior.</p>
      <button className="mt-3 rounded bg-fuchsia-500 px-3 py-2 text-sm font-bold" onClick={() => onShare(`achievement-${title.toLowerCase().replace(/\s+/g, "-")}`, ref.current)}>Share Badge PNG</button>
    </div>
  );
}
