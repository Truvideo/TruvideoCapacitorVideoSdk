var capacitorTruvideoSdkVideo = (function (exports, core) {
    'use strict';

    const TruvideoSdkVideo = core.registerPlugin('TruvideoSdkVideo');
    function getVideoInfo(videoPath) {
        return TruvideoSdkVideo.getVideoInfo({ videoPath });
    }
    function compareVideos(videoPath) {
        return TruvideoSdkVideo.compareVideos({ videoUris: videoPath });
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
            console.log("📦 [Build] Merging Videos with Config:", config);
            console.log("📦 [Build] Result Path:", this.resultPath);
            console.log("📦 [Build] Video URIs:", this._filePath);
            const response = await TruvideoSdkVideo.mergeVideos({
                videoUris: this._filePath,
                resultPath: this.resultPath,
                config: JSON.stringify(config),
            });
            console.log("📥 [Build] mergeVideos API Raw Response:", response);
            if (!(response === null || response === void 0 ? void 0 : response.result) || typeof response.result !== 'object') {
                throw new Error('❌ mergeVideos result is not a valid object.');
            }
            this.mergeData = response.result;
            if (!this.mergeData.id) {
                throw new Error('❌ mergeVideos result is missing `id`.');
            }
            console.log("✅ [Build] MergeBuilder build success. MergeData:", this.mergeData);
            console.log("🔁 [Build] Returning instance of MergeBuilder:", this);
            return this;
        }
        async process() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                console.error("❌ [Process] Missing mergeData.id. Ensure build() was called successfully.");
                throw new Error('⚠️ Call build() and ensure it succeeds before calling process().');
            }
            console.log("📤 [Process] Starting processVideo with path:", this.mergeData.id);
            const response = await TruvideoSdkVideo.processVideo({
                path: this.mergeData.id
            });
            console.log("📥 [Process] Raw processVideo response:", response);
            if (!response || !response.resultPath) {
                console.error("❌ [Process] Invalid response from processVideo. Missing resultPath.");
                throw new Error('❌ processVideo did not return a valid resultPath.');
            }
            try {
                this.mergeData = JSON.parse(response.resultPath);
            }
            catch (e) {
                console.error("❌ [Process] Failed to parse resultPath JSON:", response.resultPath, e);
                throw new Error('❌ Failed to parse resultPath from processVideo.');
            }
            console.log("✅ [Process] Video processing complete. Processed Data:", this.mergeData);
            return this.mergeData;
        }
        async cancel() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('Call build() and ensure it succeeds before calling cancel().');
            }
            var response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
            if (!response || !response.resultPath) {
                throw new Error('❌ cancelVideo did not return a valid resultPath.');
            }
            this.mergeData = JSON.parse(response.resultPath);
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
            var response = await TruvideoSdkVideo.concatVideos({
                videoUris: this._filePath,
                resultPath: this.resultPath
            });
            this.concatData = JSON.parse(response.result);
            return this;
        }
        async process() {
            var _a;
            if (!((_a = this.concatData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('concatData.id is undefined. Call build() and ensure it succeeds before calling process().');
            }
            var response = await TruvideoSdkVideo.processVideo({
                path: this.concatData.id
            });
            this.concatData = JSON.parse(response.resultPath);
            return this.concatData;
        }
        async cancel() {
            var _a;
            if (!((_a = this.concatData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('concatData.id is undefined. Call build() and ensure it succeeds before calling cancel().');
            }
            var response = await TruvideoSdkVideo.cancelVideo({
                path: this.concatData.id
            });
            this.concatData = JSON.parse(response.resultPath);
            return this.concatData;
        }
    }
    class EncodeBuilder {
        constructor(filePaths, resultPath) {
            this.height = '';
            this.width = '';
            this.frameRate = '';
            if (!filePaths) {
                throw new Error('filePath is required for EncodeBuilder.');
            }
            if (!resultPath) {
                throw new Error('resultPath is required for EncodeBuilder.');
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
            var response = await TruvideoSdkVideo.encodeVideo({
                videoUri: this._filePath,
                resultPath: this.resultPath,
                config: JSON.stringify(config)
            });
            this.mergeData = response.result;
            return this;
        }
        async process() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('Call build() and ensure it succeeds before calling process().');
            }
            // process video
            var response = await TruvideoSdkVideo.processVideo({ path: this.mergeData.id });
            this.mergeData = JSON.parse(response.resultPath);
            return this.mergeData;
        }
        async cancel() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('Call build() and ensure it succeeds before calling cancel().');
            }
            // cancel video
            var response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
            this.mergeData = JSON.parse(response.resultPath);
            return this.mergeData;
        }
    }

    exports.ConcatBuilder = ConcatBuilder;
    exports.EncodeBuilder = EncodeBuilder;
    exports.MergeBuilder = MergeBuilder;
    exports.cleanNoise = cleanNoise;
    exports.compareVideos = compareVideos;
    exports.editVideo = editVideo;
    exports.generateThumbnail = generateThumbnail;
    exports.getResultPath = getResultPath;
    exports.getVideoInfo = getVideoInfo;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
