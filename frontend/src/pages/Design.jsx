import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

export default function Design() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [design, setDesign] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDesign = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`/api/designs/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Design not found');
                    }
                    throw new Error('Failed to load design details');
                }

                const data = await response.json();
                setDesign(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchDesign();
    }, [id, navigate]);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-400 hover:text-white transition flex items-center gap-2"
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {design?.name || 'Loading...'}
                        </h1>
                        <div className="w-32"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[80vh]">
                {error ? (
                    <div className="text-red-400 text-xl font-medium">{error}</div>
                ) : design ? (
                    <div className="text-gray-500 text-3xl font-light tracking-widest uppercase">
                        empty design
                    </div>
                ) : (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                )}
            </main>
        </div>
    );
}
