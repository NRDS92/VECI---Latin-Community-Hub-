type Props = {
  src: string;
};

export default function PhoneMockup({ src }: Props) {
    return (
        <div className="relative w-[260px] h-[540px]">

        {/* 🔥 SHADOW GLOW */}
        <div className="absolute inset-0 rounded-[42px] bg-black blur-2xl opacity-50 scale-105" />

        {/* 🔥 PHONE FRAME */}
        <div className="relative w-full h-full rounded-[42px] bg-[#0a0a0a] border border-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

            {/* 🔥 INNER */}
            <div className="absolute inset-[3px] rounded-[38px] overflow-hidden bg-black">

            {/* 🔥 NOTCH */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

            {/* 🔥 SCREEN */}
            <img
                src={src}
                alt="app screenshot"
                className="w-full h-full object-cover"
            />
            </div>
        </div>
        </div>
    );
}