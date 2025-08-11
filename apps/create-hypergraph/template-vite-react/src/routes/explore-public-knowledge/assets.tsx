import { Asset } from '@/schema';
import { useQuery } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge/assets')({
  component: AssetMarket,
});

function AssetMarket() {
  const { data: assets, isPending } = useQuery(Asset, {
    mode: 'public',
    space: 'b2565802-3118-47be-91f2-e59170735bac',
    first: 100,
  });

  return (
    <>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Assets
        </h2>
      </div>

      {isPending && <div className="text-center py-16">Loading…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 z-10"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <span className="text-white font-bold text-lg">{asset.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Asset name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {asset.name}
              </h3>

              {/* Asset ID */}
              <p className="text-[10px] text-gray-500 mb-2 font-mono">{asset.id}</p>

              {/* Asset symbol */}
              {asset.symbol && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{asset.symbol}</p>}

              {/* Asset blockchain address */}
              {asset.blockchainAddress && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{asset.blockchainAddress}</p>
              )}
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-8 -translate-y-8" />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {isPending === false && assets.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assets Found</h3>
          <p className="text-gray-500">There are currently no public assets available to explore.</p>
        </div>
      )}
    </>
  );
}
