import * as os from "os";
import { EventEmitter } from "events";
import { delay } from "@esfx/async-delay";
import { IObsWebSocket } from "../obs/obsWebSocket";
import { OBSStats, ObsWebSocketEventArgsList, ObsWebSocketEvents, ObsWebSocketRequestArgs, ObsWebSocketRequests, ObsWebSocketResponse, Scene, SceneItem, Source, SourceType, SpecialSources, SourceTypeCapabilities, GetVideoInfoResponse } from "../obs/protocol";
import { getFakeScreenshotUri } from "./fakeScreenshot";

export type FakeObsWebSocketHandlers = ThisType<FakeObsWebSocket> & {
    connect?: (this: FakeObsWebSocket, options?: { address?: string; password?: string; secure?: boolean }) => Promise<void> | void;
    disconnect?: (this: FakeObsWebSocket) => void;
    requests?: ThisType<FakeObsWebSocket> & {
        [P in keyof ObsWebSocketRequests]?: (this: FakeObsWebSocket, arg: ObsWebSocketRequests[P]["request"]) => Promise<ObsWebSocketRequests[P]["response"]> | ObsWebSocketRequests[P]["response"];
    };
}

export class FakeObsWebSocket extends EventEmitter implements IObsWebSocket {
    private _handlers: FakeObsWebSocketHandlers;
    private _connected = false;

    constructor(handlers: FakeObsWebSocketHandlers) {
        super({ captureRejections: true });
        this._handlers = handlers;
    }

    get connected() {
        return this._connected;
    }

    async connect(options?: { address?: string; password?: string; secure?: boolean }): Promise<void> {
        if (this._handlers.connect) {
            await this._handlers.connect.call(this, options);
        }
        this._connected = true;
    }

    disconnect(): void {
        this._connected = false;
        if (this._handlers.disconnect) {
            this._handlers.disconnect.call(this);
        }
    }

    async send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>> {
        const handler = this._handlers.requests?.[key];
        if (handler) {
            return await (handler as Function).apply(this, args);
        }
        throw new Error("Not handled");
    }
}

export interface FakeObsWebSocket {
    // Custom events
    addListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    addListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    emit<K extends keyof ObsWebSocketEvents>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
    emit<K extends string | symbol>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
}

