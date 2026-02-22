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

const FACTORS = [
    { key: "open_space",      label: "Open Space",     weight: "20%" },
    { key: "clearance",       label: "Clearance",      weight: "15%" },
    { key: "traversability",  label: "Traversability", weight: "15%" },
    { key: "wall_placement",  label: "Wall Placement", weight: "20%" },
    { key: "orientation",     label: "Orientation",    weight: "15%" },
    { key: "zone_coherence",  label: "Zone Coherence", weight: "15%" },
];

function ScoreBadge({ scoreData }) {
    if (!scoreData) return null;
    return (
        <div className="relative group">
            <div className="flex items-center gap-1.5 bg-moss/10 border border-moss/20 text-moss px-3 py-1 rounded-full cursor-help text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M12 6v6l4 2" />
                </svg>
                {scoreData.score}
            </div>
            <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:block w-56 bg-cream border border-moss-pale rounded-xl shadow-xl p-3">
                <p className="text-xs font-semibold text-forest-dark mb-2">Score Breakdown</p>
                {FACTORS.map(f => (
                    <div key={f.key} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-forest-dark/60 w-28 shrink-0">{f.label} <span className="text-forest-dark/40">({f.weight})</span></span>
                        <div className="flex-1 bg-moss-pale/30 rounded-full h-1.5">
                            <div className="bg-moss h-1.5 rounded-full" style={{ width: `${scoreData.breakdown[f.key]}%` }} />
                        </div>
                        <span className="text-xs text-forest-dark/80 w-8 text-right">{scoreData.breakdown[f.key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Stage3Map({ htmlFile, scoreData }) {
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
                <div className="flex items-center gap-3">
                    <ScoreBadge scoreData={scoreData} />
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
                </div>
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
