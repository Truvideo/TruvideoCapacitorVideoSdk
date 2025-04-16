export interface TruvideoSdkVideoPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    concatVideos(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    encodeVideo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    getVideoInfo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    compareVideos(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    mergeVideos(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    cleanNoise(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    editVideo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    generateThumbnail(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
