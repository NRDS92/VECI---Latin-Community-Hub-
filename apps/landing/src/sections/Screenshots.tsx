import { motion } from "framer-motion";
import PhoneMockup from "../components/PhoneMockup";
import { useLanguage } from "../context/LanguageContext";

export default function Screenshots() {
    const { t } = useLanguage();

    const steps = [
        {
        title: t.screens.discoverTitle,
        text: t.screens.discoverText,
        image: "/assets/discover.png",
        },
        {
        title: t.screens.eventTitle,
        text: t.screens.eventText,
        image: "/assets/CreateEvent.png",
        },
        {
        title: t.screens.profileTitle,
        text: t.screens.profileText,
        image: "/assets/profile.png",
        },
    ];

    return (
        <section className="py-32 px-6 space-y-32">
        {steps.map((step, i) => (
            <div
            key={i}
            className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 ${
                i % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
            >
            {/* 📱 IMAGE */}
            <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="flex justify-center"
            >
                <PhoneMockup src={step.image} />
            </motion.div>

            {/* 🧠 TEXT */}
            <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 80 : -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-md text-center md:text-left"
            >
                <h3 className="text-3xl font-bold mb-4">
                {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                {step.text}
                </p>
            </motion.div>
            </div>
        ))}
        </section>
    );
}