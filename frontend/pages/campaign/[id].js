import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getCampaign } from '../../lib/api';
import Navbar from '../../components/Navbar';

/**
 * Campaign detail page
 */
export default function CampaignDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [campaign, setCampaign] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      const data = await getCampaign(id);
      setCampaign(data.campaign);
      setContributions(data.contributions);
      setBalance(data.balance);
    } catch (err) {
      console.error('Load campaign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const tweetToContribute = () => {
    if (!campaign) return;

    const tweetText = `@crowdfund fund ${campaign.type} 0.1 ${campaign.token_ca}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const timeRemaining = () => {
    if (!campaign || campaign.type !== 'dex' || !campaign.end_ts) {
      return null;
    }

    const now = Date.now();
    const remaining = campaign.end_ts - now;

    if (remaining <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="card text-center">
            <p className="text-neutral-400">Campaign not found</p>
            <a href="/campaigns" className="btn btn-primary mt-4 inline-block text-sm">
              Back
            </a>
          </div>
        </div>
      </>
    );
  }

  const statusClass = campaign.status === 'active' ? 'badge-success' : 'badge-danger';
  const typeClass = campaign.type === 'dex' ? 'badge-primary' : 'badge-warning';

  return (
    <>
      <Head>
        <title>Campaign - XFunder</title>
      </Head>

      <Navbar />

      <div className="min-h-screen">
        <div className="container-custom py-8">
          <a href="/campaigns" className="text-neutral-400 hover:text-white mb-6 inline-block text-sm">
            ← Back
          </a>

          <div className="card mb-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2">
                <span className={`badge ${typeClass}`}>
                  {campaign.type.toUpperCase()}
                </span>
                <span className={`badge ${statusClass}`}>
                  {campaign.status.toUpperCase()}
                </span>
              </div>

              {campaign.status === 'active' && (
                <button onClick={tweetToContribute} className="btn btn-primary text-sm">
                  Tweet to Fund
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-500 mb-1">Token</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-neutral-300 flex-1 break-all">
                  {campaign.token_ca}
                </p>
                <button
                  onClick={() => copyToClipboard(campaign.token_ca)}
                  className="btn btn-secondary text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Raised</p>
                <p className="text-3xl font-bold text-white">
                  {campaign.total_raised.toFixed(4)} SOL
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Balance</p>
                <p className="text-3xl font-bold text-neutral-300">
                  {balance.toFixed(4)} SOL
                </p>
              </div>
            </div>

            {campaign.type === 'dex' && (
              <div className="text-sm text-neutral-400">
                {timeRemaining()}
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-bold mb-3 text-white">Campaign Wallet</h2>
            <div className="bg-neutral-950 rounded p-3 mb-3 border border-neutral-800">
              <p className="text-xs font-mono break-all text-neutral-300">
                {campaign.campaign_wallet_pub}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(campaign.campaign_wallet_pub)}
              className="btn btn-secondary text-sm"
            >
              Copy
            </button>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-bold mb-3 text-white">Contribute</h2>
            <p className="text-sm text-neutral-400 mb-3">
              Tweet to add SOL:
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded p-3 mb-3">
              <code className="text-xs text-green-400">
                @crowdfund fund {campaign.type} 0.5 {campaign.token_ca}
              </code>
            </div>
            <button onClick={tweetToContribute} className="btn btn-primary text-sm">
              Tweet
            </button>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold mb-4 text-white">
              Contributors ({contributions.length})
            </h2>

            {contributions.length === 0 ? (
              <p className="text-neutral-400 text-center py-8 text-sm">
                No contributions yet
              </p>
            ) : (
              <div className="space-y-2">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                    <span className="font-semibold text-white text-sm">
                      {contribution.amount.toFixed(4)} SOL
                    </span>
                    <a
                      href={`https://solscan.io/tx/${contribution.tx_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                    >
                      {contribution.tx_signature.slice(0, 8)}...
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
