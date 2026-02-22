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
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 animate-[pulse_3s_ease-in-out_infinite]">
                Harmony<span className="text-purple-500">.</span>
            </h1>
            <div className="max-w-md w-full p-8 bg-neutral-900/80 border border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 opacity-70"></div>
                <h2 className="text-2xl font-semibold text-center text-white mb-6 tracking-tight">
                    Welcome back
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-neutral-950/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all hover:bg-neutral-900"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 bg-neutral-950/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all hover:bg-neutral-900"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all text-sm mt-6"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-neutral-500 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors ml-1 font-medium">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
