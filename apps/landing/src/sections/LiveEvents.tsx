import { motion } from "framer-motion";

const events = [
    {
        title: "Reggaeton Party",
        city: "Cologne",
        img: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    },
    {
        title: "Latin Food Festival",
        city: "Berlin",
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    },
    {
        title: "Salsa Night",
        city: "Madrid",
        img: "https://images.unsplash.com/photo-1515169067865-5387ec356754",
    },
    ];

    export default function LiveEvents() {
    return (
        <section className="py-28 px-6">

        <div className="max-w-6xl mx-auto">

            <h2 className="text-5xl font-bold text-center mb-16">
            Latin events happening now
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

            {events.map((e, i) => (
                <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-[#121826] rounded-2xl overflow-hidden border border-[#1f2937]"
                >
                <img src={e.img} className="h-56 w-full object-cover" />

                <div className="p-6">
                    <h3 className="text-xl font-semibold">{e.title}</h3>
                    <p className="text-gray-400">{e.city}</p>
                </div>
                </motion.div>
            ))}

            </div>
        </div>
        </section>
    );
}