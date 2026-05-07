import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">

      {/* 🔥 GLOW */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#FF7A00]/10 blur-[140px] rounded-full" />

      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6">
          <span className="block">Find your Latin</span>
          <span className="text-[#FF7A00]">community in Europe</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Discover Latin events, restaurants, and businesses near you.
          Connect with your culture wherever you are.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">

          <button className="bg-[#FF7A00] px-8 py-4 rounded-xl font-semibold text-lg shadow-[0_0_40px_rgba(255,122,0,0.5)]">
            Explore events
          </button>

          <button className="border border-[#1f2937] px-8 py-4 rounded-xl text-gray-300 hover:border-[#FF7A00]/40">
            For organizers
          </button>

        </div>
      </div>
    </section>
  );
}