export interface TruvideoSdkVideoPlugin {
    echo(options: {
        value: string
    }): Promise<{ value: string }>;

    concatVideos(options: {
        videoUris: string;
        resultPath: string
    }): Promise<{ result: object }>;

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
    }): Promise<{ result: boolean }>;

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
    }): Promise<{ result: string }>;

    getAllRequests(options: {
        status: string
    }): Promise<{ result: string }>;

    getRequestById(options: {
        id: string
    }): Promise<{ result: string }>;

    processVideo(options: {
        path: string
    }): Promise<{ result: object }>;

    cancelVideo(options: {
        path: string
    }): Promise<{ result: object }>;

}
