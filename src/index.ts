import { registerPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

const TruvideoSdkVideo = registerPlugin<TruvideoSdkVideoPlugin>('TruvideoSdkVideo');

export * from './definitions';
export { TruvideoSdkVideo };


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
export function getResultPath(videoPath: string): Promise<{ resultPath: string }> {
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

    setWigth(width: number): MergeBuilder {
        this.width = '' + width;
        return this;
    }

    setFrameRate(frameRate: FrameRate) {
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
    }

    async build(): Promise<MergeBuilder> {
        const config = {
            height: this.height,
            width: this.width,
            framesRate: this.frameRate,
        };

        var response = await TruvideoSdkVideo.mergeVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath,
            config: JSON.stringify(config)
        });
        this.mergeData = response.result as BuilderResponse;;
        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error(
                'Call build() and ensure it succeeds before calling process().'
            );
        }
        var response = await TruvideoSdkVideo.processVideo({
            path: this.mergeData.id
        });
        this.mergeData = JSON.parse(response.resultPath) as BuilderResponse;
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
        this.mergeData = JSON.parse(response.resultPath) as BuilderResponse;
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
        var response = await TruvideoSdkVideo.concatVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath
        });
        this.concatData = JSON.parse(response.result);
        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error(
                'concatData.id is undefined. Call build() and ensure it succeeds before calling process().'
            );
        }
        var response = await TruvideoSdkVideo.processVideo({
            path: this.concatData.id
        });
        this.concatData = JSON.parse(response.resultPath) as BuilderResponse;
        return this.concatData;
    }

    async cancel(): Promise<BuilderResponse> {
        if (!this.concatData?.id) {
            throw new Error(
                'concatData.id is undefined. Call build() and ensure it succeeds before calling cancel().'
            );
        }
        var response = await TruvideoSdkVideo.cancelVideo({
            path: this.concatData.id
        });
        this.concatData = JSON.parse(response.resultPath) as BuilderResponse;
        return this.concatData;
    }
}

export class EncodeBuilder {
    private _filePath: string;
    private resultPath: string;
    private height: string = '';
    private width: string = '';
    private frameRate: string = '';
    private mergeData: BuilderResponse | undefined;

    constructor(filePaths: string, resultPath: string) {
        if (!filePaths) {
            throw new Error('filePath is required for EncodeBuilder.');
        }
        if (!resultPath) {
            throw new Error('resultPath is required for EncodeBuilder.');
        }
        this._filePath = filePaths;
        this.resultPath = resultPath;
    }

    setHeight(height: number): EncodeBuilder {
        this.height = '' + height;
        return this;
    }

    setWigth(width: number): EncodeBuilder {
        this.width = '' + width;
        return this;
    }

    setFrameRate(frameRate: FrameRate) {
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
    }

    async build(): Promise<EncodeBuilder> {
        const config = {
            height: this.height,
            width: this.width,
            framesRate: this.frameRate,
        };

        var response = await TruvideoSdkVideo.encodeVideo(
            {
                videoUri: this._filePath,
                resultPath: this.resultPath,
                config: JSON.stringify(config)
            });

        this.mergeData = response.result as BuilderResponse;

        return this;
    }

    async process(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error(
                'Call build() and ensure it succeeds before calling process().'
            );
        }
        // process video
        var response = await TruvideoSdkVideo.processVideo(
            { path: this.mergeData.id }
        );
        this.mergeData = JSON.parse(response.resultPath) as BuilderResponse;
        return this.mergeData;
    }

    async cancel(): Promise<BuilderResponse> {
        if (!this.mergeData?.id) {
            throw new Error(
                'Call build() and ensure it succeeds before calling cancel().'
            );
        }
        // cancel video
        var response = await TruvideoSdkVideo.cancelVideo(
            { path: this.mergeData.id }
        );

        this.mergeData = JSON.parse(response.resultPath) as BuilderResponse;
        return this.mergeData;
    }
}