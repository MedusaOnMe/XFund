# Deploy Both Frontend & Backend to Railway

**Simple, single-platform deployment for XFunder**

---

## Why Railway for Both?

✅ **Single Platform** - Manage everything in one place
✅ **Easy Networking** - Backend and frontend on same platform
✅ **Simple Deployment** - One command for both services
✅ **Cost Effective** - Railway's free tier covers both
✅ **Auto HTTPS** - Both services get SSL certificates automatically

---

## 🚀 Deployment Steps

### 1. Create Railway Account

Sign up at [railway.app](https://railway.app)

### 2. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 3. Initialize Railway Project

```bash
cd XFunder
railway init
```

This creates a Railway project for your repo.

### 4. Deploy Backend

#### Create Backend Service

```bash
# In Railway dashboard:
# 1. Click "New" → "Empty Service"
# 2. Name it "xfunder-backend"
# 3. Connect your GitHub repo
# 4. Set Root Directory: /backend
# 5. Set Start Command: npm start
```

#### Add Backend Environment Variables

In Railway dashboard for backend service, add:

```bash
PORT=3001
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
ENCRYPTION_SECRET=your_64_char_random_hex
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter154.p.rapidapi.com
TWITTER_HANDLE=crowdfund
```

**Note the backend URL** Railway provides (e.g., `https://xfunder-backend-production.up.railway.app`)

### 5. Deploy Frontend

#### Create Frontend Service

```bash
# In Railway dashboard:
# 1. Click "New" → "Empty Service"
# 2. Name it "xfunder-frontend"
# 3. Connect your GitHub repo
# 4. Set Root Directory: /frontend
# 5. Set Build Command: npm run build
# 6. Set Start Command: npm start
```

#### Add Frontend Environment Variables

In Railway dashboard for frontend service, add:

```bash
# Replace with YOUR backend Railway URL from step 4
NEXT_PUBLIC_API_URL=https://xfunder-backend-production.up.railway.app

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Deploy Both Services

Railway auto-deploys when you push to GitHub, or manually deploy:

```bash
# Backend
cd backend
railway up

# Frontend
cd ../frontend
railway up
```

### 7. Configure Custom Domains (Optional)

In Railway dashboard:
- Backend: Settings → Domains → Add Custom Domain
- Frontend: Settings → Domains → Add Custom Domain

---

## 🔧 Railway Configuration Files

### Backend: `railway.toml`

Create this in `/backend/railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### Frontend: `railway.toml`

Create this in `/frontend/railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

---

## 📊 Railway Dashboard Overview

Your Railway project will have 2 services:

```
XFunder Project
├── xfunder-backend
│   ├── URL: https://xfunder-backend-production.up.railway.app
│   ├── Port: 3001
│   └── Services: Express API + Tweet Poller + Expiry Timer
└── xfunder-frontend
    ├── URL: https://xfunder-frontend-production.up.railway.app
    ├── Port: 3000
    └── Services: Next.js SSR
```

---

## 🧪 Testing Deployment

### 1. Test Backend Health

```bash
curl https://xfunder-backend-production.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### 2. Test Frontend

Visit: `https://xfunder-frontend-production.up.railway.app`

You should see the landing page.

### 3. Test Full Flow

1. Enter X handle on frontend
2. Check Railway backend logs for "New user registered"
3. View wallet page
4. Check campaigns page loads

---

## 📝 Monitoring & Logs

### View Logs in Railway

```bash
# Backend logs
railway logs --service xfunder-backend

# Frontend logs
railway logs --service xfunder-frontend
```

### Check Tweet Polling

Backend logs should show every 10 seconds:
```
Starting Twitter mention poller (every 10 seconds)
Found 0 new mentions
```

### Check Campaign Expiry

Backend logs should show every 5 minutes:
```
Running cleanup tasks...
Cleanup completed
```

---

## 🔄 Updating After Changes

### Auto Deploy (Recommended)

Railway auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway detects changes and redeploys automatically.

### Manual Deploy

```bash
cd backend
railway up

cd ../frontend
railway up
```

---

## 💰 Railway Pricing

**Free Tier:**
- $5 free credits/month
- Enough for development and low-traffic production
- Both services can run on free tier

**Pro Tier:** ($20/month)
- More resources
- Recommended for production with heavy traffic

---

## 🐛 Troubleshooting

### Backend won't start

Check Railway logs:
```bash
railway logs --service xfunder-backend
```

Common issues:
- Missing environment variables
- Invalid Firebase credentials
- Helius RPC URL incorrect

### Frontend can't reach backend

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend URL from Railway dashboard
3. Test backend health endpoint directly
4. Check CORS is enabled in backend (it is in our code)

### Tweet polling not working

1. Check backend logs for Twitter API errors
2. Verify RapidAPI key has credits
3. Test Twitter154 API endpoint manually
4. Ensure @crowdfund handle is correct

### Port conflicts

Railway auto-assigns ports. Don't worry about port conflicts.

---

## 🎯 Production Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Railway
- [ ] Environment variables set for both services
- [ ] Backend health check passes
- [ ] Frontend loads successfully
- [ ] Can login with X handle
- [ ] Wallet page displays
- [ ] Campaigns page loads
- [ ] Tweet poller running (check logs)
- [ ] Expiry service running (check logs)
- [ ] Firebase rules deployed
- [ ] All API keys valid

---

## 🔒 Security Notes

- Railway uses HTTPS automatically for all services
- Environment variables are encrypted at rest
- Private keys never exposed in logs
- Backend logs visible only to you in Railway dashboard

---

## 📞 Support

**Railway Issues:**
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

**App Issues:**
- Check Railway logs for both services
- Verify Firebase Console for database issues
- Test Twitter API via RapidAPI dashboard

---

**Both services on Railway = Simple deployment! 🚀**
