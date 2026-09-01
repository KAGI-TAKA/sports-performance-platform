import type { Metadata } from "next";
import { PublicNavbar } from "@/features/public-brand/components/public-navbar";
import { HeroSection } from "@/features/public-brand/components/hero-section";
import { WhyIndividualSection } from "@/features/public-brand/components/why-individual-section";
import { CoachingProcessSection } from "@/features/public-brand/components/coaching-process-section";
import { ProgramPathwaysSection } from "@/features/public-brand/components/program-pathways-section";
import { CoachProfileSection } from "@/features/public-brand/components/coach-profile-section";
import { DevelopmentAreasSection } from "@/features/public-brand/components/development-areas-section";
import { PricingSection } from "@/features/public-brand/components/pricing-section";
import { WhoItsForSection } from "@/features/public-brand/components/who-its-for-section";
import { FinalCtaSection } from "@/features/public-brand/components/final-cta-section";
import { PublicFooter } from "@/features/public-brand/components/public-footer";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Coach Zulfi | Strength & Conditioning & Youth Athletic Development",
  description:
    "Pelatihan fisik terstruktur atlet muda bersama Coach Zulfi. Setiap atlet memiliki kebutuhan berbeda: program Youth Athlete Performance & Multilateral Athletic Development berbasis sport science.",
  openGraph: {
    title: "Coach Zulfi | Athletic Performance & Physical Conditioning",
    description:
      "Every Athlete Has Different Needs. Every Development Has Its Own Process. Pembinaan fisik atletik usia muda terukur bersama Coach Zulfi.",
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

      {/* 03. Why Development is Individual */}
      <WhyIndividualSection />

      {/* 04. 6-Step Coaching Process (Assess -> Reassess) */}
      <CoachingProcessSection />

      {/* 05. Dual Program Pathways (Youth Performance vs Multilateral) */}
      <ProgramPathwaysSection />

      {/* 06. Coach Zulfi Profile & Verified Certifications */}
      <CoachProfileSection />

      {/* 07. Physical Development Map */}
      <DevelopmentAreasSection />

      {/* 08. Contextual & Transparent Pricing */}
      <PricingSection />

      {/* 09. Self-Identification Decision Aid (Who is this for?) */}
      <WhoItsForSection />

      {/* 10. Final CTA */}
      <FinalCtaSection />

      {/* 11. Footer */}
      <PublicFooter />
    </div>
  );
}
