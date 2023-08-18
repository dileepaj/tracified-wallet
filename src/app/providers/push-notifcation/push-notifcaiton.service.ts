import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
   providedIn: 'root',
})
export class pushNotificationProvider {
   constructor(private router: Router) {}

   registerNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
         permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
         throw new Error('User denied permissions!');
      } else if (permStatus.receive === 'granted') {
         PushNotifications.register();
      }

      // await PushNotifications.register();

      PushNotifications.addListener('registration', token => {
         console.info('Registration token: ', token.value);
      });

      PushNotifications.addListener('registrationError', err => {
         console.error('Registration error: ', err.error);
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {});

      PushNotifications.addListener('pushNotificationActionPerformed', notification => {
         try {
         } catch {}
      });
   };
}
