export declare function getVideoInfo(videoPath: string): Promise<{
    result: object;
}>;
export declare function compareVideos(videoPath: string): Promise<{
    result: object;
}>;
export declare function cleanNoise(videoUri: string, resultPath: string): Promise<{
    result: object;
}>;
export declare function editVideo(videoUri: string, resultPath: string): Promise<{
    result: object;
}>;
export declare function getResultPath(videoPath: string): Promise<{
    resultPath: string;
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
export interface BuilderResponse {
    id: string;
    createdAt: string;
    status: string;
    type: string;
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
    setWigth(width: number): MergeBuilder;
    setFrameRate(frameRate: FrameRate): void;
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
    private _filePath;
    private resultPath;
    private height;
    private width;
    private frameRate;
    private mergeData;
    constructor(filePaths: string, resultPath: string);
    setHeight(height: number): EncodeBuilder;
    setWigth(width: number): EncodeBuilder;
    setFrameRate(frameRate: FrameRate): void;
    build(): Promise<EncodeBuilder>;
    process(): Promise<BuilderResponse>;
    cancel(): Promise<BuilderResponse>;
}
