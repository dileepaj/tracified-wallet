import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
   appId: 'com.tracified.app.wallet',
   appName: 'Tracified wallet',
   webDir: 'www',
   bundledWebRuntime: false,
   plugins: {
      Keyboard: {
         resize: KeyboardResize.Body,
         style: KeyboardStyle.Default,
         resizeOnFullScreen: true,
      },
   },
};

export default config;