export function createDefaultFakeObsWebSocket() {
    interface TransitionType {
        readonly name: string;
        readonly supportsDuration: boolean;
    }

    interface Transition {
        name: string;
        type: TransitionType;
        duration: number;
    }

    interface SceneCollection {
        name: string;
        transitions: Transition[];
        scenes: Scene[];
        sources: Source[];
        sourceVolume: Map<string, number>;
        sourceMute: Map<string, boolean>;
        specialSources: SpecialSources;
        currentScene: Scene;
        currentTransition: Transition;
        reset(): void;
    }

    const cutTransitionType: TransitionType = { name: "Cut", supportsDuration: false };
    const fadeTransitionType: TransitionType = { name: "Fade", supportsDuration: true };
    const transitionTypes: readonly TransitionType[] = [
        cutTransitionType,
        fadeTransitionType,
        { name: "Swipe", supportsDuration: true },
        { name: "Slide", supportsDuration: true },
        { name: "Stinger", supportsDuration: false },
        { name: "Fade to Color", supportsDuration: false },
        { name: "Luma Wipe", supportsDuration: false },
        { name: "Shader", supportsDuration: false },
    ]

    const fps = 60;
    const videoBitrate = 6000 * 1024; // 6000 Kbps
    const videoInfo: GetVideoInfoResponse = {
        baseWidth: 2560,
        baseHeight: 1440,
        outputWidth: 2560,
        outputHeight: 1440,
        scaleType: "bicubic",
        fps,
        videoFormat: "NV12",
        colorSpace: "709",
        colorRange: "partial"
    };
    let connectionOptions: { address?: string; password?: string; secure?: boolean } | undefined;
    let connected = false;
    let streamTimer: NodeJS.Timeout | undefined;
    let streamState: boolean | "starting" | "stopping" = false;
    let streamingStartTime = BigInt(0);
    let streamingStopTime = BigInt(0);
    let streamOptions: ObsWebSocketRequests["StartStreaming"]["request"]["stream"] | undefined = {
        type: "rtmp_common",
        settings: {
            server: "twitch",
            key: "",
            use_auth: false
        }
    };
    let recordingState: boolean | "starting" | "stopping" | "paused" = false;
    let recordingStartTime = BigInt(0);
    let recordingStopTime = BigInt(0);
    let replayBufferState: boolean | "starting" | "stopping" = false;
    let currentProfile: string = "Untitled";

    const sourceSettings = new Map<string, Record<string, unknown>>();

    let sceneCollections: SceneCollection[] = [];
    sceneCollections.push(createSceneCollection("Game 1", ({
        collection,
        addScene,
        addSource,
        addTransition
    }) => {
        addSource("Desktop Audio", "wasapi_output_capture", "input");
        addSource("Mic/Aux", "wasapi_input_capture", "input");
        addSource("Background", "image_source", "input");
        addSource("Game Capture", "window_capture", "input");

        addScene("Intro", ({ addSceneItem }) => {
            addSceneItem("Desktop Audio");
            addSceneItem("Mic/Aux");
            addSceneItem("Background");
            addSceneItem("Game Capture");
        });

        addScene("Game", ({ addSceneItem }) => {
            addSceneItem("Desktop Audio");
            addSceneItem("Mic/Aux");
            addSceneItem("Background");
            addSceneItem("Game Capture");
        });
    }));

    let currentSceneCollection = sceneCollections[0];
    let studioModeState = false;
    let previewScene: Scene | undefined;
    let heartbeat = false;
    let heartbeatTimer: NodeJS.Timeout | undefined;
    let currentTransitionStartTime = BigInt(0);
    let currentTransitionId = 0;
    let nextTransitionId = 0;
    let pulse = false;
    const handlers: FakeObsWebSocketHandlers = {
        connect(options) {
            connectionOptions = deepClone(options);
            connected = true;
        },
        disconnect() {
            connectionOptions = undefined;
            connected = false;
            if (streamTimer) {
                clearInterval(streamTimer);
                streamTimer = undefined;
            }
            streamState = false;
            streamingStartTime = BigInt(0);
            streamingStopTime = BigInt(0);
            recordingState = false;
            recordingStartTime = BigInt(0);
            recordingStopTime = BigInt(0);
            replayBufferState = false;
            for (const collection of sceneCollections) {
                collection.reset();
            }
            currentSceneCollection = sceneCollections[0];
            previewScene = undefined;
            heartbeat = false;
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
                heartbeatTimer = undefined;
            }
            pulse = false;
        },
        requests: {
            // General
            async GetVersion() {
                if (!connected) throw new Error();
                return {
                    version: 1.1,
                    "obs-websocket-version": "4.8.0",
                    "obs-studio-version": "26.0.2",
                    "available-requests": Object.keys(handlers.requests!).sort().join(","),
                    "supported-image-export-formats": ["jpg", "jpeg"].sort().join(",")
                }
            },

            async SetHeartbeat({ enable }) {
                if (!connected) throw new Error();
                heartbeat = enable;
                updateHeartbeatTimer();
            },

            async BroadcastCustomMessage({ realm, data }) {
                if (!connected) throw new Error();
                await delay(10);
                this.emit("BroadcastCustomMessage", {
                    realm,
                    data: deepClone(data)
                });
            },

            async GetVideoInfo() {
                if (!connected) throw new Error();
                return deepClone(videoInfo);
            },

            // Streaming
            async GetStreamingStatus() {
                if (!connected) throw new Error();
                return {
                    streaming: streamState === true,
                    recording: recordingState === true,
                    "stream-timecode": streamState ? msToTimestamp(getStreamingTime()) : undefined,
                    "rec-timecode": recordingState ? msToTimestamp(getRecordingTime()) : undefined,
                    "preview-only": false,
                };
            },

            async StartStopStreaming() {
                if (!connected) throw new Error();
                switch (streamState) {
                    case false:
                    case "stopping":
                        await startStreaming();
                        break;
                    case true:
                    case "starting":
                        await stopStreaming();
                        break;
                }
            },

            async StartStreaming({ stream }) {
                if (!connected) throw new Error();
                if (streamState) throw new Error();
                if (stream) streamOptions = {
                    type: stream.type || streamOptions?.type,
                    metadata: { ...streamOptions?.metadata, ...deepClone(stream.metadata) },
                    settings: { ...streamOptions?.settings, ...deepClone(stream.settings) }
                };
                await startStreaming();
            },

            async StopStreaming() {
                if (!connected) throw new Error();
                if (streamState !== true) throw new Error();
                await stopStreaming();
            },

            async SetStreamSettings({ type, settings }) {
                if (!connected) throw new Error();
                streamOptions = {
                    type,
                    settings: {
                        ...streamOptions?.settings,
                        ...deepClone(settings)
                    }
                };
            },

            async GetStreamSettings() {
                if (!connected) throw new Error();
                if (!streamOptions) throw new Error();
                return {
                    type: streamOptions.type,
                    settings: deepClone(streamOptions.settings)
                } as ObsWebSocketRequests["GetStreamSettings"]["response"];
            },

            async SaveStreamSettings() {
                if (!connected) throw new Error();
            },

            // Recording

            async StartStopRecording() {
                if (!connected) throw new Error();
                switch (recordingState) {
                    case false:
                    case "stopping":
                        await startRecording();
                        break;
                    case true:
                    case "starting":
                    case "paused":
                        await stopRecording();
                        break;
                }
            },

            async StartRecording() {
                if (!connected) throw new Error();
                if (recordingState) throw new Error();
                await startRecording();
            },

            async StopRecording() {
                if (!connected) throw new Error();
                if (recordingState !== true && recordingState !== "paused") throw new Error();
                if (recordingState !== "paused") {
                    recordingStopTime = now();
                }
                await stopRecording();
            },

            async PauseRecording() {
                if (!connected) throw new Error();
                if (recordingState !== true) throw new Error();
                pauseRecording();
            },

            async ResumeRecording() {
                if (!connected) throw new Error();
                if (recordingState !== "paused") throw new Error();
                resumeRecording();
            },

            // Replay Buffer

            async StartStopReplayBuffer() {
                if (!connected) throw new Error();
                switch (replayBufferState) {
                    case false:
                    case "stopping":
                        await startReplayBuffer();
                        break;
                    case true:
                    case "starting":
                        await stopReplayBuffer();
                        break;
                }
            },

            async StartReplayBuffer() {
                if (!connected) throw new Error();
                if (replayBufferState) throw new Error();
                await startReplayBuffer();
            },

            async StopReplayBuffer() {
                if (!connected) throw new Error();
                if (replayBufferState !== true) throw new Error();
                await stopReplayBuffer();
            },

            async SaveReplayBuffer() {
                if (!connected) throw new Error();
                await delay(500);
            },

            // Scenes
            async SetCurrentScene(arg) {
                if (!connected) throw new Error();
                if (currentSceneCollection.currentScene?.name === arg["scene-name"]) return;
                const newScene = currentSceneCollection.scenes.find(scene => scene.name === arg["scene-name"]);
                if (!newScene) throw new Error();
                await switchScenes(newScene);
            },

            async GetCurrentScene() {
                if (!connected) throw new Error();
                if (!currentSceneCollection.currentScene) throw new Error();
                return deepClone(currentSceneCollection.currentScene);
            },

            async GetSceneList() {
                if (!connected) throw new Error();
                if (!currentSceneCollection.currentScene) throw new Error();
                return {
                    "current-scene": currentSceneCollection.currentScene.name,
                    scenes: deepClone(currentSceneCollection.scenes)
                };
            },

            // Sources
            async GetSourcesList() {
                if (!connected) throw new Error();
                return {
                    sources: deepClone(currentSceneCollection.sources)
                };
            },

            async GetSourceTypesList() {
                if (!connected) throw new Error();
                return {
                    types: deepClone(sourceTypes) as SourceType[]
                };
            },

            async GetVolume({ source: sourceName, useDecibel }) {
                if (!connected) throw new Error();
                const source = currentSceneCollection.sources.find(source => source.name === sourceName);
                if (!source) throw new Error();
                const sourceType = sourceTypes.find(sourceType => sourceType.typeId === source.typeId);
                if (!sourceType) throw new Error();
                const volume = sourceType.caps.hasAudio ? currentSceneCollection.sourceVolume.get(sourceName) ?? 1.0 : 0.0;
                const muted = sourceType.caps.hasAudio ? currentSceneCollection.sourceMute.get(sourceName) ?? false : true;
                return {
                    name: sourceName,
                    volume: useDecibel ? -(volume * 50) : Math.min(volume, 1.0),
                    muted
                };
            },

            async SetVolume({ source: sourceName, volume, useDecibel }) {
                if (!connected) throw new Error();
                const source = currentSceneCollection.sources.find(source => source.name === sourceName);
                if (!source) throw new Error();
                const sourceType = sourceTypes.find(sourceType => sourceType.typeId === source.typeId);
                if (!sourceType) throw new Error();
                if (!sourceType.caps.hasAudio) return;
                const currentVolume = currentSceneCollection.sourceVolume.get(sourceName) ?? 1.0;
                volume = Math.max(0, Math.min(1.0, useDecibel ? -(volume / 50) : volume));
                if (volume !== currentVolume) {
                    currentSceneCollection.sourceVolume.set(sourceName, volume);
                    this.emit("SourceVolumeChanged", {
                        sourceName,
                        volume
                    });
                }
            },

            async GetMute({ source: sourceName }) {
                if (!connected) throw new Error();
                const source = currentSceneCollection.sources.find(source => source.name === sourceName);
                if (!source) throw new Error();
                const sourceType = sourceTypes.find(sourceType => sourceType.typeId === source.typeId);
                if (!sourceType) throw new Error();
                const muted = sourceType.caps.hasAudio ? currentSceneCollection.sourceMute.get(sourceName) ?? false : true;
                return {
                    name: sourceName,
                    muted
                };
            },

            async SetMute({ source: sourceName, mute }) {
                if (!connected) throw new Error();
                const source = currentSceneCollection.sources.find(source => source.name === sourceName);
                if (!source) throw new Error();
                const sourceType = sourceTypes.find(sourceType => sourceType.typeId === source.typeId);
                if (!sourceType) throw new Error();
                if (!sourceType.caps.hasAudio) return;
                const currentMute = currentSceneCollection.sourceMute.get(sourceName) ?? false;
                if (mute !== currentMute) {
                    currentSceneCollection.sourceMute.set(sourceName, mute);
                    this.emit("SourceMuteStateChanged", {
                        sourceName,
                        muted: mute
                    });
                }
            },

            async ToggleMute({ source: sourceName }) {
                if (!connected) throw new Error();
                const source = currentSceneCollection.sources.find(source => source.name === sourceName);
                if (!source) throw new Error();
                const sourceType = sourceTypes.find(sourceType => sourceType.typeId === source.typeId);
                if (!sourceType) throw new Error();
                if (!sourceType.caps.hasAudio) return;
                const currentMute = currentSceneCollection.sourceMute.get(sourceName) ?? false;
                const mute = !currentMute;
                currentSceneCollection.sourceMute.set(sourceName, mute);
                this.emit("SourceMuteStateChanged", {
                    sourceName,
                    muted: mute
                });
            },

            async GetSourceSettings({ sourceName, sourceType }) {
                const source = currentSceneCollection.sources.find(s => s.name === sourceName && (sourceType === undefined || s.typeId === sourceType));
                if (!source) throw new Error();
                const settings = sourceSettings.get(source.name);
                return {
                    sourceName: source.name,
                    sourceType: source.typeId,
                    sourceSettings: deepClone(settings) || {}
                };
            },

            async SetSourceSettings({ sourceName, sourceType, sourceSettings: newSettings }) {
                const source = currentSceneCollection.sources.find(s => s.name === sourceName && (sourceType === undefined || s.typeId === sourceType));
                if (!source) throw new Error();
                const settings = { ...sourceSettings.get(source.name), ...deepClone(newSettings) };
                sourceSettings.set(source.name, settings);
                return {
                    sourceName: source.name,
                    sourceType: source.typeId,
                    sourceSettings: deepClone(settings)
                };
            },

            async GetSpecialSources() {
                if (!connected) throw new Error();
                return deepClone(currentSceneCollection.specialSources);
            },

            async TakeSourceScreenshot({ sourceName, embedPictureFormat, saveToFilePath, fileFormat, compressionQuality, width, height }) {
                if (!connected) throw new Error();
                return {
                    sourceName,
                    img: embedPictureFormat ? await getFakeScreenshotUri() : undefined,
                    imageFile: saveToFilePath
                };
            },

            // Profiles (TBD)

            // Scene Collections

            async SetCurrentSceneCollection({ "sc-name": name }) {
                if (!connected) throw new Error();
                if (currentSceneCollection.name === name) return;
                const sceneCollection = sceneCollections.find(sc => sc.name === name);
                if (!sceneCollection) throw new Error();
                if (currentSceneCollection !== sceneCollection) {
                    currentSceneCollection = sceneCollection;
                    this.emit("SceneCollectionChanged");
                }
            },

            async GetCurrentSceneCollection() {
                if (!connected) throw new Error();
                return {
                    "sc-name": currentSceneCollection.name
                };
            },

            async ListSceneCollections() {
                if (!connected) throw new Error();
                return {
                    "scene-collections": sceneCollections.map(sc => ({ "sc-name": sc.name }))
                };
            },

            // #region Studio Mode

            async GetStudioModeStatus() {
                if (!connected) throw new Error();
                return {
                    "studio-mode": studioModeState
                };
            },

            async GetPreviewScene() {
                if (!connected) throw new Error();
                if (!studioModeState) throw new Error();
                if (!previewScene) throw new Error();
                return deepClone(previewScene);
            },

            async SetPreviewScene({ "scene-name": name }) {
                if (!connected) throw new Error();
                if (!studioModeState) throw new Error();
                const scene = currentSceneCollection.scenes.find(scene => scene.name === name);
                if (!scene) throw new Error();
                if (previewScene !== scene) {
                    previewScene = scene;
                    this.emit("PreviewSceneChanged", {
                        "scene-name": previewScene.name,
                        sources: deepClone(previewScene.sources)
                    });
                }
            },

            async TransitionToProgram({ "with-transition": transition }) {
                if (!connected) throw new Error();
                if (!studioModeState) throw new Error();
                if (!previewScene) throw new Error();
                if (transition) switchTransition(transition.name, transition.duration);
                await switchScenes(previewScene);
            },

            async EnableStudioMode() {
                if (!connected) throw new Error();
                if (!studioModeState) enableStudioMode();
            },

            async DisableStudioMode() {
                if (!connected) throw new Error();
                if (studioModeState) disableStudioMode();
            },

            async ToggleStudioMode() {
                if (!connected) throw new Error();
                if (studioModeState) {
                    disableStudioMode();
                }
                else {
                    enableStudioMode();
                }
            },

            // #endregion Studio Mode

            // #region Transitions

            async GetTransitionList() {
                if (!connected) throw new Error();
                return {
                    "current-transition": currentSceneCollection.currentTransition.name,
                    transitions: currentSceneCollection.transitions.map(t => ({
                        name: t.name
                    }))
                };
            },

            async GetCurrentTransition() {
                if (!connected) throw new Error();
                return {
                    name: currentSceneCollection.currentTransition.name,
                    duration: currentSceneCollection.currentTransition.type.supportsDuration ? currentSceneCollection.currentTransition.duration : undefined
                };
            },

            async SetCurrentTransition({ "transition-name": name }) {
                if (!connected) throw new Error();
                if (!currentSceneCollection.transitions.some(t => t.name === name)) throw new Error();
                switchTransition(name);
            },

            async SetTransitionDuration({ duration }) {
                if (!connected) throw new Error();
                setTransitionDuration(duration);
            },

            async GetTransitionDuration() {
                if (!connected) throw new Error();
                return {
                    "transition-duration": currentSceneCollection.currentTransition.type.supportsDuration ? currentSceneCollection.currentTransition.duration : -1
                };
            },

            async GetTransitionPosition() {
                if (!connected) throw new Error();
                if (currentTransitionId === 0 || currentSceneCollection.currentTransition.type.name === "Cut") return { position: 1.0 };
                const realDuration = currentSceneCollection.currentTransition.type.supportsDuration ? currentSceneCollection.currentTransition.duration : 300;
                const elapsed = now() - currentTransitionStartTime;
                const position = Math.max(0, Math.min(1, Number(elapsed) / realDuration));
                return { position };
            },

            // #endregion Transitions
        }
    };

    const obs = new FakeObsWebSocket(handlers);
    return obs;

    function updateStreamTimer() {
        if (streamState === true || recordingState === true || recordingState === "paused") {
            if (!streamTimer) {
                streamTimer = setInterval(() => {
                    const streamTime = Number(getStreamingTime() / BigInt(1000));
                    obs.emit("StreamStatus", {
                        streaming: !!streamState,
                        recording: !!recordingState,
                        "replay-buffer-active": replayBufferState === true,
                        "bytes-per-sec": videoBitrate,
                        "kbits-per-sec": Math.floor(videoBitrate / 1024),
                        strain: 0,
                        "total-stream-time": streamTime,
                        "num-total-frames": streamTime * fps,
                        "num-dropped-frames": 0,
                        ...getStats(),
                        "preview-only": false
                    });
                }, 2000) as unknown as NodeJS.Timeout;
                streamTimer.unref?.();
            }
        }
        else {
            if (streamTimer) {
                clearTimeout(streamTimer);
                streamTimer = undefined;
            }
        }
    }

    function updateHeartbeatTimer() {
        if (heartbeat) {
            if (heartbeatTimer === undefined) {
                pulse = false;
                heartbeatTimer = setInterval(() => {
                    pulse = !pulse;
                    const heartbeat: ObsWebSocketEvents["Heartbeat"]["eventArgs"] = {
                        pulse,
                        stats: getStats()
                    };
                    if (currentProfile) {
                        heartbeat["current-profile"] = currentProfile;
                    }
                    if (currentSceneCollection.currentScene) {
                        heartbeat["current-scene"] = currentSceneCollection.currentScene.name;
                    }
                    if (streamState) {
                        heartbeat["streaming"] = true;
                        const streamTime = Number(getStreamingTime() / BigInt(1000));
                        heartbeat["total-stream-time"] = streamTime;
                        heartbeat["total-stream-bytes"] = streamTime * videoBitrate;
                        heartbeat["total-stream-frames"] = streamTime * fps;
                    }
                    if (recordingState) {
                        heartbeat["recording"] = true;
                        const recordTime = Number(getRecordingTime() / BigInt(1000));
                        heartbeat["total-record-time"] = recordTime;
                        heartbeat["total-record-bytes"] = recordTime * videoBitrate;
                        heartbeat["total-record-frames"] = recordTime * fps;
                    }
                    obs.emit("Heartbeat", heartbeat);
                }, 100) as unknown as NodeJS.Timeout;
                heartbeatTimer.unref?.();
            }
        }
        else {
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
            }
            heartbeatTimer = undefined;
        }
    }

    function getStats(): OBSStats {
        const streamTime = Number(getStreamingTime() / BigInt(1000));
        const recordingTime = Number(getRecordingTime() / BigInt(1000));
        return {
            fps,
            "render-total-frames": Math.max(streamTime, recordingTime) * fps,
            "render-missed-frames": 0,
            "output-total-frames": Math.max(streamTime, recordingTime) * fps,
            "output-skipped-frames": 0,
            "average-frame-time": fps * 1000,
            "cpu-usage": os.cpus().reduce((a, cpu) => a, 0),
            "memory-usage": os.freemem() / (1024 * 1024),
            "free-disk-space": 1024
        };
    }

    async function startStreaming() {
        streamState = "starting";
        streamingStartTime = BigInt(0);
        obs.emit("StreamStarting", { "preview-only": false });
        updateStreamTimer();
        await delay(500);
        if (streamState === "starting") {
            streamState = true;
            streamingStartTime = now();
            obs.emit("StreamStarted");
            updateStreamTimer();
        }
    }

    async function stopStreaming() {
        streamState = "stopping";
        obs.emit("StreamStopping", { "preview-only": false });
        updateStreamTimer();
        await delay(500);
        if (streamState === "stopping") {
            streamState = false;
            streamingStartTime = BigInt(0);
            obs.emit("StreamStopped");
            updateStreamTimer();
        }
    }

    async function startRecording() {
        recordingState = "starting";
        recordingStartTime = BigInt(0);
        obs.emit("RecordingStarting");
        updateStreamTimer();
        await delay(500);
        if (recordingState === "starting") {
            recordingState = true;
            recordingStartTime = now();
            obs.emit("RecordingStarted");
            updateStreamTimer();
        }
    }

    async function stopRecording() {
        if (recordingState !== "paused") {
            recordingStopTime = now();
        }
        recordingState = "stopping";
        obs.emit("RecordingStopping");
        updateStreamTimer();
        await delay(500);
        if (recordingState === "stopping") {
            recordingState = false;
            recordingStopTime = BigInt(0);
            obs.emit("RecordingStopped");
            updateStreamTimer();
        }
    }

    function pauseRecording() {
        recordingStopTime = now();
        recordingState = "paused";
        obs.emit("RecordingPaused");
        updateStreamTimer();
    }

    function resumeRecording() {
        const delta = now() - recordingStopTime;
        recordingStartTime += delta;
        recordingStopTime = BigInt(0);
        recordingState = true;
        obs.emit("RecordingResumed");
        updateStreamTimer();
    }

    async function startReplayBuffer() {
        replayBufferState = "starting";
        obs.emit("ReplayStarting");
        updateStreamTimer();
        await delay(500);
        if (replayBufferState === "starting") {
            replayBufferState = true;
            obs.emit("ReplayStarted");
            updateStreamTimer();
        }
    }

    async function stopReplayBuffer() {
        replayBufferState = "stopping";
        obs.emit("ReplayStopping");
        updateStreamTimer();
        await delay(500);
        if (replayBufferState === "stopping") {
            replayBufferState = false;
            obs.emit("ReplayStopped");
            updateStreamTimer();
        }
    }

    function setTransitionDuration(duration: number) {
        if (duration <= 1) return;
        if (!currentSceneCollection.currentTransition.type.supportsDuration) return;
        if (currentSceneCollection.currentTransition.duration === duration) return;
        currentSceneCollection.currentTransition.duration = duration;
        obs.emit("TransitionDurationChanged", {
            "new-duration": duration
        });
    }

    function switchTransition(name: string, duration?: number) {
        if (currentSceneCollection.currentTransition.name !== name) {
            const match = currentSceneCollection.transitions.find(t => t.name === name);
            if (!match) throw new Error();
            currentSceneCollection.currentTransition = match;
            obs.emit("SwitchTransition", {
                "transition-name": name
            });
        }
        if (duration !== undefined) {
            setTransitionDuration(duration);
        }
    }

    async function switchScenes(toScene: Scene) {
        if (currentSceneCollection.currentTransition.type.name !== "Cut") {
            const transitionId = ++nextTransitionId;
            const transitionStartTime = now();
            currentTransitionId = transitionId;
            currentTransitionStartTime = transitionStartTime;
            const name = currentSceneCollection.currentTransition.name;
            const type = currentSceneCollection.currentTransition.type.name;
            const duration = currentSceneCollection.currentTransition.type.supportsDuration ? currentSceneCollection.currentTransition.duration : -1;
            const realDuration = currentSceneCollection.currentTransition.type.supportsDuration ? currentSceneCollection.currentTransition.duration : 300;
            obs.emit("TransitionBegin", {
                name,
                type,
                duration,
                "from-scene": currentSceneCollection.currentScene.name,
                "to-scene": toScene.name
            });
            await delay(realDuration);
            if (currentTransitionId !== transitionId) {
                return;
            }
            obs.emit("TransitionEnd", {
                name,
                type,
                duration,
                "to-scene": toScene.name
            });
            currentTransitionId = 0;
            currentTransitionStartTime = BigInt(0);
        }
        currentSceneCollection.currentScene = toScene;
        obs.emit("SwitchScenes", {
            "scene-name": toScene.name,
            sources: deepClone(toScene.sources)
        });
    }

    function enableStudioMode() {
        studioModeState = true;
        if (!previewScene) {
            previewScene = currentSceneCollection.currentScene;
        }
        if (!previewScene) throw new Error();
        obs.emit("StudioModeSwitched", {
            "new-state": true
        });
    }

    function disableStudioMode() {
        studioModeState = false;
        obs.emit("StudioModeSwitched", {
            "new-state": false
        });
    }

    function now() {
        return BigInt(Math.floor(performance.now()));
    }

    function getStreamingTime() {
        switch (streamState) {
            case "stopping":
                return streamingStopTime - streamingStartTime;
            case "starting":
            case false:
                return BigInt(0);
            case true:
                return now() - streamingStartTime;
        }
    }

    function getRecordingTime() {
        switch (recordingState) {
            case "paused":
            case "stopping":
                return recordingStopTime - recordingStartTime;
            case "starting":
            case false:
                return BigInt(0);
            case true:
                return now() - recordingStartTime;
        }
    }

    function msToTimestamp(ms: bigint) {
        const seconds = ms / BigInt(1000);
        const minutes = seconds / BigInt(60);
        const hoursPart = `${minutes / BigInt(60)}`.padStart(2, "0");
        const minutesPart = `${minutes % BigInt(60)}`.padStart(2, "0");
        const secondsPart = `${seconds % BigInt(60)}`.padStart(2, "0");
        const millisecondsPart = `${ms % BigInt(1000)}`.padStart(3, "0");
        return `${hoursPart}:${minutesPart}:${secondsPart}.${millisecondsPart}`;
    }

    interface SceneCollectionBuilder {
        collection: Omit<SceneCollection, "currentScene" | "currentTransition" | "reset">;
        addTransition(name: string, type: "Cut" | "Fade" | "Swipe" | "Slide" | "Stinger" | "Fade to Color" | "Luma Wipe" | "Shader", duration: number): Transition;
        addSource(name: string, typeId: string, type: "input" | "filter" | "transition" | "scene" | "unknown"): Source;
        addScene(name: string, callback: (builder: SceneBuilder) => void): Scene;
    }

    interface SceneBuilder {
        addSceneItem(sourceName: string): SceneItem;
    }

    function createSceneCollection(name: string, callback: (builder: SceneCollectionBuilder) => void): SceneCollection {
        let nextSceneItemId = 1;
        const collection: SceneCollection = {
            name,
            transitions: [],
            scenes: [],
            sources: [],
            sourceVolume: new Map(),
            sourceMute: new Map(),
            specialSources: {},
            currentScene: undefined!,
            currentTransition: undefined!,
            reset
        };

        reset();

        return collection;

        function reset() {
            nextSceneItemId = 1;
            collection.name = name;
            collection.transitions.length = 0;
            collection.scenes.length = 0;
            collection.sources.length = 0;
            collection.sourceVolume.clear();
            collection.sourceMute.clear();
            collection.specialSources = {};
            collection.currentScene = undefined!;
            collection.currentTransition = undefined!;

            addTransition("Cut", "Cut", -1);
            addTransition("Fade", "Fade", 300);

            callback({
                collection,
                addTransition,
                addSource,
                addScene
            });
    
            if (!collection.currentTransition) {
                collection.currentTransition = collection.transitions[1];
            }
    
            if (!collection.currentScene) {
                collection.currentScene = collection.scenes[0];
            }
        }

        function addTransition(name: string, typeName: string, duration: number) {
            if (collection.transitions.some(t => t.name === name)) throw new Error();
            const type = transitionTypes.find(t => t.name === typeName);
            if (!type) throw new Error();
            if ((type.name === "Cut" || type.name === "Fade") && collection.transitions.some(t => t.type === type)) throw new Error();
            const transition: Transition = { name, type, duration };
            collection.transitions.push(transition);
            return transition;
        }

        function addSource(name: string, typeId: string, type: "input" | "filter" | "transition" | "scene" | "unknown"): Source {
            if (collection.sources.some(s => s.name === name)) throw new Error();
            if (!sourceTypes.some(t => t.typeId === typeId)) throw new Error();
            const source: Source = {
                name,
                typeId,
                type
            };
            collection.sources.push(source);
            return source;
        }

        function addScene(name: string, callback: (builder: SceneBuilder) => void): Scene {
            if (collection.sources.some(s => s.name === name)) throw new Error();
            if (collection.scenes.some(s => s.name === name)) throw new Error();
            const scene: Scene = {
                name,
                sources: []
            };
            callback({
                addSceneItem
            });
            collection.scenes.push(scene);
            addSource(name, "scene", "scene");
            return scene;

            function addSceneItem(sourceName: string): SceneItem {
                const source = collection.sources.find(s => s.name === sourceName);
                if (!source) throw new Error();
                const id = nextSceneItemId++;
                const sceneItem: SceneItem = {
                    name: source.name,
                    id,
                    type: source.typeId,
                    x: 0,
                    y: 0,
                    cx: 0,
                    cy: 0,
                    source_cx: 0,
                    source_cy: 0,
                    alignment: 0,
                    render: true,
                    muted: false,
                    locked: false,
                    volume: 1.0
                };
                scene.sources.push(sceneItem);
                return sceneItem;
            }
        }
    }
}

