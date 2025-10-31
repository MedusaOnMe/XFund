# XFunder 🚀

**Twitter-Controlled Solana Crowdfunding Platform**

Fund Solana tokens via tweets. No smart contracts, no complexity. Just tweet commands and watch the magic happen.

---

## 📋 Features

- **Tweet to Fund**: Create campaigns and contribute SOL via Twitter commands
- **Custodial Wallets**: Auto-generated wallets for each user
- **Two Campaign Types**:
  - **DEX**: 24-hour time limit
  - **BOOSTS**: Unlimited duration
- **Secure Key Export**: Tweet-verified private key export with 30s auto-wipe
- **Real-time Updates**: Live campaign tracking and contribution monitoring

---

## 🏗️ Architecture

### Backend
- **Node.js + Express**: API server
- **Firebase Admin SDK**: Database and authentication
- **Solana Web3.js**: Blockchain operations via Helius RPC (mainnet)
- **RapidAPI Twitter154**: Tweet mention monitoring
- **AES-256-GCM**: Private key encryption

### Frontend
- **Next.js**: React framework
- **Firebase Client SDK**: Realtime DB for key export
- **Tailwind CSS**: Styling
- **QR Code Generation**: Wallet deposit addresses

### Infrastructure
- **Backend**: Railway deployment
- **Frontend**: Vercel deployment
- **Database**: Firestore + Realtime DB
- **Blockchain**: Solana mainnet (Helius RPC)

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **Firebase Project** - [Create one](https://console.firebase.google.com)
3. **Helius RPC Key** - [Get one](https://helius.dev)
4. **RapidAPI Key** - [Subscribe to Twitter154](https://rapidapi.com/datahungrybeast/api/twitter154)
5. **Twitter Account** - Control @crowdfund handle

### Installation

#### 1. Clone & Install Dependencies

```bash
cd XFunder

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Configure Environment Variables

**Backend** (`backend/.env`):

```bash
PORT=3001
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
ENCRYPTION_SECRET=<64-char-random-hex>
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter154.p.rapidapi.com
TWITTER_HANDLE=crowdfund
```

**Frontend** (`frontend/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### 3. Setup Firebase Security Rules

See [FIREBASE_RULES.md](./FIREBASE_RULES.md) for complete instructions.

**Quick setup:**
- Navigate to Firebase Console
- Deploy Firestore and Realtime DB rules from the documentation
- Test rules in the Firebase Console Rules Playground

#### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit **http://localhost:3000**

---

## 🐦 Tweet Commands

### Create Campaign

```
@crowdfund create dex SolanaTokenAddress123
@crowdfund create boosts SolanaTokenAddress456
```

### Contribute to Campaign

```
@crowdfund dex SolanaTokenAddress123 0.5
@crowdfund boosts SolanaTokenAddress456 1.25
```

### Export Private Key

```
@crowdfund export 928391
```

---

## 📖 User Flows

### 1. Registration
1. Visit homepage
2. Enter X handle (e.g., `@username`)
3. Backend generates Solana wallet
4. Wallet address displayed

### 2. Funding Wallet
1. Copy wallet address from dashboard
2. Send SOL to that address
3. Balance updates automatically

### 3. Creating Campaign
1. Tweet: `@crowdfund create dex <token_address>`
2. Backend detects tweet (within 10 seconds)
3. Campaign wallet generated
4. Campaign appears on campaigns page

### 4. Contributing
1. Tweet: `@crowdfund dex <token_address> <amount>`
2. Backend transfers SOL from your wallet to campaign wallet
3. Contribution recorded and displayed

### 5. Exporting Private Key
1. Click "Export Private Key" on wallet page
2. Tweet the 6-digit verification code
3. Backend verifies tweet ownership
4. Private key displayed for 30 seconds
5. Key auto-deleted from database

---

## 🔒 Security

### Encryption
- **AES-256-GCM** for all private keys at rest
- Key derivation: `HMAC(SERVER_SECRET + userId)`
- Keys never logged or stored in plaintext

### Private Key Export
- **Random 64-char secret paths** - impossible to guess
- **Tweet verification** proves account ownership
- **30-second time limit** - auto-delete after display
- **Session-locked** - only requesting browser can see key
- **Firebase rules** prevent enumeration

### API Security
- Backend-only database writes (Admin SDK)
- Frontend cannot read encrypted private keys
- HTTPS enforced in production
- Tweet deduplication prevents replay attacks

### Firebase Rules
- Private keys: **Never** readable by frontend
- Campaign data: Publicly readable
- Key exports: Random paths, time-limited
- See [FIREBASE_RULES.md](./FIREBASE_RULES.md) for details

---

## 🚢 Deployment

### Option 1: Both on Railway (Recommended - Simpler!)

**Deploy both frontend and backend to Railway for easier management.**

See [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md) for complete step-by-step guide.

Quick setup:
1. Create Railway project
2. Add backend service (root: `/backend`)
3. Add frontend service (root: `/frontend`)
4. Set environment variables for both
5. Deploy automatically via GitHub or manually with Railway CLI

### Option 2: Railway + Vercel (Alternative)

**Backend → Railway:**
1. Create Railway project
2. Connect GitHub repo
3. Add environment variables from `.env.example`
4. Deploy
5. Note the Railway URL (e.g., `https://xfunder-backend.railway.app`)

**Frontend → Vercel:**
1. Import GitHub repo to Vercel
2. Framework preset: Next.js
3. Add environment variables:
   - Set `NEXT_PUBLIC_API_URL` to Railway backend URL
   - Add all Firebase config variables
4. Deploy

### Post-Deployment Checks

1. Test backend health endpoint
2. Verify frontend loads
3. Test tweet commands end-to-end
4. Verify key export flow works
5. Monitor logs for errors

---

## 📁 Project Structure

```
XFunder/
├── backend/
│   ├── src/
│   │   ├── lib/              # Core utilities
│   │   │   ├── solana.js     # Blockchain operations
│   │   │   ├── encrypt.js    # AES encryption
│   │   │   ├── twitter.js    # RapidAPI client
│   │   │   ├── parser.js     # Tweet parsing
│   │   │   ├── campaign.js   # Campaign logic
│   │   │   └── export.js     # Key export logic
│   │   ├── routes/
│   │   │   └── api.js        # API endpoints
│   │   ├── services/
│   │   │   ├── poller.js     # Tweet monitor (10s)
│   │   │   └── expiry.js     # Campaign expiry (5min)
│   │   ├── config/
│   │   │   └── firebase.js   # Firebase Admin init
│   │   └── server.js         # Express app
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── pages/
│   │   ├── index.js          # Landing page
│   │   ├── wallet.js         # User dashboard
│   │   ├── campaigns.js      # Campaign list
│   │   └── campaign/[id].js  # Campaign detail
│   ├── components/
│   │   ├── ExportModal.js    # Key export UI
│   │   └── CampaignCard.js   # Campaign card
│   ├── lib/
│   │   ├── firebase.js       # Firebase client
│   │   └── api.js            # API client
│   ├── styles/
│   │   └── globals.css       # Tailwind styles
│   ├── package.json
│   └── .env.local.example
├── .gitignore
├── FIREBASE_RULES.md
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Register or login with X handle |
| GET | `/api/wallet/:userId` | Get wallet balance + address |
| POST | `/api/withdraw` | Withdraw SOL to external address |
| POST | `/api/export-request` | Generate verification code for key export |
| GET | `/api/campaigns` | List all campaigns (with filters) |
| GET | `/api/campaign/:id` | Get campaign details + contributions |
| GET | `/health` | Health check |

---

## 🧪 Development Notes

### Tweet Polling
- Poller runs every **10 seconds**
- Checks for new @crowdfund mentions
- Processes CREATE, CONTRIBUTE, EXPORT commands
- Deduplicates via Firestore `processed_tweets`

### Campaign Expiry
- Timer runs every **5 minutes**
- Marks DEX campaigns as "ended" after 24 hours
- Cleans up expired export requests and keys

### Error Handling
- All errors logged to console (no sensitive data)
- User-friendly error messages returned to frontend
- Failed transactions don't block other operations

---

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists and all variables are set
- Verify Firebase credentials are correct
- Ensure Helius RPC URL is valid

### Twitter commands not working
- Check RapidAPI key is valid and has credits
- Verify Twitter154 API endpoint in code matches current API
- Check Railway logs for polling errors

### Key export not showing
- Verify Firebase Realtime DB rules are deployed
- Check browser console for Firebase connection errors
- Ensure verification code was tweeted correctly

### Campaign not appearing
- User must be registered (visited site and entered @handle)
- Tweet must mention @crowdfund exactly
- Check processed_tweets in Firestore for deduplication issues

---

## 📊 Database Schema

### Firestore Collections

**users**
```javascript
{
  id: string,
  x_handle: "@username",
  user_wallet_pub: "SolanaAddress...",
  user_wallet_priv_enc: "encrypted_key...",
  created_at: timestamp
}
```

**campaigns**
```javascript
{
  id: string,
  type: "dex" | "boosts",
  creator_user_id: string,
  token_ca: "TokenAddress...",
  campaign_wallet_pub: "CampaignAddress...",
  campaign_wallet_priv_enc: "encrypted_key...",
  start_ts: timestamp,
  end_ts: timestamp | null,
  status: "active" | "ended",
  total_raised: number
}
```

**contributions**
```javascript
{
  id: string,
  campaign_id: string,
  user_id: string,
  amount: number,
  tx_signature: string,
  timestamp: timestamp
}
```

### Realtime DB

**key_exports/{randomSecretPath}**
```javascript
{
  privkey: "base64_encoded_key",
  expires_at: timestamp
}
```

---

## 🤝 Contributing

This is a production project. Contributions welcome:

1. Fork the repo
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- **Solana** - Blockchain infrastructure
- **Helius** - RPC provider
- **Firebase** - Database and Realtime DB
- **RapidAPI** - Twitter API access
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check deployment logs (Railway + Vercel)
- Review Firebase Console for database issues

---

**Built with ❤️ for the Solana community**

Tweet to fund. Simple as that. 🚀
