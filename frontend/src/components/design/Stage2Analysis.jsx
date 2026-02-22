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

export default function Stage2Analysis({ jsonContent, hasResults }) {
    const dims = jsonContent?.room_dimensions;
    const objects = jsonContent?.objects;

    return (
        <div className="w-full flex-1 border-8 border-black p-6 bg-white flex flex-col shadow-[24px_24px_0_0_#000] overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 border-b-4 border-black pb-2">ANALYSIS</h2>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0 gap-4">
                {!jsonContent && !hasResults && <Placeholder text="Awaiting analysis" />}

                {!jsonContent && hasResults && <Placeholder text="Loading results..." />}

                {jsonContent && (
                    <>
                        {dims && (
                            <div className="border-4 border-black p-4 flex-shrink-0">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1">Room Dimensions</h3>
                                <div className="flex gap-3">
                                    {dims.width !== undefined && (
                                        <div className="flex-1 border-2 border-black p-3 text-center">
                                            <div className="text-2xl font-black">{dims.width}<span className="text-sm font-bold">m</span></div>
                                            <div className="text-xs uppercase font-bold mt-1 opacity-50">Width</div>
                                        </div>
                                    )}
                                    {dims.length !== undefined && (
                                        <div className="flex-1 border-2 border-black p-3 text-center">
                                            <div className="text-2xl font-black">{dims.length}<span className="text-sm font-bold">m</span></div>
                                            <div className="text-xs uppercase font-bold mt-1 opacity-50">Length</div>
                                        </div>
                                    )}
                                    {dims.height !== undefined && (
                                        <div className="flex-1 border-2 border-black p-3 text-center">
                                            <div className="text-2xl font-black">{dims.height}<span className="text-sm font-bold">m</span></div>
                                            <div className="text-xs uppercase font-bold mt-1 opacity-50">Height</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {objects && objects.length > 0 && (
                            <div className="border-4 border-black p-4 flex-1 overflow-auto min-h-0">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1">
                                    Objects Detected
                                    <span className="ml-2 bg-black text-white px-2 py-0.5 text-xs">{objects.length}</span>
                                </h3>
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-black">
                                            <th className="text-left py-2 pr-4 font-black uppercase text-xs">Name</th>
                                            <th className="text-left py-2 pr-4 font-black uppercase text-xs">Position</th>
                                            <th className="text-left py-2 font-black uppercase text-xs">Conf.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {objects.map((obj, i) => (
                                            <tr key={i} className="border-b border-black last:border-0">
                                                <td className="py-2 pr-4 font-bold uppercase">{obj.name ?? obj.label ?? '—'}</td>
                                                <td className="py-2 pr-4 font-mono text-xs">
                                                    {obj.position
                                                        ? `${obj.position.x ?? 0}, ${obj.position.y ?? 0}, ${obj.position.z ?? 0}`
                                                        : '—'}
                                                </td>
                                                <td className="py-2 font-bold">
                                                    {obj.confidence !== undefined ? `${Math.round(obj.confidence * 100)}%` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Fallback for unrecognized shape */}
                        {!dims && !objects && (
                            <div className="border-4 border-black p-4 flex-1 overflow-auto min-h-0">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1">Analysis Data</h3>
                                <ul className="flex flex-col gap-2">
                                    {Object.entries(jsonContent).map(([key, val]) => (
                                        <li key={key} className="flex gap-3 border-b border-black pb-2 last:border-0">
                                            <span className="font-black uppercase text-xs w-32 flex-shrink-0 opacity-50">{key}</span>
                                            <span className="font-mono text-xs break-all">{JSON.stringify(val)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
