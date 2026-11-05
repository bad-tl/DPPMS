import { PublicHeader } from "@/components/public/public-header";
import { HeroSection } from "@/components/public/hero-section";
import AboutSection from "@/components/public/about-section";
import PublicEducation from "@/components/public/public-education";
import PublicSkills from "@/components/public/public-skills";
import PublicExperience from "@/components/public/public-experience";
import PublicProjects from "@/components/public/public-projects";
import PublicCertificates from "@/components/public/public-certificates";
import PublicContact from "@/components/public/public-contact";
import PublicFooter from "@/components/public/public-footer";
export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <PublicEducation />
         <PublicSkills />
        <PublicExperience />
        <PublicProjects />
        <PublicCertificates />
        <PublicContact />
        <PublicFooter />
      </main>
    </>
  );
}