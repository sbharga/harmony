export default function ProcessingOverlay() {
    return (
        <div className="w-full flex-1 border-8 border-black p-12 bg-white flex flex-col items-center justify-center shadow-[24px_24px_0_0_#000] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%),linear-gradient(45deg,#000_25%,white_25%,white_75%,#000_75%,#000_100%)] bg-[size:20px_20px] opacity-10 animate-[pulse_2s_ease-in-out_infinite]"></div>
            <h2 className="text-6xl font-black uppercase tracking-tighter mix-blend-difference text-white z-10 animate-bounce">PROCESSING</h2>
            <div className="w-32 h-32 border-8 border-black border-t-white animate-spin mt-10 mix-blend-difference z-10"></div>
        </div>
    );
}
