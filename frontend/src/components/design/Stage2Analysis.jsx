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

export default function Stage2Analysis({ jsonContent, hasResults }) {
    const dims = jsonContent?.room_dimensions;
    const objects = jsonContent?.objects;

    return (
        <div className="w-full h-full flex flex-col bg-cream border border-moss-pale rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-semibold text-forest-dark mb-6 border-b border-moss-pale pb-4">
                Analysis Results
            </h2>

            <div className="flex-1 flex flex-col overflow-hidden gap-6">
                {!jsonContent && !hasResults && <Placeholder text="Awaiting analysis..." />}

                {!jsonContent && hasResults && <Placeholder text="Loading results..." />}

                {jsonContent && (
                    <>
                        {dims && (
                            <div className="bg-milk border border-moss-pale rounded-xl p-5 flex-shrink-0">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-dark/80 mb-4">Room Dimensions</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {dims.width !== undefined && (
                                        <div className="bg-cream border border-moss-pale rounded-lg p-4 text-center">
                                            <div className="text-xl font-semibold text-forest-dark">{dims.width}<span className="text-xs text-forest-dark/50 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-forest-dark/70 mt-1">Width</div>
                                        </div>
                                    )}
                                    {dims.length !== undefined && (
                                        <div className="bg-cream border border-moss-pale rounded-lg p-4 text-center">
                                            <div className="text-xl font-semibold text-forest-dark">{dims.length}<span className="text-xs text-forest-dark/50 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-forest-dark/70 mt-1">Length</div>
                                        </div>
                                    )}
                                    {dims.height !== undefined && (
                                        <div className="bg-cream border border-moss-pale rounded-lg p-4 text-center">
                                            <div className="text-xl font-semibold text-forest-dark">{dims.height}<span className="text-xs text-forest-dark/50 ml-1">m</span></div>
                                            <div className="text-xs font-medium text-forest-dark/70 mt-1">Height</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {objects && objects.length > 0 && (
                            <div className="bg-milk border border-moss-pale rounded-xl flex-1 overflow-hidden flex flex-col shadow-inner">
                                <div className="p-4 border-b border-moss-pale flex justify-between items-center bg-cream">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-dark/80">
                                        Detected Objects
                                    </h3>
                                    <span className="bg-moss-pale text-forest-dark px-2.5 py-1 rounded-md text-xs font-medium">
                                        {objects.length} items
                                    </span>
                                </div>
                                <div className="overflow-auto flex-1 p-2">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-xs text-forest-dark/70 font-medium sticky top-0 bg-milk/90 backdrop-blur-md">
                                            <tr>
                                                <th className="px-4 py-3 font-medium rounded-tl-lg">Object Name</th>
                                                <th className="px-4 py-3 font-medium">Position (x,y,z)</th>
                                                <th className="px-4 py-3 font-medium rounded-tr-lg">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-moss-pale/50">
                                            {objects.map((obj, i) => (
                                                <tr key={i} className="hover:bg-moss-pale/20 transition-colors">
                                                    <td className="px-4 py-3 text-forest-dark capitalize">{obj.name ?? obj.label ?? '—'}</td>
                                                    <td className="px-4 py-3 text-forest-dark/70 font-mono text-xs">
                                                        {obj.position
                                                            ? `${obj.position.x ?? 0}, ${obj.position.y ?? 0}, ${obj.position.z ?? 0}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cream border border-moss-pale text-forest-dark/80">
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
                            <div className="bg-milk border border-moss-pale rounded-xl p-5 flex-1 overflow-auto">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-dark/80 mb-4">Raw Data</h3>
                                <ul className="space-y-2">
                                    {Object.entries(jsonContent).map(([key, val]) => (
                                        <li key={key} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 rounded-lg bg-cream border border-moss-pale">
                                            <span className="font-medium text-forest-dark/70 text-xs w-32 shrink-0">{key}</span>
                                            <span className="font-mono text-xs text-forest-dark break-all">{JSON.stringify(val)}</span>
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
