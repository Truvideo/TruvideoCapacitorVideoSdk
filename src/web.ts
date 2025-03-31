import { WebPlugin } from '@capacitor/core';

import type { TruvideoSdkVideoPlugin } from './definitions';

export class TruvideoSdkVideoWeb extends WebPlugin implements TruvideoSdkVideoPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
