// #region Typedefs

/**
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#sceneitem}.
 */
export interface SceneItem {
    /**
     * The name of this Scene Item.
     */
    name: string;
    /**
     * Scene item ID.
     */
    id: number; // int
    /**
     * The typeId of the source type.
     */
    type: string;
    /**
     * The volume of the scene item.
     */
    volume: number; // double
    /**
     * The _x_ position of the scene item.
     */
    x: number; // double
    /**
     * The _y_ position of the scene item.
     */
    y: number; // double
    /**
     * The source width of the scene item.
     */
    source_cx: number; // int
    /**
     * The source height of the scene item.
     */
    source_cy: number; // int
    /**
     * Whether or not this Scene Item is muted.
     */
    muted: boolean;
    /**
     * The point on the source that the item is manipulated from. A bitwise combination of {@link Alignment} flags, or omit to center on that axis.
     */
    alignment: Alignment; // int
    /**
     * The scaled height of the scene item.
     */
    cy: number; // double
    /**
     * The scaled width of the scene item.
     */
    cx: number; // double
    /**
     * Whether or not this Scene Item is visible in the Scene.
     */
    render: boolean;
    /**
     * Whether or not this Scene Item is locked and can't be moved around.
     */
    locked: boolean;
    /**
     * Name of this item's parent (if this item belongs to a group).
     */
    parentGroupName?: string;
    /**
     * List of children (if this item is a group).
     */
    groupChildren?: SceneItem[];
}

/**
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#sceneitemtransform}.
 */
export interface SceneItemTransform {
    /**
     * The position and alignment of the scene item.
     */
    position: {
        /**
         * The _x_ position of the scene item from the left.
         */
        x: number; // double
        /**
         * The _y_ position of the scene item from the top.
         */
        y: number; // double
        /**
         * The point on the scene item that the item is manipulated from.
         */
        alignment: Alignment; // int
    };
    /**
     * The clockwise rotation of the scene item in degrees around the point of alignment.
     */
    rotation: number; // double
    /**
     * The _x_ and _y_ scale factors of the scene item.
     */
    scale: {
        /**
         * The _x_-scale factor of the scene item.
         */
        x: number; // double
        /**
         * The _y_-scale factor of the scene item.
         */
        y: number; // double
    };
    /**
     * The crop offsets for the scene item.
     */
    crop: {
        /**
         * The number of pixels cropped off the top of the scene item before scaling.
         */
        top: number; // int
        /**
         * The number of pixels cropped off the right of the scene item before scaling.
         */
        right: number; // int
        /**
         * The number of pixels cropped off the bottom of the scene item before scaling.
         */
        bottom: number; // int
        /**
         * The number of pixels cropped off the left of the scene item before scaling.
         */
        left: number; // int
    };
    /**
     * Whether the scene item is visible.
     */
    visible: boolean;
    /**
     * Whether the scene item is locked in position.
     */
    locked: boolean;
    /**
     * The bounding box for the scene item.
     */
    bounds: {
        /**
         * Type of bounding box.
         */
        type: BoundingBoxType;
        /**
         * Alignment of the bounding box.
         */
        alignment: Alignment; // int
        /**
         * Width of the bounding box.
         */
        x: number; // int
        /**
         * Height of the bounding box.
         */
        y: number; // int
    };
    /**
     * Base width (without scaling) of the source.
     */
    sourceWidth: number; // int
    /**
     * Base height (without scaling) of the source.
     */
    sourceHeight: number; // int
    /**
     * Scene item width (base source width multiplied by the horizontal scaling factor).
     */
    width: number; // double
    /**
     * Scene item height (base source height multiplied by the vertical scaling factor).
     */
    height: number; // double
    /**
     * Name of the item's parent (if this item belongs to a group).
     */
    parentGroupName?: string;
    /**
     * List of children (if this item is a group).
     */
    groupChildren?: SceneItemTransform[];
}

/**
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#obsstats}.
 */
export interface OBSStats {
    /**
     * Current framerate.
     */
    fps: number; // double
    /**
     * Number of frames rendered.
     */
    "render-total-frames": number; // int
    /**
     * Number of frames missed due to rendering lag.
     */
    "render-missed-frames": number; // int
    /**
     * Number of frames outputted.
     */
    "output-total-frames": number; // int
    /**
     * Number of frames skipped due to encoding lag.
     */
    "output-skipped-frames": number; // int
    /**
     * Average frame render time (in milliseconds).
     */
    "average-frame-time": number; // double
    /**
     * Current CPU usage (percentage).
     */
    "cpu-usage": number; // double
    /**
     * Current RAM usage (in megabytes).
     */
    "memory-usage": number; // double
    /**
     * Free recording disk space (in megabytes).
     */
    "free-disk-space": number; // double
}

/**
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#output}.
 */
export interface Output {
    /**
     * Output name.
     */
    name: string;
    // TODO: determine if this is a fixed or dynamic list
    /**
     * Output type/kind.
     */
    type: string;
    /**
     * Video output width.
     */
    width: number; // int
    /**
     * Video output height.
     */
    height: number; // int
    /**
     * Output flags.
     */
    flags: {
        /**
         * Raw flags value.
         */
        rawValue: number; // int
        /**
         * Output uses audio.
         */
        audio: boolean;
        /**
         * Output uses video.
         */
        video: boolean;
        /**
         * Output is encoded.
         */
        encoded: boolean;
        /**
         * Output uses several audio tracks.
         */
        multiTrack: boolean;
        /**
         * Output uses a service.
         */
        service: boolean;
    };
    /**
     * Output settings.
     */
    settings: Record<string, unknown>;
    /**
     * Output status (active or not).
     */
    active: boolean;
    /**
     * Output reconnection status (reconnecting or not).
     */
    reconnecting: boolean;
    /**
     * Output congestion.
     */
    congestion: number; // double
    /**
     * Number of frames sent.
     */
    totalFrames: number; // int
    /**
     * Number of frames dropped.
     */
    droppedFrames: number; // int
    /**
     * Total bytes sent.
     */
    totalBytes: number; // int
}

/**
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#scene}.
 */
export interface Scene {
    /** 
     * Name of the scene.
     */
    name: string;
    /** 
     * Ordered list of the scene's source items.
     */
    sources: SceneItem[];
}

/**
 * See `font.flags` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#gettextgdiplusproperties}
 */
export const enum FontFlags {
    None = 0,
    Bold = 1,
    Italic = 2,
    BoldItalic = Bold | Italic,
    Underline = 5,
    Strikeout = 8,
}

/**
 * Format of the Data URI encoded picture. Can be "png", "jpg", "jpeg" or "bmp" (or any other value supported by Qt's Image module)
 *
 * See `embedPictureFormat` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#takesourcescreenshot}
 */
export type ImageFormat =
    | "png"
    | "jpg"
    | "jpeg"
    | "bmp"
    | "gif"
    | "pbm"
    | "pgm"
    | "ppm"
    | "xbm"
    | "xpm";

/**
 * The type of bounding box.
 * c
 * See `bounds.type` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#sceneitemtransform}
 */
export type BoundingBoxType = `OBS_BOUNDS_${"NONE" | "STRETCH" | `SCALE_${"INNER" | "OUTER" | `TO_${"WIDTH" | "HEIGHT"}`}` | "MAX_ONLY"}`

/**
 * The point on the source that the item is manipulated from.
 *
 * See `alignment` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#sceneitem}
 */
export const enum Alignment {
    Center = 0,         // OBS_ALIGN_CENTER
    Left = 1 << 0,      // OBS_ALIGN_LEFT
    Right = 1 << 1,     // OBS_ALIGN_RIGHT
    Top = 1 << 2,       // OBS_ALIGN_TOP
    Bottom = 1 << 3,    // OBS_ALIGN_BOTTOM
}

export type Movement =
    | "up"              // OBS_ORDER_MOVE_UP
    | "down"            // OBS_ORDER_MOVE_DOWN
    | "top"             // OBS_ORDER_MOVE_TOP
    | "bottom"          // OBS_ORDER_MOVE_BOTTOM
    ;

export interface SceneItemNameSpec {
    /**
     * The name of the scene item.
     */
    name: string;
}

export interface SceneItemIdSpec extends Partial<SceneItemNameSpec> {
    /**
     * The scene-specific ID of the item.
     */
    id: number;
}

/**
 * A reference used to specify a {@link SceneItem}.
 */
export type SceneItemSpec =
    | SceneItemNameSpec
    | SceneItemIdSpec
    ;

/**
 * A reference to a {@link SceneItem}.
 */
export interface SceneItemRef {
    id: number;
    name: string;
}

/**
 * Type IDs for {@link SourceType} objects added by OBS.
 */
export type ObsSourceTypeId =
    | "scene"
    | "group"
    | "audio_line"
    | "image_source"
    | "color_source"
    | "color_source_v2"
    | "color_source_v3"
    | "slideshow"
    | "browser_source"
    | "ffmpeg_source"
    | "mask_filter"
    | "crop_filter"
    | "gain_filter"
    | "color_filter"
    | "scale_filter"
    | "scroll_filter"
    | "gpu_delay"
    | "color_key_filter"
    | "clut_filter"
    | "sharpness_filter"
    | "chroma_key_filter"
    | "async_delay_filter"
    | "noise_suppress_filter"
    | "noise_suppress_filter_v2"
    | "invert_polarity_filter"
    | "noise_gate_filter"
    | "compressor_filter"
    | "limiter_filter"
    | "expander_filter"
    | "luma_key_filter"
    | "text_gdiplus"
    | "text_gdiplus_v2"
    | "cut_transition"
    | "fade_transition"
    | "swipe_transition"
    | "slide_transition"
    | "obs_stinger_transition"
    | "fade_to_color_transition"
    | "wipe_transition"
    | "vst_filter"
    | "text_ft2_source"
    | "text_ft2_source_v2"
    | "vlc_source"
    | "monitor_capture"
    | "window_capture"
    | "game_capture"
    | "dshow_input"
    | "wasapi_input_capture"
    | "wasapi_output_capture"
    ;

/**
 * The Type IDs for {@link SourceType} objects deprecated in OBS.
 */
