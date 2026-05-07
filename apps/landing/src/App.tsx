import Hero from "./sections/Hero";
import Features from "./sections/Features";
import ProblemSolution from "./sections/ProblemSolution";
import Screenshots from "./sections/Screenshots";
import CTA from "./sections/CTA";
import LiveEvents from "./sections/LiveEvents";
import SEO from "./sections/SEO";

function App() {
  return (
    <div className="bg-[#0B0F1A] text-white relative font-[Inter]">

      <SEO />

      {/* 🔥 DONATE FLOATING */}
      <a
        href="https://buymeacoffee.com/tuusuario"
        target="_blank"
        className="fixed bottom-6 right-6 bg-[#FF7A00] px-5 py-3 rounded-full shadow-lg z-50"
      >
        ❤️ Donate
      </a>

      <Hero />
      <LiveEvents />
      <Features />
      <ProblemSolution />
      <Screenshots />
      <CTA />

    </div>
  );
}

export default App;