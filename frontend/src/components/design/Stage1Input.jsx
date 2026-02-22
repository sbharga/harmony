export default function Stage1Input({ image6ft, image1ft, setImage6ft, setImage1ft, file6ft, file1ft }) {
    const bothSelected = image6ft && image1ft;

    return (
        <div className="w-full h-full flex flex-col bg-cream border border-moss-pale rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-semibold text-forest-dark mb-6 border-b border-moss-pale pb-4">
                Input Views
            </h2>
            <div className="flex flex-col md:flex-row gap-6 w-full flex-1 min-h-0">
                <div className="flex-1 border-2 border-dashed border-moss-pale rounded-xl bg-milk flex flex-col items-center justify-center relative cursor-pointer hover:bg-milk/80 hover:border-moss transition-all overflow-hidden group">
                    <h3 className="text-base font-medium text-forest-dark mb-4 z-10 opacity-80 group-hover:opacity-100 transition-opacity">6ft View</h3>
                    {file6ft && !image6ft && (
                        <div className="absolute inset-0 z-0">
                            <img src={file6ft.file_path} className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay" />
                        </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => setImage6ft(e.target.files[0])} accept="image/*" />
                    <div className="text-center z-10 relative mt-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${image6ft ? 'bg-moss text-forest-dark' : 'bg-cream text-forest-dark/50 group-hover:bg-moss-pale group-hover:text-forest-dark'}`}>
                            <span className="text-xl font-semibold leading-none">{image6ft ? '✓' : '+'}</span>
                        </div>
                        <p className="font-medium text-xs text-forest-dark/70 group-hover:text-forest-dark transition-colors">
                            {image6ft ? image6ft.name : 'Click to Upload'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 border-2 border-dashed border-moss-pale rounded-xl bg-milk flex flex-col items-center justify-center relative cursor-pointer hover:bg-milk/80 hover:border-moss transition-all overflow-hidden group">
                    <h3 className="text-base font-medium text-forest-dark mb-4 z-10 opacity-80 group-hover:opacity-100 transition-opacity">1ft View</h3>
                    {file1ft && !image1ft && (
                        <div className="absolute inset-0 z-0">
                            <img src={file1ft.file_path} className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay" />
                        </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => setImage1ft(e.target.files[0])} accept="image/*" />
                    <div className="text-center z-10 relative mt-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${image1ft ? 'bg-moss text-forest-dark' : 'bg-cream text-forest-dark/50 group-hover:bg-moss-pale group-hover:text-forest-dark'}`}>
                            <span className="text-xl font-semibold leading-none">{image1ft ? '✓' : '+'}</span>
                        </div>
                        <p className="font-medium text-xs text-forest-dark/70 group-hover:text-forest-dark transition-colors">
                            {image1ft ? image1ft.name : 'Click to Upload'}
                        </p>
                    </div>
                </div>
            </div>

            {bothSelected && (
                <p className="mt-6 text-center text-xs font-medium text-forest-dark/50 tracking-wide animate-pulse">
                    Use arrows to proceed
                </p>
            )}
        </div>
    );
}
