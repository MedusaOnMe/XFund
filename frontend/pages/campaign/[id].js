import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getCampaign } from '../../lib/api';
import Navbar from '../../components/Navbar';
import UpdateModal from '../../components/UpdateModal';

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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load campaign on mount - parse ID from URL for static export compatibility
    loadCampaign();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userId = sessionStorage.getItem('user_id');
    const xHandle = sessionStorage.getItem('x_handle');
    if (userId && xHandle) {
      setCurrentUser({
        user_id: userId,
        x_handle: xHandle
      });
    }
  }, [mounted]);

  const loadCampaign = async () => {
    try {
      // Get campaign ID from router.query or parse from URL
      let campaignId = id;

      // Fallback for static export: parse from window.location
      if (!campaignId && typeof window !== 'undefined') {
        const match = window.location.pathname.match(/\/campaign\/([^/?]+)/);
        if (match) {
          campaignId = match[1];
        }
      }

      if (!campaignId) {
        setLoading(false);
        return;
      }

      const data = await getCampaign(campaignId);
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
    const tweetText = `@XFundDex fund SOL_AMOUNT ${campaign.token_ca}`;
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

    return `${hours}h ${minutes}m`;
  };

  const isCreator = () => {
    return currentUser && campaign && currentUser.user_id === campaign.creator_user_id;
  };

  const handleUpdateSuccess = () => {
    loadCampaign();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
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
              Back to Campaigns
            </a>
          </div>
        </div>
      </>
    );
  }

  const getStatusClass = () => {
    switch (campaign.status) {
      case 'active': return 'badge-success';
      case 'funded': return 'bg-green-600 text-white';
      case 'failed': return 'badge-danger';
      default: return 'bg-neutral-700 text-neutral-300';
    }
  };

  const getStatusLabel = () => {
    switch (campaign.status) {
      case 'active': return 'ACTIVE';
      case 'funded': return 'FUNDED';
      case 'failed': return 'FAILED';
      default: return campaign.status.toUpperCase();
    }
  };

  const statusClass = getStatusClass();
  const typeClass = campaign.type === 'dex' ? 'badge-primary' : 'badge-warning';

  return (
    <>
      <Head>
        <title>{campaign.metadata?.token_name || 'Campaign'} - XFundDex</title>
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Hero Section with Header Image */}
        {campaign.metadata?.header_image_url && (
          <div className="relative h-64 md:h-80 bg-neutral-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/50 to-neutral-950"></div>
            <img
              src={campaign.metadata.header_image_url}
              alt="Header"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        )}

        <div className="container-custom py-8 relative z-10">
          <a href="/campaigns" className="text-neutral-400 hover:text-white mb-6 inline-flex items-center gap-2 text-sm transition-colors">
            <span>←</span> Back to Campaigns
          </a>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Token Info Card */}
              <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start gap-6">
                  {/* Token Image */}
                  {campaign.metadata?.main_image_url && (
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                        <img
                          src={campaign.metadata.main_image_url}
                          alt="Token"
                          className="relative w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl border-2 border-neutral-700/50 shadow-xl"
                        />
                      </div>
                    </div>
                  )}

                  {/* Token Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`badge ${typeClass} text-xs font-bold`}>
                        {campaign.type.toUpperCase()}
                      </span>
                      <span className={`badge ${statusClass} text-xs font-bold`}>
                        {getStatusLabel()}
                      </span>
                      {campaign.type === 'dex' && timeRemaining() && (
                        <span className="badge bg-neutral-800 text-neutral-300 text-xs font-mono">
                          ⏱ {timeRemaining()}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {campaign.metadata?.token_name || 'Campaign'}
                    </h1>

                    {campaign.metadata?.token_symbol && (
                      <p className="text-lg text-neutral-400 font-semibold mb-4">
                        ${campaign.metadata.token_symbol}
                      </p>
                    )}

                    {/* Token CA */}
                    <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800/50">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-mono text-neutral-400 truncate flex-1">
                          {campaign.token_ca}
                        </p>
                        <button
                          onClick={() => copyToClipboard(campaign.token_ca)}
                          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md text-xs font-medium transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mt-6 pt-6 border-t border-neutral-800/50">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-sm font-medium text-neutral-400">Total Raised</p>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">
                        {campaign.total_raised.toFixed(4)} <span className="text-xl text-neutral-400">SOL</span>
                      </p>
                      {campaign.goal_amount && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Goal: {campaign.goal_amount.toFixed(4)} SOL (${campaign.goal_usd})
                        </p>
                      )}
                    </div>
                  </div>

                  {campaign.goal_amount ? (
                    <>
                      <div className="h-3 bg-neutral-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((campaign.total_raised / campaign.goal_amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-neutral-500">{contributions.length} contributors</p>
                        <p className="text-xs font-bold text-blue-400">
                          {((campaign.total_raised / campaign.goal_amount) * 100).toFixed(1)}% funded
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-neutral-500">{contributions.length} contributors</p>
                      <p className="text-xs text-neutral-400 font-mono">Balance: {balance.toFixed(4)} SOL</p>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {campaign.status === 'active' && (
                    <button
                      onClick={tweetToContribute}
                      className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      🐦 Tweet to Fund
                    </button>
                  )}
                  {mounted && isCreator() && (
                    <button
                      onClick={() => setShowUpdateModal(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                    >
                      ✏️ Update Campaign
                    </button>
                  )}
                </div>
              </div>

              {/* Description Card */}
              {campaign.metadata?.description && (
                <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-4">About</h2>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {campaign.metadata.description}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(campaign.metadata?.twitter_url || campaign.metadata?.telegram_url || campaign.metadata?.website_url) && (
                <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-4">Links</h2>
                  <div className="flex flex-wrap gap-3">
                    {campaign.metadata.twitter_url && (
                      <a
                        href={campaign.metadata.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-colors"
                      >
                        <span>𝕏</span> Twitter
                      </a>
                    )}
                    {campaign.metadata.telegram_url && (
                      <a
                        href={campaign.metadata.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-colors"
                      >
                        <span>✈️</span> Telegram
                      </a>
                    )}
                    {campaign.metadata.website_url && (
                      <a
                        href={campaign.metadata.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 font-medium transition-colors"
                      >
                        <span>🌐</span> Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Campaign Wallet */}
              <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Campaign Wallet</h3>
                <div className="bg-neutral-950/50 rounded-lg p-4 mb-4 border border-neutral-800/50">
                  <p className="text-xs font-mono text-neutral-400 break-all leading-relaxed">
                    {campaign.campaign_wallet_pub}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(campaign.campaign_wallet_pub)}
                  className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
                >
                  📋 Copy Address
                </button>
              </div>

              {/* How to Contribute */}
              <div className="bg-gradient-to-br from-green-900/20 to-green-950/20 border border-green-700/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-3">How to Contribute</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Tweet this command to contribute:
                </p>
                <div className="bg-neutral-950/80 rounded-lg p-4 mb-3 border border-green-700/20">
                  <code className="text-xs text-green-400 break-all">
                    @XFundDex fund SOL_AMOUNT {campaign.token_ca}
                  </code>
                </div>
                <p className="text-xs text-neutral-400 mb-3">
                  Replace SOL_AMOUNT with how much SOL you want to contribute (e.g., 0.5)
                </p>
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-300">
                    <strong>💬 Works from X Communities too!</strong> Tweet from the token's Community to contribute.
                  </p>
                </div>
                <button
                  onClick={tweetToContribute}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors"
                >
                  🐦 Tweet to Contribute
                </button>
              </div>

              {/* Contributors */}
              <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  Contributors ({contributions.length})
                </h3>

                {contributions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-500 text-sm">No contributions yet</p>
                    <p className="text-neutral-600 text-xs mt-2">Be the first to fund!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {contributions.map((contribution) => (
                      <div
                        key={contribution.id}
                        className="flex justify-between items-center p-3 bg-neutral-950/50 rounded-lg border border-neutral-800/50"
                      >
                        <span className="font-bold text-white text-sm">
                          {contribution.amount.toFixed(4)} SOL
                        </span>
                        <a
                          href={`https://solscan.io/tx/${contribution.tx_signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors"
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
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && currentUser && (
        <UpdateModal
          campaign={campaign}
          xHandle={currentUser.x_handle}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}

