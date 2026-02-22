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
        <div className="min-h-screen bg-milk flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-3 mb-8">
                <img src="/harmony.png" alt="Harmony Logo" className="w-20 h-20 object-contain" />
                <h1 className="text-4xl font-bold tracking-tight text-forest-dark">
                    Harmony<span className="text-moss">.</span>
                </h1>
            </div>
            <div className="max-w-md w-full p-8 bg-cream border border-moss-pale rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-xl transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-moss opacity-70"></div>
                <h2 className="text-3xl font-semibold text-center text-forest-dark mb-8 tracking-tight">
                    Create an Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg text-red-600 text-base text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-moss-pale/30 border border-moss-pale rounded-lg text-forest-dark text-base text-center">
                            Success! Redirecting to login...
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-base font-medium text-forest-dark/80 mb-2">Username</label>
                            <input
                                type="text"
                                required
                                autoComplete="username"
                                className="w-full px-4 py-3 bg-milk border border-moss-pale rounded-lg text-forest-dark text-lg placeholder-forest-dark/40 focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss transition-all hover:bg-milk/80"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-base font-medium text-forest-dark/80 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                className="w-full px-4 py-3 bg-milk border border-moss-pale rounded-lg text-forest-dark text-lg placeholder-forest-dark/40 focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss transition-all hover:bg-milk/80"
                                placeholder="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-moss text-forest-dark font-semibold rounded-lg hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-cream transition-all text-base mt-8"
                    >
                        Register
                    </button>

                    <p className="text-center text-forest-dark/70 text-base mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-moss hover:text-moss/80 transition-colors ml-1 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