export type DeprecatedSourceTypeId =
    | "obs-stream-effects-filter-blur"
    | "obs-stream-effects-filter-color-grade"
    | "obs-stream-effects-filter-displacement"
    | "obs-stream-effects-filter-dynamic-mask"
    | "obs-stream-effects-filter-sdf-effects"
    | "obs-stream-effects-filter-shader"
    | "obs-stream-effects-filter-transform"
    | "obs-stream-effects-source-mirror"
    | "obs-stream-effects-source-shader"
    | "obs-stream-effects-transition-shader"
    ;

/**
 * The Type IDs for {@link SourceType} objects added by StreamFX.
 */
export type StreamFxSourceTypeId =
    | "obs-stream-effects-filter-blur"
    | "obs-stream-effects-filter-color-grade"
    | "obs-stream-effects-filter-displacement"
    | "obs-stream-effects-filter-dynamic-mask"
    | "obs-stream-effects-filter-sdf-effects"
    | "obs-stream-effects-filter-shader"
    | "obs-stream-effects-filter-transform"
    | "obs-stream-effects-source-mirror"
    | "obs-stream-effects-source-shader"
    | "obs-stream-effects-transition-shader"
    | "streamfx-filter-blur"
    | "streamfx-filter-color-grade"
    | "streamfx-filter-displacement"
    | "streamfx-filter-dynamic-mask"
    | "streamfx-filter-sdf-effects"
    | "streamfx-filter-shader"
    | "streamfx-filter-transform"
    | "streamfx-source-mirror"
    | "streamfx-source-shader"
    | "streamfx-transition-shader"
    ;

declare const kOtherSourceType: unique symbol;

/**
 * The TypeID for other {@link SourceType} objects added by other plugins.
 */
export type OtherSourceTypeId = string & { [kOtherSourceType]?: never };

/**
 * The TypeId for a {@link SourceType}.
 */
export type SourceTypeId =
    | ObsSourceTypeId
    | DeprecatedSourceTypeId
    | StreamFxSourceTypeId
    | OtherSourceTypeId
    ;

/**
 * The kind of {@link Source} provided by a {@link SourceType}.
 */
export type SourceTypeKind =
    | "input"
    | "filter"
    | "transition"
    | "other" // possibly an output, encoder, or service
    ;

/**
 * A source type.
 *
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getsourcetypeslist}.
 */
export interface SourceType {
    /** 
     * Non-unique internal source type ID.
     */
    typeId: SourceTypeId;
    /** 
     * Display name of the source type.
     */
    displayName: string;
    /** 
     * The kind of {@link Source} provided by this source type.
     */
    type: SourceTypeKind;
    /** 
     * The default settings of this source type.
     */
    defaultSettings: Record<string, unknown>;
    /** 
     * The capabilities of the source type.
     */
    caps: SourceTypeCapabilities;
}

/**
 * The capabilities of a {@link SourceType}.
 *
 * See `types.*.caps` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getsourcetypeslist}.
 */
export interface SourceTypeCapabilities {
    /**
     * True if source of this type provide frames asynchronously.
     */
    isAsync: boolean;
    /**
     * True if sources of this type provide video.
     */
    hasVideo: boolean;
    /**
     * True if sources of this type provide audio.
     */
    hasAudio: boolean;
    /**
     * True if interaction with this sources of this type is possible.
     */
    canInteract: boolean;
    /**
     * True if sources of this type composite one or more sub-sources.
     */
    isComposite: boolean;
    /**
     * True if sources of this type should not be fully duplicated.
     */
    doNotDuplicate: boolean;
    /**
     * True if sources of this type may cause a feedback loop if it's audio is monitored and shouldn't be.
     */
    doNotSelfMonitor: boolean;
    /**
     * Whether the source type is deprecated.
     */
    isDeprecated?: boolean;
}

/**
 * The kind of {@link Source}.
 *
 * See `sources.*.type` in {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getsourceslist}.
 */
export type SourceKind =
    | "input"       // OBS_SOURCE_TYPE_INPUT
    | "filter"      // OBS_SOURCE_TYPE_FILTER
    | "transition"  // OBS_SOURCE_TYPE_TRANSITION
    | "scene"       // OBS_SOURCE_TYPE_SCENE
    | "unknown"     // an unknown source type due to a newer version of OBS Studio
    ;

/**
 * A source in the running OBS instance.
 *
 * See {@link https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getsourceslist}
 */
export interface Source {
    /**
     * Unique source name.
     */
    name: string;
    /**
     * Non-unique source internal type.
     */
    typeId: SourceTypeId;
    /**
     * The kind of source.
     */
    type: SourceKind;
}

export interface Transition {
    name: string;
    duration?: number;
}

export interface SpecialSources {
    "desktop-1"?: string;
    "desktop-2"?: string;
    "mic-1"?: string;
    "mic-2"?: string;
    "mic-3"?: string;
}

// #endregion

export type ObsWebSocketRequestArgs<K extends keyof ObsWebSocketRequests> = [ObsWebSocketRequests[K]["request"]] extends [void] ? [] : [request: ObsWebSocketRequests[K]["request"]];
export type ObsWebSocketRequest<K extends keyof ObsWebSocketRequests> = ObsWebSocketRequests[K]["request"];
export type ObsWebSocketResponse<K extends keyof ObsWebSocketRequests> = ObsWebSocketRequests[K]["response"];

export interface ObsWebSocketRequestDescriptor<Request, Response> {
    request: Request;
    response: Response;
};

export interface ObsWebSocketRequests {
    // #region General

    /**
     * Returns the latest version of the plugin and the API.
     * @since 0.3
     */
    GetVersion: ObsWebSocketRequestDescriptor<GetVersionRequest, GetVersionResponse>;

    /**
     * Tells the client if authentication is required. If so, returns authentication parameters.
     * @since 0.3
     */
    GetAuthRequired: ObsWebSocketRequestDescriptor<GetAuthRequiredRequest, GetAuthRequiredResponse>;

    /**
     * Attempt to authenticat the client to the server.
     * @since 0.3
     */
    Authenticate: ObsWebSocketRequestDescriptor<AuthenticateRequest, AuthenticateResponse>;

    /**
     * Enable/disable sending of the Heartbeat event.
     * @since 4.3.0
     * @deprecated since 4.9.0
     */
    SetHeartbeat: ObsWebSocketRequestDescriptor<SetHeartbeatRequest, SetHeartbeatResponse>;

    /**
     * Set the filename formatting string.
     * @since 4.3.0
     */
    SetFilenameFormatting: ObsWebSocketRequestDescriptor<SetFilenameFormattingRequest, SetFilenameFormattingResponse>;

    /**
     * Get the filename formatting string.
     * @since 4.3.0
     */
    GetFilenameFormatting: ObsWebSocketRequestDescriptor<GetFilenameFormattingRequest, GetFilenameFormattingResponse>;

    /**
     * Get OBS stats.
     * @since 4.6.0
     */
    GetStats: ObsWebSocketRequestDescriptor<GetStatsRequest, GetStatsResponse>;

    /**
     * Broadcast custom message to all connected WebSocket clients.
     * @since 4.7.0
     */
    BroadcastCustomMessage: ObsWebSocketRequestDescriptor<BroadcastCustomMessageRequest, BroadcastCustomMessageResponse>;

    /**
     * Get basic OBS video information.
     * @since 4.6.0
     */
    GetVideoInfo: ObsWebSocketRequestDescriptor<GetVideoInfoRequest, GetVideoInfoResponse>;

    /**
     * Open a projector window or create a projector on a monitor. Rquires OBS v24.0.4 or newer.
     * @since 4.8.0
     */
    OpenProjector: ObsWebSocketRequestDescriptor<OpenProjectorRequest, OpenProjectorResponse>;

    // TriggerHotkeyByName (unreleased)
    // TriggerHotkeyBySequence (unreleased)

    // #endregion General

    // #region Media Control

    // PlayPauseMedia (unreleased)
    // RestartMedia (unreleased)
    // StopMedia (unreleased)
    // NextMedia (unreleased)
    // PreviousMedia (unreleased)
    // GetMediaDuration (unreleased)
    // GetMediaTime (unreleased)
    // SetMediaTime (unreleased)
    // ScrubMedia (unreleased)
    // GetMediaState (unreleased)

    // #endregion Media Control

    // #region Sources

    // GetMediaSourcesList (unreleased)

    /**
     * List all sources available in the running OBS instance.
     * @since 4.3.0
     */
    GetSourcesList: ObsWebSocketRequestDescriptor<GetSourcesListRequest, GetSourcesListResponse>;

    /**
     * Get a list of all available source types.
     * @since 4.3.0
     */
    GetSourceTypesList: ObsWebSocketRequestDescriptor<GetSourceTypesListRequest, GetSourceTypesListResponse>;

    /**
     * Get the volume of the specified source. Default response uses mul format, NOT SLIDER PERCENTAGE.
     * @since 4.0.0
     */
    GetVolume: ObsWebSocketRequestDescriptor<GetVolumeRequest, GetVolumeResponse>;

    /**
     * Get the volume of the specified source. Default response uses mul format, NOT SLIDER PERCENTAGE.
     * @since 4.0.0
     */
    SetVolume: ObsWebSocketRequestDescriptor<SetVolumeRequest, SetVolumeResponse>;

    /**
     * Get the mute status of a specified source.
     * @since 4.0.0
     */
    GetMute: ObsWebSocketRequestDescriptor<GetMuteRequest, GetMuteResponse>;

    /**
     * Sets the mute status of a specified source.
     * @since 4.0.0
     */
    SetMute: ObsWebSocketRequestDescriptor<SetMuteRequest, SetMuteResponse>;

    /**
     * Inverts the mute status of a specified source.
     * @since 4.0.0
     */
    ToggleMute: ObsWebSocketRequestDescriptor<ToggleMuteRequest, ToggleMuteResponse>;

    // GetAudioActive (unreleased)

    /**
     * Sets a new name of an existing source. If the new name already exists as a source, obs-websocket will return an error.
     * @since 4.8.0
     */
    SetSourceName: ObsWebSocketRequestDescriptor<SetSourceNameRequest, SetSourceNameResponse>;

    /**
     * Set the audio sync offset of a specified source.
     * @since 4.2.0
     */
    SetSyncOffset: ObsWebSocketRequestDescriptor<SetSyncOffsetRequest, SetSyncOffsetResponse>;

