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

export default function Stage2Analysis({ jsonContent, hasResults }) {
    const dims = jsonContent?.room_dimensions;
    const objects = jsonContent?.objects;

    return (
        <div className="w-full h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-neutral-800 pb-4">
                Analysis Results
            </h2>

            <div className="flex-1 flex flex-col overflow-hidden gap-6">
                {!jsonContent && !hasResults && <Placeholder text="Awaiting analysis..." />}

                {!jsonContent && hasResults && <Placeholder text="Loading results..." />}

                {jsonContent && (
                    <>
                        {dims && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-5 flex-shrink-0">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Room Dimensions</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {dims.width !== undefined && (
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-semibold text-white">{dims.width}<span className="text-sm text-neutral-500 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-neutral-500 mt-1">Width</div>
                                        </div>
                                    )}
                                    {dims.length !== undefined && (
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-semibold text-white">{dims.length}<span className="text-sm text-neutral-500 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-neutral-500 mt-1">Length</div>
                                        </div>
                                    )}
                                    {dims.height !== undefined && (
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-semibold text-white">{dims.height}<span className="text-sm text-neutral-500 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-neutral-500 mt-1">Height</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {objects && objects.length > 0 && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl flex-1 overflow-hidden flex flex-col shadow-inner">
                                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                        Detected Objects
                                    </h3>
                                    <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-xs font-medium">
                                        {objects.length} items
                                    </span>
                                </div>
                                <div className="overflow-auto flex-1 p-2">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-neutral-500 font-medium sticky top-0 bg-neutral-950/90 backdrop-blur-md">
                                            <tr>
                                                <th className="px-4 py-3 font-medium rounded-tl-lg">Object Name</th>
                                                <th className="px-4 py-3 font-medium">Position (x,y,z)</th>
                                                <th className="px-4 py-3 font-medium rounded-tr-lg">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-800/50">
                                            {objects.map((obj, i) => (
                                                <tr key={i} className="hover:bg-neutral-800/30 transition-colors">
                                                    <td className="px-4 py-3 text-neutral-200 capitalize">{obj.name ?? obj.label ?? '—'}</td>
                                                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                                                        {obj.position
                                                            ? `${obj.position.x ?? 0}, ${obj.position.y ?? 0}, ${obj.position.z ?? 0}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300">
                                                            {obj.confidence !== undefined ? `${Math.round(obj.confidence * 100)}%` : '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {!dims && !objects && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-5 flex-1 overflow-auto">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Raw Data</h3>
                                <ul className="space-y-2">
                                    {Object.entries(jsonContent).map(([key, val]) => (
                                        <li key={key} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                                            <span className="font-medium text-neutral-400 text-sm w-32 shrink-0">{key}</span>
                                            <span className="font-mono text-xs text-neutral-300 break-all">{JSON.stringify(val)}</span>
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
