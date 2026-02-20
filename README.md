# Boy Math: Cost per Nut (CPN)

A playful, fully client-side MVP that tracks encounters and computes risk-adjusted **Cost per Nut (CPN)** with charts, a Hot–Crazy matrix, and shareable PNG cards.

---

## 1) Quick start (newb friendly)

### Prerequisites
- Install **Node.js 18.18+** (Node 20+ recommended): https://nodejs.org
- On Windows, install the **LTS** version from nodejs.org and keep default installer options.
- Verify install in **PowerShell** or **Command Prompt**:

```bash
node -v
npm -v
```

### Install and run (Windows + Mac + Linux)
From this project folder:

```bash
npm install
npm run dev
```

Then open: http://localhost:3000

---

## 2) Windows-specific setup (if you're testing on Windows)

### Option A: PowerShell (recommended)

```powershell
cd C:\path\to\CPN
npm install
npm run dev
```

### Option B: Command Prompt (cmd)

```cmd
cd C:\path\to\CPN
npm install
npm run dev
```

### Optional: run on a different port
If port 3000 is busy:

```powershell
npm run dev -- -p 3001
```

Open http://localhost:3001

---

## 3) How to test manually (step-by-step)

If you’re new, follow this exact checklist.

### A. App boots + demo data
1. Open the app in your browser.
2. You should see the title **“Boy Math: Cost per Nut (CPN)”**.
3. Click **Entries** tab.
4. Confirm there are **3 demo entries** already there.

### B. Add an entry
1. Go to **Log Entry**.
2. Fill a few fields (money/time/effort etc.).
3. Click **Save Entry**.
4. Go to **Entries** and confirm the new row appears.

### C. Edit + delete entry
1. In **Entries**, click **Edit** on any row.
2. You should be sent to **Log Entry** with values prefilled.
3. Change a value and click **Update Entry**.
4. Back in **Entries**, click **Delete** and confirm row is removed.

### D. Dashboard numbers react
1. Open **Dashboard** tab.
2. Check the cards:
   - Current Total CPN
   - Hidden Cost Breakdown
   - Decision Helper
3. Add/delete entries and confirm those numbers/status change.

### E. Charts render
1. Open **Charts**.
2. Confirm both charts appear:
   - Timeline (cumulative adjusted cost + total nuts)
   - Rolling CPN (last 3 entries)

### F. Hot–Crazy matrix
1. Open **Hot–Crazy**.
2. Confirm scatter points appear.
3. Toggle **Meme Mode** in **Settings** and return to matrix.
4. Label style should change between meme/clean text.

### G. Blur mode
1. In **Settings**, turn **Blur Mode** ON.
2. Return to **Entries**.
3. Dates should be hidden and notes masked.

### H. PNG export buttons
1. In **Dashboard**, click **Export Receipt PNG**.
2. In **Hot–Crazy**, click:
   - **Export Hot–Crazy Poster PNG**
   - **Export Weekly Recap Story Cards**
3. Confirm PNG files are downloaded (usually in your **Downloads** folder).

### I. Reset all data
1. Go to **Settings**.
2. Click **Reset all data**.
3. Confirm app returns to seeded demo state.

---

## 4) Optional command checks

```bash
npm run lint
npm run build
```

If these pass, your app is in good shape for MVP use.

---

## 5) Troubleshooting

### `npm install` fails
- Usually Node/npm version or network/proxy issue.
- Try:
  - upgrading/reinstalling Node.js LTS
  - deleting `node_modules` and lockfile, then reinstalling
  - checking corporate firewall/proxy settings

### Windows PowerShell script policy error
If you see script execution policy errors, run PowerShell as Administrator and use:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then reopen PowerShell and retry.

### Port 3000 already used
Run on another port:

```bash
npm run dev -- -p 3001
```

Then open http://localhost:3001

---

## 6) Feature overview

- Next.js App Router + TypeScript + Tailwind
- Recharts for timeline/rolling/matrix visualizations
- html2canvas for shareable PNG cards
- localStorage-only persistence (no backend)
- Meme Mode + Blur Mode
- Editable entries + reset-all