function deepClone<T>(value: T) {
    let refMap: Map<object, object> | undefined;
    return deepCloneWorker(value);

    function deepCloneWorker<T>(value: T): T {
        if (typeof value !== "object" || value === null) {
            return value;
        }

        const clone = refMap?.get(value as T & object);
        if (clone) return clone as T & object;

        return Array.isArray(value) ? deepCloneArray(value as T & any[]) :
            value instanceof Map ? deepCloneMap(value as T & Map<any, any>) :
            value instanceof Set ? deepCloneSet(value as T & Set<any>) :
            deepCloneObject(value as T & object);
    }

    function deepCloneArray<T extends any[]>(value: T): T {
        const C = value.constructor as typeof Array & (new (...args: any[]) => T);
        const clone = trackClone(value, new C());
        clone.length = value.length;
        for (let i = 0; i < value.length; i++) {
            if (Object.prototype.hasOwnProperty.call(value, i)) {
                clone[i] = value[i];
            }
        }
        return clone;
    }

    function deepCloneMap<T extends Map<any, any>>(value: T): T {
        const C = value.constructor as typeof Map & (new (...args: any[]) => T);
        const clone = trackClone(value, new C());
        for (const [k, v] of value) {
            clone.set(deepCloneWorker(k), deepCloneWorker(v));
        }
        return clone;
    }

    function deepCloneSet<T extends Set<any>>(value: T): T {
        const C = value.constructor as typeof Set & (new (...args: any[]) => T);
        const clone = trackClone(value, new C());
        for (const v of value) {
            clone.add(deepCloneWorker(v));
        }
        return clone;
    }

    function deepCloneObject<T extends object>(value: T): T {
        const clone = trackClone(value, Object.create(Object.getPrototypeOf(value)) as T);
        const descriptors = ownDescriptors(value);
        for (const key of ownKeys(descriptors)) {
            const descriptor = descriptors[key];
            if (descriptor.get || descriptor.set) continue;
            descriptor.value = deepCloneWorker(descriptor.value);
        }
        Object.defineProperties(clone, descriptors);
        return clone;
    }

    function ownKeys<T extends object>(object: T): (keyof T)[];
    function ownKeys<T extends object>(object: T) {
        return Reflect.ownKeys(object);
    }

    function ownDescriptors<T extends object>(object: T): { [P in keyof T]: TypedPropertyDescriptor<T[P]> };
    function ownDescriptors<T extends object>(object: T) {
        return Object.getOwnPropertyDescriptors(object);
    }

    function trackClone<T extends object>(value: T, clone: T) {
        (refMap ||= new Map()).set(value, clone);
        return clone;
    }
}

