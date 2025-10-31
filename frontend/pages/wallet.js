import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import { getWallet } from '../lib/api';
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
        <title>Wallet - XFunder</title>
      </Head>

      <Navbar />

      <div className="min-h-screen">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Wallet</h1>
            <p className="text-neutral-400">{xHandle}</p>
          </div>

          {/* Balance */}
          <div className="card mb-8">
            <p className="text-sm text-neutral-400 mb-1">Balance</p>
            <p className="text-4xl font-bold text-white">{balance.toFixed(4)} SOL</p>
          </div>

          {/* Deposit */}
          <div className="card max-w-md">
            <h2 className="text-lg font-bold mb-4 text-white">Deposit</h2>

            <div className="bg-neutral-950 p-3 rounded mb-4 flex justify-center border border-neutral-800">
              <QRCodeSVG value={walletPub} size={150} bgColor="#0a0a0a" fgColor="#ffffff" />
            </div>

            <div className="bg-neutral-950 rounded p-3 mb-4 border border-neutral-800">
              <p className="text-xs font-mono break-all text-neutral-300">
                {walletPub}
              </p>
            </div>

            <button onClick={copyAddress} className="btn btn-secondary w-full text-sm">
              {copied ? 'Copied' : 'Copy Address'}
            </button>
          </div>

          {/* Export */}
          <div className="card border border-red-600/30 mt-6">
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
