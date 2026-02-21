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
        <div className="min-h-screen bg-white text-black font-mono">
            <nav className="border-b-4 border-black bg-white sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-black text-white border-2 border-black px-4 py-2 font-black uppercase hover:bg-white hover:text-black transition-none shadow-[4px_4px_0_0_#000] flex items-center gap-2"
                        >
                            &larr; BACK
                        </button>
                        <h1 className="text-2xl font-black uppercase text-black tracking-tighter">
                            {design?.name || 'LOADING...'}
                        </h1>
                        <div className="w-[100px]"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] relative">
                {error ? (
                    <div className="border-4 border-black p-8 bg-black text-white text-2xl font-black uppercase shadow-[16px_16px_0_0_#000]">
                        {error}
                    </div>
                ) : design ? (
                    <div className="w-full flex-1 border-8 border-black p-12 bg-white flex items-center justify-center shadow-[24px_24px_0_0_#000] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_2px,transparent_2px),linear-gradient(to_bottom,#000_2px,transparent_2px)] bg-[size:100px_100px] opacity-10"></div>
                        <div className="bg-black text-white p-12 border-4 border-black z-10 rotate-[-2deg] hover:rotate-0 transition-all font-black text-6xl md:text-8xl tracking-widest uppercase text-center relative shadow-[-16px_16px_0_0_#fff, -16px_16px_0_4px_#000]">
                            EMPTY
                            <br />
                            DESIGN
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 border-8 border-black border-t-transparent animate-spin"></div>
                )}
            </main>
        </div>
    );
}
