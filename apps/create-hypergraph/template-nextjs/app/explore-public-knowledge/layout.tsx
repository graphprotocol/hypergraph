import { ExploreTabs } from '../../Components/explore-tabs';

export default function ExplorePublicKnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Explore Public Knowledge
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          This page demonstrates how to query public data from a space. No authentication is required.
        </p>
      </div>

      <ExploreTabs />

      <div className="mt-12">{children}</div>
    </div>
  );
}


