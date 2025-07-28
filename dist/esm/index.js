import { registerPlugin } from '@capacitor/core';
const TruvideoSdkVideo = registerPlugin('TruvideoSdkVideo');
export function getVideoInfo(videoPath) {
    return TruvideoSdkVideo.getVideoInfo({ videoPath });
}
export function compareVideos(videoPath) {
    return TruvideoSdkVideo.compareVideos({ videoUris: videoPath });
}
export function cleanNoise(videoUri, resultPath) {
    return TruvideoSdkVideo.cleanNoise({ videoPath: videoUri, resultPath: resultPath });
}
export function editVideo(videoUri, resultPath) {
    return TruvideoSdkVideo.editVideo({ videoPath: videoUri, resultPath: resultPath });
}
export function getResultPath(videoPath) {
    return TruvideoSdkVideo.getResultPath({ path: videoPath });
}
export function generateThumbnail(videoPath, resultPath, position, width, height, precise) {
    return TruvideoSdkVideo.generateThumbnail({
        videoPath: videoPath,
        resultPath: resultPath,
        position: position,
        width: width,
        height: height,
        precise: precise
    });
}
export var FrameRate;
(function (FrameRate) {
    FrameRate["twentyFourFps"] = "twentyFourFps";
    FrameRate["twentyFiveFps"] = "twentyFiveFps";
    FrameRate["thirtyFps"] = "thirtyFps";
    FrameRate["fiftyFps"] = "fiftyFps";
    FrameRate["sixtyFps"] = "sixtyFps";
})(FrameRate || (FrameRate = {}));
export class MergeBuilder {
    constructor(filePaths, resultPath) {
        this.height = '';
        this.width = '';
        this.frameRate = '';
        if (!filePaths) {
            throw new Error('filePath is required for MediaBuilder.');
        }
        if (!resultPath) {
            throw new Error('resultPath is required for MediaBuilder.');
        }
        this._filePath = filePaths;
        this.resultPath = resultPath;
    }
    setHeight(height) {
        this.height = '' + height;
        return this;
    }
    setWidth(width) {
        this.width = '' + width;
        return this;
    }
    setFrameRate(frameRate) {
        if (frameRate == FrameRate.fiftyFps) {
            this.frameRate = 'fiftyFps';
        }
        else if (frameRate == FrameRate.sixtyFps) {
            this.frameRate = 'sixtyFps';
        }
        else if (frameRate == FrameRate.twentyFourFps) {
            this.frameRate = 'twentyFourFps';
        }
        else if (frameRate == FrameRate.twentyFiveFps) {
            this.frameRate = 'twentyFiveFps';
        }
        else if (frameRate == FrameRate.thirtyFps) {
            this.frameRate = 'thirtyFps';
        }
        else {
            this.frameRate = 'fiftyFps';
        }
        return this;
    }
    async build() {
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
        console.log("📥 [Build] mergeVideos API Raw Response:", response);
        try {
            const result = typeof response.result === 'string'
                ? JSON.parse(response.result)
                : response.result;
            if (!result || typeof result !== 'object') {
                throw new Error('❌ processVideo returned invalid result.');
            }
            this.mergeData = result;
            console.log("✅ [Process] Video processing complete. Processed Data:", this.mergeData);
            return this;
        }
        catch (e) {
            console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
            throw new Error('❌ Failed to parse resultPath from processVideo.');
        }
    }
    async process() {
        var _a;
        if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
            console.error("❌ [Process] Missing mergeData.id. Ensure build() was called successfully.");
            throw new Error('⚠️ Call build() and ensure it succeeds before calling process().');
        }
        const response = await TruvideoSdkVideo.processVideo({
            path: this.mergeData.id
        });
        // if (!response || !response.result) {
        //     console.error("❌ [Process] Invalid response from processVideo. Missing resultPath.");
        //     throw new Error('❌ processVideo did not return a valid resultPath.');
        // }
        // try {
        //     this.mergeData = JSON.parse(response.result) as BuilderResponse;
        // } catch (e) {
        //     console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
        //     throw new Error('❌ Failed to parse resultPath from processVideo.');
        // }
        // console.log("✅ [Process] Video processing complete. Processed Data:", this.mergeData);
        try {
            const result = typeof response.result === 'string'
                ? JSON.parse(response.result)
                : response.result;
            if (!result || typeof result !== 'object') {
                throw new Error('❌ processVideo returned invalid result.');
            }
            this.mergeData = result;
            console.log("✅ [Process] Video processing complete. Processed Data:", this.mergeData);
            return this.mergeData;
        }
        catch (e) {
            console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
            throw new Error('❌ Failed to parse resultPath from processVideo.');
        }
    }
    async cancel() {
        var _a;
        if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('Call build() and ensure it succeeds before calling cancel().');
        }
        var response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
        try {
            const result = typeof response.result === 'string'
                ? JSON.parse(response.result)
                : response.result;
            if (!result || typeof result !== 'object') {
                throw new Error('❌ cancelVideo returned invalid result.');
            }
            this.mergeData = result;
            return this.mergeData;
        }
        catch (e) {
            console.error("❌ [Cancel] Failed to parse resultPath JSON:", response.result, e);
            throw new Error('❌ Failed to parse resultPath from cancelVideo.');
        }
    }
}
export class ConcatBuilder {
    constructor(filePaths, resultPath) {
        if (!filePaths) {
            throw new Error('filePath is required for ConcatBuilder.');
        }
        if (!resultPath) {
            throw new Error('resultPath is required for ConcatBuilder.');
        }
        this._filePath = filePaths;
        this.resultPath = resultPath;
    }
    async build() {
        const response = await TruvideoSdkVideo.concatVideos({
            videoUris: this._filePath,
            resultPath: this.resultPath
        });
        this.concatData = parsePluginResponse(response);
        return this;
    }
    async process() {
        var _a;
        if (!((_a = this.concatData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }
        const response = await TruvideoSdkVideo.processVideo({
            path: this.concatData.id
        });
        this.concatData = parsePluginResponse(response);
        return this.concatData;
    }
    async cancel() {
        var _a;
        if (!((_a = this.concatData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('concatData.id is undefined. Call build() first.');
        }
        const response = await TruvideoSdkVideo.cancelVideo({
            path: this.concatData.id
        });
        this.concatData = parsePluginResponse(response);
        return this.concatData;
    }
}
export class EncodeBuilder {
    constructor(filePath, resultPath) {
        this.height = '';
        this.width = '';
        this.frameRate = '';
        if (!filePath)
            throw new Error('filePath is required for EncodeBuilder.');
        if (!resultPath)
            throw new Error('resultPath is required for EncodeBuilder.');
        this.filePath = filePath;
        this.resultPath = resultPath;
    }
    setHeight(height) {
        this.height = height.toString();
        return this;
    }
    setWidth(width) {
        this.width = width.toString();
        return this;
    }
    setFrameRate(frameRate) {
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
    async build() {
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
        this.mergeData = parsePluginResponse(response);
        return this;
    }
    // Process the video after build
    async process() {
        var _a;
        if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('Call build() and ensure it succeeds before calling process().');
        }
        const response = await TruvideoSdkVideo.processVideo({ path: this.mergeData.id });
        this.mergeData = parsePluginResponse(response);
        return this.mergeData;
    }
    // Cancel the video encoding
    async cancel() {
        var _a;
        if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('Call build() and ensure it succeeds before calling cancel().');
        }
        const response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
        this.mergeData = parsePluginResponse(response);
        return this.mergeData;
    }
}
function parsePluginResponse(response) {
    if (!response || typeof response !== 'object') {
        throw new Error("Plugin response is not an object");
    }
    if (!response.result || typeof response.result !== 'string') {
        throw new Error("Plugin response.result is not a valid string");
    }
    try {
        return JSON.parse(response.result);
    }
    catch (e) {
        throw new Error("Failed to parse plugin response.result: " + e);
    }
}
//# sourceMappingURL=index.js.map