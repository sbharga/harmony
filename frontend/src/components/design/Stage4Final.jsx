function Placeholder({ text }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 border-4 border-black border-dashed">
            <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-black animate-bounce [animation-delay:0ms]" />
                <span className="w-3 h-3 rounded-full bg-black animate-bounce [animation-delay:150ms]" />
                <span className="w-3 h-3 rounded-full bg-black animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="font-black uppercase tracking-widest text-sm opacity-40">{text}</p>
        </div>
    );
}

export default function Stage4Final({ reorgFile }) {
    return (
        <div className="w-full flex-1 border-8 border-black p-6 bg-white flex flex-col shadow-[24px_24px_0_0_#000] overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 border-b-4 border-black pb-2 flex justify-between items-center">
                FINAL DESIGN
                {reorgFile && <span className="bg-black text-white text-sm px-4 py-2 -rotate-2 font-mono">OPTIMIZED VIEW</span>}
            </h2>

            {reorgFile ? (
                <div className="flex-1 border-4 border-black relative min-h-0">
                    <iframe src={reorgFile.file_path} className="absolute inset-0 w-full h-full border-none" title="Reorganized Render" />
                </div>
            ) : (
                <Placeholder text="Awaiting reorganization — use ↻ to generate" />
            )}
        </div>
    );
}
