"use client";

import { AnimatedSection, StaggeredContainer, StaggeredItem } from '@/components/shared/AnimatedSection';
import {
  Shield,
  Users,
  BarChart3,
  Bell,
  Smartphone,
  Lock,
  Fingerprint,
  FileText
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Digital Access Tokens',
    description: 'Generate unique 4-digit visitor codes and 9-character resident tokens with real-time validation.',
  },
  {
    icon: Users,
    title: 'Resident Directory',
    description: 'Complete database of landlords, tenants, and occupants with hierarchical management.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track entry/exit patterns, peak traffic hours, and security incidents in one dashboard.',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Push alerts for visitor arrivals, security events, and billing reminders.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Security officers can verify access on any device—no special hardware needed.',
  },
  {
    icon: Lock,
    title: 'Access Revocation',
    description: 'Instantly disable tokens for ex-residents or flagged visitors with one click.',
  },
  {
    icon: Fingerprint,
    title: 'IoT Integration',
    description: 'Connect with smart gates, QR scanners, and biometric devices via our API.',
  },
  {
    icon: FileText,
    title: 'Automated Billing',
    description: 'Generate invoices, track payments, and send reminders automatically.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Everything you need to secure your estate
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for property managers, security teams, and residents.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <StaggeredItem key={feature.title}>
              <div className="group stat-card h-full cursor-default">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggeredItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}