    /**
     * Get the audio sync offset of a specified source.
     * @since 4.2.0
     */
    GetSyncOffset: ObsWebSocketRequestDescriptor<GetSyncOffsetRequest, GetSyncOffsetResponse>;

    /**
     * Get settings of the specified source.
     * @since 4.3.0
     */
    GetSourceSettings: ObsWebSocketRequestDescriptor<GetSourceSettingsRequest, GetSourceSettingsResponse>;

    /**
     * Set settings of the specified source.
     * @since 4.3.0
     */
    SetSourceSettings: ObsWebSocketRequestDescriptor<SetSourceSettingsRequest, SetSourceSettingsResponse>;

    /**
     * Get the current properties of a Text GDI+ source.
     * @since 4.1.0
     */
    GetTextGDIPlusProperties: ObsWebSocketRequestDescriptor<GetTextGDIPlusPropertiesRequest, GetTextGDIPlusPropertiesResponse>;

    /**
     * Set the current properties of a Text GDI+ source.
     * @since 4.1.0
     */
    SetTextGDIPlusProperties: ObsWebSocketRequestDescriptor<SetTextGDIPlusPropertiesRequest, SetTextGDIPlusPropertiesResponse>;

    /**
     * Get the current properties of a Text Freetype2 source.
     * @since 4.5.0
     */
    GetTextFreetype2Properties: ObsWebSocketRequestDescriptor<GetTextFreetype2PropertiesRequest, GetTextFreetype2PropertiesResponse>;

    /**
     * Set the current properties of a Text Freetype2 source.
     * @since 4.5.0
     */
    SetTextFreetype2Properties: ObsWebSocketRequestDescriptor<SetTextFreetype2PropertiesRequest, SetTextFreetype2PropertiesResponse>;

    /**
     * @since 4.1.0
     * @deprecated since 4.8.0. Use `GetSourceSettings` instead.
     */
    GetBrowserSourceProperties: ObsWebSocketRequestDescriptor<GetBrowserSourcePropertiesRequest, GetBrowserSourcePropertiesResponse>;

    /**
     * @since 4.1.0
     * @deprecated since 4.8.0. Use `SetSourceSettings` instead.
     */
    SetBrowserSourceProperties: ObsWebSocketRequestDescriptor<SetBrowserSourcePropertiesRequest, SetBrowserSourcePropertiesResponse>;

    /**
     * @since 4.1.0
     */
    GetSpecialSources: ObsWebSocketRequestDescriptor<GetSpecialSourcesRequest, GetSpecialSourcesResponse>;

    /**
     * @since 4.5.0
     */
    GetSourceFilters: ObsWebSocketRequestDescriptor<GetSourceFiltersRequest, GetSourceFiltersResponse>;

    /**
     * @since 4.7.0
     */
    GetSourceFilterInfo: ObsWebSocketRequestDescriptor<GetSourceFilterInfoRequest, GetSourceFilterInfoResponse>;

    /**
     * @since 4.5.0
     */
    AddFilterToSource: ObsWebSocketRequestDescriptor<AddFilterToSourceRequest, AddFilterToSourceResponse>;

    /**
     * @since 4.5.0
     */
    RemoveFilterFromSource: ObsWebSocketRequestDescriptor<RemoveFilterFromSourceRequest, RemoveFilterFromSourceResponse>;

    /**
     * @since 4.5.0
     */
    ReorderSourceFilter: ObsWebSocketRequestDescriptor<ReorderSourceFilterRequest, ReorderSourceFilterResponse>;

    /**
     * @since 4.5.0
     */
    MoveSourceFilter: ObsWebSocketRequestDescriptor<MoveSourceFilterRequest, MoveSourceFilterResponse>;

    /**
     * @since 4.5.0
     */
    SetSourceFilterSettings: ObsWebSocketRequestDescriptor<SetSourceFilterSettingsRequest, SetSourceFilterSettingsResponse>;

    /**
     * @since 4.7.0
     */
    SetSourceFilterVisibility: ObsWebSocketRequestDescriptor<SetSourceFilterVisibilityRequest, SetSourceFilterVisibilityResponse>;

    /**
     * @since 4.8.0
     */
    GetAudioMonitorType: ObsWebSocketRequestDescriptor<GetAudioMonitorTypeRequest, GetAudioMonitorTypeResponse>;

    /**
     * @since 4.8.0
     */
    SetAudioMonitorType: ObsWebSocketRequestDescriptor<SetAudioMonitorTypeRequest, SetAudioMonitorTypeResponse>;

    /**
     * @since 4.6.0
     */
    TakeSourceScreenshot: ObsWebSocketRequestDescriptor<TakeSourceScreenshotRequest, TakeSourceScreenshotResponse>;

    // #endregion Sources

    // #region Outputs

    /**
     * @since 4.7.0
     */
    ListOutputs: ObsWebSocketRequestDescriptor<ListOutputsRequest, ListOutputsResponse>;

    /**
     * @since 4.7.0
     */
    GetOutputInfo: ObsWebSocketRequestDescriptor<GetOutputInfoRequest, GetOutputInfoResponse>;

    /**
     * @since 4.7.0
     */
    StartOutput: ObsWebSocketRequestDescriptor<StartOutputRequest, StartOutputResponse>;

    /**
     * @since 4.7.0
     */
    StopOutput: ObsWebSocketRequestDescriptor<StopOutputRequest, StopOutputResponse>;

    // #endregion Outputs

    // #region Profiles

    /**
     * @since 4.0.0
     */
    SetCurrentProfile: ObsWebSocketRequestDescriptor<SetCurrentProfileRequest, SetCurrentProfileResponse>;

    /**
     * @since 4.0.0
     */
    GetCurrentProfile: ObsWebSocketRequestDescriptor<GetCurrentProfileRequest, GetCurrentProfileResponse>;

    /**
     * @since 4.0.0
     */
    ListProfiles: ObsWebSocketRequestDescriptor<ListProfilesRequest, ListProfilesResponse>;

    // #endregion Profiles

    // #region Recording

    // GetRecordingStatus (unreleased)

    /**
     * @since 0.3
     */
    StartStopRecording: ObsWebSocketRequestDescriptor<StartStopRecordingRequest, StartStopRecordingResponse>;

    /**
     * @since 4.1.0
     */
    StartRecording: ObsWebSocketRequestDescriptor<StartRecordingRequest, StartRecordingResponse>;

    /**
     * @since 4.1.0
     */
    StopRecording: ObsWebSocketRequestDescriptor<StopRecordingRequest, StopRecordingResponse>;

    /**
     * @since 4.7.0
     */
    PauseRecording: ObsWebSocketRequestDescriptor<PauseRecordingRequest, PauseRecordingResponse>;

    /**
     * @since 4.7.0
     */
    ResumeRecording: ObsWebSocketRequestDescriptor<ResumeRecordingRequest, ResumeRecordingResponse>;

    /**
     * @since 4.1.0
     */
    SetRecordingFolder: ObsWebSocketRequestDescriptor<SetRecordingFolderRequest, SetRecordingFolderResponse>;

    /**
     * @since 4.1.0
     */
    GetRecordingFolder: ObsWebSocketRequestDescriptor<GetRecordingFolderRequest, GetRecordingFolderResponse>;

    // #endregion Recording

    // #region Replay Buffer

    // GetReplayBufferStatus (unreleased)

    /**
     * @since 4.2.0
     */
    StartStopReplayBuffer: ObsWebSocketRequestDescriptor<StartStopReplayBufferRequest, StartStopReplayBufferResponse>;

    /**
     * @since 4.2.0
     */
    StartReplayBuffer: ObsWebSocketRequestDescriptor<StartReplayBufferRequest, StartReplayBufferResponse>;

    /**
     * @since 4.2.0
     */
    StopReplayBuffer: ObsWebSocketRequestDescriptor<StopReplayBufferRequest, StopReplayBufferResponse>;

    /**
     * @since 4.2.0
     */
    SaveReplayBuffer: ObsWebSocketRequestDescriptor<SaveReplayBufferRequest, SaveReplayBufferResponse>;

    // #endregion Replay Buffer

    // #region Scene Collections

    /**
     * @since 4.0.0
     */
    SetCurrentSceneCollection: ObsWebSocketRequestDescriptor<SetCurrentSceneCollectionRequest, SetCurrentSceneCollectionResponse>;

    /**
     * @since 4.0.0
     */
    GetCurrentSceneCollection: ObsWebSocketRequestDescriptor<GetCurrentSceneCollectionRequest, GetCurrentSceneCollectionResponse>;

    /**
     * @since 4.0.0
     */
    ListSceneCollections: ObsWebSocketRequestDescriptor<ListSceneCollectionsRequest, ListSceneCollectionsResponse>;

    // #endregion Scene Collections

    // #region Scene Items

    // GetSceneItemList (unreleased)

    /**
     * Gets the scene specific properties of the specified source item. Coordinates are relative to the item's parent (the scene or group it belongs to).
     * @since 4.3.0
     */
    GetSceneItemProperties: ObsWebSocketRequestDescriptor<GetSceneItemPropertiesRequest, GetSceneItemPropertiesResponse>;

    /**
     * @since 4.3.0
     */
    SetSceneItemProperties: ObsWebSocketRequestDescriptor<SetSceneItemPropertiesRequest, SetSceneItemPropertiesResponse>;

    /**
     * @since 4.2.0
     */
    ResetSceneItem: ObsWebSocketRequestDescriptor<ResetSceneItemRequest, ResetSceneItemResponse>;

    /**
     * @since 0.3
     */
    SetSceneItemRender: ObsWebSocketRequestDescriptor<SetSceneItemRenderRequest, SetSceneItemRenderResponse>;

    /**
     * @since 4.0.0
     * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
     */
    SetSceneItemPosition: ObsWebSocketRequestDescriptor<SetSceneItemPositionRequest, SetSceneItemPositionResponse>;

    /**
     * @since 4.0.0
     * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
     */
    SetSceneItemTransform: ObsWebSocketRequestDescriptor<SetSceneItemTransformRequest, SetSceneItemTransformResponse>;

