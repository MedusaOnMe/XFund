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

  // Prevent body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
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
        <title>XFunder - Fund DEX Updates via Tweet</title>
        <meta name="description" content="Community tool for funding DEXScreener updates. Tweet to contribute." />
      </Head>

      <Navbar />

      {/* Video Background */}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/2.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="h-screen flex items-center justify-center overflow-hidden">
        <div className="container-custom w-full">

          <div className="max-w-6xl mx-auto">

            {/* Hero - Centered */}
            <div className="text-center mb-8">
              <h1 className="text-6xl font-extrabold mb-4 text-white leading-tight">
                Fund DEX Updates <span className="text-blue-400">via Twitter</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-6 max-w-3xl mx-auto">
                Community tool for pooling SOL to pay for DEXScreener enhanced token info
              </p>

              {/* Login */}
              <div className="card max-w-md mx-auto border-neutral-700 shadow-xl mb-8">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    className="input"
                    placeholder="Your X handle"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    disabled={loading}
                  />
                  {error && (
                    <div className="text-sm text-red-400">{error}</div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary w-full font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Get Started'}
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Guide */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-900/60 backdrop-blur-sm border-2 border-neutral-700/50 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                <h2 className="text-xl font-bold mb-5 text-white text-center">Tweet Commands</h2>
                <div className="space-y-4">
                  {/* Create */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-2 border-blue-700/30 rounded-xl p-4 hover:border-blue-600/50 transition-all">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-lg">CREATE</span>
                      <span className="text-sm text-white font-semibold">Start a new campaign</span>
                    </div>
                    <div className="bg-black/40 border border-blue-800/30 rounded-lg p-3 backdrop-blur-sm">
                      <code className="text-blue-300 text-sm font-semibold">@XFundDex create dex TOKEN_CA</code>
                    </div>
                  </div>

                  {/* Contribute */}
                  <div className="bg-gradient-to-br from-green-900/20 to-green-950/20 border-2 border-green-700/30 rounded-xl p-4 hover:border-green-600/50 transition-all">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-lg">FUND</span>
                      <span className="text-sm text-white font-semibold">Add SOL to a campaign</span>
                    </div>
                    <div className="bg-black/40 border border-green-800/30 rounded-lg p-3 backdrop-blur-sm">
                      <code className="text-green-300 text-sm font-semibold">@XFundDex fund dex 0.5 TOKEN_CA</code>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <a href="/how-it-works" className="btn btn-primary inline-block">
                    View detailed guide →
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
