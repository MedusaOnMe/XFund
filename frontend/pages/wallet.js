import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import { getWallet, getUserCampaigns } from '../lib/api';
import ExportModal from '../components/ExportModal';
import Navbar from '../components/Navbar';

/**
 * Wallet page - Deposit, withdraw, export
 */
export default function Wallet() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [walletPub, setWalletPub] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myCampaigns, setMyCampaigns] = useState([]);

  // Load user from session
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('user_id');
    const storedHandle = sessionStorage.getItem('x_handle');
    const storedWallet = sessionStorage.getItem('wallet_pub');

    if (!storedUserId) {
      router.push('/');
      return;
    }

    setUserId(storedUserId);
    setXHandle(storedHandle);
    setWalletPub(storedWallet);

    loadWallet(storedUserId);
  }, [router]);

  const loadWallet = async (uid) => {
    try {
      const data = await getWallet(uid);
      setWalletPub(data.wallet_pub);
      setBalance(data.balance);

      // Load user's campaigns
      const campaigns = await getUserCampaigns(uid);
      setMyCampaigns(campaigns);

      setLoading(false);
    } catch (err) {
      console.error('Load wallet error:', err);
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletPub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Wallet - XFundDex</title>
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Wallet</h1>
            <a
              href={`https://x.com/${xHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {xHandle.startsWith('@') ? xHandle : `@${xHandle}`}
            </a>
          </div>

          {/* Balance & Deposit - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Balance */}
            <div className="card h-full flex flex-col justify-center text-center">
              <p className="text-sm text-neutral-400 mb-2">Balance</p>
              <p className="text-5xl font-bold text-white">{balance.toFixed(4)} <span className="text-2xl text-neutral-400">SOL</span></p>
            </div>

            {/* Deposit */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4 text-white">Deposit SOL</h2>

              <div className="bg-neutral-950 p-4 rounded-lg mb-4 flex justify-center border border-neutral-800">
                <QRCodeSVG value={walletPub} size={160} bgColor="#0a0a0a" fgColor="#ffffff" />
              </div>

              <div className="bg-neutral-950 rounded-lg p-3 mb-4 border border-neutral-800">
                <p className="text-xs font-mono break-all text-neutral-300">
                  {walletPub}
                </p>
              </div>

              <button onClick={copyAddress} className="btn btn-secondary w-full text-sm">
                {copied ? 'Copied ✓' : 'Copy Address'}
              </button>
            </div>
          </div>

          {/* My Campaigns */}
          {myCampaigns.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">My Campaigns</h2>
              <div className="space-y-3">
                {myCampaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-neutral-950 border border-neutral-800 rounded p-4 hover:border-neutral-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${campaign.type === 'dex' ? 'badge-primary' : 'badge-warning'}`}>
                            {campaign.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {campaign.total_raised.toFixed(4)} SOL raised
                          </span>
                        </div>
                        <p className="text-xs font-mono text-neutral-400 break-all">
                          {campaign.token_ca}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/campaign/${campaign.id}`}
                      className="btn btn-secondary text-xs w-full"
                    >
                      View & Update
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          <div className="card border border-red-600/30 mt-8">
            <h2 className="text-lg font-bold text-red-400 mb-2">Export Private Key</h2>
            <p className="text-sm text-neutral-400 mb-4">
              Export your key to import wallet elsewhere. Requires tweet verification.
            </p>
            <button
              onClick={() => setShowExportModal(true)}
              className="btn btn-danger text-sm"
            >
              Export Key
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          userId={userId}
          xHandle={xHandle}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
}