interface SourceTypeBuilder {
    addSourceType(typeId: string, displayName: string, type: "input" | "filter" | "transition" | "other", caps: Partial<SourceTypeCapabilities>, defaultSettings?: Record<string, unknown>): SourceType;
}

const sourceTypes = createSourceTypes(({ addSourceType }) => {
    addSourceType("scene", "Scene", "other", { doNotDuplicate: true, hasVideo: true, isComposite: true });
    addSourceType("group", "Group", "other", { hasVideo: true, isComposite: true });
    addSourceType("audio_line", "Audio line (internal use only)", "input", { hasAudio: true });
    addSourceType("image_source", "Image", "input", { hasVideo: true });
    addSourceType("color_source", "Color Source", "input", { hasVideo: true });
    addSourceType("color_source_v2", "Color Source", "input", { hasVideo: true });
    addSourceType("color_source_v3", "Color Source", "input", { hasVideo: true });
    addSourceType("slideshow", "Image Slide Show", "input", { hasVideo: true, isComposite: true });
    addSourceType("browser_source", "Browser", "input", { canInteract: true, doNotDuplicate: true, hasAudio: true, hasVideo: true });
    addSourceType("ffmpeg_source", "Media Source", "input", { doNotDuplicate: true, hasAudio: true, hasVideo: true, isAsync: true });
    addSourceType("mask_filter", "Image Mask/Blend", "filter", { hasVideo: true });
    addSourceType("crop_filter", "Crop/Pad", "filter", { hasVideo: true });
    addSourceType("gain_filter", "Gain", "filter", { hasAudio: true, isAsync: true });
    addSourceType("color_filter", "Color Correction", "filter", { hasVideo: true });
    addSourceType("scale_filter", "Scaling/Aspect Ratio", "filter", { hasVideo: true });
    addSourceType("scroll_filter", "Scroll", "filter", { hasVideo: true });
    addSourceType("gpu_delay", "Render Delay", "filter", { hasVideo: true });
    addSourceType("color_key_filter", "Color Key", "filter", { hasVideo: true });
    addSourceType("clut_filter", "Apply LUT", "filter", { hasVideo: true });
    addSourceType("sharpness_filter", "Sharpen", "filter", { hasVideo: true });
    addSourceType("chroma_key_filter", "Chroma Key", "filter", { hasVideo: true });
    addSourceType("async_delay_filter", "Video Delay (Async)", "filter", { hasVideo: true, isAsync: true });
    addSourceType("noise_suppress_filter", "Noise Suppression", "filter", { hasAudio: true, isAsync: true });
    addSourceType("noise_suppress_filter_v2", "Noise Suppression", "filter", { hasAudio: true, isAsync: true });
    addSourceType("invert_polarity_filter", "Invert Polarity", "filter", { hasAudio: true, isAsync: true });
    addSourceType("noise_gate_filter", "Noise Gate", "filter", { hasAudio: true, isAsync: true });
    addSourceType("compressor_filter", "Compressor", "filter", { hasAudio: true, isAsync: true });
    addSourceType("limiter_filter", "Limiter", "filter", { hasAudio: true, isAsync: true });
    addSourceType("expander_filter", "Expander", "filter", { hasAudio: true, isAsync: true });
    addSourceType("luma_key_filter", "Luma Key", "filter", { hasVideo: true });
    addSourceType("text_gdiplus", "Text (GDI+)", "input", { hasVideo: true });
    addSourceType("text_gdiplus_v2", "Text (GDI+)", "input", { hasVideo: true });
    addSourceType("cut_transition", "Cut", "transition", { hasVideo: true, isComposite: true });
    addSourceType("fade_transition", "Fade", "transition", { hasVideo: true, isComposite: true });
    addSourceType("swipe_transition", "Swipe", "transition", { hasVideo: true, isComposite: true });
    addSourceType("slide_transition", "Slide", "transition", { hasVideo: true, isComposite: true });
    addSourceType("obs_stinger_transition", "Stinger", "transition", { hasVideo: true, isComposite: true });
    addSourceType("fade_to_color_transition", "Fade to Color", "transition", { hasVideo: true, isComposite: true });
    addSourceType("wipe_transition", "Luma Wipe", "transition", { hasVideo: true, isComposite: true });
    addSourceType("vst_filter", "VST 2.x Plug-in", "filter", { hasAudio: true, isAsync: true });
    addSourceType("streamfx-filter-blur", "Blur", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-blur", "Blur", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-color-grade", "Color Grading", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-color-grade", "Color Grading", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-displacement", "Displacement Mapping", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-displacement", "Displacement Mapping", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-dynamic-mask", "Dynamic Mask", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-dynamic-mask", "Dynamic Mask", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-sdf-effects", "SDF Effects", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-sdf-effects", "SDF Effects", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-shader", "Shader", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-shader", "Shader", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-filter-transform", "3D Transform", "filter", { hasVideo: true });
    addSourceType("obs-stream-effects-filter-transform", "3D Transform", "filter", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-source-mirror", "Source Mirror", "input", { hasAudio: true, hasVideo: true });
    addSourceType("obs-stream-effects-source-mirror", "Source Mirror", "input", { hasAudio: true, hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-source-shader", "Shader", "input", { hasVideo: true });
    addSourceType("obs-stream-effects-source-shader", "Shader", "input", { hasVideo: true, isDeprecated: true });
    addSourceType("streamfx-transition-shader", "Shader", "transition", { hasVideo: true, isComposite: true });
    addSourceType("obs-stream-effects-transition-shader", "Shader", "transition", { hasVideo: true, isComposite: true, isDeprecated: true });
    addSourceType("text_ft2_source", "Text (FreeType 2)", "input", { hasVideo: true });
    addSourceType("text_ft2_source_v2", "Text (FreeType 2)", "input", { hasVideo: true, isDeprecated: true });
    addSourceType("vlc_source", "VLC Video Source", "input", { doNotDuplicate: true, hasAudio: true, hasVideo: true, isAsync: true });
    addSourceType("monitor_capture", "Display Capture", "input", { doNotDuplicate: true, hasVideo: true });
    addSourceType("window_capture", "Window Capture", "input", { hasVideo: true });
    addSourceType("game_capture", "Game Capture", "input", { doNotDuplicate: true, hasVideo: true });
    addSourceType("dshow_input", "Video Capture Device", "input", { doNotDuplicate: true, hasAudio: true, hasVideo: true, isAsync: true });
    addSourceType("wasapi_input_capture", "Audio Input Capture", "input", { doNotDuplicate: true, hasAudio: true });
    addSourceType("wasapi_output_capture", "Audio Output Capture", "input", { doNotDuplicate: true, doNotSelfMonitor: true, hasAudio: true });
});

function createSourceTypes(callback: (builder: SourceTypeBuilder) => void): readonly SourceType[] {
    const sourceTypes: SourceType[] = [];
    callback({ addSourceType });
    return sourceTypes;

    function addSourceType(typeId: string, displayName: string, type: "input" | "filter" | "transition" | "other", caps: Partial<SourceTypeCapabilities>, defaultSettings?: Record<string, unknown>): SourceType {
        if (sourceTypes.some(t => t.typeId === typeId)) throw new Error();
        const sourceType: SourceType = {
            typeId,
            displayName,
            type,
            defaultSettings: defaultSettings ?? {},
            caps: {
                isAsync: false,
                hasVideo: false,
                hasAudio: false,
                canInteract: false,
                isComposite: false,
                doNotDuplicate: false,
                doNotSelfMonitor: false,
                isDeprecated: false,
                ...caps
            }
        };
        sourceTypes.push(sourceType);
        return sourceType;
    }
}