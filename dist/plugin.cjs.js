'use strict';

var core = require('@capacitor/core');

exports.VideoStatus = void 0;
(function (VideoStatus) {
    VideoStatus["processing"] = "processing";
    VideoStatus["completed"] = "complete";
    VideoStatus["idle"] = "idle";
    VideoStatus["cancel"] = "cancelled";
    VideoStatus["error"] = "error";
})(exports.VideoStatus || (exports.VideoStatus = {}));
const TruvideoSdkVideo = core.registerPlugin('TruvideoSdkVideo');
async function getVideoInfo(videoPath) {
    let response = TruvideoSdkVideo.getVideoInfo({ videoPath });
    return parsePluginResponse(response);
}
async function compareVideos(videoPath) {
    let response = TruvideoSdkVideo.compareVideos({ videoUris: videoPath });
    return parsePluginResponse(response);
}
function cleanNoise(videoUri, resultPath) {
    return TruvideoSdkVideo.cleanNoise({ videoPath: videoUri, resultPath: resultPath });
}
function editVideo(videoUri, resultPath) {
    return TruvideoSdkVideo.editVideo({ videoPath: videoUri, resultPath: resultPath });
}
function getResultPath(videoPath) {
    return TruvideoSdkVideo.getResultPath({ path: videoPath });
}
async function getAllRequests(status) {
    return parsePluginResponse(TruvideoSdkVideo.getAllRequests({ status: status }));
}
async function getRequestById(id) {
    return parsePluginResponse(TruvideoSdkVideo.getRequestById({ id: id }));
}
function generateThumbnail(videoPath, resultPath, position, width, height, precise) {
    return TruvideoSdkVideo.generateThumbnail({
        videoPath: videoPath,
        resultPath: resultPath,
        position: position,
        width: width,
        height: height,
        precise: precise
    });
}
exports.FrameRate = void 0;
(function (FrameRate) {
    FrameRate["twentyFourFps"] = "twentyFourFps";
    FrameRate["twentyFiveFps"] = "twentyFiveFps";
    FrameRate["thirtyFps"] = "thirtyFps";
    FrameRate["fiftyFps"] = "fiftyFps";
    FrameRate["sixtyFps"] = "sixtyFps";
})(exports.FrameRate || (exports.FrameRate = {}));
exports.BuilderType = void 0;
(function (BuilderType) {
    BuilderType["merge"] = "merge";
    BuilderType["concat"] = "concat";
    BuilderType["encode"] = "encode";
})(exports.BuilderType || (exports.BuilderType = {}));
class MergeBuilder {
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
        if (frameRate == exports.FrameRate.fiftyFps) {
            this.frameRate = 'fiftyFps';
        }
        else if (frameRate == exports.FrameRate.sixtyFps) {
            this.frameRate = 'sixtyFps';
        }
        else if (frameRate == exports.FrameRate.twentyFourFps) {
            this.frameRate = 'twentyFourFps';
        }
        else if (frameRate == exports.FrameRate.twentyFiveFps) {
            this.frameRate = 'twentyFiveFps';
        }
        else if (frameRate == exports.FrameRate.thirtyFps) {
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
        this.mergeData = parsePluginResponse(response);
        return this;
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
        this.mergeData = parsePluginResponse(response);
        return this.mergeData;
    }
    async cancel() {
        var _a;
        if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error('Call build() and ensure it succeeds before calling cancel().');
        }
        var response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
        this.mergeData = parsePluginResponse(response);
        return this.mergeData;
    }
}
class ConcatBuilder {
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
class EncodeBuilder {
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
            case exports.FrameRate.fiftyFps:
                this.frameRate = 'fiftyFps';
                break;
            case exports.FrameRate.sixtyFps:
                this.frameRate = 'sixtyFps';
                break;
            case exports.FrameRate.twentyFourFps:
                this.frameRate = 'twentyFourFps';
                break;
            case exports.FrameRate.twentyFiveFps:
                this.frameRate = 'twentyFiveFps';
                break;
            case exports.FrameRate.thirtyFps:
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

exports.ConcatBuilder = ConcatBuilder;
exports.EncodeBuilder = EncodeBuilder;
exports.MergeBuilder = MergeBuilder;
exports.cleanNoise = cleanNoise;
exports.compareVideos = compareVideos;
exports.editVideo = editVideo;
exports.generateThumbnail = generateThumbnail;
exports.getAllRequests = getAllRequests;
exports.getRequestById = getRequestById;
exports.getResultPath = getResultPath;
exports.getVideoInfo = getVideoInfo;
//# sourceMappingURL=plugin.cjs.js.map
