/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { useCallback, useEffect, useRef } from "react";
import { IAppService } from "../../services/app/common/appService";
import { IPowerManagementService } from "../../services/powerManagement/common/powerManagementService";
import { useAsyncEffect } from "../hooks/useAsyncEffect";
import { useService } from "../hooks/useService";
import { useAppContext } from "../utils/appContext";

export interface FullscreenModeProps {
}

/**
 * Manages effects that occur when the app switches in and out of fullscreen mode.
 */
export const FullscreenMode = ({ }: FullscreenModeProps) => {
    // state
    const { fullscreen, setFullscreen } = useAppContext();
    const powerManager = useService(IPowerManagementService);
    const appInfo = useService(IAppService);
    const blockerRef = useRef<number>();

    // behavior
    const blockSleep = () => {
        blockerRef.current ??= powerManager.startPowerSaveBlocker("prevent-display-sleep");
    };

    const unblockSleep = useCallback(() => {
        if (blockerRef.current !== undefined) {
            powerManager.stopPowerSaveBlocker(blockerRef.current);
            blockerRef.current = undefined;
        }
    }, [powerManager]);

    const onDocumentFullscreenChange = useCallback(() => {
        setFullscreen(!!document.fullscreenElement);
    }, [document]);

    // effects
    useAsyncEffect(async () => {
        // handle UI updates when the 'fullscreen' state changes
        if (fullscreen) {
            if (!document.fullscreenElement) {
                await appInfo.requestFullscreen();
            }
        }
        else {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        }
    }, [document, fullscreen]);

    useEffect(() => {
        // listen for changes to the document fullscreenElement
        document.addEventListener("fullscreenchange", onDocumentFullscreenChange);
        return () => { document.removeEventListener("fullscreenchange", onDocumentFullscreenChange); }
    }, [document]);

    useEffect(() => {
        if (fullscreen) {
            blockSleep();
        }
        else {
            unblockSleep();
        }
        return unblockSleep;
    }, [fullscreen]);

    return null;
};