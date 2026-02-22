import { useEffect, useState } from "react";
import "./WelcomeOverlay.css";

const WELCOME_OVERLAY_DURATION_MS = 6000;
const EXIT_ANIMATION_MS = 900;
const PROGRESS_DURATION_MS = WELCOME_OVERLAY_DURATION_MS - 1500;

export function WelcomeOverlay({ onComplete }) {
    const [phase, setPhase] = useState("visible");

    useEffect(() => {
        let exitId, goneId;

        const beginExit = () => {
            setPhase((currentPhase) => (currentPhase === "visible" ? "exiting" : currentPhase));
        };

        const forceDismiss = () => {
            beginExit();
            window.clearTimeout(exitId);
            window.clearTimeout(goneId);
            goneId = window.setTimeout(() => {
                setPhase("gone");
                if (onComplete) onComplete();
            }, EXIT_ANIMATION_MS);
        };

        exitId = window.setTimeout(beginExit, WELCOME_OVERLAY_DURATION_MS - EXIT_ANIMATION_MS);
        goneId = window.setTimeout(() => {
            setPhase("gone");
            if (onComplete) onComplete();
        }, WELCOME_OVERLAY_DURATION_MS);

        window.addEventListener("pointerdown", forceDismiss, { once: true });
        window.addEventListener("keydown", forceDismiss, { once: true });

        return () => {
            window.clearTimeout(exitId);
            window.clearTimeout(goneId);
            window.removeEventListener("pointerdown", forceDismiss);
            window.removeEventListener("keydown", forceDismiss);
        };
    }, [onComplete]);

    if (phase === "gone") return null;

    return (
        <div
            aria-live="polite"
            className={`wo-root${phase === "exiting" ? " wo-exit" : ""}`}
            role="status"
            style={{ "--wo-progress-duration": `${PROGRESS_DURATION_MS}ms` }}
        >
            <div className="wo-grain" />
            <div className="wo-leak" />

            <div className="wo-corner wo-corner--tl" />
            <div className="wo-corner wo-corner--tr" />
            <div className="wo-corner wo-corner--bl" />
            <div className="wo-corner wo-corner--br" />

            <div className="wo-content">
                <p className="wo-eyebrow">Upload &mdash; Optimize &mdash; Visualize</p>
                <h1 className="wo-title">
                    Harmony
                </h1>
                <p className="wo-subtitle">Click &amp; swipe to continue</p>
            </div>

            <div className="wo-progress-track">
                <div className="wo-progress-bar" />
            </div>
        </div>
    );
}