    /**
     * @since 4.0.0
     * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
     */
    SetSceneItemCrop: ObsWebSocketRequestDescriptor<SetSceneItemCropRequest, SetSceneItemCropResponse>;

    /**
     * @since 4.5.0
     */
    DeleteSceneItem: ObsWebSocketRequestDescriptor<DeleteSceneItemRequest, DeleteSceneItemResponse>;

    // AddSceneItem (unreleased)

    /**
     * @since 4.5.0
     */
    DuplicateSceneItem: ObsWebSocketRequestDescriptor<DuplicateSceneItemRequest, DuplicateSceneItemResponse>;

    // #endregion Scene Items

    // #region Scenes

    /**
     * @since 0.3
     */
    SetCurrentScene: ObsWebSocketRequestDescriptor<SetCurrentSceneRequest, SetCurrentSceneResponse>;

    /**
     * @since 0.3
     */
    GetCurrentScene: ObsWebSocketRequestDescriptor<GetCurrentSceneRequest, GetCurrentSceneResponse>;

    /**
     * @since 0.3
     */
    GetSceneList: ObsWebSocketRequestDescriptor<GetSceneListRequest, GetSceneListResponse>;

    /**
     * @since 4.8.0
     */
    CreateScene: ObsWebSocketRequestDescriptor<CreateSceneRequest, CreateSceneResponse>;

    /**
     * @since 4.5.0
     */
    ReorderSceneItems: ObsWebSocketRequestDescriptor<ReorderSceneItemsRequest, ReorderSceneItemsResponse>;

    /**
     * @since 4.8.0
     */
    SetSceneTransitionOverride: ObsWebSocketRequestDescriptor<SetSceneTransitionOverrideRequest, SetSceneTransitionOverrideResponse>;

    /**
     * @since 4.8.0
     */
    RemoveSceneTransitionOverride: ObsWebSocketRequestDescriptor<RemoveSceneTransitionOverrideRequest, RemoveSceneTransitionOverrideResponse>;

    /**
     * @since 4.8.0
     */
    GetSceneTransitionOverride: ObsWebSocketRequestDescriptor<GetSceneTransitionOverrideRequest, GetSceneTransitionOverrideResponse>;

    // #endregion Scenes

    // #region Streaming

    /**
     * @since 0.3
     */
    GetStreamingStatus: ObsWebSocketRequestDescriptor<GetStreamingStatusRequest, GetStreamingStatusResponse>;

    /**
     * @since 0.3
     */
    StartStopStreaming: ObsWebSocketRequestDescriptor<StartStopStreamingRequest, StartStopStreamingResponse>;

    /**
     * @since 4.1.0
     */
    StartStreaming: ObsWebSocketRequestDescriptor<StartStreamingRequest, StartStreamingResponse>;

    /**
     * @since 4.1.0
     */
    StopStreaming: ObsWebSocketRequestDescriptor<StopStreamingRequest, StopStreamingResponse>;

    /**
     * @since 4.1.0
     */
    SetStreamSettings: ObsWebSocketRequestDescriptor<SetStreamSettingsRequest, SetStreamSettingsResponse>;

    /**
     * @since 4.1.0
     */
    GetStreamSettings: ObsWebSocketRequestDescriptor<GetStreamSettingsRequest, GetStreamSettingsResponse>;

    /**
     * @since 4.1.0
     */
    SaveStreamSettings: ObsWebSocketRequestDescriptor<SaveStreamSettingsRequest, SaveStreamSettingsResponse>;

    /**
     * @since 4.6.0
     */
    SendCaptions: ObsWebSocketRequestDescriptor<SendCaptionsRequest, SendCaptionsResponse>;

    // #endregion Streaming

    // #region Studio Mode

    /**
     * @since 4.1.0
     */
    GetStudioModeStatus: ObsWebSocketRequestDescriptor<GetStudioModeStatusRequest, GetStudioModeStatusResponse>;

    /**
     * @since 4.1.0
     */
    GetPreviewScene: ObsWebSocketRequestDescriptor<GetPreviewSceneRequest, GetPreviewSceneResponse>;

    /**
     * @since 4.1.0
     */
    SetPreviewScene: ObsWebSocketRequestDescriptor<SetPreviewSceneRequest, SetPreviewSceneResponse>;

    /**
     * @since 4.1.0
     */
    TransitionToProgram: ObsWebSocketRequestDescriptor<TransitionToProgramRequest, TransitionToProgramResponse>;

    /**
     * @since 4.1.0
     */
    EnableStudioMode: ObsWebSocketRequestDescriptor<EnableStudioModeRequest, EnableStudioModeResponse>;

    /**
     * @since 4.1.0
     */
    DisableStudioMode: ObsWebSocketRequestDescriptor<DisableStudioModeRequest, DisableStudioModeResponse>;

    /**
     * @since 4.1.0
     */
    ToggleStudioMode: ObsWebSocketRequestDescriptor<ToggleStudioModeRequest, ToggleStudioModeResponse>;

    // #endregion Studio Mode

    // #region Transitions

    /**
     * @since 4.1.0
     */
    GetTransitionList: ObsWebSocketRequestDescriptor<GetTransitionListRequest, GetTransitionListResponse>;

    /**
     * @since 0.3
     */
    GetCurrentTransition: ObsWebSocketRequestDescriptor<GetCurrentTransitionRequest, GetCurrentTransitionResponse>;

    /**
     * @since 0.3
     */
    SetCurrentTransition: ObsWebSocketRequestDescriptor<SetCurrentTransitionRequest, SetCurrentTransitionResponse>;

    /**
     * @since 4.0.0
     */
    SetTransitionDuration: ObsWebSocketRequestDescriptor<SetTransitionDurationRequest, SetTransitionDurationResponse>;

    /**
     * @since 4.1.0
     */
    GetTransitionDuration: ObsWebSocketRequestDescriptor<GetTransitionDurationRequest, GetTransitionDurationResponse>;

    /**
     * @since 4.8.0
     */
    GetTransitionPosition: ObsWebSocketRequestDescriptor<GetTransitionPositionRequest, GetTransitionPositionResponse>;

    // #endregion Transitions
}

// #region General

/**
 * @since 0.3
 */
export type GetVersionRequest = void;

/**
 * @since 0.3
 */
export type GetVersionResponse = {
    version: 1.1;
    "obs-websocket-version": string;
    "obs-studio-version": string;
    "available-requests": string;
    "supported-image-export-formats": string;
};

/**
 * @since 0.3
 */
export type GetAuthRequiredRequest = void;

/**
 * @since 0.3
 */
export type GetAuthRequiredResponse = {
    authRequred: false
    challenge?: string;
    salt?: string;
} | {
    authRequired: true;
    challenge: string;
    salt: string;
};

/**
 * @since 0.3
 */
export type AuthenticateRequest = {
    auth: string;
};

/**
 * @since 0.3
 */
export type AuthenticateResponse = void;

/**
 * @since 4.3.0
 * @deprecated since 4.9.0
 */
export type SetHeartbeatRequest = {
    enable: boolean;
};

/**
 * @since 4.3.0
 * @deprecated since 4.9.0
 */
export type SetHeartbeatResponse = void;

/**
 * @since 4.3.0
 */
export type SetFilenameFormattingRequest = {
    "filename-formatting": string;
};

/**
 * @since 4.3.0
 */
export type SetFilenameFormattingResponse = void;

/**
 * @since 4.3.0
 */
export type GetFilenameFormattingRequest = void;

/**
 * @since 4.3.0
 */
export type GetFilenameFormattingResponse = {
    "filename-formatting": string;
};

/**
 * @since 4.6.0
 */
export type GetStatsRequest = void;

/**
 * @since 4.6.0
 */
export type GetStatsResponse = {
    stats: OBSStats;
};

/**
 * @since 4.7.0
 */
export type BroadcastCustomMessageRequest = {
    realm: string;
    data: unknown;
};

/**
 * @since 4.7.0
 */
export type BroadcastCustomMessageResponse = void;

/**
 * @since 4.6.0
 */
export type GetVideoInfoRequest = void;

/**
 * @since 4.6.0
 */
export type GetVideoInfoResponse = {
    baseWidth: number;
    baseHeight: number;
    outputWidth: number;
    outputHeight: number;
    scaleType: string;
    fps: number;
    videoFormat: string;
    colorSpace: string;
    colorRange: string;
};

/**
 * @since 4.8.0
 */
export type OpenProjectorRequest = {
    type?: "preview" | "source" | "scene" | "studioprogram" | "multiview";
    monitor?: number;
    geometry?: string;
    name?: string;
};

/**
 * @since 4.8.0
 */
export type OpenProjectorResponse = void;

// #endregion General

// #region Media Control
// #endregion Media Control

// #region Sources

/**
 * @since 4.3.0
 */
export type GetSourcesListRequest = void;

/**
 * @since 4.3.0
 */
export type GetSourcesListResponse = {
    sources: Source[];
};

/**
 * @since 4.3.0
 */
export type GetSourceTypesListRequest = void;

/**
 * @since 4.3.0
 */
export type GetSourceTypesListResponse = {
    types: SourceType[];
};

/**
 * @since 4.0.0
 */
export type GetVolumeRequest = {
    source: string;
    useDecibel?: boolean;
};

/**
 * @since 4.0.0
 */
export type GetVolumeResponse = {
    name: string;
    volume: number;
    muted: boolean;
};

/**
 * @since 4.0.0
 */
export type SetVolumeRequest = {
    source: string;
    volume: number;
    useDecibel?: boolean
};

/**
 * @since 4.0.0
 */
export type SetVolumeResponse = void;

/**
 * @since 4.0.0
 */
export type GetMuteRequest = {
    source: string;
};

/**
 * @since 4.0.0
 */
export type GetMuteResponse = {
    name: string;
    muted: boolean;
};

/**
 * @since 4.0.0
 */
export type SetMuteRequest = {
    source: string;
    mute: boolean;
};

/**
 * @since 4.0.0
 */
export type SetMuteResponse = void;

/**
 * @since 4.0.0
 */
export type ToggleMuteRequest = {
    source: string;
};

/**
 * @since 4.0.0
 */
export type ToggleMuteResponse = void;

/**
 * @since 4.8.0
 */
export type SetSourceNameRequest = {
    sourceName: string;
    newName: string;
};

