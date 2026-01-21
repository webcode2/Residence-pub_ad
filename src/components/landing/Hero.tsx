"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/components/shared/Brand';

export function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-primary/50 border-b border-white/10"
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Brand variant="light" size="sm" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm">Pricing</a>
              <a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="heroOutline" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button variant="hero" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto text-center mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/90 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Trusted by 200+ premium Gate'
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.95] mb-6"
          >
            Security without
            <br />
            <span className="text-gradient">the bottleneck</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Transform your Gate's access control with digital tokens, real-time logs,
            and seamless resident management. No more paper logs. No more gatehouse delays.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl" className="group">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-12 border-t border-white/10"
          >
            {[
              { value: '50K+', label: 'Active Residents' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '2sec', label: 'Avg. Check-in' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      Bottom Wave
      {/* <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="hsl(210, 20%, 98%)"
          />
        </svg>
      </div> */}
    </section>
  );
}
