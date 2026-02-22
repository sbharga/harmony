export default function DesignModal({
    isOpen,
    onClose,
    onSave,
    editingDesign,
    designName,
    setDesignName,
    designDescription,
    setDesignDescription,
    isSaving,
    isDeleting,
    onDelete
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl text-white transform transition-all scale-100 opacity-100">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">
                    {editingDesign ? 'Edit Design' : 'New Creation'}
                </h3>

                <form onSubmit={onSave} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">
                            Design Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={designName}
                            onChange={(e) => setDesignName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg text-white font-medium px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 placeholder-neutral-600 transition-colors"
                            placeholder="Project Title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">
                            Description
                        </label>
                        <textarea
                            value={designDescription}
                            onChange={(e) => setDesignDescription(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg text-white font-medium px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 min-h-[120px] resize-y placeholder-neutral-600 transition-colors"
                            placeholder="Add details about your design..."
                        />
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        {editingDesign && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isDeleting || isSaving}
                                className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 w-full sm:w-auto text-center sm:mr-auto flex items-center justify-center gap-2"
                            >
                                {isDeleting && (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                )}
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving || isDeleting}
                            className="px-5 py-2.5 bg-transparent text-neutral-300 font-medium rounded-lg hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isDeleting || !designName.trim()}
                            className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                        >
                            {isSaving && (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                            )}
                            {editingDesign ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
