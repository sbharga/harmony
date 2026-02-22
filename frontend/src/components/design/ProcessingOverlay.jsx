export default function ProcessingOverlay() {
    return (
        <div className="w-full flex-1 border border-moss-pale rounded-2xl bg-milk flex flex-col items-center justify-center shadow-xl relative overflow-hidden backdrop-blur-sm">
            {/* Subtle glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-moss/20 rounded-full blur-[100px] animate-pulse"></div>

            <div className="flex flex-col items-center z-10 space-y-8">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-moss-pale border-t-moss rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-moss/20 rounded-full blur-sm animate-pulse"></div>
                </div>

                <h2 className="text-xl font-medium tracking-widest text-forest-dark animate-pulse">PROCESSING</h2>
            </div>
        </div>
    );
}
