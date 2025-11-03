import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/api';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function Home() {
  const router = useRouter();
  const [xHandle, setXHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Allow natural scrolling
  useEffect(() => {
    document.body.style.overflow = 'unset';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!xHandle.trim()) {
      setError('Please enter your X handle');
      return;
    }

    setLoading(true);

    try {
      const result = await login(xHandle);
      sessionStorage.setItem('user_id', result.user_id);
      sessionStorage.setItem('x_handle', xHandle);
      sessionStorage.setItem('wallet_pub', result.wallet_pub);
      router.push('/wallet');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>XFundDex - Fund DEX Updates via Tweet</title>
        <meta name="description" content="Community tool for funding DEXScreener updates. Tweet to contribute." />
      </Head>

      <Navbar />

      {/* Video Background */}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/2.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="flex items-center justify-center pt-12 pb-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">

          {/* Hero - Centered */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-6">
                <img src="/logo.png" alt="XFundDex" className="w-24 h-24" />
              </div>
              <h1 style={{fontSize: 'clamp(2.75rem, 6.5vw, 4rem)'}} className="font-extrabold mb-4 text-white leading-tight">
                Crowdfund DEX Updates <span className="text-blue-400">via Twitter</span>
              </h1>
              <p style={{fontSize: 'clamp(1.25rem, 2vw, 1.6rem)'}} className="text-neutral-300 mb-6 max-w-3xl mx-auto whitespace-nowrap">
                Community tool for pooling SOL to pay for DEXScreener enhanced token info
              </p>

              {/* Primary Action - X Handle Login */}
              <div className="max-w-xl mx-auto mb-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1 text-lg px-4 py-3"
                    placeholder="Your X handle"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-purple-500/20 transition-all whitespace-nowrap text-base"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Get Started →'}
                  </button>
                </form>
                {error && (
                  <div className="text-red-400 text-center mt-2 text-base">{error}</div>
                )}
              </div>

              {/* Secondary Action */}
              <div className="text-center">
                <a
                  href="/campaigns"
                  className="text-blue-400 hover:text-blue-300 text-lg font-medium transition-colors inline-flex items-center gap-1"
                >
                  or browse active campaigns →
                </a>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="mx-auto mt-6" style={{maxWidth: '80rem'}}>
            <div className="bg-neutral-900/60 backdrop-blur-sm border-2 border-neutral-700/50 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                <h2 style={{fontSize: 'clamp(1.3rem, 2.2vw, 1.6rem)'}} className="font-bold mb-3 text-white text-center">Tweet Commands</h2>
                <p style={{fontSize: 'clamp(1rem, 1.5vw, 1.15rem)'}} className="text-center text-neutral-400 mb-5">Works from regular tweets <strong>OR X Communities!</strong></p>

                {/* Commands Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Create */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-700/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{fontSize: 'clamp(0.85rem, 1.3vw, 1rem)'}} className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded">CREATE</span>
                      <span style={{fontSize: 'clamp(1rem, 1.5vw, 1.15rem)'}} className="text-white font-semibold">$300 campaign</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="bg-black/40 border border-blue-800/30 rounded-lg p-2">
                        <code style={{fontSize: 'clamp(0.9rem, 1.35vw, 1.05rem)'}} className="text-blue-300">@XFundDex create TOKEN_CA</code>
                      </div>
                      <div className="bg-neutral-900/50 border border-blue-800/20 rounded-lg p-2">
                        <p style={{fontSize: 'clamp(0.8rem, 1.15vw, 0.95rem)'}} className="text-neutral-500 mb-0.5">Example:</p>
                        <code style={{fontSize: 'clamp(0.85rem, 1.25vw, 1rem)'}} className="text-blue-200 break-all">@XFundDex create DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263</code>
                      </div>
                      <p style={{fontSize: 'clamp(0.8rem, 1.15vw, 0.95rem)'}} className="text-neutral-400 mt-1">
                        <strong>Tip:</strong> Attach images to your tweet or add them later via the campaign page
                      </p>
                    </div>
                  </div>

                  {/* Fund */}
                  <div className="bg-gradient-to-br from-green-900/20 to-green-950/20 border border-green-700/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{fontSize: 'clamp(0.85rem, 1.3vw, 1rem)'}} className="bg-green-600 text-white font-bold px-2 py-0.5 rounded">FUND</span>
                      <span style={{fontSize: 'clamp(1rem, 1.5vw, 1.15rem)'}} className="text-white font-semibold">Contribute SOL</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="bg-black/40 border border-green-800/30 rounded-lg p-2">
                        <code style={{fontSize: 'clamp(0.9rem, 1.35vw, 1.05rem)'}} className="text-green-300">@XFundDex fund AMOUNT TOKEN_CA</code>
                      </div>
                      <div className="bg-neutral-900/50 border border-green-800/20 rounded-lg p-2">
                        <p style={{fontSize: 'clamp(0.8rem, 1.15vw, 0.95rem)'}} className="text-neutral-500 mb-0.5">Example:</p>
                        <code style={{fontSize: 'clamp(0.85rem, 1.25vw, 1rem)'}} className="text-green-200 break-all">@XFundDex fund 0.5 DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Creators Note */}
                <div className="bg-purple-900/30 border-2 border-purple-600/40 rounded-xl p-3 text-center mb-3 mt-3">
                  <p style={{fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)'}} className="text-purple-200 font-semibold">
                    Campaign creators can add images, description, and links after creation via the campaign page
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <a href="/how-it-works" style={{fontSize: 'clamp(1rem, 1.5vw, 1.15rem)'}} className="btn btn-primary inline-block px-6 py-2.5">
                    View detailed guide →
                  </a>
                </div>
              </div>
            </div>

        </div>
      </div>
    </>
  );
}
