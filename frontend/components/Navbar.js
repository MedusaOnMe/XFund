import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = sessionStorage.getItem('user_id');
    setUserId(id);
  }, [mounted]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <nav className="border-b border-neutral-800 sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/logo.png" alt="XFundDex" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">XFundDex</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/how-it-works">
              <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm font-medium">
                How it works
              </span>
            </Link>

            <Link href="/campaigns">
              <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm font-medium">
                Campaigns
              </span>
            </Link>

            {/* Social Links */}
            <a
              href="https://t.me/XFundDexTx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              title="Join our Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
            </a>

            <a
              href="https://x.com/XFundDex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              title="Follow on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {userId && (
              <>
                <Link href="/wallet">
                  <button className="btn btn-primary text-sm">
                    Wallet
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            )}

            {!userId && (
              <Link href="/">
                <button className="btn btn-secondary text-sm">
                  Connect
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
