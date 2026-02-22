export default function Stage1Input({ image6ft, image1ft, setImage6ft, setImage1ft, file6ft, file1ft }) {
    const bothSelected = image6ft && image1ft;

    return (
        <div className="w-full flex-1 border-8 border-black p-6 bg-white flex flex-col shadow-[24px_24px_0_0_#000] overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 border-b-4 border-black pb-2">INPUT</h2>
            <div className="flex flex-col md:flex-row gap-6 w-full flex-1 min-h-0">
                <div className="flex-1 border-4 border-black p-6 flex flex-col items-center justify-center relative cursor-pointer hover:bg-black hover:text-white transition-none">
                    <h3 className="text-2xl font-black uppercase mb-4 z-10">6ft View</h3>
                    {file6ft && !image6ft && (
                        <div className="absolute inset-0 z-0 opacity-50">
                            <img src={file6ft.file_path} className="w-full h-full object-cover grayscale" />
                        </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => setImage6ft(e.target.files[0])} accept="image/*" />
                    <div className="text-center z-10 relative">
                        <span className="text-6xl font-black">{image6ft ? '✓' : '+'}</span>
                        <p className="mt-2 font-bold text-sm">{image6ft ? image6ft.name : 'UPLOAD IMAGE'}</p>
                    </div>
                </div>

                <div className="flex-1 border-4 border-black p-6 flex flex-col items-center justify-center relative cursor-pointer hover:bg-black hover:text-white transition-none">
                    <h3 className="text-2xl font-black uppercase mb-4 z-10">1ft View</h3>
                    {file1ft && !image1ft && (
                        <div className="absolute inset-0 z-0 opacity-50">
                            <img src={file1ft.file_path} className="w-full h-full object-cover grayscale" />
                        </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => setImage1ft(e.target.files[0])} accept="image/*" />
                    <div className="text-center z-10 relative">
                        <span className="text-6xl font-black">{image1ft ? '✓' : '+'}</span>
                        <p className="mt-2 font-bold text-sm">{image1ft ? image1ft.name : 'UPLOAD IMAGE'}</p>
                    </div>
                </div>
            </div>

            {bothSelected && (
                <p className="mt-3 text-center text-sm font-bold uppercase opacity-50 tracking-widest">
                    Click → to process
                </p>
            )}
        </div>
    );
}
