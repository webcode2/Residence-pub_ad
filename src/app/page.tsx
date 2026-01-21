"use client";

import { Hero } from '@/components/landing/Hero';
import { Journey } from '@/components/landing/Journey';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { TrustTicker } from '@/components/landing/TrustTicker';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
    return (
        <main className="overflow-x-hidden">
            <Hero />
            <Journey />
            <Features />
            <TrustTicker />
            <Pricing />
            <FAQ />
            <Footer />
        </main>
    );
}
