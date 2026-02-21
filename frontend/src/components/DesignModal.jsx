export default function DesignModal({
    isOpen,
    onClose,
    onSave,
    editingDesign,
    designName,
    setDesignName,
    designDescription,
    setDesignDescription,
    isSaving
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-white/90 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white border-8 border-black w-full max-w-lg p-8 shadow-[16px_16px_0_0_#000]">
                <h3 className="text-4xl font-black uppercase text-black mb-8 tracking-tighter border-b-8 border-black pb-4">
                    {editingDesign ? 'EDIT DESIGN' : 'NEW CREATION'}
                </h3>

                <form onSubmit={onSave} className="space-y-6">
                    <div>
                        <label className="block text-xl font-black uppercase text-black mb-3">
                            DESIGN NAME <span className="text-black">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={designName}
                            onChange={(e) => setDesignName(e.target.value)}
                            className="w-full bg-white border-4 border-black text-black font-bold uppercase px-4 py-4 focus:outline-none focus:ring-0 placeholder-gray-300 text-xl"
                            placeholder="TITLE"
                        />
                    </div>

                    <div>
                        <label className="block text-xl font-black uppercase text-black mb-3">
                            DESCRIPTION
                        </label>
                        <textarea
                            value={designDescription}
                            onChange={(e) => setDesignDescription(e.target.value)}
                            className="w-full bg-white border-4 border-black text-black font-bold uppercase px-4 py-4 focus:outline-none focus:ring-0 min-h-[140px] resize-y placeholder-gray-300 text-xl"
                            placeholder="DETAILS..."
                        />
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row justify-end gap-6 border-t-8 border-black mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-6 py-4 bg-white text-black border-4 border-black font-black uppercase hover:bg-black hover:text-white transition-none disabled:opacity-50 w-full sm:w-auto text-center text-xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_#000]"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !designName.trim()}
                            className="px-8 py-4 bg-black text-white border-4 border-black font-black uppercase hover:bg-white hover:text-black transition-none disabled:opacity-50 w-full sm:w-auto text-center flex items-center justify-center gap-3 shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_#000] text-xl"
                        >
                            {isSaving && (
                                <div className="w-5 h-5 border-4 border-current border-t-transparent animate-spin pointer-events-none"></div>
                            )}
                            {editingDesign ? 'SAVE' : 'CREATE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
