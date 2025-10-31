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

  return (
    <>
      <Head>
        <title>Campaigns - XFunder</title>
      </Head>

      <Navbar />

      <div className="min-h-screen">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Active Campaigns</h1>
            <p className="text-neutral-400">DEX update funding campaigns</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex gap-4">
              <select
                className="input text-sm"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>

              <select
                className="input text-sm"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="dex">DEX (24h)</option>
                <option value="boosts">Boosts</option>
              </select>
            </div>
          </div>

          {/* Campaigns */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-neutral-400 text-sm">No campaigns found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
