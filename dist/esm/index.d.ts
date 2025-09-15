export interface VideoTrack {
    index: string;
    width: string;
    height: string;
    rotatedWidth: string;
    rotatedHeight: string;
    codec: string;
    codecTag: string;
    pixelFormat: string;
    bitRate: string;
    frameRate: string;
    rotation: string;
    durationMillis: string;
}
export interface AudioTrack {
    index: string;
    bitRate: string;
    sampleRate: string;
    channels: string;
    codec: string;
    codecTag: string;
    durationMillis: string;
    channelLayout: string;
    sampleFormat: string;
}
export interface MediaInfo {
    path: string;
    size: number;
    durationMillis: number;
    format: string;
    videoTracks: VideoTrack[];
    audioTracks: AudioTrack[];
}
export declare enum VideoStatus {
    processing = "processing",
    completed = "complete",
    idle = "idle",
    cancel = "cancelled",
    error = "error"
}
export declare function getVideoInfo(videoPath: string): Promise<MediaInfo>;
export declare function compareVideos(videoPath: string): Promise<boolean>;
export declare function getRequestById(id: string): Promise<BuilderResponse>;
export declare function getAllRequest(status: VideoStatus): Promise<BuilderResponse[]>;
export declare function cleanNoise(videoUri: string, resultPath: string): Promise<{
    result: object;
}>;
export declare function editVideo(videoUri: string, resultPath: string): Promise<{
    result: object;
}>;
export declare function getResultPath(videoPath: string): Promise<{
    result: string;
}>;
export declare function generateThumbnail(videoPath: string, resultPath: string, position: number, width: number, height: number, precise: boolean): Promise<{
    result: object;
}>;
export declare enum FrameRate {
    twentyFourFps = "twentyFourFps",
    twentyFiveFps = "twentyFiveFps",
    thirtyFps = "thirtyFps",
    fiftyFps = "fiftyFps",
    sixtyFps = "sixtyFps"
}
export interface BuilderType {
    merge: 'merge';
    concat: 'concat';
    encode: 'encode';
}
export interface BuilderResponse {
    id: string;
    createdAt: string;
    status: VideoStatus;
    type: BuilderType;
    updatedAt: string;
}
export declare class MergeBuilder {
    private _filePath;
    private resultPath;
    private height;
    private width;
    private frameRate;
    private mergeData;
    constructor(filePaths: string, resultPath: string);
    setHeight(height: number): MergeBuilder;
    setWidth(width: number): MergeBuilder;
    setFrameRate(frameRate: FrameRate): MergeBuilder;
    build(): Promise<MergeBuilder>;
    process(): Promise<BuilderResponse>;
    cancel(): Promise<BuilderResponse>;
}
export declare class ConcatBuilder {
    private _filePath;
    private resultPath;
    private concatData;
    constructor(filePaths: string, resultPath: string);
    build(): Promise<ConcatBuilder>;
    process(): Promise<BuilderResponse>;
    cancel(): Promise<BuilderResponse>;
}
export declare class EncodeBuilder {
    private filePath;
    private resultPath;
    private height;
    private width;
    private frameRate;
    private mergeData?;
    constructor(filePath: string, resultPath: string);
    setHeight(height: number): EncodeBuilder;
    setWidth(width: number): EncodeBuilder;
    setFrameRate(frameRate: FrameRate): EncodeBuilder;
    build(): Promise<EncodeBuilder>;
    process(): Promise<BuilderResponse>;
    cancel(): Promise<BuilderResponse>;
}
