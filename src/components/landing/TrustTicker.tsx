"use client";

import { motion } from 'framer-motion';
import { AnimatedSection } from '@/components/shared/AnimatedSection';

const estates = [
  'Lekki Gardens',
  'Banana Island',
  'VGC Estate',
  'Ikoyi Towers',
  'Victoria Garden City',
  'Oniru Estate',
  'Parkview Estate',
  'Atlantic View',
  'Osborne Foreshore',
  'Dolphin Estate',
  'Graceland Estate',
  'Chevron Drive',
];

export function TrustTicker() {
  // Double the array for seamless loop
  const allEstates = [...estates, ...estates];

  return (
    <section className="py-16 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Trusted by 200+ premium estates across Nigeria
          </p>
        </AnimatedSection>
      </div>

      <div className="relative">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-secondary/50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-secondary/50 to-transparent z-10" />

        <motion.div
          animate={{ x: [0, -50 * estates.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex gap-12 whitespace-nowrap"
        >
          {allEstates.map((estate, index) => (
            <div
              key={`${estate}-${index}`}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">
                  {estate.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="font-medium text-foreground">{estate}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
