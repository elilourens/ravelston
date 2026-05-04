import Masthead from "@/components/Masthead";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Register from "@/components/Register";
import Targeting from "@/components/Targeting";
import Pricing from "@/components/Pricing";
import Summons from "@/components/Summons";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="paper" style={{
      maxWidth: 1440,
      margin: "0 auto",
      borderLeft: "1px solid var(--forest)",
      borderRight: "1px solid var(--forest)",
      minHeight: "100vh",
    }}>
      <Masthead />
      <Summons />
      <Hero />
      <HowItWorks />
      <Register />
      <Targeting />
      <Pricing />
      <Footer />
    </div>
  );
}
