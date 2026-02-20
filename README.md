# BOY MATH: Cost per Nut (CPN) — V2

A viral-but-useful client-only tracker for dating spend, time, effort, outcomes, risk, and meme-grade sharing cards.

## Run

```bash
npm install
npm run dev
```

Open: http://localhost:3000

---

## Core Rule (important)

**We do NOT multiply time by money. Ever.**

CPN tracks three separate per-outcome costs:
- `CPN_money` in euros
- `CPN_time` in hours
- `CPN_effort` in effort points

Then each is normalized against your own budget targets.

---

## Composite score logic

For each date:
1. Compute raw costs: fiscal (`€`), time (`hours`), effort (`0–10`).
2. If outcomes > 0, compute per-outcome CPN family.
3. Normalize each against budgets:
   - `rMoney = CPN_money / budgetMoneyPerOutcome`
   - `rTime = CPN_time / budgetHoursPerOutcome`
   - `rEffort = CPN_effort / budgetEffortPerOutcome`
   - `CostRatio = average(rMoney, rTime, rEffort)`
4. Apply risk factor from Drama + RedFlags − GreenFlags:
   - `AdjustedCostRatio = CostRatio * (1 + 0.6 * RiskIndex)`
5. Compute value from enjoyment:
   - `ValueIndex = sexEnjoyment / 10`
6. Final score:
   - `PursuitScore = round(100 * ValueIndex / max(0.1, AdjustedCostRatio))`

Higher `PursuitScore` means better value for your budgets.

---

## Free vs Paid gating (UI only)

### Free
- 1 active partner profile
- max 5 date entries
- 1 free reset
- unlimited exports/share cards
- unlimited achievements

### Paid
- unlimited partners
- unlimited dates
- unlimited resets

Pricing copy shown in-app:
- €9.69 / month
- €96 / year
- €169 lifetime

---

## What V2 includes

- Partner profile + baseline sliders
- Fast “Log Date” form (simple/advanced money modes)
- No-time*money CPN family and Pursuit score cards
- Hot–Crazy matrix (Hot vs Drama)
- Analytics filters + charts + weekday summary + venue leaderboard
- Entries list with edit/delete (immediate chart updates)
- Lousy Receipt PNG, Hot–Crazy poster PNG, Weekly recap PNG set
- Achievement engine + shareable badge cards
- Panic button overlay joke page
- localStorage namespace: `boymath_cpn_v2`
- Debounced auto-save + JSON export/import backup

---

## Windows PowerShell npm policy issue

If PowerShell blocks npm with `npm.ps1 cannot be loaded`, use:

```powershell
npm.cmd install
npm.cmd run dev
```

Or set policy once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
