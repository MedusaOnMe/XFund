import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import OnboardingModal from './OnboardingModal';

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = sessionStorage.getItem('user_id');
    setUserId(id);

    // Listen for auth changes (login/logout from other components)
    const handleAuthChange = () => {
      const updatedId = sessionStorage.getItem('user_id');
      setUserId(updatedId);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [mounted]);

  const handleLogout = () => {
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  return (
    <>
      <nav className="border-b border-neutral-800 sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile menu button - Left side */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-neutral-400 hover:text-white transition-colors"
                title="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/">
                <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
                  <img src="/logo.png" alt="XFundDex" className="w-7 h-7 md:w-8 md:h-8" />
                  <span className="text-lg md:text-xl font-bold text-white">XFundDex</span>
                </div>
              </Link>

              {/* Hide navigation links on mobile */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/">
                  <span className={`transition-colors cursor-pointer text-sm font-medium ${
                    router.pathname === '/'
                      ? 'text-white border-b-2 border-blue-500 pb-1'
                      : 'text-neutral-400 hover:text-white'
                  }`}>
                    Home
                  </span>
                </Link>

                <Link href="/how-it-works">
                  <span className={`transition-colors cursor-pointer text-sm font-medium ${
                    router.pathname === '/how-it-works'
                      ? 'text-white border-b-2 border-blue-500 pb-1'
                      : 'text-neutral-400 hover:text-white'
                  }`}>
                    How it works
                  </span>
                </Link>

                <Link href="/campaigns">
                  <span className={`transition-colors cursor-pointer text-sm font-medium ${
                    router.pathname === '/campaigns'
                      ? 'text-white border-b-2 border-blue-500 pb-1'
                      : 'text-neutral-400 hover:text-white'
                  }`}>
                    Browse Campaigns
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Social Links - hide on mobile */}
              <a
                href="https://t.me/XFundDexTx"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block text-neutral-400 hover:text-white transition-colors"
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
                className="hidden md:block text-neutral-400 hover:text-white transition-colors"
                title="Follow on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Info button */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-neutral-400 hover:text-white transition-colors"
                title="View tutorial"
              >
                <FaInfoCircle className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {userId && (
                <>
                  <Link href="/wallet">
                    <button className="btn btn-primary text-xs md:text-sm px-3 md:px-4 py-2">
                      Wallet
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary text-xs md:text-sm px-3 md:px-4 py-2"
                  >
                    Logout
                  </button>
                </>
              )}

              {!userId && (
                <Link href="/">
                  <button className="btn btn-secondary text-xs md:text-sm px-3 md:px-4 py-2">
                    Connect
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu */}
          <div className="fixed top-0 left-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 z-50 md:hidden">
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="XFundDex" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">XFundDex</span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <div className={`text-base font-medium py-2 transition-colors ${
                    router.pathname === '/' ? 'text-blue-400' : 'text-neutral-300 hover:text-white'
                  }`}>
                    Home
                  </div>
                </Link>

                <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>
                  <div className={`text-base font-medium py-2 transition-colors ${
                    router.pathname === '/how-it-works' ? 'text-blue-400' : 'text-neutral-300 hover:text-white'
                  }`}>
                    How it works
                  </div>
                </Link>

                <Link href="/campaigns" onClick={() => setMobileMenuOpen(false)}>
                  <div className={`text-base font-medium py-2 transition-colors ${
                    router.pathname === '/campaigns' ? 'text-blue-400' : 'text-neutral-300 hover:text-white'
                  }`}>
                    Browse Campaigns
                  </div>
                </Link>

                {userId && (
                  <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}>
                    <div className={`text-base font-medium py-2 transition-colors ${
                      router.pathname === '/wallet' ? 'text-blue-400' : 'text-neutral-300 hover:text-white'
                    }`}>
                      Wallet
                    </div>
                  </Link>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-neutral-800">
                <a
                  href="https://t.me/XFundDexTx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  title="Join our Telegram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        isManualOpen={true}
      />
    </>
  );
}
