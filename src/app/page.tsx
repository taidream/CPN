"use client";

import { FormEvent, useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { computeAll, cpnColor, computeEntry } from "@/lib/calc";
import { getCaption } from "@/lib/captions";
import { defaultSettings } from "@/lib/demo";
import { initStorage, loadEntries, loadSettings, resetAll, saveEntries, saveSettings } from "@/lib/storage";
import { Entry, Settings } from "@/lib/types";

const sectionTabs = ["Log Entry", "Dashboard", "Charts", "Hot–Crazy", "Entries", "Settings"] as const;

const initialDraft: Omit<Entry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  moneySpent: 0,
  timeSpentHours: 1,
  mentalEffort: 5,
  attractiveness: 7,
  personality: 7,
  sexEnjoyment: 7,
  nuts: 0,
  hotScore: 7,
  crazyScore: 4,
  notes: ""
};

const formatDate = (iso: string, blur: boolean) => (blur ? "••/••/••" : new Date(iso).toLocaleDateString());

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [draft, setDraft] = useState(initialDraft);
  const [activeTab, setActiveTab] = useState<(typeof sectionTabs)[number]>("Log Entry");
  const [editingId, setEditingId] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const recapRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    initStorage();
    setEntries(loadEntries());
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const stats = useMemo(() => computeAll(entries, settings), [entries, settings]);
  const latest = stats.computed[stats.computed.length - 1];
  const color = cpnColor(stats.totalCostPerNut, settings.cpnBudget);
  const decision = !latest
    ? "Add some lore first"
    : latest.rewardScore >= 7.2 && latest.hotCrazyRisk < 0.35 && !stats.trendingUp
      ? "Continue"
      : latest.hotCrazyRisk > 0.6 && latest.rewardScore < 6.2 && stats.trendingUp
        ? "Cut"
        : "Pause";
  const caption = getCaption(color, (latest?.hotCrazyRisk ?? 0) > 0.4);

  const timelineData = useMemo(() => {
    let runningCost = 0;
    let runningNuts = 0;
    return stats.computed.map((e) => {
      runningCost += e.adjustedCost;
      runningNuts += e.nuts;
      return {
        date: formatDate(e.date, settings.blurMode),
        cumulativeCost: Number(runningCost.toFixed(2)),
        totalNuts: runningNuts
      };
    });
  }, [stats.computed, settings.blurMode]);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const payload: Entry = {
      ...draft,
      id: editingId ?? uuidv4(),
      date: new Date(draft.date).toISOString(),
      moneySpent: Math.max(0, Number(draft.moneySpent)),
      timeSpentHours: Math.max(0, Number(draft.timeSpentHours)),
      mentalEffort: Math.max(0, Math.min(10, Number(draft.mentalEffort))),
      attractiveness: Math.max(0, Math.min(10, Number(draft.attractiveness))),
      personality: Math.max(0, Math.min(10, Number(draft.personality))),
      sexEnjoyment: Math.max(0, Math.min(10, Number(draft.sexEnjoyment))),
      nuts: Math.max(0, Math.floor(Number(draft.nuts))),
      hotScore: Math.max(0, Math.min(10, Number(draft.hotScore))),
      crazyScore: Math.max(0, Math.min(10, Number(draft.crazyScore))),
      notes: draft.notes?.trim() || ""
    };
    if (editingId) {
      setEntries((old) => old.map((x) => (x.id === editingId ? payload : x)));
      setEditingId(null);
    } else {
      setEntries((old) => [payload, ...old]);
    }
    setDraft(initialDraft);
  };

  const handleExport = async (name: string, el: HTMLDivElement | null) => {
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: "#020617", scale: 2 });
    const link = document.createElement("a");
    link.download = `${name}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="mx-auto max-w-7xl p-4 pb-24 md:p-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Boy Math: Cost per Nut (CPN)</h1>
      <p className="mt-1 text-slate-300">Track costs, chaos, and ROI. Share receipts. Protect peace.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {sectionTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === tab ? "bg-fuchsia-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Log Entry" && (
        <section className="card mt-4">
          <h2 className="mb-3 text-xl font-bold">Quick Log</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
            {[
              ["date", "Date", "date"],
              ["moneySpent", "Money Spent", "number"],
              ["timeSpentHours", "Time (hours)", "number"],
              ["mentalEffort", "Mental Effort 0-10", "number"],
              ["attractiveness", "Attractiveness 0-10", "number"],
              ["personality", "Personality 0-10", "number"],
              ["sexEnjoyment", "Sex Enjoyment 0-10", "number"],
              ["nuts", "Nuts", "number"],
              ["hotScore", "Hot Score 0-10", "number"],
              ["crazyScore", "Crazy Score 0-10", "number"]
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type={type}
                  className="input"
                  value={(draft as Record<string, string | number>)[key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="md:col-span-3">
              <label className="label">Notes</label>
              <textarea
                className="input min-h-20"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>
            <button className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 md:col-span-3" type="submit">
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "Dashboard" && (
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-sm text-slate-300">Current Total CPN</p>
            <p className="text-4xl font-black">${stats.totalCostPerNut.toFixed(2)}</p>
            <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${color === "green" ? "bg-emerald-500 text-slate-950" : color === "orange" ? "bg-amber-400 text-slate-950" : "bg-rose-500"}`}>
              {color.toUpperCase()} vs budget ${settings.cpnBudget}
            </p>
            <p className="mt-3 text-sm text-slate-400">Useful Total CPN + Meme TCPN both shown below.</p>
            <p className="mt-2 text-sm">TCPN: ${stats.tcpn.toFixed(2)} | ICON: ${stats.icon.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3 className="font-bold">Hidden Cost Breakdown</h3>
            <p className="mt-2 text-sm">Adjusted Cost: ${stats.totalAdjustedCost.toFixed(2)}</p>
            <p className="text-sm">Total Nuts: {stats.totalNuts}</p>
            <p className="text-sm">Caption: {caption}</p>
          </div>
          <div className="card">
            <h3 className="font-bold">Decision Helper</h3>
            <p className="mt-3 text-3xl font-black">{decision}</p>
            <p className="mt-2 text-xs text-slate-400">Continue = high reward + low risk + trend down. Pause = mixed. Cut = high risk + low reward + trend up.</p>
          </div>

          <div className="card md:col-span-3" ref={receiptRef}>
            <h3 className="text-lg font-bold">CPN Receipt</h3>
            <div className="mt-2 font-mono text-sm">
              <p>Subtotal Adjusted Cost: ${stats.totalAdjustedCost.toFixed(2)}</p>
              <p>Total Nuts: {stats.totalNuts}</p>
              <p>TOTAL CPN: ${stats.totalCostPerNut.toFixed(2)}</p>
              <p>Budget: ${settings.cpnBudget}</p>
              <p>Status: {color.toUpperCase()}</p>
            </div>
            <button className="mt-3 rounded-lg bg-fuchsia-500 px-3 py-2 text-sm font-semibold" onClick={() => handleExport("cpn-receipt", receiptRef.current)}>
              Export Receipt PNG
            </button>
          </div>
        </section>
      )}

      {activeTab === "Charts" && (
        <section className="mt-4 grid gap-4">
          <div className="card h-80">
            <h3 className="mb-3 font-bold">Timeline: cumulative adjusted cost + total nuts</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#22c55e" />
                <YAxis yAxisId="right" orientation="right" stroke="#f472b6" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cumulativeCost" stroke="#22c55e" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="totalNuts" stroke="#f472b6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card h-72">
            <h3 className="mb-3 font-bold">Rolling CPN (last 3 entries)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.rollingCpn.map((e) => ({ ...e, date: formatDate(e.date, settings.blurMode), rollingCpn: Number(e.rollingCpn.toFixed(2)) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#facc15" />
                <Tooltip />
                <Line type="monotone" dataKey="rollingCpn" stroke="#facc15" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {activeTab === "Hot–Crazy" && (
        <section className="mt-4 grid gap-4">
          <div className="card h-[430px]" ref={matrixRef}>
            <h3 className="mb-3 text-xl font-bold">Hot–Crazy Matrix</h3>
            <p className="mb-2 text-sm text-slate-400">
              {settings.memeMode ? "Quadrants: Sweet Spot / Danger Zone / Entertainment Risk / Invest Carefully" : "X=Attraction, Y=Stability/Chaos"}
            </p>
            <ResponsiveContainer width="100%" height="85%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#334155" />
                <XAxis type="number" dataKey="hotScore" domain={[0, 10]} name="Hot" stroke="#fb7185" />
                <YAxis type="number" dataKey="crazyScore" domain={[0, 10]} name="Crazy" stroke="#60a5fa" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={stats.computed} fill="#e879f9" />
              </ScatterChart>
            </ResponsiveContainer>
            {latest && <p className="mt-1 text-sm">Latest point caption: {caption}</p>}
          </div>
          <button className="w-fit rounded-lg bg-fuchsia-500 px-3 py-2 text-sm font-semibold" onClick={() => handleExport("hot-crazy-poster", matrixRef.current)}>
            Export Hot–Crazy Poster PNG
          </button>

          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} ref={recapRefs[i]} className="card aspect-[9/16] h-[420px]">
                <p className="text-xs uppercase text-slate-400">Weekly Recap {i + 1}</p>
                <h4 className="mt-2 text-2xl font-black">{["Budget Mood", "Chaos Tax", "Performance"]?.[i]}</h4>
                <p className="mt-2 text-4xl font-black">{i === 0 ? color.toUpperCase() : i === 1 ? `${((latest?.hotCrazyRisk ?? 0) * 100).toFixed(0)}%` : `$${stats.totalCostPerNut.toFixed(0)}`}</p>
                <p className="mt-4 text-sm">{caption}</p>
              </div>
            ))}
          </div>
          <button
            className="w-fit rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
            onClick={async () => {
              for (let i = 0; i < recapRefs.length; i += 1) {
                await handleExport(`weekly-recap-${i + 1}`, recapRefs[i].current);
              }
            }}
          >
            Export Weekly Recap Story Cards
          </button>
        </section>
      )}

      {activeTab === "Entries" && (
        <section className="mt-4 card overflow-auto">
          <h3 className="mb-3 text-xl font-bold">Entries</h3>
          <div className="space-y-2">
            {stats.computed.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-800 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{formatDate(entry.date, settings.blurMode)}</p>
                  <p className="text-sm">Adj Cost: ${entry.adjustedCost.toFixed(2)} | CPN: {entry.cpn ? `$${entry.cpn.toFixed(2)}` : "Pending"}</p>
                </div>
                <p className="text-xs text-slate-400">{settings.blurMode ? "Notes hidden in blur mode" : entry.notes || "No notes"}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded bg-slate-700 px-3 py-1 text-xs"
                    onClick={() => {
                      setEditingId(entry.id);
                      setActiveTab("Log Entry");
                      setDraft({
                        ...entry,
                        date: entry.date.slice(0, 10)
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="rounded bg-rose-600 px-3 py-1 text-xs" onClick={() => setEntries((old) => old.filter((e) => e.id !== entry.id))}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Settings" && (
        <section className="card mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["cpnBudget", "CPN Budget"],
            ["valuePerHour", "Value Per Hour"],
            ["valuePerEffortPoint", "Value Per Effort Pt"],
            ["attractivenessWeight", "Attractiveness Weight"],
            ["personalityWeight", "Personality Weight"],
            ["sexEnjoymentWeight", "Sex Enjoyment Weight"]
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="number"
                className="input"
                value={
                  key in settings.weights
                    ? settings.weights[key as keyof Settings["weights"]]
                    : (settings as Record<string, number | boolean>)[key]
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (key in settings.weights) {
                    setSettings((s) => ({ ...s, weights: { ...s.weights, [key]: val } }));
                  } else {
                    setSettings((s) => ({ ...s, [key]: val }));
                  }
                }}
              />
            </div>
          ))}
          <div className="md:col-span-3 flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.memeMode} onChange={(e) => setSettings((s) => ({ ...s, memeMode: e.target.checked }))} /> Meme Mode
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.blurMode} onChange={(e) => setSettings((s) => ({ ...s, blurMode: e.target.checked }))} /> Blur Mode
            </label>
            <button
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                resetAll();
                setEntries(loadEntries());
                setSettings(loadSettings());
              }}
            >
              Reset all data
            </button>
          </div>
        </section>
      )}

      <footer className="mt-8 text-xs text-slate-500">Run locally: npm install && npm run dev</footer>
    </main>
  );
}
