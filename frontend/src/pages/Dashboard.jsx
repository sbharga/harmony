import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DesignModal from '../components/DesignModal';
import Navigation from '../components/Navigation';

// Pencil icon SVG
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
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
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteDesign = async () => {
        if (!editingDesign) return;

        if (!window.confirm("Are you sure you want to delete this design? This cannot be undone.")) return;

        setIsDeleting(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/designs/${editingDesign.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete design');

            setDesigns(designs.filter(d => d.id !== editingDesign.id));
            handleCloseModal();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user && !error) {
        return (
            <div className="min-h-screen bg-milk flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-moss-pale border-t-moss rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-milk text-forest-dark">
            <Navigation user={user} handleLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-forest-dark tracking-tight">Your Designs</h2>
                            <p className="text-forest-dark/70 mt-2 text-base">Manage your 3D creations</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="mt-4 sm:mt-0 px-5 py-2.5 bg-moss text-forest-dark rounded-lg font-medium hover:bg-moss/90 transition-all flex items-center gap-2 text-base shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Design
                        </button>
                    </div>

                    {isLoadingDesigns ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 flex items-center justify-center border-2 border-moss-pale border-t-moss rounded-full animate-spin"></div>
                        </div>
                    ) : designs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <h3 className="text-xl font-semibold text-forest-dark mb-3 tracking-tight">No designs yet</h3>
                            <p className="text-forest-dark/70 mb-8 max-w-sm mx-auto text-base">Create your first design to get started.</p>
                            <button
                                onClick={() => handleOpenModal(null)}
                                className="px-6 py-3 bg-moss text-forest-dark font-medium rounded-lg hover:bg-moss/90 transition-all text-base shadow-sm"
                            >
                                Create Design
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {designs.map(design => {
                                const previewFile = design.files?.find(f => f.file_type === 'image_6ft')
                                    || design.files?.find(f => f.file_type === 'image_1ft');
                                const hasPreview = !!previewFile;

                                return (
                                    <div
                                        key={design.id}
                                        onClick={() => navigate(`/design/${design.id}`)}
                                        className="group bg-cream border border-moss-pale rounded-xl hover:border-moss transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                                    >
                                        <div className="h-56 w-full relative overflow-hidden bg-milk flex items-center justify-center">
                                            {hasPreview ? (
                                                <img src={previewFile.file_path} alt={`${design.name} preview`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-moss-pale/20 to-moss-pale/50 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            )}

                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />

                                            {!hasPreview && (
                                                <span className="relative z-10 bg-forest-dark/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-moss-pale/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                                                    Open Project
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col items-start w-full bg-cream relative z-10">
                                            <div className="flex items-start justify-between w-full gap-3">
                                                <h3 className="font-semibold text-forest-dark text-lg truncate flex-1 min-w-0 group-hover:text-moss transition-colors">
                                                    {design.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenModal(design);
                                                    }}
                                                    className="p-1.5 text-forest-dark/50 hover:text-forest-dark rounded-md hover:bg-moss-pale/50 transition-colors flex-shrink-0"
                                                    title="Edit Details"
                                                >
                                                    <PencilIcon />
                                                </button>
                                            </div>
                                            <p className="text-forest-dark/70 text-sm mt-1.5 line-clamp-2">
                                                {design.description || "No description provided."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <DesignModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveDesign}
                onDelete={handleDeleteDesign}
                editingDesign={editingDesign}
                designName={designName}
                setDesignName={setDesignName}
                designDescription={designDescription}
                setDesignDescription={setDesignDescription}
                isSaving={isSaving}
                isDeleting={isDeleting}
            />
        </div>
    );
}
