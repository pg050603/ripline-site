# RIPLINE

A self-contained, provably-fair pack-opening demo (fictional "APEX" card set).
Built with **Vite + React**. No backend, no database — everything runs in the browser.

> Note: this is a demo. It uses an original fictional card set and is not affiliated
> with Nintendo, Wizards of the Coast, Bandai, or any real trading-card brand.
> No real payments, inventory, or shipping happen.

---

## Run it locally

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install      # first time only
npm run dev      # starts a local server, usually http://localhost:5173
```

To make a production build locally:

```bash
npm run build    # outputs static files to /dist
npm run preview  # serves the built /dist to check it
```

The whole app lives in **`src/App.jsx`** — that's the file to edit.

---

## Deploy to Vercel (recommended for long term)

### Route A — GitHub + Vercel (auto-redeploys on every change)

1. Put this folder on GitHub:
   ```bash
   git init
   git add .
   git commit -m "RIPLINE site"
   ```
   Create an empty repo at https://github.com/new, then follow the
   "push an existing repository" lines GitHub shows you (the `git remote add` + `git push`).

2. Go to https://vercel.com, sign in with GitHub, click **Add New → Project**, and
   **Import** the repo.

3. Vercel auto-detects Vite. Leave the defaults:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Click **Deploy**. In ~30 seconds you get a live URL like
   `https://ripline.vercel.app` — send that to your friends.

From now on, every `git push` redeploys automatically.

### Route B — Vercel CLI (no GitHub)

```bash
npm install -g vercel
vercel            # first run: answers a few prompts, then deploys a preview
vercel --prod     # promotes it to your main public URL
```

---

## Make it private (optional)

The default Vercel URL is public to anyone who has the link. To lock it down:

- **Vercel Deployment Protection** — in your project on vercel.com:
  **Settings → Deployment Protection**. You can require Vercel login, or set a
  shared **Password** so only people with the password can view it. (Some options
  depend on your Vercel plan.)
- That's the cleanest way to "send privately to friends" — share the URL **and**
  the password with just them.

---

## Custom domain (optional)

In your Vercel project: **Settings → Domains → Add**. Point your domain's DNS at
Vercel as instructed, and the site will serve from your own address with free HTTPS.

---

## Project layout

```
ripline-site/
├── index.html          # page shell, mounts the app
├── package.json        # scripts + dependencies
├── vite.config.js      # Vite + React plugin
├── src/
│   ├── main.jsx        # entry — renders <Ripline/>
│   ├── App.jsx         # the entire RIPLINE app (edit here)
│   └── index.css       # tiny global reset
└── README.md
```
