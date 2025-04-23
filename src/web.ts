import { WebPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

export class TruvideoSdkVideoWeb extends WebPlugin implements TruvideoSdkVideoPlugin {
  async concatVideos(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async encodeVideo(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async getVideoInfo(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async compareVideos(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async mergeVideos(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async cleanNoise(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async editVideo(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async generateThumbnail(options: { value: string; }): Promise<{ value: string; }> {
    return options;
  }
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
