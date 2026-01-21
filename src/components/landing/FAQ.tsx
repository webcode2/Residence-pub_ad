"use client";

import { AnimatedSection } from '@/components/shared/AnimatedSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How secure is the ResidentPass system?",
    answer: "ResidentPass uses bank-grade encryption for all data transmission and storage. Our tokens are cryptographically secure with automatic expiration. We're SOC 2 compliant and conduct regular security audits. Your residents' data never leaves our secure Nigerian data centers."
  },
  {
    question: "Can ResidentPass integrate with our existing gate hardware?",
    answer: "Yes! We support integration with most modern gate systems, QR scanners, and biometric devices through our API. Our team can assist with custom integrations for legacy systems. Popular integrations include HID, ZKTeco, and Suprema devices."
  },
  {
    question: "How do visitors get their access tokens?",
    answer: "Residents can generate 4-digit visitor tokens through the mobile app or web portal. Visitors receive tokens via SMS or WhatsApp. Security officers verify tokens in real-time at the gate—no internet required for offline validation."
  },
  {
    question: "What happens if the internet goes down?",
    answer: "ResidentPass has robust offline capabilities. The system caches all active tokens locally, allowing security officers to verify access without internet. Once connectivity is restored, all logs sync automatically."
  },
  {
    question: "How do you handle resident data privacy?",
    answer: "We're NDPR compliant and take data privacy seriously. Residents control their own data and can request deletion at any time. We never sell or share personal data with third parties. Only authorized estate personnel can access resident information."
  },
  {
    question: "Can we manage multiple estates from one account?",
    answer: "Absolutely! Our Enterprise plan supports multi-estate management with consolidated billing, centralized reporting, and role-based access control. Perfect for property management companies overseeing multiple locations."
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. If you don't find what you're looking for, reach out to our team.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </AnimatedSection>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
