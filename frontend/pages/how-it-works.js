import Head from 'next/head';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';

export default function HowItWorks() {
  const [activeSection, setActiveSection] = useState('what-is');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['what-is', 'getting-started', 'commands', 'security', 'how-it-works', 'faq'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <>
      <Head>
        <title>How It Works - XFundDex</title>
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all"
          title="Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-64 bg-neutral-900 border-l border-neutral-800 z-50 lg:hidden overflow-y-auto">
              <div className="p-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="text-white font-bold mb-4 text-sm">Documentation</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'what-is', label: 'What is XFundDex?' },
                    { id: 'getting-started', label: 'Getting Started' },
                    { id: 'commands', label: 'Commands' },
                    { id: 'security', label: 'Security & Encryption' },
                    { id: 'how-it-works', label: 'How It Works' },
                    { id: 'faq', label: 'FAQ' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}

        <div className="flex max-w-7xl mx-auto">{/* Sidebar */}
          <aside className="hidden lg:block w-64 fixed left-0 top-16 h-screen border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              <h3 className="text-white font-bold mb-4 text-sm">Documentation</h3>
              <nav className="space-y-1">
                {[
                  { id: 'what-is', label: 'What is XFundDex?' },
                  { id: 'getting-started', label: 'Getting Started' },
                  { id: 'commands', label: 'Commands' },
                  { id: 'security', label: 'Security & Encryption' },
                  { id: 'how-it-works', label: 'How It Works' },
                  { id: 'faq', label: 'FAQ' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64 px-6 sm:px-8 py-12 max-w-4xl">

            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">Documentation</h1>
              <p className="text-xl text-neutral-400">
                Everything you need to know about crowdfunding DEXScreener updates via Twitter
              </p>
            </div>

            {/* What is XFundDex */}
            <section id="what-is" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">What is XFundDex?</h2>

              <div className="prose prose-invert max-w-none">
                <p className="text-neutral-300 text-lg leading-relaxed mb-4">
                  XFundDex is a crowdfunding platform that enables crypto communities to pool SOL together to purchase DEXScreener enhanced token info updates.
                </p>

                <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-blue-200 font-semibold mb-2">💡 How it works:</p>
                  <ul className="text-neutral-300 space-y-2 ml-4">
                    <li>• Create a campaign by tweeting @XFundDex with your token address</li>
                    <li>• Community members contribute SOL until the $300 goal is reached</li>
                    <li>• Once funded, we purchase the DEXScreener update using your campaign details</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">Getting Started</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Login with Twitter</h3>
                  <p className="text-neutral-300">Enter your X (Twitter) handle on the homepage to create your custodial wallet.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Deposit SOL</h3>
                  <p className="text-neutral-300">Send SOL to your generated wallet address. This will be used for campaign contributions.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Tweet Commands</h3>
                  <p className="text-neutral-300">Use @XFundDex commands from regular tweets or X Communities to create and fund campaigns.</p>
                </div>
              </div>
            </section>

            {/* Commands */}
            <section id="commands" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">Commands</h2>

              <div className="space-y-8">
                {/* Create */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-sm">CREATE</span>
                    <h3 className="text-xl font-semibold text-white">Create Campaign</h3>
                  </div>

                  <div className="bg-black/40 border border-neutral-700 rounded-lg p-4 mb-3">
                    <code className="text-blue-300 text-base">@XFundDex create TOKEN_CA</code>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-4">
                    <p className="text-neutral-500 text-sm mb-2">Example:</p>
                    <code className="text-blue-200 text-sm break-all">@XFundDex create DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263</code>
                  </div>

                  <p className="text-neutral-400 mb-3"><strong>TOKEN_CA</strong> = Contract address from DEXScreener URL</p>

                  <ul className="text-neutral-300 space-y-2">
                    <li>• Creates $300 USD campaign (auto-converts to SOL)</li>
                    <li>• Attach images to tweet or add later via website</li>
                    <li>• 24-hour deadline to reach goal</li>
                  </ul>
                </div>

                {/* Fund */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-600 text-white font-bold px-3 py-1 rounded text-sm">FUND</span>
                    <h3 className="text-xl font-semibold text-white">Fund Campaign</h3>
                  </div>

                  <div className="bg-black/40 border border-neutral-700 rounded-lg p-4 mb-3">
                    <code className="text-green-300 text-base">@XFundDex fund AMOUNT TOKEN_CA</code>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-4">
                    <p className="text-neutral-500 text-sm mb-2">Example:</p>
                    <code className="text-green-200 text-sm break-all">@XFundDex fund 0.5 DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263</code>
                  </div>

                  <ul className="text-neutral-300 space-y-2">
                    <li>• SOL withdrawn from your custodial wallet</li>
                    <li>• Funds sent to campaign wallet on-chain</li>
                    <li>• All transactions are transparent and verifiable</li>
                  </ul>
                </div>

                {/* Update */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-600 text-white font-bold px-3 py-1 rounded text-sm">UPDATE</span>
                    <h3 className="text-xl font-semibold text-white">Update Campaign (Creator Only)</h3>
                  </div>

                  <ol className="text-neutral-300 space-y-2 list-decimal list-inside">
                    <li>Go to your campaign page and click "Update Campaign"</li>
                    <li>Generate verification code</li>
                    <li>Tweet: <code className="text-orange-300 bg-black/40 px-2 py-1 rounded">@XFundDex update CODE</code></li>
                    <li>Wait ~10 seconds for verification</li>
                    <li>Upload logo, banner, description, and social links</li>
                  </ol>
                </div>

                {/* Withdraw */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded text-sm">WITHDRAW</span>
                    <h3 className="text-xl font-semibold text-white">Withdraw SOL</h3>
                  </div>

                  <ol className="text-neutral-300 space-y-2 list-decimal list-inside">
                    <li>Go to wallet page and click "Withdraw"</li>
                    <li>Enter destination wallet address and amount</li>
                    <li>Generate verification code</li>
                    <li>Tweet: <code className="text-purple-300 bg-black/40 px-2 py-1 rounded">@XFundDex withdraw CODE</code></li>
                    <li>Wait ~10 seconds for verification and processing</li>
                    <li>SOL will be sent to your destination address</li>
                  </ol>
                </div>

                {/* Export */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white font-bold px-3 py-1 rounded text-sm">EXPORT</span>
                    <h3 className="text-xl font-semibold text-white">Export Private Key</h3>
                  </div>

                  <ol className="text-neutral-300 space-y-2 list-decimal list-inside">
                    <li>Go to wallet page and click "Export Private Key"</li>
                    <li>Generate verification code</li>
                    <li>Tweet: <code className="text-red-300 bg-black/40 px-2 py-1 rounded">@XFundDex export CODE</code></li>
                    <li>Wait ~10 seconds for verification</li>
                    <li>Encrypted private key will be displayed</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Security & Encryption */}
            <section id="security" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">Security & Encryption</h2>

              <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6">
                <p className="text-amber-200 font-semibold mb-2">🔒 Your funds are protected</p>
                <p className="text-neutral-300">All private keys are encrypted with military-grade AES-256 encryption and stored securely.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Custodial Wallets</h3>
                  <ul className="text-neutral-300 space-y-2 ml-4">
                    <li>• Each user gets a unique Solana wallet with AES-256 encrypted private keys</li>
                    <li>• Export your private key anytime via tweet verification</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Tweet Verification System</h3>
                  <p className="text-neutral-300 mb-3">Sensitive actions require tweet verification to prevent unauthorized access:</p>
                  <ul className="text-neutral-300 space-y-2 ml-4">
                    <li>• Random codes generated for sensitive actions, expire after 10 minutes</li>
                    <li>• Must tweet from the connected X handle</li>
                    <li>• Verification completes within ~10-30 seconds</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">On-Chain Transparency</h3>
                  <ul className="text-neutral-300 space-y-2 ml-4">
                    <li>• EVERY transaction is publicly viewable on Solscan or Solana Explorer</li>
                    <li>• Campaign wallets are public and auditable</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 border-l-4 border-red-500 p-4">
                  <p className="text-red-200 font-semibold mb-2">⚠️ Important Security Notes</p>
                  <ul className="text-neutral-300 space-y-1 ml-4 text-sm">
                    <li>• Never share your verification codes publicly</li>
                    <li>• Always verify you're on the correct website</li>
                    <li>• Export and backup your private key in a secure location</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">How It Works</h2>

              <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">1</div>
                    <h3 className="text-xl font-semibold text-white">Campaign Creation</h3>
                  </div>
                  <ul className="text-neutral-300 space-y-2 ml-11">
                    <li>• User tweets <code className="bg-black/40 px-2 py-1 rounded">@XFundDex create TOKEN_CA</code></li>
                    <li>• System fetches token metadata from pump.fun or DEXScreener</li>
                    <li>• Creates campaign with $300 USD goal (converted to SOL)</li>
                    <li>• Extracts images from tweet if attached</li>
                    <li>• 24-hour deadline starts immediately</li>
                  </ul>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
                    <h3 className="text-xl font-semibold text-white">Community Funding</h3>
                  </div>
                  <ul className="text-neutral-300 space-y-2 ml-11">
                    <li>• Community members tweet to contribute SOL</li>
                    <li>• Funds withdrawn from contributor's custodial wallet</li>
                    <li>• Sent on-chain to campaign wallet</li>
                    <li>• Progress tracked in real-time</li>
                    <li>• Telegram notifications for each contribution</li>
                  </ul>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">3</div>
                    <h3 className="text-xl font-semibold text-white">DEX Update Purchase</h3>
                  </div>
                  <ul className="text-neutral-300 space-y-2 ml-11">
                    <li>• Once $300 goal reached, campaign marked as "funded"</li>
                    <li>• XFundDex team reviews campaign information</li>
                    <li>• Purchases DEXScreener update using provided logo, banner, description, links</li>
                    <li>• Token gets enhanced DEXScreener listing</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Can anyone login with my X username? Is that secure?</h3>
                  <p className="text-neutral-300">Yes, anyone can type any X username to create an account or login to an existing one. However, all spending requires tweeting commands (like fund or create), so only the real account owner can spend money.<br/><br/>Additionally, sensitive actions like withdrawing funds or exporting your private key require tweet verification - you must actually tweet from that X account to prove ownership. This ensures only the real account owner can access and control funds.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Does this work from X Communities?</h3>
                  <p className="text-neutral-300">Yes! All commands work from both regular tweets and X Communities. This makes it perfect for rallying your token holders in a community space.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">How much does a DEXScreener update cost?</h3>
                  <p className="text-neutral-300">$300 USD. When you create a campaign, we automatically convert this to the current SOL equivalent so the goal is always exactly $300.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Who controls my wallet?</h3>
                  <p className="text-neutral-300">XFundDex controls all custodial wallets. You control your wallet through tweet commands. All private keys are encrypted with AES-256 and can be exported anytime via tweet verification.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">How do I withdraw SOL from my wallet?</h3>
                  <p className="text-neutral-300">Go to your wallet page, click "Withdraw", enter the destination address and amount, then tweet the verification code. The SOL will be sent to your destination address after verification. Requires tweet verification for security.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">What if I forget to include images in my create tweet?</h3>
                  <p className="text-neutral-300">You can update the campaign at any time by going to your campaign page and clicking "Update Campaign" to add images, description, and social links.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">What if I forget to include images and don't update the campaign?</h3>
                  <p className="text-neutral-300">We will message you (the campaign creator) on X to request more information about your campaign so we can complete the DEXScreener update.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">How do I add images to my campaign?</h3>
                  <p className="text-neutral-300">You can attach images (logo and banner) directly to your creation tweet, or update them later via the campaign page using the UPDATE command.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">What happens if a campaign doesn't reach its goal?</h3>
                  <p className="text-neutral-300">Campaigns have 24 hours to reach the $300 goal. If the deadline passes without reaching the goal, the campaign is marked as "failed" and no DEX update is purchased.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Can I get my SOL back from a failed campaign?</h3>
                  <p className="text-neutral-300">Currently, funds contributed to campaigns remain in the campaign wallet. We recommend only contributing to campaigns you believe will succeed within the 24-hour window.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Are all transactions visible on-chain?</h3>
                  <p className="text-neutral-300">Yes! Every deposit, withdrawal, and contribution is a publicly viewable Solana transaction. You can view all activity on Solscan or any Solana block explorer.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">How long does tweet verification take?</h3>
                  <p className="text-neutral-300">Our system polls the Twitter API approximately every 10 seconds. Verification usually completes within 10-30 seconds of posting your tweet.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">What if I lose access to my Twitter account?</h3>
                  <p className="text-neutral-300">If you lose access to your Twitter account, you will not be able to withdraw funds or export your private key since all sensitive actions require tweet verification. Please contact us on X <a href="https://x.com/XFundDex" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@XFundDex</a> immediately for assistance with account recovery.</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">What if I change my Twitter username?</h3>
                  <p className="text-neutral-300">Your account is linked to your Twitter username in our system. If you change your username, please contact us on X <a href="https://x.com/XFundDex" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@XFundDex</a> to update our records and ensure you can continue using your wallet without issues. We will verify your claim.</p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to get started?</h3>
              <p className="text-neutral-300 mb-6">Create your wallet and start crowdfunding DEX updates via Twitter</p>
              <a href="/" className="btn btn-primary inline-block px-8 py-3 text-lg">
                Get Started
              </a>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
