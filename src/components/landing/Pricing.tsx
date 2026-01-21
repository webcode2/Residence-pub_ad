"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggeredContainer, StaggeredItem } from '@/components/shared/AnimatedSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Community',
    description: 'For small estates getting started',
    price: { monthly: 25000, annually: 250000 },
    features: [
      'Up to 50 units',
      'Basic access logs',
      'Email notifications',
      'Standard support',
      'Mobile web access',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing estates that need more',
    price: { monthly: 75000, annually: 750000 },
    features: [
      'Up to 500 units',
      'Advanced analytics',
      'SMS & Push notifications',
      'Priority support',
      'IoT integrations',
      'Custom branding',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large estates and management companies',
    price: { monthly: 'Custom', annually: 'Custom' },
    features: [
      'Unlimited units',
      'White-label solution',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment',
      'Custom integrations',
      'Training & onboarding',
      'Multi-estate management',
    ],
    popular: false,
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <AnimatedSection className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your estate. All plans include a 14-day free trial.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-secondary">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <StaggeredItem key={plan.name}>
              <div
                className={cn(
                  "relative h-full rounded-2xl border-2 p-8 transition-all duration-300",
                  plan.popular
                    ? "border-accent bg-card shadow-xl scale-105"
                    : "border-border bg-card hover:border-accent/50 hover:shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-display font-bold text-foreground">
                        {formatPrice(isAnnual ? plan.price.annually : plan.price.monthly)}
                      </span>
                      {typeof plan.price.monthly === 'number' && (
                        <span className="text-muted-foreground ml-2">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === 'Enterprise' ? 'mailto:sales@residentpass.com' : '/register'} className="w-full">
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </Link>
              </div>
            </StaggeredItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}
