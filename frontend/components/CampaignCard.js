import Link from 'next/link';

export default function CampaignCard({ campaign }) {
  const timeRemaining = () => {
    if (campaign.type !== 'dex' || !campaign.end_ts) {
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
    <Link href={`/campaign/${campaign.id}`}>
      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-5 hover:border-neutral-700 hover:shadow-xl transition-all cursor-pointer group">
        <div className="flex items-start gap-4 mb-4">
          {/* Token Image */}
          {campaign.metadata?.main_image_url ? (
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                <img
                  src={campaign.metadata.main_image_url}
                  alt={campaign.metadata.token_name || 'Token'}
                  className="relative w-16 h-16 object-cover rounded-xl border-2 border-neutral-700/50 group-hover:border-neutral-600/50 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl border-2 border-neutral-700/50 flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
          )}

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`badge ${typeClass} text-xs font-bold`}>
                {campaign.type.toUpperCase()}
              </span>
              <span className={`badge ${statusClass} text-xs font-bold`}>
                {getStatusLabel()}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
              {campaign.metadata?.token_name || 'Unknown Token'}
            </h3>

            {campaign.metadata?.token_symbol && (
              <p className="text-sm text-neutral-400 font-semibold mb-2">
                ${campaign.metadata.token_symbol}
              </p>
            )}
          </div>
        </div>

        {/* Token Address */}
        <div className="mb-4 bg-neutral-950/50 rounded-lg p-2 border border-neutral-800/50">
          <p className="text-xs font-mono text-neutral-500 truncate">
            {campaign.token_ca}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Raised</p>
            <p className="text-xl font-bold text-white">
              {campaign.total_raised.toFixed(4)} <span className="text-sm text-neutral-400">SOL</span>
            </p>
          </div>

          {campaign.type === 'dex' && timeRemaining() && (
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Time Left</p>
              <p className="text-sm font-bold text-orange-400">
                {timeRemaining()}
              </p>
            </div>
          )}

          {campaign.type === 'boosts' && (
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Duration</p>
              <p className="text-sm font-bold text-green-400">
                No expiry
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {campaign.goal_amount ? (
          <>
            <div className="h-2 bg-neutral-800/50 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((campaign.total_raised / campaign.goal_amount) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-neutral-500">
                Goal: {campaign.goal_amount.toFixed(2)} SOL
              </p>
              <p className="text-xs font-bold text-blue-400">
                {((campaign.total_raised / campaign.goal_amount) * 100).toFixed(1)}%
              </p>
            </div>
          </>
        ) : (
          <div className="h-2 bg-neutral-800/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
          </div>
        )}
      </div>
    </Link>
  );
}
