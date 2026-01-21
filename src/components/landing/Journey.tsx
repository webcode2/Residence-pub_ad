"use client";

import { AnimatedSection, StaggeredContainer, StaggeredItem } from '@/components/shared/AnimatedSection';
import { ClipboardList, AlertTriangle, Clock, ArrowRight, Smartphone, CheckCircle2, Zap } from 'lucide-react';

const beforeItems = [
  { icon: ClipboardList, text: 'Manual paper logbooks', color: 'text-destructive' },
  { icon: AlertTriangle, text: 'Security vulnerabilities', color: 'text-destructive' },
  { icon: Clock, text: 'Long wait times', color: 'text-destructive' },
];

const afterItems = [
  { icon: Smartphone, text: 'Digital token access', color: 'text-accent' },
  { icon: CheckCircle2, text: 'Real-time verification', color: 'text-accent' },
  { icon: Zap, text: 'Instant check-ins', color: 'text-accent' },
];

export function Journey() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            From Chaos to Control
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Residence transforms Gate security management
          </p>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Before */}
          <AnimatedSection direction="left" className="flex-1 max-w-md">
            <div className="relative p-8 rounded-2xl bg-destructive/5 border-2 border-dashed border-destructive/20">
              <div className="absolute -top-4 left-6 px-4 py-1 bg-destructive/10 rounded-full">
                <span className="text-sm font-semibold text-destructive">Before</span>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-6 mt-2">
                Manual Guardroom Frustration
              </h3>
              <StaggeredContainer staggerDelay={0.15}>
                {beforeItems.map((item) => (
                  <StaggeredItem key={item.text}>
                    <div className="flex items-center gap-4 mb-4 last:mb-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </div>
                  </StaggeredItem>
                ))}
              </StaggeredContainer>
            </div>
          </AnimatedSection>

          {/* Arrow */}
          <AnimatedSection delay={0.3} className="hidden lg:block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-destructive/20 to-accent/20 flex items-center justify-center">
              <ArrowRight className="h-10 w-10 text-accent" />
            </div>
          </AnimatedSection>

          {/* After */}
          <AnimatedSection direction="right" className="flex-1 max-w-md">
            <div className="relative p-8 rounded-2xl bg-accent/5 border-2 border-accent/20 shadow-glow">
              <div className="absolute -top-4 left-6 px-4 py-1 bg-accent rounded-full">
                <span className="text-sm font-semibold text-accent-foreground">After</span>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-6 mt-2">
                Digital Peace of Mind
              </h3>
              <StaggeredContainer staggerDelay={0.15}>
                {afterItems.map((item) => (
                  <StaggeredItem key={item.text}>
                    <div className="flex items-center gap-4 mb-4 last:mb-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </div>
                  </StaggeredItem>
                ))}
              </StaggeredContainer>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
