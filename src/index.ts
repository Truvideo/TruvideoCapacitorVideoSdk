import { registerPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

export enum VideoStatus {
  processing = 'processing',
  completed = 'complete',
  idle = 'idle',
  cancel = 'cancelled',
  error = 'error',
}

// Define a class for the VideoTrack
export interface VideoTrack {
  index : string;
  width : string;
  height : string;
  rotatedWidth : string;
  rotatedHeight : string;
  codec : string;
  codecTag : string;
  pixelFormat : string;
  bitRate : string;
  frameRate : string;
  rotation : string;
  durationMillis : string;
}

// Define a class for the AudioTrack
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

// Define a class for the main response data
export interface MediaInfo {
  path : string;
  size : number;
  durationMillis : number;
  format : string;
  videoTracks : VideoTrack[];
  audioTracks : AudioTrack[];
}
 

const TruvideoSdkVideo = registerPlugin<TruvideoSdkVideoPlugin>('TruvideoSdkVideo');

export async function getVideoInfo(videoPath: string): Promise<MediaInfo> {
    let response = TruvideoSdkVideo.getVideoInfo({ videoPath });
    return parsePluginResponse<MediaInfo>((await response).result);
}
export async function compareVideos(videoPath: string): Promise<Boolean> {
    let response =  TruvideoSdkVideo.compareVideos({ videoUris: videoPath });
    return parsePluginResponse<Boolean>((await response).result);
}

export function cleanNoise(
    videoUri: string,
    resultPath: string
): Promise<{ result: object }> {
    return TruvideoSdkVideo.cleanNoise({ videoPath: videoUri, resultPath: resultPath });
}

export function editVideo(
    videoUri: string,
    resultPath: string
): Promise<{ result: object }> {
    return TruvideoSdkVideo.editVideo({ videoPath: videoUri, resultPath: resultPath });
}
export function getResultPath(videoPath: string): Promise<{ result: string }> {
    return TruvideoSdkVideo.getResultPath({ path: videoPath });
}

export async function getAllRequests(status: VideoStatus): Promise<BuilderResponse[]> {
    return parsePluginResponse<BuilderResponse[]>(TruvideoSdkVideo.getAllRequests({ status : status }));
}

export async function getRequestById(id: string): Promise<BuilderResponse> {
    return parsePluginResponse<BuilderResponse>(TruvideoSdkVideo.getRequestById({ id : id }));
}

export function generateThumbnail(
    videoPath: string,
    resultPath: string,
    position: number,
    width: number,
    height: number,
    precise: boolean
): Promise<{ result: object }> {
    return TruvideoSdkVideo.generateThumbnail({
        videoPath: videoPath,
        resultPath: resultPath,
        position: position,
        width: width,
        height: height,
        precise: precise
    });
}

export enum FrameRate {
    twentyFourFps = 'twentyFourFps',
    twentyFiveFps = 'twentyFiveFps',
    thirtyFps = 'thirtyFps',
    fiftyFps = 'fiftyFps',
    sixtyFps = 'sixtyFps',
}
export enum BuilderType {
    merge = 'merge',    
    concat = 'concat',
    encode = 'encode',
}

export interface BuilderResponse {
    id: string;
    createdAt: string;
    status: string;
    type: BuilderType;
    updatedAt: string;
}

export class MergeBuilder {
    private _filePath: string;
    private resultPath: string;
    private height: string = '';
    private width: string = '';
    private frameRate: string = '';
    private mergeData: BuilderResponse | undefined;

    constructor(filePaths: string, resultPath: string) {
        if (!filePaths) {
            throw new Error('filePath is required for MediaBuilder.');
        }
        if (!resultPath) {
            throw new Error('resultPath is required for MediaBuilder.');
        }
        this._filePath = filePaths;
        this.resultPath = resultPath;
    }

    setHeight(height: number): MergeBuilder {
        this.height = '' + height;
        return this;
    }

    setWidth(width: number): MergeBuilder {
        this.width = '' + width;
        return this;
    }

    setFrameRate(frameRate: FrameRate): MergeBuilder {
        if (frameRate == FrameRate.fiftyFps) {
            this.frameRate = 'fiftyFps';
        } else if (frameRate == FrameRate.sixtyFps) {
            this.frameRate = 'sixtyFps';
        } else if (frameRate == FrameRate.twentyFourFps) {
            this.frameRate = 'twentyFourFps';
        } else if (frameRate == FrameRate.twentyFiveFps) {
            this.frameRate = 'twentyFiveFps';
        } else if (frameRate == FrameRate.thirtyFps) {
            this.frameRate = 'thirtyFps';
        } else {
            this.frameRate = 'fiftyFps';
        }
        return this;
    }

    async build(): Promise<MergeBuilder> {
        const config = {
            height: this.height,
            width: this.width,
            framesRate: this.frameRate,
        };

        const response = await TruvideoSdkVideo.mergeVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath,
            config: JSON.stringify(config),
        });
        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            console.error("❌ [Process] Missing mergeData.id. Ensure build() was called successfully.");
            throw new Error('⚠️ Call build() and ensure it succeeds before calling process().');
        }

        const response = await TruvideoSdkVideo.processVideo({
            path: this.mergeData.id
        });

        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this.mergeData;
    }

    async cancel(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error(
                'Call build() and ensure it succeeds before calling cancel().'
            );
        }
        var response = await TruvideoSdkVideo.cancelVideo(
            { path: this.mergeData.id }
        );

        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this.mergeData;
    }
}

