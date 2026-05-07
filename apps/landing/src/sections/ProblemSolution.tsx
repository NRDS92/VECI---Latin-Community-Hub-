import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

export default function ProblemSolution() {
    const { t } = useLanguage();

    return (
        <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto space-y-24">

            {/* ❌ PROBLEM */}
            <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
            >
            <h2 className="text-4xl font-bold mb-6">
                {t.problem.title}
            </h2>

            <p className="text-gray-400 leading-relaxed">
                {t.problem.description}
            </p>
            </motion.div>

            {/* 🔥 SOLUTION */}
            <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-[#121826] border border-[#1f2937] rounded-3xl p-10 md:p-16 text-center"
            >
            <h3 className="text-3xl font-semibold mb-6">
                {t.solution.title}
            </h3>

            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
                {t.solution.description}
            </p>

            {/* 🔥 CTA */}
            <button className="bg-[#FF7A00] px-6 py-3 rounded-xl font-semibold shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:scale-105 transition">
                {t.solution.cta}
            </button>
            </motion.div>

        </div>
        </section>
    );
}