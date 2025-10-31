# Deploy XFunder - Single Service

## ✅ ONE service. Backend + Frontend + Workers.

---

## 🚀 Deploy to Railway (Simple)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "XFunder initial commit"
gh repo create xfunder --public --source=. --remote=origin --push
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select `xfunder` repo
4. Railway auto-detects Node.js
5. **No root directory needed** - it's at the root
6. Add environment variables from `backend/.env`
7. Deploy

### 3. Railway Environment Variables

Add these in Railway dashboard:

```
PORT=3001
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
ENCRYPTION_SECRET=your_64_char_hex
FIREBASE_PROJECT_ID=scream-5cef9
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-r44k2@scream-5cef9.iam.gserviceaccount.com
RAPIDAPI_KEY=your_key
RAPIDAPI_HOST=twitter154.p.rapidapi.com
TWITTER_HANDLE=crowdfund
```

### 4. Done

Railway gives you ONE URL: `https://xfunder-production.up.railway.app`

- Frontend: `https://xfunder-production.up.railway.app/`
- API: `https://xfunder-production.up.railway.app/api/*`
- Background workers run 24/7 automatically

---

## 🏗️ How it Works

### Build Process (automatic on Railway)

```bash
npm install  # Installs backend + frontend deps
npm run build  # Builds Next.js to static HTML in /frontend/out
npm start  # Starts Express server
```

### Express Server (backend/src/server.js)

1. **API routes** at `/api/*`
2. **Static files** serve from `/frontend/out`
3. **Background workers** (poller + expiry) start automatically
4. **All in one process**

---

## 🧪 Test Locally

```bash
# Install deps
npm install

# Build frontend
npm run build

# Start server (backend + frontend + workers)
npm start
```

Visit: `http://localhost:3001`

---

## 🔄 Update After Push

Push to GitHub → Railway auto-deploys:

```bash
git add .
git commit -m "Update"
git push
```

---

## 📊 What Runs

**Single Node.js process:**
- Express API server (port 3001)
- Tweet poller (every 10s)
- Campaign expiry timer (every 5min)
- Static frontend files

**One Railway service. That's it.** 🚀
