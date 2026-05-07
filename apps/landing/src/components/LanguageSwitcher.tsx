import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="absolute top-6 right-6 flex gap-2 z-50">
        <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded ${
            language === "en" ? "bg-white text-black" : "text-white"
            }`}
        >
            EN
        </button>

        <button
            onClick={() => setLanguage("es")}
            className={`px-3 py-1 rounded ${
            language === "es" ? "bg-white text-black" : "text-white"
            }`}
        >
            ES
        </button>
        </div>
    );
}