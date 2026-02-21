import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DesignModal from '../components/DesignModal';

// Pencil icon SVG
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
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

        if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS DESIGN? THIS CANNOT BE UNDONE.")) return;

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
            <div className="min-h-screen bg-white flex items-center justify-center font-mono">
                <div className="w-20 h-20 border-8 border-black border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-mono">
            <nav className="border-b-4 border-black bg-white sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
                            HARMONY
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex items-center gap-3">
                                <span className="text-black font-black uppercase tracking-wide">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-none text-sm font-black uppercase text-black"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative bg-white">
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">YOUR DESIGNS</h2>
                            <p className="text-black font-bold uppercase mt-2 border-l-4 border-black pl-3">Manage your creations</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="mt-6 sm:mt-0 px-6 py-3 bg-black text-white border-4 border-black font-black uppercase shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#000] transition-none text-lg"
                        >
                            + NEW DESIGN
                        </button>
                    </div>

                    {isLoadingDesigns ? (
                        <div className="flex justify-center py-20">
                            <div className="w-20 h-20 border-8 border-black border-t-transparent animate-spin"></div>
                        </div>
                    ) : designs.length === 0 ? (
                        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#000] p-16 text-center">
                            <div className="w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 bg-black text-white">
                                <span className="text-4xl font-black uppercase">X</span>
                            </div>
                            <h3 className="text-3xl font-black text-black uppercase mb-4 tracking-tighter">NOTHING HERE</h3>
                            <p className="text-black font-bold uppercase mb-8 max-w-sm mx-auto">Start creating.</p>
                            <button
                                onClick={() => handleOpenModal(null)}
                                className="px-8 py-4 bg-black text-white border-4 border-black font-black uppercase hover:bg-white hover:text-black transition-none shadow-[8px_8px_0_0_#000] text-xl"
                            >
                                MAKE DESIGN
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {designs.map(design => (
                                <div
                                    key={design.id}
                                    onClick={() => navigate(`/design/${design.id}`)}
                                    className="group bg-white border-4 border-black shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#000] transition-none cursor-pointer flex flex-col"
                                >
                                    <div className="h-48 w-full relative overflow-hidden flex items-center justify-center bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%),linear-gradient(45deg,#000_25%,white_25%,white_75%,#000_75%,#000_100%)] bg-[size:20px_20px]">
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-none"></div>

                                        <span className="relative z-10 bg-black text-white px-4 py-2 font-black tracking-widest uppercase border-4 border-black shadow-[4px_4px_0_0_#fff]">
                                            PREVIEW
                                        </span>

                                    </div>

                                    <div className="p-6 flex-1 flex flex-col items-start bg-white w-full">
                                        <div className="flex items-start justify-between w-full gap-4">
                                            <h3 className="font-black text-black uppercase text-2xl truncate flex-1 min-w-0">
                                                {design.name}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(design);
                                                }}
                                                className="p-2 bg-white border-4 border-black hover:bg-black text-black hover:text-white transition-none shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0_0_#000] flex-shrink-0"
                                                title="Edit Details"
                                            >
                                                <PencilIcon />
                                            </button>
                                        </div>
                                        <p className="text-black font-bold uppercase text-sm mt-4 line-clamp-2 border-l-4 border-black pl-4">
                                            {design.description || "NO DESCRIPTION"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
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
