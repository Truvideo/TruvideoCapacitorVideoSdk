export interface TruvideoSdkVideoPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
