import { useRef } from 'react';

function Placeholder({ text }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-moss-pale/50 rounded-xl bg-milk/50">
            <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-moss animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-moss animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-moss animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="font-medium text-xs text-forest-dark/70 tracking-wide">{text}</p>
        </div>
    );
}

export default function Stage3Map({ htmlFile }) {
    const containerRef = useRef(null);

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            } else if (containerRef.current.msRequestFullscreen) {
                containerRef.current.msRequestFullscreen();
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-cream border border-moss-pale rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 relative">
            <h2 className="text-xl font-semibold text-forest-dark mb-6 border-b border-moss-pale pb-4 flex justify-between items-center">
                3D Map Generation
                {htmlFile && (
                    <button
                        onClick={handleFullscreen}
                        className="bg-cream hover:bg-moss transition-all text-forest-dark text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-2 border border-moss-pale hover:border-moss"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                        Full Screen
                    </button>
                )}
            </h2>

            {htmlFile ? (
                <div ref={containerRef} className="flex-1 bg-milk border border-moss-pale rounded-xl relative overflow-hidden shadow-inner bg-black">
                    <iframe src={htmlFile.file_path} className="absolute inset-0 w-full h-full border-none bg-black" title="3D Render" />
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <Placeholder text="Awaiting 3D render generation..." />
                </div>
            )}
        </div>
    );
}
