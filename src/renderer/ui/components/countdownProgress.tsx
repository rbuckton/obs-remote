import React, { useEffect, useRef, useState } from "react";
import { CircularProgress, CircularProgressProps, Fab } from "@material-ui/core";
import { Check as CheckIcon, Cancel as CancelIcon } from "@material-ui/icons";

export interface CountdownProgressProps {
    size: number;
    timeout: number;
    started?: boolean;
    interrupted?: boolean;
    CircularProgressProps?: CircularProgressProps;
    timeoutElement?: React.ReactNode;
    interruptedElement?: React.ReactNode;
    onTimeout?: () => void;
}

interface CountdownState {
    percentComplete: number;
    status: "not-started" | "started" | "timeout-elapsed" | "interrupted";
}

export const CountdownProgress = ({
    size,
    started,
    timeout,
    timeoutElement,
    interrupted,
    interruptedElement,
    onTimeout,
    CircularProgressProps
}: CountdownProgressProps) => {
    // state
    const [value, setValue] = useState(0);
    const [status, setStatus] = useState(interrupted ? "interrupted" : started ? "started" : "not-started");
    const startTimeRef = useRef<number>(0);
    const animationRef = useRef<any>();

    // behavior
    const onAnimationFrame = () => {
        const timeElapsed = Date.now() - startTimeRef.current;
        const value = Math.max(0, Math.min(1, timeElapsed / timeout)) * 100;
        setValue(value);
        if (value >= 100) {
            if (animationRef.current) clearInterval(animationRef.current);
            animationRef.current = undefined;
            setValue(100);
            setStatus("timeout-elapsed");
            onTimeout?.();
        }
    };

    // effects
    useEffect(() => {
        if (!interrupted && started) {
            animationRef.current = setInterval(onAnimationFrame, 1000);
            startTimeRef.current = Date.now();
            return () => {
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
            };
        }
    }, []);

    // ui
    return <>{
        status === "not-started" ? <CircularProgress size={size} {...CircularProgressProps} variant="indeterminate" /> :
        status === "started" ? <CircularProgress size={size} {...CircularProgressProps} variant="static" value={value} /> :
        status === "timeout-elapsed" ? timeoutElement || <CheckIcon /> :
        status === "interrupted" ? interruptedElement || <CancelIcon /> :
        null
    }</>;
}