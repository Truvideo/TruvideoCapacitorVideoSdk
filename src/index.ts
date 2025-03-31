import { registerPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

const TruvideoSdkVideo = registerPlugin<TruvideoSdkVideoPlugin>('TruvideoSdkVideo', {
  web: () => import('./web').then((m) => new m.TruvideoSdkVideoWeb()),
});

export * from './definitions';
export { TruvideoSdkVideo };
