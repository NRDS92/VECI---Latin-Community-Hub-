import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { Calendar, Heart, PlusCircle } from "lucide-react";

export default function Features() {
    const { t } = useLanguage();

    const features = [
        {
        icon: <Calendar size={28} />,
        text: t.features.discover,
        },
        {
        icon: <Heart size={28} />,
        text: t.features.save,
        },
        {
        icon: <PlusCircle size={28} />,
        text: t.features.create,
        },
    ];

    return (
        <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">

            {/* 🧠 TITLE */}
            <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-center mb-16"
            >
            {t.features.title}
            </motion.h2>

            {/* 🔥 GRID */}
            <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
                <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="group bg-[#121826] p-8 rounded-2xl text-center border border-[#1f2937] hover:border-[#FF7A00]/40 transition"
                >
                {/* 🔥 ICON */}
                <div className="mb-6 flex justify-center text-[#FF7A00] group-hover:scale-110 transition">
                    {f.icon}
                </div>

                {/* 🧾 TEXT */}
                <p className="text-gray-300 leading-relaxed">
                    {f.text}
                </p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>
    );
}