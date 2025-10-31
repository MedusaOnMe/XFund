import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('user_id') : null;

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <nav className="border-b border-neutral-800 sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl font-bold text-white">XFunder</span>
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
