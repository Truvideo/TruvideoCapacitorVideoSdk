export interface TruvideoSdkVideoPlugin {
    echo(options: {
        value: string
    }): Promise<{ value: string }>;

    concatVideos(options: {
        videoUris: string;
        resultPath: string
    }): Promise<{ result: string }>;

    encodeVideo(options: {
        videoUri: string;
        resultPath: string;
        config: string;
    }): Promise<{ result: object }>;

    getVideoInfo(options: {
        videoPath: string;
    }): Promise<{ result: object }>;

    compareVideos(options: {
        videoUris: string;
    }): Promise<{ result: object }>;

    mergeVideos(options: {
        videoUris: string;
        resultPath: string;
        config: string;
    }): Promise<{ result: object }>;

    cleanNoise(options: {
        videoPath: string;
        resultPath: string;
    }): Promise<{ result: object }>;

    editVideo(options: {
        videoPath: string;
        resultPath: string;
    }): Promise<{ result: object }>;

    generateThumbnail(options: {
        videoPath: string;
        resultPath: string;
        position: number;
        width: number;
        height: number;
        precise: boolean;
    }): Promise<{ result: object }>;

    getResultPath(options: {
        path: string
    }): Promise<{ resultPath: string }>;

    getRequestById(options: {
        path: string
    }): Promise<{ resultPath: string }>;

    processVideo(options: {
        path: string
    }): Promise<{ resultPath: string }>;

    cancelVideo(options: {
        path: string
    }): Promise<{ resultPath: string }>;

}
