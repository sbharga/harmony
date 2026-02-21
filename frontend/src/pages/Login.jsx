import { useState } from 'react';
import { useNavigate, Link } from 'react-router';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full p-8 bg-white border-4 border-black shadow-[16px_16px_0_0_#000]">
                <h2 className="text-4xl font-black uppercase text-center text-black mb-8 tracking-tighter">
                    LOGIN
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-black text-white font-bold uppercase border-4 border-black text-center text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-black uppercase text-black mb-2 tracking-wide">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-white border-4 border-black text-black font-bold uppercase focus:outline-none focus:ring-0 focus:border-black placeholder-gray-300"
                                placeholder="USERNAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase text-black mb-2 tracking-wide">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-white border-4 border-black text-black font-bold uppercase focus:outline-none focus:ring-0 focus:border-black placeholder-gray-300"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 px-4 bg-black text-white font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-none text-xl shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#000]"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-black font-black text-sm uppercase mt-6 p-4 border-2 border-black bg-white">
                        NO ACCOUNT?{' '}
                        <Link to="/register" className="ml-2 underline hover:bg-black hover:text-white transition-none px-2 py-1">
                            REGISTER
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
