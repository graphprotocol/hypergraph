import { createFileRoute } from '@tanstack/react-router';

function InvestmentRounts() {
  return (
    <div className="container mx-auto px-0 py-0">
      <h1 className="text-3xl font-bold mb-2">Investment Rounts</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}

export const Route = createFileRoute('/explore-public-knowledge/investment-rounts')({
  component: InvestmentRounts,
});
