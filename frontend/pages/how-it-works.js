import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How It Works - XFunder</title>
      </Head>

      <Navbar />

      <div className="min-h-screen">
        <div className="container-custom py-12 max-w-4xl">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">How It Works</h1>
            <p className="text-lg text-neutral-400">
              Fund DEXScreener updates through tweets. Simple, transparent, community-driven.
            </p>
          </div>

          {/* Overview */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-neutral-300 mb-4">
              Pool SOL with your community to pay for DEXScreener enhanced token info. Tweet commands to <code className="text-blue-400">@XFundDex</code> to create campaigns and contribute — all without leaving Twitter.
            </p>
            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-300 text-sm font-medium">
                💡 Tweet your campaign creation in your token's X community to get maximum visibility and support!
              </p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">1</div>
                  <h3 className="text-lg font-semibold text-white">Connect Your X Account</h3>
                </div>
                <p className="text-neutral-300 ml-11">
                  Enter your X handle on the homepage. This creates a custodial Solana wallet linked to your account.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-lg font-semibold text-white">Deposit SOL</h3>
                </div>
                <p className="text-neutral-300 ml-11">
                  Go to your wallet page and deposit SOL using the QR code or wallet address.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">3</div>
                  <h3 className="text-lg font-semibold text-white">Tweet Commands</h3>
                </div>
                <p className="text-neutral-300 ml-11">
                  Tweet to create campaigns or contribute. Transactions happen automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Tweet Commands */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Tweet Commands</h2>

            <div className="space-y-6">
              {/* Create Campaign */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-primary font-semibold">CREATE</span>
                  <h3 className="text-lg font-semibold text-white">Create a Campaign</h3>
                </div>
                <div className="bg-neutral-950 border border-neutral-700 rounded p-4 mb-3">
                  <code className="text-blue-400">@XFundDex create dex TOKEN_CA</code>
                </div>
                <div className="bg-neutral-900/50 border-l-2 border-blue-500/30 p-3 text-sm text-neutral-400">
                  <p className="mb-1"><strong className="text-white">Example:</strong></p>
                  <code className="text-blue-400">@XFundDex create dex EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>
                </div>
                <p className="text-neutral-400 text-sm mt-3">
                  Creates a 24-hour campaign. Community contributes SOL toward the DEX update.
                </p>
              </div>

              {/* Fund Campaign */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-success font-semibold">FUND</span>
                  <h3 className="text-lg font-semibold text-white">Fund a Campaign</h3>
                </div>
                <div className="bg-neutral-950 border border-neutral-700 rounded p-4 mb-3">
                  <code className="text-green-400">@XFundDex fund dex AMOUNT TOKEN_CA</code>
                </div>
                <div className="bg-neutral-900/50 border-l-2 border-green-500/30 p-3 text-sm text-neutral-400">
                  <p className="mb-1"><strong className="text-white">Example:</strong></p>
                  <code className="text-green-400">@XFundDex fund dex 0.5 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>
                </div>
                <p className="text-neutral-400 text-sm mt-3">
                  Contributes 0.5 SOL from your wallet. Any amount accepted.
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Campaign Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Duration</h3>
                <p className="text-neutral-300">
                  Campaigns last 24 hours. Funds are used to pay for the DEX update after expiry.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
                <p className="text-neutral-300">
                  All contributions are public. Transactions recorded on Solana blockchain, verifiable on Solscan.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Tracking</h3>
                <p className="text-neutral-300">
                  View campaigns on the <a href="/campaigns" className="text-blue-400 hover:text-blue-300">Campaigns page</a>. Filter by status and type.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Management */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Management</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Custodial Wallet</h3>
                <p className="text-neutral-300">
                  XFunder holds your private key securely. Enables tweet-based transactions without wallet signatures.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Export Private Key</h3>
                <p className="text-neutral-300 mb-2">
                  Export your private key via tweet verification to import the wallet elsewhere and manage your funds.
                </p>
                <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-3">
                  <p className="text-sm text-yellow-300">
                    <strong>⚠ Security:</strong> Keys shown once for 30 seconds. Never share your private key.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">FAQ</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What is a DEX update?</h3>
                <p className="text-neutral-300">
                  Enhanced token info on DEXScreener — logos, descriptions, social links, etc.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How much does it cost?</h3>
                <p className="text-neutral-300">
                  Pricing varies. Campaigns pool community funds to cover costs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What if the campaign doesn't reach the goal?</h3>
                <p className="text-neutral-300">
                  Funds are used toward the DEX update regardless. Excess may be returned.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is my wallet secure?</h3>
                <p className="text-neutral-300">
                  Private keys encrypted in Firestore. Tweet verification required for sensitive operations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I use my own wallet?</h3>
                <p className="text-neutral-300">
                  Platform uses custodial wallets for tweet functionality. Export your key to use elsewhere.
                </p>
              </div>
            </div>
          </div>

          {/* Get Started CTA */}
          <div className="card border-blue-600/30 bg-blue-600/10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
            <p className="text-neutral-300 mb-6">
              Connect your X account and start funding DEX updates.
            </p>
            <a href="/" className="btn btn-primary inline-block">
              Get Started
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
