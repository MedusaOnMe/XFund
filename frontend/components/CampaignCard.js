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

  const statusClass = campaign.status === 'active' ? 'badge-success' : 'badge-danger';
  const typeClass = campaign.type === 'dex' ? 'badge-primary' : 'badge-warning';

  return (
    <Link href={`/campaign/${campaign.id}`}>
      <div className="card hover:border-neutral-700 transition-colors cursor-pointer">
        <div className="flex gap-2 mb-3">
          <span className={`badge ${typeClass}`}>
            {campaign.type.toUpperCase()}
          </span>
          <span className={`badge ${statusClass}`}>
            {campaign.status.toUpperCase()}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-1">Token</p>
          <p className="font-mono text-xs text-neutral-300 truncate">
            {campaign.token_ca}
          </p>
        </div>

        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-1">Raised</p>
          <p className="text-2xl font-bold text-white">
            {campaign.total_raised.toFixed(4)} SOL
          </p>
        </div>

        {campaign.type === 'dex' && (
          <div className="text-xs text-neutral-400">
            {timeRemaining()} left
          </div>
        )}

        {campaign.type === 'boosts' && (
          <div className="text-xs text-neutral-400">
            No expiry
          </div>
        )}
      </div>
    </Link>
  );
}
