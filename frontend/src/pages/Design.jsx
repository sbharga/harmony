import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import ProcessingOverlay from '../components/design/ProcessingOverlay';
import Stage1Input from '../components/design/Stage1Input';
import Stage2Analysis from '../components/design/Stage2Analysis';
import Stage3Map from '../components/design/Stage3Map';
import Stage4Final from '../components/design/Stage4Final';

export default function Design() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [design, setDesign] = useState(null);
    const [error, setError] = useState('');

    const getMaxStage = (files) => {
        if (!files || files.length === 0) return 1;
        const hasStage1 = files.some(f => f.file_type === 'image_6ft') && files.some(f => f.file_type === 'image_1ft');
        if (!hasStage1) return 1;
        const hasStage2 = files.some(f => f.file_type === 'results_json');
        if (!hasStage2) return 2;
        const hasStage3 = files.some(f => f.file_type === 'render_3d');
        if (!hasStage3) return 3;
        const hasStage4 = files.some(f => f.file_type === 'reorganized_3d');
        if (hasStage4) return 4;
        return 4;
    };

    const [currentStage, setCurrentStage] = useState(1);
    const [maxStage, setMaxStage] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const [image6ft, setImage6ft] = useState(null);
    const [image1ft, setImage1ft] = useState(null);

    const [jsonContent, setJsonContent] = useState(null);
    const [initialScoreData, setInitialScoreData] = useState(null);
    const [optimizedScoreData, setOptimizedScoreData] = useState(null);
    const [hoverLeft, setHoverLeft] = useState(false);
    const [hoverRight, setHoverRight] = useState(false);
    const stageNames = ["Upload Images", "Room Analysis", "3D Map", "Final Design"];

    const fetchDesign = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const response = await fetch(`/api/designs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 404) throw new Error('Design not found');
                throw new Error('Failed to load design details');
            }
            const data = await response.json();
            setDesign(data);
            const max = getMaxStage(data.files);
            setMaxStage(max);
            if (!design || currentStage > max) setCurrentStage(max);
            const rf = data.files?.find(f => f.file_type === 'results_json');
            if (rf) {
                fetch(rf.file_path)
                    .then(res => res.json())
                    .then(json => setJsonContent(json))
                    .catch(console.error);
            } else {
                setJsonContent(null);
            }
            const isf = data.files?.find(f => f.file_type === 'initial_score_json');
            if (isf) {
                fetch(isf.file_path)
                    .then(res => res.json())
                    .then(json => setInitialScoreData(json))
                    .catch(console.error);
            } else {
                setInitialScoreData(null);
            }
            const osf = data.files?.find(f => f.file_type === 'optimized_score_json');
            if (osf) {
                fetch(osf.file_path)
                    .then(res => res.json())
                    .then(json => setOptimizedScoreData(json))
                    .catch(console.error);
            } else {
                setOptimizedScoreData(null);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { fetchDesign(); }, [id, navigate]);

    const handleStage1Submit = async () => {
        if (!image6ft || !image1ft) return;
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('image_6ft', image6ft);
        formData.append('image_1ft', image1ft);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/designs/${id}/upload_stage_1`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) { await fetchDesign(); setCurrentStage(2); }
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const handleGenerateJSON = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/designs/${id}/generate_json`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) await fetchDesign();
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const handleGenerate3D = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/designs/${id}/generate_3d`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) await fetchDesign();
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const handleGenerateReorganized = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/designs/${id}/generate_reorganized`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) await fetchDesign();
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    // Auto-generate when entering a stage that has no cached result
    useEffect(() => {
        if (!design || isProcessing) return;
        const hasResults = design.files?.some(f => f.file_type === 'results_json');
        const has3D = design.files?.some(f => f.file_type === 'render_3d');
        const hasReorg = design.files?.some(f => f.file_type === 'reorganized_3d');
        if (currentStage === 2 && !hasResults) handleGenerateJSON();
        else if (currentStage === 3 && !has3D) handleGenerate3D();
        else if (currentStage === 4 && !hasReorg) handleGenerateReorganized();
    }, [currentStage, design]);

    // Right arrow: on stage 1 triggers submit if files selected, else navigates
    const canGoNext = currentStage === 1
        ? (image6ft && image1ft) || maxStage >= 2
        : currentStage < maxStage && currentStage < 4;

    const handleNext = () => {
        if (currentStage === 1) {
            if (image6ft && image1ft) handleStage1Submit();
            else if (maxStage >= 2) setCurrentStage(2);
            return;
        }
        if (currentStage < maxStage) setCurrentStage(currentStage + 1);
    };

    const handlePrev = () => {
        if (currentStage > 1) setCurrentStage(currentStage - 1);
    };

    // Regenerate handler per stage (null = no regen icon)
    const regenHandlers = { 2: handleGenerateJSON, 3: handleGenerate3D, 4: handleGenerateReorganized };
    const regenHandler = design ? regenHandlers[currentStage] ?? null : null;

    const renderStageContent = () => {
        if (isProcessing) return <ProcessingOverlay />;

        const file6ft = design?.files?.find(f => f.file_type === 'image_6ft');
        const file1ft = design?.files?.find(f => f.file_type === 'image_1ft');
        const htmlFile = design?.files?.find(f => f.file_type === 'render_3d');
        const reorgFile = design?.files?.find(f => f.file_type === 'reorganized_3d');
        const heatmapOriginal = design?.files?.find(f => f.file_type === 'render_3d_heatmap');
        const hasResults = !!design?.files?.find(f => f.file_type === 'results_json');

        switch (currentStage) {
            case 1: return <Stage1Input image6ft={image6ft} image1ft={image1ft} setImage6ft={setImage6ft} setImage1ft={setImage1ft} file6ft={file6ft} file1ft={file1ft} />;
            case 2: return <Stage2Analysis jsonContent={jsonContent} hasResults={hasResults} />;
            case 3: return <Stage3Map htmlFile={htmlFile} scoreData={initialScoreData} />;
            case 4: return <Stage4Final reorgFile={reorgFile} initialFile={htmlFile} originalHeatmapFile={heatmapOriginal} scoreData={optimizedScoreData} />;
            default: return null;
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-milk text-forest-dark flex flex-col">
            <nav className="border-b border-moss-pale bg-milk/80 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-base font-medium text-forest-dark/80 hover:text-moss transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Designs
                        </button>
                        <h1 className="text-xl font-semibold text-forest-dark tracking-tight hidden sm:block">
                            {design?.name || 'Loading...'}
                        </h1>
                        <div className="flex items-center gap-4">
                            {regenHandler && (
                                <button
                                    onClick={regenHandler}
                                    disabled={isProcessing}
                                    title="Regenerate"
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border border-moss-pale transition-colors ${isProcessing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-moss/20 text-forest-dark/60 hover:text-moss'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isProcessing ? 'animate-spin' : ''}>
                                        <path d="M21 2v6h-6" />
                                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                        <path d="M3 22v-6h6" />
                                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                    </svg>
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                {[1, 2, 3, 4].map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => stage <= maxStage ? setCurrentStage(stage) : null}
                                        disabled={stage > maxStage}
                                        className={`rounded-full transition-all duration-300 ${currentStage === stage
                                            ? 'w-2 h-2 bg-moss ring-4 ring-moss/30'
                                            : stage <= maxStage
                                                ? 'w-2 h-2 bg-forest-dark/30 hover:bg-moss cursor-pointer'
                                                : 'w-2 h-2 bg-moss-pale/50 cursor-not-allowed'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {design && (
                <>
                    <div className="hidden lg:block fixed left-10 top-1/2 -translate-y-1/2 z-50">
                        <button
                            onClick={handlePrev}
                            disabled={currentStage === 1 || isProcessing}
                            onMouseEnter={() => setHoverLeft(true)}
                            onMouseLeave={() => setHoverLeft(false)}
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-cream/90 backdrop-blur-md border border-moss-pale text-forest-dark/60 transition-all shadow-md ${currentStage === 1 || isProcessing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-cream hover:text-moss hover:border-moss/50 hover:scale-105'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            {hoverLeft && currentStage > 1 && !isProcessing && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cream border border-moss-pale text-forest-dark/80 text-xs font-medium px-2.5 py-1 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                                    {stageNames[currentStage - 2]}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 z-50">
                        <button
                            onClick={handleNext}
                            disabled={!canGoNext || isProcessing}
                            onMouseEnter={() => setHoverRight(true)}
                            onMouseLeave={() => setHoverRight(false)}
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-cream/90 backdrop-blur-md border border-moss-pale text-forest-dark/60 transition-all shadow-md ${!canGoNext || isProcessing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-cream hover:text-moss hover:border-moss/50 hover:scale-105'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            {hoverRight && canGoNext && !isProcessing && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cream border border-moss-pale text-forest-dark/80 text-xs font-medium px-2.5 py-1 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                                    {stageNames[currentStage]}
                                </span>
                            )}
                        </button>
                    </div>
                </>
            )}

            <main className="py-6 px-4 flex-1 min-h-0 overflow-hidden w-full flex flex-col items-center relative">
                {error ? (
                    <div className="w-full max-w-lg mt-20 bg-red-50/50 border border-red-200 text-red-600 rounded-xl p-6 text-center shadow-xl">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-forest-dark mb-2">Failed to load</h3>
                        <p className="text-xs">{error}</p>
                    </div>
                ) : design ? (
                    <div className="w-full max-w-5xl h-full flex overflow-hidden">
                        {renderStageContent()}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 flex items-center justify-center border-2 border-moss-pale border-t-moss rounded-full animate-spin"></div>
                    </div>
                )}
            </main>
        </div>
    );
}
