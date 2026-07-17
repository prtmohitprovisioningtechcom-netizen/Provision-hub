'use client';

import { Check } from 'lucide-react';
import { PRICING_PLANS } from '@/constants';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user } = useCompany();
  const currentPlan =
    typeof user?.companyId === 'object' && user.companyId && 'subscription' in user.companyId
      ? (user.companyId as { subscription?: string }).subscription
      : 'free';

  const handleUpgrade = (planName: string) => {
    toast.success(`Upgrade to ${planName} — payment integration coming soon`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Choose the plan that fits your business"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.id === 'professional';

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                isPopular && 'border-indigo-500 shadow-lg',
                isCurrent && 'ring-2 ring-indigo-500',
              )}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs text-white">
                  Popular
                </span>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? 'secondary' : isPopular ? 'gradient' : 'outline'}
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