/**
 * @since 4.8.0
 */
export type SetSourceNameResponse = void;

/**
 * @since 4.2.0
 */
export type SetSyncOffsetRequest = {
    source: string;
    offset: number;
};

/**
 * @since 4.2.0
 */
export type SetSyncOffsetResponse = void;

/**
 * @since 4.2.0
 */
export type GetSyncOffsetRequest = {
    source: string;
};

/**
 * @since 4.2.0
 */
export type GetSyncOffsetResponse = {
    name: string;
    offset: number;
};

/**
 * @since 4.3.0
 */
export type GetSourceSettingsRequest = {
    sourceName: string;
    sourceType?: string;
};

/**
 * @since 4.3.0
 */
export type GetSourceSettingsResponse = {
    sourceName: string;
    sourceType: string;
    sourceSettings: Record<string, unknown>;
};

/**
 * @since 4.3.0
 */
export type SetSourceSettingsRequest = {
    sourceName: string;
    sourceType?: string;
    sourceSettings: Record<string, unknown>;
};

/**
 * @since 4.3.0
 */
export type SetSourceSettingsResponse = {
    sourceName: string;
    sourceType: string;
    sourceSettings: Record<string, unknown>;
};

/**
 * @since 4.1.0
 */
export type GetTextGDIPlusPropertiesRequest = {
    source: string;
};

/**
 * @since 4.1.0
 */
export type GetTextGDIPlusPropertiesResponse = {
    source: string;
    align: "left" | "center" | "right";
    bk_color: number;
    bk_opacity: number;
    chatlog: boolean;
    chatlog_lines: number;
    color: number;
    extents: boolean;
    extents_cx: number;
    extents_cy: number;
    file: string;
    read_from_file: boolean;
    font: {
        face: string;
        flags: FontFlags;
        size: number;
        style: string;
    };
    gradient: boolean;
    gradient_color: number;
    gradient_dir: number;
    gradient_opacity: number;
    outline: boolean;
    outline_color: number;
    outline_size: number;
    outline_opacity: number;
    text: string;
    valign: "top" | "center" | "bottom";
    vertical: boolean;
};

/**
 * @since 4.1.0
 */
export type SetTextGDIPlusPropertiesRequest = {
    source: string;
    align?: "left" | "center" | "right";
    bk_color?: number;
    bk_opacity?: number;
    chatlog?: boolean;
    chatlog_lines?: number;
    color?: number;
    extents?: boolean;
    extents_cx?: number;
    extents_cy?: number;
    file?: string;
    read_from_file?: boolean;
    font?: {
        face?: string;
        flags?: FontFlags;
        size?: number;
        style?: string;
    };
    gradient?: boolean;
    gradient_color?: number;
    gradient_dir?: number;
    gradient_opacity?: number;
    outline?: boolean;
    outline_color?: number;
    outline_size?: number;
    outline_opacity?: number;
    text?: string;
    valign?: "top" | "center" | "bottom";
    vertical?: boolean;
    render?: boolean;
};

/**
 * @since 4.1.0
 */
export type SetTextGDIPlusPropertiesResponse = void;

/**
 * @since 4.5.0
 */
export type GetTextFreetype2PropertiesRequest = {
    source: string;
};

/**
 * @since 4.5.0
 */
export type GetTextFreetype2PropertiesResponse = {
    source: string;
    color1: number;
    color2: number;
    custom_width: number;
    drop_shadow: boolean;
    font: {
        face: string;
        flags: FontFlags;
        size: number;
        style: string;
    };
    from_file: boolean;
    log_mode: boolean;
    outline: boolean;
    text: string;
    text_file: string;
    word_wrap: boolean;
};

/**
 * @since 4.5.0
 */
export type SetTextFreetype2PropertiesRequest = {
    source: string;
    color2?: number;
    color1?: number;
    custom_width?: number;
    drop_shadow?: boolean;
    font?: {
        face: string;
        flags: FontFlags;
        size: number;
        style: string;
    };
    from_file?: boolean;
    log_mode?: boolean;
    outline?: boolean;
    text?: string;
    text_file?: string;
    word_wrap?: boolean;
};

/**
 * @since 4.5.0
 */
export type SetTextFreetype2PropertiesResponse = void;

/**
 * @since 4.1.0
 * @deprecated since 4.8.0. Use `GetSourceSettings` instead.
 */
export type GetBrowserSourcePropertiesRequest = {
    source: string;
};

/**
 * @since 4.1.0
 * @deprecated since 4.8.0. Use `GetSourceSettings` instead.
 */
export type GetBrowserSourcePropertiesResponse = {
    source: string;
    is_local_file: boolean;
    local_file: string;
    url: string;
    css: string;
    width: number;
    height: number;
    fps: number;
    shutdown: boolean;
};

/**
 * @since 4.1.0
 * @deprecated since 4.8.0. Use `SetSourceSettings` instead.
 */
export type SetBrowserSourcePropertiesRequest = {
    source: string;
    is_local_file?: boolean;
    local_file?: string;
    url?: string;
    css?: string;
    width?: number;
    height?: number;
    fps?: number;
    shutdown?: boolean;
    render?: boolean;
};

/**
 * @since 4.1.0
 * @deprecated since 4.8.0. Use `SetSourceSettings` instead.
 */
export type SetBrowserSourcePropertiesResponse = void;

/**
 * @since 4.1.0
 */
export type GetSpecialSourcesRequest = void;

/**
 * @since 4.1.0
 */
export type GetSpecialSourcesResponse = SpecialSources;

/**
 * @since 4.5.0
 */
export type GetSourceFiltersRequest = {
    sourceName: string;
};

/**
 * @since 4.5.0
 */
export type GetSourceFiltersResponse = {
    filters: {
        enabled: boolean;
        type: string;
        name: string;
        settings: Record<string, unknown>;
    }[];
};

/**
 * @since 4.7.0
 */
export type GetSourceFilterInfoRequest = {
    sourceName: string;
    filterName: string;
};

/**
 * @since 4.7.0
 */
export type GetSourceFilterInfoResponse = {
    enabled: boolean;
    type: string;
    name: string;
    settings: Record<string, unknown>;
};

/**
 * @since 4.5.0
 */
export type AddFilterToSourceRequest = {
    sourceName: string;
    filterName: string;
    filterType: string;
    filterSettings: Record<string, unknown>;
};

/**
 * @since 4.5.0
 */
export type AddFilterToSourceResponse = void;

/**
 * @since 4.5.0
 */
export type RemoveFilterFromSourceRequest = {
    sourceName: string;
    filterName: string;
};

/**
 * @since 4.5.0
 */
export type RemoveFilterFromSourceResponse = void;

/**
 * @since 4.5.0
 */
export type ReorderSourceFilterRequest = {
    sourceName: string;
    filterName: string;
    newIndex: number;
};

/**
 * @since 4.5.0
 */
export type ReorderSourceFilterResponse = void;

/**
 * @since 4.5.0
 */
export type MoveSourceFilterRequest = {
    sourceName: string;
    filterName: string;
    movementType: Movement;
};

/**
 * @since 4.5.0
 */
export type MoveSourceFilterResponse = void;

/**
 * @since 4.5.0
 */
export type SetSourceFilterSettingsRequest = {
    sourceName: string;
    filterName: string;
    filterSettings: Record<string, unknown>;
};

/**
 * @since 4.5.0
 */
export type SetSourceFilterSettingsResponse = void;

/**
 * @since 4.7.0
 */
export type SetSourceFilterVisibilityRequest = {
    sourceName: string;
    filterName: string;
    filterEnabled: boolean;
};

/**
 * @since 4.7.0
 */
export type SetSourceFilterVisibilityResponse = void;

/**
 * @since 4.8.0
 */
export type GetAudioMonitorTypeRequest = {
    sourceName: string;
};

/**
 * @since 4.8.0
 */
export type GetAudioMonitorTypeResponse = {
    monitorType: "none" | "monitorOnly" | "monitorAndOutput";
};

/**
 * @since 4.8.0
 */
export type SetAudioMonitorTypeRequest = {
    sourceName: string;
    monitorType: "none" | "monitorOnly" | "monitorAndOutput";
};

/**
 * @since 4.8.0
 */
export type SetAudioMonitorTypeResponse = void;

/**
 * @since 4.6.0
 */
export type TakeSourceScreenshotRequest = {
    sourceName: string;
    embedPictureFormat?: ImageFormat;
    saveToFilePath?: string;
    fileFormat?: string;
    compressionQuality?: number;
    width?: number;
    height?: number;
};

/**
 * @since 4.6.0
 */
export type TakeSourceScreenshotResponse = {
    sourceName: string;
    img?: string;
    imageFile?: string;
};

// #endregion Sources

// #region Outputs

/**
 * @since 4.7.0
 */
export type ListOutputsRequest = void;

/**
 * @since 4.7.0
 */
export type ListOutputsResponse = {
    outputs: Output[];
};

/**
 * @since 4.7.0
 */
export type GetOutputInfoRequest = {
    outputName: string;
};

/**
 * @since 4.7.0
 */
export type GetOutputInfoResponse = {
    outputInfo: Output;
};

/**
 * @since 4.7.0
 */
export type StartOutputRequest = {
    outputName: string;
};

/**
 * @since 4.7.0
 */
export type StartOutputResponse = void;

/**
 * @since 4.7.0
 */
export type StopOutputRequest = {
    outputName: string;
    force?: boolean;
};

/**
 * @since 4.7.0
 */
export type StopOutputResponse = void;

// #endregion Outputs

// #region Profiles

/**
 * @since 4.0.0
 */
export type SetCurrentProfileRequest = {
    "profile-name": string;
};

/**
 * @since 4.0.0
 */
export type SetCurrentProfileResponse = void;

/**
 * @since 4.0.0
 */
export type GetCurrentProfileRequest = void;

/**
 * @since 4.0.0
 */
export type GetCurrentProfileResponse = {
    "profile-name": string;
};

/**
 * @since 4.0.0
 */
export type ListProfilesRequest = void;

/**
 * @since 4.0.0
 */
export type ListProfilesResponse = {
    profiles: {
        "profile-name": string;
    }[];
};

// #endregion Profiles

// #region Recording

/**
 * @since 0.3
 */
