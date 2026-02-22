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
        const hasResults = !!design?.files?.find(f => f.file_type === 'results_json');

        switch (currentStage) {
            case 1: return <Stage1Input image6ft={image6ft} image1ft={image1ft} setImage6ft={setImage6ft} setImage1ft={setImage1ft} file6ft={file6ft} file1ft={file1ft} />;
            case 2: return <Stage2Analysis jsonContent={jsonContent} hasResults={hasResults} />;
            case 3: return <Stage3Map htmlFile={htmlFile} />;
            case 4: return <Stage4Final reorgFile={reorgFile} />;
            default: return null;
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-white text-black font-mono flex flex-col">
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-black text-white border-2 border-black px-4 py-2 font-black uppercase hover:bg-white hover:text-black transition-none shadow-[4px_4px_0_0_#000]"
                        >
                            &larr; BACK
                        </button>
                        <h1 className="text-2xl font-black uppercase text-black tracking-tighter hidden sm:block">
                            {design?.name || 'LOADING...'}
                        </h1>
                        <div className="flex items-center gap-3">
                            {regenHandler && (
                                <button
                                    onClick={regenHandler}
                                    disabled={isProcessing}
                                    title="Regenerate"
                                    className={`w-8 h-8 flex items-center justify-center border-2 border-black transition-none ${isProcessing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={isProcessing ? 'animate-spin' : ''}>
                                        <path d="M21 2v6h-6" />
                                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                        <path d="M3 22v-6h6" />
                                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                    </svg>
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4].map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => stage <= maxStage ? setCurrentStage(stage) : null}
                                        disabled={stage > maxStage}
                                        className={`rounded-full transition-all ${currentStage === stage
                                                ? 'w-4 h-4 bg-black'
                                                : stage <= maxStage
                                                    ? 'w-2.5 h-2.5 bg-black opacity-40 hover:opacity-70 cursor-pointer'
                                                    : 'w-2.5 h-2.5 bg-black opacity-15 cursor-not-allowed'
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
                    <button
                        onClick={handlePrev}
                        disabled={currentStage === 1 || isProcessing}
                        className={`hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center text-2xl font-black border-4 border-black bg-white transition-none ${currentStage === 1 || isProcessing ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black hover:text-white shadow-[4px_4px_0_0_#000]'}`}
                    >
                        &larr;
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canGoNext || isProcessing}
                        className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center text-2xl font-black border-4 border-black bg-white transition-none ${!canGoNext || isProcessing ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black hover:text-white shadow-[4px_4px_0_0_#000]'}`}
                    >
                        &rarr;
                    </button>
                </>
            )}

            <main className="py-4 px-4 flex-1 min-h-0 overflow-hidden w-full flex flex-col items-center relative">
                {error ? (
                    <div className="border-4 border-black p-8 bg-black text-white text-2xl font-black uppercase shadow-[16px_16px_0_0_#000] self-center mt-20">
                        {error}
                    </div>
                ) : design ? (
                    <div className="w-full max-w-5xl h-full flex overflow-hidden">
                        {renderStageContent()}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-32 h-32 border-8 border-black border-t-transparent animate-spin"></div>
                    </div>
                )}
            </main>
        </div>
    );
}