export class ConcatBuilder {
    private _filePath: string;
    private resultPath: string;
    private concatData: BuilderResponse | undefined;

    constructor(filePaths: string, resultPath: string) {
        if (!filePaths) {
            throw new Error('filePath is required for ConcatBuilder.');
        }
        if (!resultPath) {
            throw new Error('resultPath is required for ConcatBuilder.');
        }
        this._filePath = filePaths;
        this.resultPath = resultPath;
    }

    async build(): Promise<ConcatBuilder> {
        const response = await TruvideoSdkVideo.concatVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath
        });
        this.concatData = parsePluginResponse<BuilderResponse>(response);
        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }

        const response = await TruvideoSdkVideo.processVideo({
            path: this.concatData.id
        });

        this.concatData = parsePluginResponse<BuilderResponse>(response);
        return this.concatData;
    }

    async cancel(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }

        const response = await TruvideoSdkVideo.cancelVideo({
            path: this.concatData.id
        });

        this.concatData = parsePluginResponse<BuilderResponse>(response);
        return this.concatData;
    }
}

export class EncodeBuilder {
    private filePath: string;
    private resultPath: string;
    private height = '';
    private width = '';
    private frameRate = '';
    private mergeData?: BuilderResponse;

    constructor(filePath: string, resultPath: string) {
        if (!filePath) throw new Error('filePath is required for EncodeBuilder.');
        if (!resultPath) throw new Error('resultPath is required for EncodeBuilder.');
        this.filePath = filePath;
        this.resultPath = resultPath;
    }

    setHeight(height: number): EncodeBuilder {
        this.height = height.toString();
        return this;
    }

    setWidth(width: number): EncodeBuilder {
        this.width = width.toString();
        return this;
    }

    setFrameRate(frameRate: FrameRate): EncodeBuilder {
        // Map enum to valid frame rate string
        switch (frameRate) {
            case FrameRate.fiftyFps:
                this.frameRate = 'fiftyFps';
                break;
            case FrameRate.sixtyFps:
                this.frameRate = 'sixtyFps';
                break;
            case FrameRate.twentyFourFps:
                this.frameRate = 'twentyFourFps';
                break;
            case FrameRate.twentyFiveFps:
                this.frameRate = 'twentyFiveFps';
                break;
            case FrameRate.thirtyFps:
                this.frameRate = 'thirtyFps';
                break;
            default:
                this.frameRate = 'fiftyFps';
        }
        return this;
    }

    // Builds the video using encodeVideo method
    async build(): Promise<EncodeBuilder> {
        const config = {
            height: this.height,
            width: this.width,
            framesRate: this.frameRate,
        };

        const response = await TruvideoSdkVideo.encodeVideo({
            videoUri: this.filePath,
            resultPath: this.resultPath,
            config: JSON.stringify(config)
        });

        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this;
    }

    // Process the video after build
    async process(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error('Call build() and ensure it succeeds before calling process().');
        }

        const response = await TruvideoSdkVideo.processVideo({ path: this.mergeData.id });
        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this.mergeData;
    }

    // Cancel the video encoding
    async cancel(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error('Call build() and ensure it succeeds before calling cancel().');
        }

        const response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
        this.mergeData = parsePluginResponse<BuilderResponse>(response);
        return this.mergeData;
    }
}


function parsePluginResponse<T>(response: any): T {
    if (!response || typeof response !== 'object') {
        throw new Error("Plugin response is not an object");
    }

    if (!response.result || typeof response.result !== 'string') {
        throw new Error("Plugin response.result is not a valid string");
    }

    try {
        return JSON.parse(response.result) as T;
    } catch (e) {
        throw new Error("Failed to parse plugin response.result: " + e);
    }
}