export type StartStopRecordingRequest = void;

/**
 * @since 0.3
 */
export type StartStopRecordingResponse = void;

/**
 * @since 4.1.0
 */
export type StartRecordingRequest = void;

/**
 * @since 4.1.0
 */
export type StartRecordingResponse = void;

/**
 * @since 4.1.0
 */
export type StopRecordingRequest = void;

/**
 * @since 4.1.0
 */
export type StopRecordingResponse = void;

/**
 * @since 4.7.0
 */
export type PauseRecordingRequest = void;

/**
 * @since 4.7.0
 */
export type PauseRecordingResponse = void;

/**
 * @since 4.7.0
 */
export type ResumeRecordingRequest = void;

/**
 * @since 4.7.0
 */
export type ResumeRecordingResponse = void;

/**
 * @since 4.1.0
 */
export type SetRecordingFolderRequest = {
    "rec-folder": string;
};

/**
 * @since 4.1.0
 */
export type SetRecordingFolderResponse = void;

/**
 * @since 4.1.0
 */
export type GetRecordingFolderRequest = void;

/**
 * @since 4.1.0
 */
export type GetRecordingFolderResponse = {
    "rec-folder": string;
};

// #endregion Recording

// #region Replay Buffer

/**
 * @since 4.2.0
 */
export type StartStopReplayBufferRequest = void;

/**
 * @since 4.2.0
 */
export type StartStopReplayBufferResponse = void;

/**
 * @since 4.2.0
 */
export type StartReplayBufferRequest = void;

/**
 * @since 4.2.0
 */
export type StartReplayBufferResponse = void;

/**
 * @since 4.2.0
 */
export type StopReplayBufferRequest = void;

/**
 * @since 4.2.0
 */
export type StopReplayBufferResponse = void;

/**
 * @since 4.2.0
 */
export type SaveReplayBufferRequest = void;

/**
 * @since 4.2.0
 */
export type SaveReplayBufferResponse = void;

// #endregion Replay Buffer

// #region Scene Collections

/**
 * @since 4.0.0
 */
export type SetCurrentSceneCollectionRequest = {
    "sc-name": string;
};

/**
 * @since 4.0.0
 */
export type SetCurrentSceneCollectionResponse = void;

/**
 * @since 4.0.0
 */
export type GetCurrentSceneCollectionRequest = void;

/**
 * @since 4.0.0
 */
export type GetCurrentSceneCollectionResponse = {
    "sc-name": string;
};

/**
 * @since 4.0.0
 */
export type ListSceneCollectionsRequest = void;

/**
 * @since 4.0.0
 */
export type ListSceneCollectionsResponse = {
    "scene-collections": {
        "sc-name": string;
    }[];
};

// #endregion Scene Collections

// #region Scene Items

/**
 * @since 4.3.0
 */
export type GetSceneItemPropertiesRequest = {
    /**
     * Name of the scene the scene item belongs to. Defaults to the current scene.
     */
    "scene-name"?: string;

    /**
     * Scene item name (if this field is a string), or specification (if it is an object).
     */
    item: string | SceneItemSpec;
};

/**
 * @since 4.3.0
 */
export interface GetSceneItemPropertiesResponse extends SceneItemTransform {
    /**
     * Scene item name.
     */
    name: string;

    /**
     * Scene item ID.
     */
    itemId: number;
}

/**
 * @since 4.3.0
 */
export interface SetSceneItemPropertiesRequest {
    /**
     * Name of the scene the scene item belongs to. Defaults to the current scene.
     */
    "scene-name"?: string;
    /**
     * Scene item name (if this field is a string), or specification (if it is an object).
     */
    item: string | SceneItemSpec;
    /**
     * The position and alignment of the scene item.
     */
    position?: {
        /**
         * The _x_ position of the scene item from the left.
         */
        x?: number;
        /**
         * The _y_ position of the scene item from the top.
         */
        y?: number;
        /**
         * The point on the scene item that the item is manipulated from.
         */
        alignment?: Alignment;
    };
    /**
     * The clockwise rotation of the scene item in degrees around the point of alignment.
     */
    rotation?: number;
    /**
     * The _x_ and _y_ scale factors of the scene item.
     */
    scale?: {
        /**
         * The _x_-scale factor of the scene item.
         */
        x?: number;
        /**
         * The _y_-scale factor of the scene item.
         */
        y?: number;
    };
    /**
     * The crop offsets for the scene item.
     */
    crop?: {
        /**
         * The number of pixels cropped off the top of the scene item before scaling.
         */
        top?: number;
        /**
         * The number of pixels cropped off the right of the scene item before scaling.
         */
        right?: number;
        /**
         * The number of pixels cropped off the bottom of the scene item before scaling.
         */
        bottom?: number;
        /**
         * The number of pixels cropped off the left of the scene item before scaling.
         */
        left?: number;
    };
    /**
     * Whether the scene item is visible.
     */
    visible?: boolean;
    /**
     * Whether the scene item is locked in position.
     */
    locked?: boolean;
    /**
     * The bounding box for the scene item.
     */
    bounds?: {
        /**
         * Type of bounding box.
         */
        type?: BoundingBoxType;
        /**
         * Alignment of the bounding box.
         */
        alignment?: Alignment;
        /**
         * Width of the bounding box.
         */
        x?: number;
        /**
         * Height of the bounding box.
         */
        y?: number;
    };
}

/**
 * @since 4.3.0
 */
export type SetSceneItemPropertiesResponse = void;

/**
 * @since 4.3.0
 */
export type ResetSceneItemRequest = {
    "scene-name"?: string;
    item: string | SceneItemSpec;
};

/**
 * @since 4.3.0
 */
export type ResetSceneItemResponse = void;

/**
 * @since 0.3
 */
export type SetSceneItemRenderRequest = {
    "scene-name"?: string;
    source: string;
    render: boolean;
};

/**
 * @since 0.3
 */
export type SetSceneItemRenderResponse = void;

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemPositionRequest = {
    "scene-name"?: string;
    item: string;
    x: number;
    y: number;
};

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemPositionResponse = void;

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemTransformRequest = {
    "scene-name"?: string;
    item: string;
    "x-scale": number;
    "y-scale": number;
    rotation: number;
};

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemTransformResponse = void;

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemCropRequest = {
    "scene-name"?: string;
    item: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
};

/**
 * @since 4.0.0
 * @deprecated since 4.3.0. Use `SetSceneItemProperties` instead.
 */
export type SetSceneItemCropResponse = void;

/**
 * @since 4.5.0
 */
export type DeleteSceneItemRequest = {
    scene?: string;
    item: string | SceneItemSpec;
};

/**
 * @since 4.5.0
 */
export type DeleteSceneItemResponse = void;

/**
 * @since 4.5.0
 */
export type DuplicateSceneItemRequest = {
    fromScene?: string;
    toScene?: string;
    item: string | SceneItemSpec;
};

/**
 * @since 4.5.0
 */
export type DuplicateSceneItemResponse = {
    scene: string;
    item: SceneItemRef;
};

// #endregion Scene Items

// #region Scenes

/**
 * @since 0.3
 */
export type SetCurrentSceneRequest = {
    "scene-name": string;
};

/**
 * @since 0.3
 */
export type SetCurrentSceneResponse = void;

/**
 * @since 0.3
 */
export type GetCurrentSceneRequest = void;

/**
 * @since 0.3
 */
export type GetCurrentSceneResponse = {
    name: string;
    sources: SceneItem[];
};

/**
 * @since 0.3
 */
export type GetSceneListRequest = void;

/**
 * @since 0.3
 */
export type GetSceneListResponse = {
    "current-scene": string;
    scenes: Scene[];
};

/**
 * @since 4.8.0
 */
export type CreateSceneRequest = {
    sceneName: string;
};

/**
 * @since 4.8.0
 */
export type CreateSceneResponse = void;

/**
 * @since 4.5.0
 */
export type ReorderSceneItemsRequest = {
    scene?: string;
    items: SceneItemSpec[];
};

/**
 * @since 4.5.0
 */
export type ReorderSceneItemsResponse = void;

/**
 * @since 4.8.0
 */
export type SetSceneTransitionOverrideRequest = {
    sceneName: string;
    transitionName: string;
    transitionDuration?: number;
};

/**
 * @since 4.8.0
 */
export type SetSceneTransitionOverrideResponse = void;

/**
 * @since 4.8.0
 */
export type RemoveSceneTransitionOverrideRequest = {
    sceneName: string;
};

/**
 * @since 4.8.0
 */
export type RemoveSceneTransitionOverrideResponse = void;

/**
 * @since 4.8.0
 */
export type GetSceneTransitionOverrideRequest = {
    sceneName: string;
};

/**
 * @since 4.8.0
 */
export type GetSceneTransitionOverrideResponse = {
    transitionName: string;
    transitionDuration: number;
};

// #endregion Scenes

// #region Streaming

/**
 * @since 4.8.0
 */
export type GetStreamingStatusRequest = void;

/**
 * @since 4.8.0
 */
export type GetStreamingStatusResponse = {
    streaming: boolean;
    recording: boolean;
    "stream-timecode"?: string;
    "rec-timecode"?: string;
    "preview-only": false;
};

/**
 * @since 0.3
 */
export type StartStopStreamingRequest = void;

/**
 * @since 0.3
 */
export type StartStopStreamingResponse = void;

/**
 * @since 4.1.0
 */
export type StartStreamingRequest = {
    stream?: {
        type?: "rtmp_custom" | "rtmp_common" | string;
        metadata?: Record<string, string | number | boolean>;
        settings?: {
            server?: string;
            key?: string;
            use_auth?: boolean;
            username?: string;
            password?: string;
        };
    };
};

/**
 * @since 4.1.0
 */
export type StartStreamingResponse = void;

/**
 * @since 4.1.0
 */
export type StopStreamingRequest = void;

/**
 * @since 4.1.0
 */
export type StopStreamingResponse = void;

/**
 * @since 4.1.0
 */
export type SetStreamSettingsRequest = {
    type: "rtmp_custom" | "rtmp_common" | string;
    settings: {
        server?: string;
        key?: string;
        use_auth?: boolean;
        username?: string;
        password?: string;
    };
    save: boolean;
};

/**
 * @since 4.1.0
 */
