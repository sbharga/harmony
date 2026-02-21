import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// Settings icon SVG
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [designs, setDesigns] = useState([]);
    const [error, setError] = useState('');
    const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
    const navigate = useNavigate();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesign, setEditingDesign] = useState(null);
    const [designName, setDesignName] = useState('');
    const [designDescription, setDesignDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUserAndDesigns = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch User
                const userRes = await fetch('/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!userRes.ok) throw new Error('Session expired. Please log in again.');
                const userData = await userRes.json();
                setUser(userData);

                // Fetch Designs
                const designsRes = await fetch('/api/designs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (designsRes.ok) {
                    const designsData = await designsRes.json();
                    setDesigns(designsData);
                }
            } catch (err) {
                setError(err.message);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setIsLoadingDesigns(false);
            }
        };

        fetchUserAndDesigns();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleOpenModal = (design = null) => {
        if (design) {
            setEditingDesign(design);
            setDesignName(design.name);
            setDesignDescription(design.description || '');
        } else {
            setEditingDesign(null);
            setDesignName('');
            setDesignDescription('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDesign(null);
        setDesignName('');
        setDesignDescription('');
    };

    const handleSaveDesign = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('token');

        const endpoint = editingDesign ? `/api/designs/${editingDesign.id}` : '/api/designs';
        const method = editingDesign ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: designName, description: designDescription })
            });

            if (!response.ok) throw new Error('Failed to save design');

            const savedDesign = await response.json();

            if (editingDesign) {
                setDesigns(designs.map(p => p.id === savedDesign.id ? savedDesign : p));
            } else {
                setDesigns([...designs, savedDesign]);
            }

            handleCloseModal();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user && !error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="h-8 w-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-gray-300 font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition text-sm font-medium text-gray-300"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Your Designs</h2>
                            <p className="text-gray-400 mt-1">Manage and view all your creative designs</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="mt-4 sm:mt-0 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95"
                        >
                            + Create Design
                        </button>
                    </div>

                    {isLoadingDesigns ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : designs.length === 0 ? (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center backdrop-blur-sm">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No designs yet</h3>
                            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Get started by creating your first design.</p>
                            <button
                                onClick={() => handleOpenModal(null)}
                                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition"
                            >
                                Create your first design
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {designs.map(design => (
                                <div
                                    key={design.id}
                                    onClick={() => navigate(`/design/${design.id}`)}
                                    className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                                >
                                    {/* Design Preview Image / Gradient */}
                                    <div className="h-40 w-full relative overflow-hidden flex items-center justify-center">
                                        <div className={`absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                        {/* A generic colorful abstract shape pattern based on design id */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>

                                        <span className="relative z-10 text-gray-500 font-medium tracking-wide">
                                            PREVIEW
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(design);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-gray-900/60 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                            title="Design Settings"
                                        >
                                            <SettingsIcon />
                                        </button>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col items-start bg-gray-900/80">
                                        <h3 className="font-semibold text-white text-lg truncate w-full group-hover:text-blue-400 transition-colors">
                                            {design.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                            {design.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all m-4">
                        <h3 className="text-2xl font-semibold text-white mb-6">
                            {editingDesign ? 'Edit Design' : 'Create New Design'}
                        </h3>

                        <form onSubmit={handleSaveDesign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Design Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={designName}
                                    onChange={(e) => setDesignName(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="e.g. My Awesome Design"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={designDescription}
                                    onChange={(e) => setDesignDescription(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-y"
                                    placeholder="What are you trying to redesign?"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !designName.trim()}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white pointer-events-none"></div>
                                    )}
                                    {editingDesign ? 'Save Changes' : 'Create Design'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
