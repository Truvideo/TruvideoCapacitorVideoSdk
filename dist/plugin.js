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
            // if (!response?.result || typeof response.result !== 'object') {
            //     throw new Error('❌ mergeVideos result is not a valid object.');
            // }
            // this.mergeData = response.result as BuilderResponse;
            try {
                this.mergeData = response.result;
            }
            catch (e) {
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
        async process() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
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
                this.mergeData = JSON.parse(response.result);
            }
            catch (e) {
                console.error("❌ [Process] Failed to parse resultPath JSON:", response.result, e);
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
            if (!response || !response.result) {
                throw new Error('❌ cancelVideo did not return a valid resultPath.');
            }
            this.mergeData = JSON.parse(response.result);
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
            if (!response || typeof response !== 'object') {
                throw new Error("Build failed: concatVideos response is not an object");
            }
            if (!response.result || typeof response.result !== 'object') {
                throw new Error("Build failed: response.result is not valid");
            }
            this.concatData = response.result;
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
            if (!response || typeof response !== 'object') {
                throw new Error("Process failed: response is not an object");
            }
            if (!response.result || typeof response.result !== 'string') {
                throw new Error("Process failed: response.result is not a valid string");
            }
            this.concatData = JSON.parse(response.result);
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
            if (!response || typeof response !== 'object') {
                throw new Error("Cancel failed: response is not an object");
            }
            if (!response.result || typeof response.result !== 'string') {
                throw new Error("Cancel failed: response.result is not a valid string");
            }
            this.concatData = JSON.parse(response.result);
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
            if (!response || typeof response !== 'object') {
                console.error("❌ Invalid response from encodeVideo:", response);
                throw new Error("Build failed: encodeVideo response is not an object");
            }
            if (!response.result || typeof response.result !== 'object') {
                console.error("❌ Invalid result in encodeVideo response:", response.result);
                throw new Error("Build failed: response.result is not valid");
            }
            this.mergeData = response.result;
            return this;
        }
        // Process the video after build
        async process() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('Call build() and ensure it succeeds before calling process().');
            }
            const response = await TruvideoSdkVideo.processVideo({ path: this.mergeData.id });
            this.mergeData = JSON.parse(response.result);
            return this.mergeData;
        }
        // Cancel the video encoding
        async cancel() {
            var _a;
            if (!((_a = this.mergeData) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error('Call build() and ensure it succeeds before calling cancel().');
            }
            const response = await TruvideoSdkVideo.cancelVideo({ path: this.mergeData.id });
            this.mergeData = JSON.parse(response.result);
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
