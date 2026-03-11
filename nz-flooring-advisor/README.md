# NZ Flooring Advisor

A professional flooring estimation and quoting tool for NZ tradespeople, built with React + Vite, deployable via GitHub → Netlify.

## Features

- 📸 AI photo analysis — estimates room area from photos using NZ standard reference objects
- 🏠 Multi-room project management
- 📍 Address search + geo-tagging via OpenStreetMap (no API key needed)
- 🔍 Floor plan search links (Trade Me, OneRoof, LINZ, council GIS)
- 🏗️ Subfloor condition assessment with AI vision
- 🏷️ NZ flooring layer recommendations (NZS 3604, E3, G6, H1 compliance)
- 💰 Quote builder with materials + labour, wastage, margin, GST
- 📄 PDF job report export (branded)
- 🛒 User-managed product & pricing database
- ⚠️ Pre-1990 asbestos warnings (mandatory)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/nz-flooring-advisor.git
cd nz-flooring-advisor
npm install
```

### 2. Local development

```bash
# Install Netlify CLI globally if not already done
npm install -g netlify-cli

# Run locally with Netlify functions support
netlify dev
```

> The app will be available at http://localhost:8888

Without `netlify dev`, AI features won't work locally (the serverless function won't run). All other features (manual entry, products, quotes, PDF export) work without the API.

---

## Deploy to Netlify via GitHub

1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → New site → Import from GitHub
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variable:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
5. Deploy

---

## Adding API Key

Go to: **Netlify → Your Site → Site Settings → Environment Variables**

Add:
```
ANTHROPIC_API_KEY = sk-ant-...
```

Then trigger a redeploy. AI features activate automatically.

**Without an API key**, the app still works — all AI analysis buttons will fail gracefully, and you can use manual entry for all fields.

---

## Pricing Data

Go to **Products** in the app to add your own products and pricing. All pricing is user-managed — nothing is hardcoded except placeholder ranges shown in the flooring selector.

Price data is stored in your browser's localStorage.

To back up your data: **Settings → Export Backup**

---

## Data & Privacy

- All project data is stored locally in the browser (localStorage)
- Photos are sent to the Anthropic API for analysis only — they are not stored
- No analytics or tracking
- GPS data is used only for address lookup — not stored externally

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **State:** Zustand (localStorage persistence)
- **Routing:** React Router v6
- **AI:** Anthropic Claude API (via Netlify serverless function)
- **Geocoding:** OpenStreetMap Nominatim (free, no key)
- **PDF:** jsPDF
- **Deployment:** Netlify

---

## NZ Compliance References

- NZS 3604 — Timber-Framed Buildings
- NZBC E3 — Internal Moisture (wet areas)
- NZBC G6 — Airborne & Impact Sound
- NZBC H1 — Energy Efficiency (underfloor insulation R-values)
- Health and Safety at Work (Asbestos) Regulations 2016
