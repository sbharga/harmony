export default function StageIndicator({ currentStage, maxStage, setCurrentStage }) {
    return (
        <footer className="bg-white py-2 flex-shrink-0 flex justify-center items-center gap-2">
            {[1, 2, 3, 4].map(stage => (
                <button
                    key={stage}
                    onClick={() => stage <= maxStage ? setCurrentStage(stage) : null}
                    disabled={stage > maxStage}
                    className={`rounded-full transition-all ${
                        currentStage === stage
                            ? 'w-4 h-4 bg-black'
                            : stage <= maxStage
                                ? 'w-2.5 h-2.5 bg-black opacity-40 hover:opacity-70 cursor-pointer'
                                : 'w-2.5 h-2.5 bg-black opacity-15 cursor-not-allowed'
                    }`}
                />
            ))}
        </footer>
    );
}
