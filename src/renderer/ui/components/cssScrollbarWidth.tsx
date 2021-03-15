import React, { useEffect } from "react";

/**
 * Sets a CSS variable for the scrollbar's width
 */
export const CssScrollbarWidth = () => {
    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }, []);
    return <></>;
};