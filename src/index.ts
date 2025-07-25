import { registerPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

const TruvideoSdkVideo = registerPlugin<TruvideoSdkVideoPlugin>('TruvideoSdkVideo');

export function getVideoInfo(videoPath: string): Promise<{ result: object }> {
    return TruvideoSdkVideo.getVideoInfo({ videoPath });
}
export function compareVideos(videoPath: string): Promise<{ result: object }> {
    return TruvideoSdkVideo.compareVideos({ videoUris: videoPath });
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

export interface BuilderResponse {
    id: string;
    createdAt: string;
    status: string;
    type: string;
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

        console.log("📦 [Build] Merging Videos with Config:", config);
        console.log("📦 [Build] Result Path:", this.resultPath);
        console.log("📦 [Build] Video URIs:", this._filePath);

        const response = await TruvideoSdkVideo.mergeVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath,
            config: JSON.stringify(config),
        });

        console.log("📥 [Build] mergeVideos API Raw Response:", response);

        // if (!response?.result || typeof response.result !== 'object') {
        //     throw new Error('❌ mergeVideos result is not a valid object.');
        // }

        // this.mergeData = response.result as BuilderResponse;
        try {
            this.mergeData = response.result as BuilderResponse;
        } catch (e) {
            console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
            throw new Error('❌ Failed to parse resultPath from MergeBuilder.');
        }


        if (!this.mergeData.id) {
            throw new Error('❌ mergeVideos result is missing `id`.');
        }

        console.log("✅ [Build] MergeBuilder build success. MergeData:", this.mergeData);
        console.log("🔁 [Build] Returning instance of MergeBuilder:", this);

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


        if (!response || !response.result) {
            console.error("❌ [Process] Invalid response from processVideo. Missing resultPath.");
            throw new Error('❌ processVideo did not return a valid resultPath.');
        }

        try {
            this.mergeData = JSON.parse(response.result) as BuilderResponse;
        } catch (e) {
            console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
            throw new Error('❌ Failed to parse resultPath from processVideo.');
        }

        console.log("✅ [Process] Video processing complete. Processed Data:", this.mergeData);

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

        if (!response || !response.result) {
            throw new Error('❌ cancelVideo did not return a valid resultPath.');
        }

        this.mergeData = JSON.parse(response.result) as BuilderResponse;
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

        if (!response || typeof response !== 'object') {
            throw new Error("Build failed: concatVideos response is not an object");
        }

        if (!response.result || typeof response.result !== 'object') {
            throw new Error("Build failed: response.result is not valid");
        }

        this.concatData = response.result as BuilderResponse;
        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }

        const response = await TruvideoSdkVideo.processVideo({
            path: this.concatData.id
        });

        if (!response || typeof response !== 'object') {
            throw new Error("Process failed: response is not an object");
        }

        if (!response.result || typeof response.result !== 'string') {
            throw new Error("Process failed: response.result is not a valid string");
        }

        this.concatData = JSON.parse(response.result) as BuilderResponse;
        return this.concatData;
    }

    async cancel(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }

        const response = await TruvideoSdkVideo.cancelVideo({
            path: this.concatData.id
        });

        if (!response || typeof response !== 'object') {
            throw new Error("Cancel failed: response is not an object");
        }

        if (!response.result || typeof response.result !== 'string') {
            throw new Error("Cancel failed: response.result is not a valid string");
        }

        this.concatData = JSON.parse(response.result) as BuilderResponse;
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

        if (!response || typeof response !== 'object') {
            console.error("❌ Invalid response from encodeVideo:", response);
            throw new Error("Build failed: encodeVideo response is not an object");
        }

        if (!response.result || typeof response.result !== 'object') {
            console.error("❌ Invalid result in encodeVideo response:", response.result);
            throw new Error("Build failed: response.result is not valid");
        }

        this.mergeData = response.result as BuilderResponse;
        return this;
    }

    // Process the video after build
    async process(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error('Call build() and ensure it succeeds before calling process().');
        }

        const response = await TruvideoSdkVideo.processVideo({ path: this.mergeData.id });
        this.mergeData = JSON.parse(response.result) as BuilderResponse;
        return this.mergeData;
    }

    // Cancel the video encoding
    async cancel(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error('Call build() and ensure it succeeds before calling cancel().');
        }

        const response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
        this.mergeData = JSON.parse(response.result) as BuilderResponse;
        return this.mergeData;
    }
}
