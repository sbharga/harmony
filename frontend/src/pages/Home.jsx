import { useEffect } from 'react';
import { Link } from 'react-router';
import Navigation from '../components/Navigation';
import LiveDemo from '../components/LiveDemo';

export default function Home() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, []);

    return (
        <div className="min-h-screen bg-milk text-forest-dark font-sans selection:bg-moss-pale selection:text-forest-dark relative">
            <Navigation user={null} handleLogout={() => { }} />

            <main className="relative">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 sm:py-32 lg:py-40 flex flex-col items-center text-center">
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-forest-dark mb-8 leading-tight max-w-4xl">
                        Design your space with <span className="text-transparent bg-clip-text bg-gradient-to-r from-moss to-forest-dark italic">perfect balance.</span>
                    </h1>
                    <p className="text-xl text-forest-dark/70 mb-12 max-w-2xl leading-relaxed">
                        Transform your room layout using advanced multimodal AI and interior design principles. Get a comprehensive score and a fully traversable 3D environment in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <Link to="/register" className="px-8 py-4 bg-moss text-forest-dark font-semibold rounded-lg hover:bg-moss/90 transition-all text-lg shadow-sm hover:shadow-md">
                            Start Designing Free
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-cream border border-moss-pale text-forest-dark font-semibold rounded-lg hover:bg-moss-pale/50 transition-all text-lg">
                            Sign In
                        </Link>
                    </div>
                </section>

                {/* Live Demo Section */}
                <LiveDemo />

                {/* Features Section */}
                <section className="bg-cream py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl sm:text-4xl font-bold text-forest-dark tracking-tight mb-4">Reimagine your interior.</h2>
                            <p className="text-lg text-forest-dark/70 max-w-2xl mx-auto">Three powerful core features to help you create the perfect living space.</p>
                        </div>

                        <div className="space-y-32">
                            {/* Feature 1 */}
                            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                                <div className="flex-1 w-full lg:w-1/2">
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-milk border border-moss-pale shadow-lg relative cursor-default hover:shadow-xl transition-shadow duration-300">
                                        <img
                                            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
                                            alt="AI Room Analysis"
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-forest-dark tracking-tight">AI Room Analysis</h3>
                                    <p className="text-lg text-forest-dark/70 leading-relaxed">
                                        Just upload photos of your room. Our advanced multimodal AI (powered by Google Gemini) automatically understands your space, detecting dimensions and classifying all your furniture into a digital layout.
                                    </p>
                                    <ul className="space-y-3 text-forest-dark/80">
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Intelligent item classification
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Accurate dimension extraction
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
                                <div className="flex-1 w-full lg:w-1/2">
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-milk border border-moss-pale shadow-lg relative cursor-default hover:shadow-xl transition-shadow duration-300">
                                        <img
                                            src="https://cdn.mos.cms.futurecdn.net/m6K5YFUu7Gw4RD34TEX6aS.jpg"
                                            alt="Harmony Optimization"
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-forest-dark tracking-tight">Harmony Optimization</h3>
                                    <p className="text-lg text-forest-dark/70 leading-relaxed">
                                        Get a comprehensive "Harmony Score" evaluating traversability, clearance, and zone coherence. Our proprietary algorithm then intelligently tests thousands of layouts to find the absolute best arrangement for your furniture.
                                    </p>
                                    <ul className="space-y-3 text-forest-dark/80">
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Interior design principle evaluation
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Greedy hill-climbing spatial optimizer
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                                <div className="flex-1 w-full lg:w-1/2">
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-milk border border-moss-pale shadow-lg relative cursor-default hover:shadow-xl transition-shadow duration-300">
                                        <img
                                            src="https://images.unsplash.com/photo-1558442074-3c19857bc1dc?auto=format&fit=crop&q=80&w=1200"
                                            alt="Interactive 3D Visualization"
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-forest-dark tracking-tight">Interactive 3D Visualization</h3>
                                    <p className="text-lg text-forest-dark/70 leading-relaxed">
                                        Step inside your newly designed room before moving a single chair. Compare your current layout and the optimized layout in real-time, interactive 3D, rendered beautifully in your browser.
                                    </p>
                                    <ul className="space-y-3 text-forest-dark/80">
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Interactive Three.js scene rendering
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Traversability heatmaps
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Call To Action */}
                <section className="py-24 sm:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-forest-dark z-0"></div>
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a5b890\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] z-0"></div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-milk mb-6">Ready to find your balance?</h2>
                        <p className="text-lg text-moss-pale/80 mb-10 max-w-2xl mx-auto">
                            Join Harmony today to analyze your space, optimize your furniture layout, and visualize your room in stunning 3D.
                        </p>
                        <Link to="/register" className="inline-block px-10 py-5 bg-moss text-forest-dark font-bold rounded-lg hover:bg-moss/90 hover:-translate-y-1 transition-all text-lg shadow-xl hover:shadow-2xl">
                            Create Your First Design
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-milk border-t border-moss-pale py-10 text-center">
                    <p className="text-forest-dark/60">&copy; {new Date().getFullYear()} Harmony All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