export type SetStreamSettingsResponse = void;

/**
 * @since 4.1.0
 */
export type GetStreamSettingsRequest = void;

/**
 * @since 4.1.0
 */
export type GetStreamSettingsResponse = {
    type: "rtmp_custom" | "rtmp_common" | string;
    settings: {
        service?: string;
        bwtest?: boolean;
        server: string;
        key: string;
        use_auth: false;
        username?: string;
        password?: string;
    } | {
        service?: string;
        bwtest?: boolean;
        server: string;
        key: string;
        use_auth: true;
        username: string;
        password: string;
    };
};

/**
 * @since 4.1.0
 */
export type SaveStreamSettingsRequest = void;

/**
 * @since 4.1.0
 */
export type SaveStreamSettingsResponse = void;

/**
 * @since 4.6.0
 */
export type SendCaptionsRequest = {
    text: string;
};

/**
 * @since 4.6.0
 */
export type SendCaptionsResponse = void;

// #endregion Streaming

// #region Studio Mode

/**
 * @since 4.1.0
 */
export type GetStudioModeStatusRequest = void;

/**
 * @since 4.1.0
 */
export type GetStudioModeStatusResponse = {
    "studio-mode": boolean;
};

/**
 * @since 4.1.0
 */
export type GetPreviewSceneRequest = void;

/**
 * @since 4.1.0
 */
export type GetPreviewSceneResponse = {
    name: string;
    sources: SceneItem[];
};

/**
 * @since 4.1.0
 */
export type SetPreviewSceneRequest = {
    "scene-name": string;
};

/**
 * @since 4.1.0
 */
export type SetPreviewSceneResponse = void;

/**
 * @since 4.1.0
 */
export type TransitionToProgramRequest = {
    "with-transition"?: Transition;
};

/**
 * @since 4.1.0
 */
export type TransitionToProgramResponse = void;

/**
 * @since 4.1.0
 */
export type EnableStudioModeRequest = void;

/**
 * @since 4.1.0
 */
export type EnableStudioModeResponse = void;

/**
 * @since 4.1.0
 */
export type DisableStudioModeRequest = void;

/**
 * @since 4.1.0
 */
export type DisableStudioModeResponse = void;

/**
 * @since 4.1.0
 */
export type ToggleStudioModeRequest = void;

/**
 * @since 4.1.0
 */
export type ToggleStudioModeResponse = void;

// #endregion Studio Mode

// #region Transitions

/**
 * @since 4.1.0
 */
export type GetTransitionListRequest = void;

/**
 * @since 4.1.0
 */
export type GetTransitionListResponse = {
    "current-transition": string;
    transitions: {
        name: string;
    }[];
};

/**
 * @since 0.3
 */
export type GetCurrentTransitionRequest = void;

/**
 * @since 0.3
 */
export type GetCurrentTransitionResponse = Transition;

/**
 * @since 0.3
 */
export type SetCurrentTransitionRequest = {
    "transition-name": string;
};

/**
 * @since 0.3
 */
export type SetCurrentTransitionResponse = void;

/**
 * @since 4.0.0
 */
export type SetTransitionDurationRequest = {
    duration: number;
};

/**
 * @since 4.0.0
 */
export type SetTransitionDurationResponse = void;

/**
 * @since 4.1.0
 */
export type GetTransitionDurationRequest = void;

/**
 * @since 4.1.0
 */
export type GetTransitionDurationResponse = {
    "transition-duration": number;
};

/**
 * @since 4.8.0
 */
export type GetTransitionPositionRequest = void;

/**
 * @since 4.8.0
 */
export type GetTransitionPositionResponse = {
    position: number;
};

// #endregion Transitions

export type ObsWebSocketEventArgs<K extends string | symbol> = K extends keyof ObsWebSocketEvents ? ObsWebSocketEvents[K]["eventArgs"] : unknown;
export type ObsWebSocketEventArgsList<K extends string | symbol> = K extends keyof ObsWebSocketEvents ? [ObsWebSocketEventArgs<K>] extends [void] ? [] : [args: ObsWebSocketEventArgs<K>] : any[];

export interface ObsWebSocketEventDescriptor<Args> {
    eventArgs: Args;
}

export interface ObsWebSocketEvents {
    // #region Client-side

    ConnectionOpened: ObsWebSocketEventDescriptor<ConnectionOpenedEventArgs>;
    ConnectionClosed: ObsWebSocketEventDescriptor<ConnectionClosedEventArgs>;
    AuthenticationSuccess: ObsWebSocketEventDescriptor<AuthenticationSuccessEventArgs>;
    AuthenticationFailure: ObsWebSocketEventDescriptor<AuthenticationFailureEventArgs>;

    // #endregion Client-side

    // #region Scenes

    /**
     * Indicates a scene change.
     * @since 0.3
     */
    SwitchScenes: ObsWebSocketEventDescriptor<SwitchScenesEventArgs>;

    /**
     * @since 0.3
     */
    ScenesChanged: ObsWebSocketEventDescriptor<ScenesChangedEventArgs>;

    // #endregion Scenes

    // #region Scene Collections

    /**
     * @since 4.0.0
     */
    SceneCollectionChanged: ObsWebSocketEventDescriptor<SceneCollectionChangedEventArgs>;

    /**
     * @since 4.0.0
     */
    SceneCollectionListChanged: ObsWebSocketEventDescriptor<SceneCollectionListChangedEventArgs>;

    // #endregion Scenes

    // #region Transitions

    /**
     * @since 4.0.0
     */
    SwitchTransition: ObsWebSocketEventDescriptor<SwitchTransitionEventArgs>;

    /**
     * @since 4.0.0
     */
    TransitionListChanged: ObsWebSocketEventDescriptor<TransitionListChangedEventArgs>;

    /**
     * @since 4.0.0
     */
    TransitionDurationChanged: ObsWebSocketEventDescriptor<TransitionDurationChangedEventArgs>;

    /**
     * @since 4.0.0
     */
    TransitionBegin: ObsWebSocketEventDescriptor<TransitionBeginEventArgs>;

    /**
     * @since 4.8.0
     */
    TransitionEnd: ObsWebSocketEventDescriptor<TransitionEndEventArgs>;

    /**
     * @since 4.8.0
     */
    TransitionVideoEnd: ObsWebSocketEventDescriptor<TransitionVideoEndEventArgs>;

    // #endregion Transitions

    // #region Profiles

    /**
     * @since 4.0.0
     */
    ProfileChanged: ObsWebSocketEventDescriptor<ProfileChangedEventArgs>;

    /**
     * @since 4.0.0
     */
    ProfileListChanged: ObsWebSocketEventDescriptor<ProfileListChangedEventArgs>;

    // #endregion Profiles

    // #region Streaming

    /**
     * @since 0.3
     */
    StreamStarting: ObsWebSocketEventDescriptor<StreamStartingEventArgs>;

    /**
     * @since 0.3
     */
    StreamStarted: ObsWebSocketEventDescriptor<StreamStartedEventArgs>;

    /**
     * @since 0.3
     */
    StreamStopping: ObsWebSocketEventDescriptor<StreamStoppingEventArgs>;

    /**
     * @since 0.3
     */
    StreamStopped: ObsWebSocketEventDescriptor<StreamStoppedEventArgs>;

    /**
     * @since 0.3
     */
    StreamStatus: ObsWebSocketEventDescriptor<StreamStatusEventArgs>;

    // #endregion Streaming

    // #region Recording

    /**
     * @since 0.3
     */
    RecordingStarting: ObsWebSocketEventDescriptor<RecordingStartingEventArgs>;

    /**
     * @since 0.3
     */
    RecordingStarted: ObsWebSocketEventDescriptor<RecordingStartedEventArgs>;

    /**
     * @since 0.3
     */
    RecordingStopping: ObsWebSocketEventDescriptor<RecordingStoppingEventArgs>;

    /**
     * @since 0.3
     */
    RecordingStopped: ObsWebSocketEventDescriptor<RecordingStoppedEventArgs>;

    /**
     * @since 4.7.0
     */
    RecordingPaused: ObsWebSocketEventDescriptor<RecordingPausedEventArgs>;

    /**
     * @since 4.7.0
     */
    RecordingResumed: ObsWebSocketEventDescriptor<RecordingResumedEventArgs>;

    // #endregion Recording

    // #region Replay Buffer

    /**
     * @since 4.2.0
     */
    ReplayStarting: ObsWebSocketEventDescriptor<ReplayStartingEventArgs>;

    /**
     * @since 4.2.0
     */
    ReplayStarted: ObsWebSocketEventDescriptor<ReplayStartedEventArgs>;

    /**
     * @since 4.2.0
     */
    ReplayStopping: ObsWebSocketEventDescriptor<ReplayStoppingEventArgs>;

    /**
     * @since 4.2.0
     */
    ReplayStopped: ObsWebSocketEventDescriptor<ReplayStoppedEventArgs>;

    // #endregion Replay Buffer

    // #region Other

    /**
     * @since 0.3
     */
    Exiting: ObsWebSocketEventDescriptor<ExitingEventArgs>;

    // #endregion Other

    // #region General

    /**
     * @since 0.3
     * @deprecated since 4.9.0
     */
    Heartbeat: ObsWebSocketEventDescriptor<HeartbeatEventArgs>;

    /**
     * @since 4.7.0
     */
    BroadcastCustomMessage: ObsWebSocketEventDescriptor<BroadcastCustomMessageEventArgs>;

    // #endregion General

    // #region Sources

    /**
     * @since 4.6.0
     */
    SourceCreated: ObsWebSocketEventDescriptor<SourceCreatedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceDestroyed: ObsWebSocketEventDescriptor<SourceDestroyedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceVolumeChanged: ObsWebSocketEventDescriptor<SourceVolumeChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceMuteStateChanged: ObsWebSocketEventDescriptor<SourceMuteStateChangedEventArgs>;

    // SourceAudioDeactivated (unreleased)
    // SourceAudioActivated (unreleased)

