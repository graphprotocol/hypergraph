import { Button } from '@/components/ui/button';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { redirectToConnect } = useHypergraphApp();

  const handleSignIn = () => {
    redirectToConnect({
      storage: localStorage,
      connectUrl: 'https://connect.geobrowser.io/',
      successUrl: `${window.location.origin}/authenticate-success`,
      redirectFn: (url: URL) => {
        window.location.href = url.toString();
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <img src="/hypergraph.svg" alt="Hypergraph Logo" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Hypergraph
        </h1>
        <p className="text-lg text-muted-foreground">Your web3 app template powered by Hypergraph</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Section 1: Explore existing public knowledge */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Explore Public Knowledge</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover and explore the vast network of knowledge already available in the public Knowledge Graph.
            </p>
            <Link to="/explore-public-knowledge/projects">
              <Button variant="outline" className="w-full">
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 2: Sign in with Geo Connect */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Manage Your Data</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sign in with Geo Connect to manage your private data and publish it to the public Knowledge Graph.
            </p>
            <Button onClick={handleSignIn} className="w-full bg-primary hover:bg-primary/90">
              Sign in with Geo Connect
            </Button>
          </div>
        </div>

        {/* Section 3: Explore the docs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Explore the Docs</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Learn how to build with Hypergraph and discover all the features available in our comprehensive
              documentation.
            </p>
            <a
              href="https://docs.hypergraph.thegraph.com/docs/quickstart"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button variant="outline" className="w-full">
                Read Documentation
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
