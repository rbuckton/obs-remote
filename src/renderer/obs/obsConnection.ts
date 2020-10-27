// import ObsWebSocket, { OBSStats } from "obs-websocket-js";

// export interface GetVersionResponse {
//     "obs-websocket-version": string;
//     "obs-studio-version": string;
//     "available-requests": string[];
//     "supported-image-export-formats": string[];
// }

// export type GetAuthRequiredResponse =
//     | { authRequired: false }
//     | { authRequired: true, challenge: string, salt: string };

// export interface AuthenticateRequest {
//     auth: string;
// }

// export interface SetHeartbeatRequest {
//     enable: boolean;
// }

// export interface SetFilenameFormattingRequest {
//     "filename-formatting": string;
// }

// export interface GetFilenameFormattingResponse {
//     "filename-formatting": string;
// }

// export interface GetStatsResponse {
//     stats: OBSStats;
// }

// export interface BroadcastCustomMessageRequest {
//     realm: string;
//     data: unknown;
// }

// export interface GetVideoInfoResponse {
//     baseWidth: number;
//     baseHeight: number;
//     outputWidth: number;
//     outputHeight: number;
//     scaleType: string;
//     fps: number;
//     videoFormat: string;
//     colorSpace: string;
//     colorRange: string;
// }

// export interface OpenProjectorRequest {
//     type?: "preview" | "source" | "scene" | "studioprogram" | "multiview";
//     monitor?: number;
//     geometry?: string;
//     name?: string;
// }

// // export interface TriggerHotkeyByNameRequest {
// //     hotkeyName: string;
// // }

// // export interface TriggerHotkeyBySequenceRequest {
// //     keyId: string; // `OBS_KEY_${string}`
// //     keyModifiers?: {
// //         shift?: boolean;
// //         alt?: boolean;
// //         control?: boolean;
// //         command?: boolean;
// //     }
// // }

// // export type MediaState = "none" | "playing" | "opening" | "buffering" | "paused" | "stopped" | "ended" | "error" | "unknown";

// export interface IObsConnection {
//     // #region General
//     /**
//      * @since 0.3.0
//      */
//     getVersion(): Promise<GetVersionResponse>;
//     /**
//      * @since 0.3.0
//      */
//     getAuthRequired(): Promise<GetAuthRequiredResponse>;
//     /**
//      * @since 0.3.0
//      */
//     authenticate(request: AuthenticateRequest): Promise<void>;
//     /** 
//      * @since 4.3.0
//      * @deprecated since 4.9.0
//      */
//     setHeartbeat(request: SetHeartbeatRequest): Promise<void>;
//     /**
//      * @since 4.3.0
//      */
//     setFilenameFormatting(request: SetFilenameFormattingRequest): Promise<void>;
//     /**
//      * @since 4.3.0
//      */
//     getFilenameFormatting(): Promise<GetFilenameFormattingResponse>;
//     /**
//      * @since 4.6.0
//      */
//     getStats(): Promise<GetStatsResponse>;
//     /**
//      * @since 4.7.0
//      */
//     broadcastCustomMessage(request: BroadcastCustomMessageRequest): Promise<void>;
//     /**
//      * @since 4.6.0
//      */
//     getVideoInfo(): Promise<GetVideoInfoResponse>;
//     /**
//      * @since 4.8.0
//      */
//     openProjector(request: OpenProjectorRequest): Promise<void>;
//     // triggerHotkeyByName(request: TriggerHotkeyByNameRequest): Promise<void>;
//     // triggerHotkeyBySequence(request: TriggerHotkeyBySequenceRequest): Promise<void>;
//     // #endregion General

//     // #region Media Control
//     // the following are marked unreleased
//     // playPauseMedia(request: { sourceName: string, playPause: boolean }): Promise<void>;
//     // restartMedia(request: { sourceName: string }): Promise<void>;
//     // stopMedia(request: { sourceName: string }): Promise<void>;
//     // nextMedia(request: { sourceName: string }): Promise<void>;
//     // previousMedia(request: { sourceName: string }): Promise<void>;
//     // getMediaDuration(request: { sourceName: string }): Promise<{ mediaDuration: number }>;
//     // getMediaTime(request: { sourceName: string }): Promise<{ timestamp: number }>;
//     // setMediaTime(request: { sourceName: string, timestamp: number }): Promise<void>;
//     // scribMedia(request: { sourceName: string, timeOffset: number }): Promise<void>;
//     // getMediaState(request: { sourceName: string }): Promise<{ mediaState: MediaState }>;
//     // #endregion Media Control
    
//     // #region Sources
//     // getMediaSourcesList(): Promise<{ mediaSources: { sourceName: string, sourceKind: "ffmpeg_source" | "vlc_source", mediaState: MediaState }[] }>;
//     /**
//      * @since 4.3.0
//      */
//     getSourcesList(): Promise<{
//         sources: {
//             name: string;
//             typeId: string;
//             type: "input" | "filter" | "transition" | "scene" | "unknown";
//         }[]
//     }>;
//     /**
//      * @since 4.3.0
//      */
//     getSourceTypesList(): Promise<{
//         types: {
//             typeId: string;
//             displayName: string;
//             type: "input" | "filter" | "transition" | "other";
//             defaultSettings: Record<string, any>;
//             caps: {
//                 isAsync: boolean;
//                 hasVideo: boolean;
//                 hasAudio: boolean;
//                 canInteract: boolean;
//                 isComposite: boolean;
//                 doNotDuplicate: boolean;
//                 doNotSelfMonitor: boolean;
//             };
//         }[];
//     }>;
//     /**
//      * @since 4.0.0
//      */
//     getVolume(request: {
//         source: string;
//         useDecibel?: boolean;
//     }): Promise<{
//         name: string;
//         volume: number;
//         muted: boolean;
//     }>;
//     /**
//      * @since 4.0.0
//      */
//     setVolume(request: {
//         source: string;
//         volume: number;
//         useDecibel?: boolean;
//     }): Promise<void>;
//     /**
//      * @since 4.0.0
//      */
//     getMute(request: {
//         source: string;
//     }): Promise<{
//         name: string;
//         muted: boolean;
//     }>;
//     /**
//      * @since 4.0.0
//      */
//     setMute(request: {
//         source: string;
//         mute: boolean;
//     }): Promise<void>;
//     /**
//      * @since 4.0.0
//      */
//     toggleMute(request: {
//         source: string;
//     }): Promise<void>;
//     // getAudioActive({ sourceName: string }): Promise<{ audioActive: boolean; }>;
//     setSource
//     // #endregion Sources

// }

// export class ObsConnection {
//     private _socket: ObsWebSocket;

//     constructor(socket: ObsWebSocket) {
//         this._socket = socket;
//     }

//     async getVersion() {
//         const result = await this._socket.send("GetVersion");
//         return {
//             obsWebsocketVersion: result["obs-websocket-version"],
//             obsStudioVersion: result["obs-studio-version"],
//             availableRequests: result["available-requests"].split(/,/g),
//             supportedImageExportFormats: result["supported-image-export-formats"].split(/,/g)
//         };
//     }

//     async getStats() {
//         const { stats } = await this._socket.send("GetStats");
//         return stats;
//     }

//     async broadcastCustomMessage(realm: string, data: {}) {
//         await this._socket.send("BroadcastCustomMessage", { realm, data });
//     }

//     async getVideoInfo()
// }