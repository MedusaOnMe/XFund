import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getCampaigns } from '../lib/api';
import CampaignCard from '../components/CampaignCard';
import Navbar from '../components/Navbar';

/**
 * Campaigns list page
 */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: 'active' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, [filter]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns(filter);
      setCampaigns(data);
    } catch (err) {
      console.error('Load campaigns error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns by search query
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const name = campaign.metadata?.token_name?.toLowerCase() || '';
    const symbol = campaign.metadata?.token_symbol?.toLowerCase() || '';
    const ca = campaign.token_ca.toLowerCase();

    return name.includes(query) || symbol.includes(query) || ca.includes(query);
  });

  return (
    <>
      <Head>
        <title>Campaigns - XFundDex</title>
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              {filter.status === 'active' && 'Active Campaigns'}
              {filter.status === 'funded' && 'Funded Campaigns'}
              {filter.status === 'failed' && 'Failed Campaigns'}
              {!filter.status && 'All Campaigns'}
            </h1>
            <p className="text-lg text-neutral-400">Community-funded DEXScreener updates</p>
          </div>

          {/* Search */}
          <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-5 mb-6 shadow-xl">
            <label className="text-xs text-neutral-500 mb-3 block">Search</label>
            <input
              type="text"
              placeholder="Search by name, ticker, or contract address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Filters */}
          <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-5 mb-6 shadow-xl">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="text-xs text-neutral-500 mb-3 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter({ ...filter, status: '' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.status === ''
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter({ ...filter, status: 'active' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.status === 'active'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter({ ...filter, status: 'funded' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.status === 'funded'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    Funded
                  </button>
                  <button
                    onClick={() => setFilter({ ...filter, status: 'failed' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.status === 'failed'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-xs text-neutral-500 mb-3 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter({ ...filter, type: '' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.type === ''
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setFilter({ ...filter, type: 'dex' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter.type === 'dex'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    DEX (24h)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="text-neutral-500 mt-4">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-12 text-center shadow-xl">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-neutral-400 text-lg">No campaigns found</p>
              <p className="text-neutral-600 text-sm mt-2">
                {searchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
