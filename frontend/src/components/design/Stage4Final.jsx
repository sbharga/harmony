import { useRef } from 'react';

function Placeholder({ text }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-neutral-700/50 rounded-xl bg-neutral-900/30">
            <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="font-medium text-sm text-neutral-500 tracking-wide">{text}</p>
        </div>
    );
}

export default function Stage4Final({ reorgFile }) {
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
        <div className="w-full h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 relative">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-neutral-800 pb-4 flex justify-between items-center">
                Final Design
                {reorgFile && (
                    <button
                        onClick={handleFullscreen}
                        className="bg-neutral-800 hover:bg-purple-600 transition-all text-white text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-2 border border-neutral-700 hover:border-purple-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                        Full Screen
                    </button>
                )}
            </h2>

            {reorgFile ? (
                <div ref={containerRef} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl relative overflow-hidden shadow-inner bg-black flex flex-col items-center justify-center">
                    <iframe src={reorgFile.file_path} className="absolute inset-0 w-full h-full border-none bg-black" title="Reorganized Render" />
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <Placeholder text="Awaiting final design generation..." />
                </div>
            )}
        </div>
    );
}
