import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router';

export default function Navigation({ user, handleLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="border-b border-moss-pale bg-milk/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/harmony.png" alt="Harmony Logo" className="w-12 h-12 object-contain" />
                        <h1 className="text-3xl font-bold tracking-tight text-forest-dark">
                            Harmony<span className="text-moss">.</span>
                        </h1>
                    </Link>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-3">
                                    <span className="text-forest-dark/80 text-base font-medium">{user.username}</span>
                                </div>
                                {location.pathname !== '/dashboard' && (
                                    <Link
                                        to="/dashboard"
                                        className="text-forest-dark/80 hover:text-forest-dark text-base font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 bg-cream border border-moss-pale rounded-lg hover:bg-moss-pale/50 hover:border-moss text-base font-medium transition-colors text-forest-dark cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-forest-dark/80 hover:text-forest-dark text-base font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 bg-moss border border-moss rounded-lg hover:bg-moss/90 text-base font-medium transition-colors text-forest-dark cursor-pointer shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
