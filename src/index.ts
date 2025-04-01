import { registerPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

const TruvideoSdkVideo = registerPlugin<TruvideoSdkVideoPlugin>('TruvideoSdkVideo');

export * from './definitions';
export { TruvideoSdkVideo };
