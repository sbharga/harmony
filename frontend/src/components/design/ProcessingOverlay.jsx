export default function ProcessingOverlay() {
    return (
        <div className="w-full flex-1 border border-neutral-800 rounded-2xl bg-neutral-900 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Subtle glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[100px] animate-pulse"></div>

            <div className="flex flex-col items-center z-10 space-y-8">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-white/10 rounded-full blur-sm animate-pulse"></div>
                </div>

                <h2 className="text-xl font-medium tracking-widest text-white/90 animate-pulse">PROCESSING</h2>
            </div>
        </div>
    );
}