    /**
     * @since 4.6.0
     */
    SourceAudioSyncOffsetChanged: ObsWebSocketEventDescriptor<SourceAudioSyncOffsetChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceAudioMixersChanged: ObsWebSocketEventDescriptor<SourceAudioMixersChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceRenamed: ObsWebSocketEventDescriptor<SourceRenamedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceFilterAdded: ObsWebSocketEventDescriptor<SourceFilterAddedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceFilterRemoved: ObsWebSocketEventDescriptor<SourceFilterRemovedEventArgs>;

    /**
     * @since 4.7.0
     */
    SourceFilterVisibilityChanged: ObsWebSocketEventDescriptor<SourceFilterVisibilityChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SourceFiltersReordered: ObsWebSocketEventDescriptor<SourceFiltersReorderedEventArgs>;

    // #endregion Sources

    // #region Media
    // #endregion Media

    // #region Scene Items

    /**
     * @since 4.0.0
     */
    SourceOrderChanged: ObsWebSocketEventDescriptor<SourceOrderChangedEventArgs>;

    /**
     * @since 4.0.0
     */
    SceneItemAdded: ObsWebSocketEventDescriptor<SceneItemAddedEventArgs>;

    /**
     * @since 4.0.0
     */
    SceneItemRemoved: ObsWebSocketEventDescriptor<SceneItemRemovedEventArgs>;

    /**
     * @since 4.0.0
     */
    SceneItemVisibilityChanged: ObsWebSocketEventDescriptor<SceneItemVisibilityChangedEventArgs>;

    /**
     * @since 4.8.0
     */
    SceneItemLockChanged: ObsWebSocketEventDescriptor<SceneItemLockChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SceneItemTransformChanged: ObsWebSocketEventDescriptor<SceneItemTransformChangedEventArgs>;

    /**
     * @since 4.6.0
     */
    SceneItemSelected: ObsWebSocketEventDescriptor<SceneItemSelectedEventArgs>;

    /**
     * @since 4.6.0
     */
    SceneItemDeselected: ObsWebSocketEventDescriptor<SceneItemDeselectedEventArgs>;

    // #endregion Scene Items

    // #region Studio Mode

    /**
     * @since 4.1.0
     */
    PreviewSceneChanged: ObsWebSocketEventDescriptor<PreviewSceneChangedEventArgs>;

    /**
     * @since 4.1.0
     */
    StudioModeSwitched: ObsWebSocketEventDescriptor<StudioModeSwitchedEventArgs>;

    // #endregion Studio Mode
}

// #region Client-side

export type ConnectionOpenedEventArgs = void;
export type ConnectionClosedEventArgs = void;
export type AuthenticationSuccessEventArgs = void;
export type AuthenticationFailureEventArgs = void;

// #endregion Client-side

// #region Scenes

/**
 * @since 0.3
 */
export type SwitchScenesEventArgs = {
    "scene-name": string;
    sources: SceneItem[];
};

/**
 * @since 0.3
 */
export type ScenesChangedEventArgs = void;

// #endregion Scenes

// #region Scene Collections

/**
 * @since 4.0.0
 */
export type SceneCollectionChangedEventArgs = void;

/**
 * @since 4.0.0
 */
export type SceneCollectionListChangedEventArgs = void;

// #endregion Scene Collections

// #region Transitions

/**
 * @since 4.0.0
 */
export type SwitchTransitionEventArgs = {
    "transition-name": string;
};

/**
 * @since 4.0.0
 */
export type TransitionListChangedEventArgs = void;

/**
 * @since 4.0.0
 */
export type TransitionDurationChangedEventArgs = {
    "new-duration": number;
};

/**
 * @since 4.0.0
 */
export type TransitionBeginEventArgs = {
    name: string;
    type: string;
    duration: number;
    "from-scene": string;
    "to-scene": string;
};

/**
 * @since 4.8.0
 */
export type TransitionEndEventArgs = {
    name: string;
    type: string;
    duration: number;
    "to-scene": string;
};

/**
 * @since 4.8.0
 */
export type TransitionVideoEndEventArgs = {
    name: string;
    type: string;
    duration: number;
    "from-scene": string;
    "to-scene": string;
};

// #endregion Transitions

// #region Profiles

/**
 * @since 4.0.0
 */
export type ProfileChangedEventArgs = void;

/**
 * @since 4.0.0
 */
export type ProfileListChangedEventArgs = void;

// #endregion Profiles

// #region Streaming

/**
 * @since 0.3
 */
export type StreamStartingEventArgs = {
    "preview-only": boolean;
};

/**
 * @since 0.3
 */
export type StreamStartedEventArgs = void;

/**
 * @since 0.3
 */
export type StreamStoppingEventArgs = {
    "preview-only": boolean;
};

/**
 * @since 0.3
 */
export type StreamStoppedEventArgs = void;

/**
 * @since 0.3
 */
export type StreamStatusEventArgs = {
    fps: number;
    streaming: boolean;
    "replay-buffer-active": boolean;
    "bytes-per-sec": number;
    "kbits-per-sec": number;
    strain: number;
    "total-stream-time": number;
    "num-total-frames": number;
    "num-dropped-frames": number;
    recording: boolean;
    "render-total-frames": number;
    "render-missed-frames": number;
    "output-total-frames": number;
    "output-skipped-frames": number;
    "average-frame-time": number;
    "cpu-usage": number;
    "memory-usage": number;
    "free-disk-space": number;
    "preview-only": boolean;
};

// #endregion Streaming

// #region Recording

/**
 * @since 0.3
 */
export type RecordingStartingEventArgs = void;

/**
 * @since 0.3
 */
export type RecordingStartedEventArgs = void;

/**
 * @since 0.3
 */
export type RecordingStoppingEventArgs = void;

/**
 * @since 0.3
 */
export type RecordingStoppedEventArgs = void;

/**
 * @since 4.7.0
 */
export type RecordingPausedEventArgs = void;

/**
 * @since 4.7.0
 */
export type RecordingResumedEventArgs = void;

// #endregion Recording

// #region Replay Buffer

/**
 * @since 4.2.0
 */
export type ReplayStartingEventArgs = void;

/**
 * @since 4.2.0
 */
export type ReplayStartedEventArgs = void;

/**
 * @since 4.2.0
 */
export type ReplayStoppingEventArgs = void;

/**
 * @since 4.2.0
 */
export type ReplayStoppedEventArgs = void;

// #endregion Replay Buffer

// #region Other

/**
 * @since 0.3
 */
export type ExitingEventArgs = void;

// #endregion Other

// #region General

/**
 * @since 0.3
 * @deprecated since 4.9.0
 */
export type HeartbeatEventArgs = {
    "total-stream-frames"?: number;
    pulse: boolean;
    "current-scene"?: string;
    streaming?: boolean;
    "total-stream-time"?: number;
    "total-stream-bytes"?: number;
    "current-profile"?: string;
    recording?: boolean;
    "total-record-time"?: number;
    "total-record-bytes"?: number;
    "total-record-frames"?: number;
    stats: OBSStats;
};

/**
 * @since 4.7.0
 */
export type BroadcastCustomMessageEventArgs = {
    realm: string;
    data: unknown;
};

// #endregion General

// #region Sources

/**
 * @since 4.6.0
 */
export type SourceCreatedEventArgs = {
    sourceName: string;
    sourceType: string;
    sourceKind: string;
    sourceSettings: Record<string, unknown>;
};

/**
 * @since 4.6.0
 */
export type SourceDestroyedEventArgs = {
    sourceName: string;
    sourceType: string;
    sourceKind: string;
};

/**
 * @since 4.6.0
 */
export type SourceVolumeChangedEventArgs = {
    sourceName: string;
    volume: number;
};

/**
 * @since 4.6.0
 */
export type SourceMuteStateChangedEventArgs = {
    sourceName: string;
    muted: boolean;
};

/**
 * @since 4.6.0
 */
export type SourceAudioSyncOffsetChangedEventArgs = {
    sourceName: string;
    syncOffset: number;
};

/**
 * @since 4.6.0
 */
export type SourceAudioMixersChangedEventArgs = {
    sourceName: string;
    mixers: {
        id: number;
        enabled: boolean;
    }[];
    hexMixersValue: string;
};

/**
 * @since 4.6.0
 */
export type SourceRenamedEventArgs = {
    previousName: string;
    newName: string;
    sourceType: string;
};

/**
 * @since 4.6.0
 */
export type SourceFilterAddedEventArgs = {
    sourceName: string;
    filterName: string;
    filterType: string;
    filterSettings: Record<string, unknown>;
};

/**
 * @since 4.6.0
 */
export type SourceFilterRemovedEventArgs = {
    sourceName: string;
    filterName: string;
    filterType: string;
};

/**
 * @since 4.7.0
 */
export type SourceFilterVisibilityChangedEventArgs = {
    sourceName: string;
    filterName: string;
    filterEnabled: boolean;
};

/**
 * @since 4.6.0
 */
export type SourceFiltersReorderedEventArgs = {
    sourceName: string;
    filters: {
        name: string;
        type: string;
        enabled: boolean;
    }[];
};

// #endregion Sources

// #region Media
// #endregion Media

// #region Scene Items

/**
 * @since 4.0.0
 */
export type SourceOrderChangedEventArgs = {
    "scene-name": string;
    "scene-items": {
        "source-name": string;
        "item-id": number;
    }[];
};

/**
 * @since 4.0.0
 */
export type SceneItemAddedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
};

/**
 * @since 4.0.0
 */
export type SceneItemRemovedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
};

/**
 * @since 4.0.0
 */
export type SceneItemVisibilityChangedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
    "item-visible": boolean;
};

/**
 * @since 4.8.0
 */
export type SceneItemLockChangedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
    "item-locked": boolean;
};

/**
 * @since 4.6.0
 */
export type SceneItemTransformChangedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
    transform: SceneItemTransform;
};

/**
 * @since 4.6.0
 */
export type SceneItemSelectedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
};

/**
 * @since 4.6.0
 */
export type SceneItemDeselectedEventArgs = {
    "scene-name": string;
    "item-name": string;
    "item-id": number;
};

// #endregion Scene Items

// #region Studio Mode

/**
 * @since 4.1.0
 */
export type PreviewSceneChangedEventArgs = {
    "scene-name": string;
    sources: SceneItem[];
};

/**
 * @since 4.1.0
 */
export type StudioModeSwitchedEventArgs = {
    "new-state": boolean;
};

// #endregion Studio Mode
