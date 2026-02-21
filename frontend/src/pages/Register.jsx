import { useState } from 'react';
import { useNavigate, Link } from 'react-router';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white mb-8">
                    Create an Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">
                            Registration successful! Redirecting...
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                placeholder="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition shadow-lg shadow-green-600/20"
                    >
                        Register
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-500 hover:text-green-400 transition">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
