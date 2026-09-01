import type { Metadata } from "next";
import { PublicNavbar } from "@/features/public-brand/components/public-navbar";
import { HeroSection } from "@/features/public-brand/components/hero-section";
import { WhyIndividualSection } from "@/features/public-brand/components/why-individual-section";
import { CoachingProcessSection } from "@/features/public-brand/components/coaching-process-section";
import { ProgramPathwaysSection } from "@/features/public-brand/components/program-pathways-section";
import { CoachProfileSection } from "@/features/public-brand/components/coach-profile-section";
import { DevelopmentAreasSection } from "@/features/public-brand/components/development-areas-section";
import { ClientPortalShowcaseSection } from "@/features/public-brand/components/client-portal-showcase-section";
import { PricingSection } from "@/features/public-brand/components/pricing-section";
import { WhoItsForSection } from "@/features/public-brand/components/who-its-for-section";
import { FinalCtaSection } from "@/features/public-brand/components/final-cta-section";
import { PublicFooter } from "@/features/public-brand/components/public-footer";

export const metadata: Metadata = {
  title: "Coach Zulfi | Strength & Conditioning & Youth Athletic Development",
  description:
    "BUILD THE ATHLETE BEFORE CHASING PERFORMANCE. Program pengembangan kemampuan fisik untuk anak dan atlet muda yang disusun berdasarkan kebutuhan individu, kualitas gerak, tahap perkembangan, dan tujuan jangka panjang bersama Coach Zulfi.",
  openGraph: {
    title: "Coach Zulfi | Youth Athletic Development & Strength & Conditioning",
    description:
      "Every Athlete Has Different Needs. Every Development Has Its Own Process. Pembinaan fisik terstruktur anak dan atlet muda bersama Coach Zulfi.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-foreground font-sans">
      {/* 01. Navigation */}
      <PublicNavbar />

      {/* 02. Hero Section */}
      <HeroSection />

      {/* 03. Why This Approach? (Philosophy & 6 Pillars) */}
      <WhyIndividualSection />

      {/* 04. 6-Step Coaching Process: FROM ASSESSMENT TO DEVELOPMENT */}
      <CoachingProcessSection />

      {/* 05. WHO WE HELP: Dual Program Pathways (Youth Performance vs Multilateral) */}
      <ProgramPathwaysSection />

      {/* 06. Coach Zulfi Profile & Official Certifications */}
      <CoachProfileSection />

      {/* 07. WHAT WE ASSESS & Movement Capacity */}
      <DevelopmentAreasSection />

      {/* 08. PROGRESS YOU CAN UNDERSTAND (Transparent Development Monitoring) */}
      <ClientPortalShowcaseSection />

      {/* 09. Contextual & Transparent Pricing */}
      <PricingSection />

      {/* 10. Self-Identification Decision Aid (Mana Jalur yang Tepat?) */}
      <WhoItsForSection />

      {/* 11. Final CTA: START WITH UNDERSTANDING THE ATHLETE */}
      <FinalCtaSection />

      {/* 12. Footer */}
      <PublicFooter />
    </div>
  );
}
