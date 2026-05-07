import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-32 px-6">

      <div className="max-w-4xl mx-auto text-center">

        <div className="bg-[#121826] border border-[#1f2937] rounded-3xl p-12">

          <h2 className="text-5xl font-bold mb-6">
            Join the Latin community in Europe
          </h2>

          <p className="text-gray-400 mb-10">
            Be part of the fastest growing Latin platform abroad.
            Discover events, promote your business, and connect with your people.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-[#FF7A00] px-8 py-4 rounded-xl font-semibold"
            >
              Join now
            </motion.button>

            <motion.a
              href="https://buymeacoffee.com/tuusuario"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              className="bg-pink-600 px-8 py-4 rounded-xl font-semibold"
            >
              ❤️ Support VECI
            </motion.a>

          </div>
        </div>
      </div>
    </section>
  );
}