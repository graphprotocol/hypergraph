import { GraphImage } from '@/components/graph-image';
import { Dapp } from '@/schema';
import { useQuery } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge/dapps')({
  component: Dapps,
});

function Dapps() {
  const { data: dapps, isPending } = useQuery(Dapp, {
    mode: 'public',
    space: 'b2565802-3118-47be-91f2-e59170735bac',
    first: 100,
    include: { avatar: {} },
  });

  return (
    <>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dapps
        </h2>
      </div>

      {isPending && <div className="text-center py-16">Loading…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dapps.map((dapp) => (
          <div
            key={dapp.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 z-10"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative p-6">
              {/* Dapp icon/avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {dapp.avatar?.[0]?.url ? (
                  <GraphImage
                    src={dapp.avatar[0].url}
                    alt={`${dapp.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">{dapp.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Asset name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {dapp.name}
              </h3>

              {/* Asset ID */}
              <p className="text-[10px] text-gray-500 mb-2 font-mono">{dapp.id}</p>

              {/* Dapp description */}
              {dapp.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dapp.description}</p>}

              {/* Dapp x */}
              {dapp.x && (
                <a
                  href={dapp.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  View on X
                </a>
              )}

              {/* Dapp github */}
              {dapp.github && (
                <a
                  href={dapp.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 22h20L12 2z" />
                  </svg>
                  View on Github
                </a>
              )}
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-8 -translate-y-8" />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {isPending === false && dapps.length === 0 && (
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dapps Found</h3>
          <p className="text-gray-500">There are currently no public dapps available to explore.</p>
        </div>
      )}
    </>
  );
}
