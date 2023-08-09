import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
    providedIn: 'root',
})
export class pushNotificationProvider {
    constructor(private router: Router) { }

    registerNotifications = async () => {
        let permStatus = await PushNotifications.checkPermissions();
        console.log('permStatus', permStatus);
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive !== 'granted') {
            throw new Error('User denied permissions!');
        } else if (permStatus.receive === 'granted') {
            PushNotifications.register();
        }
        console.log("param received : ",permStatus.receive)

        // await PushNotifications.register();

        PushNotifications.addListener('registration', token => {
            console.info('Registration token: ', token.value);
            console.log('token.value', token.value);
        });

        PushNotifications.addListener('registrationError', err => {
            console.error('Registration error: ', err.error);
            console.log('Registration error: ', err.error);
        });

        PushNotifications.addListener('pushNotificationReceived', notification => {
            console.log('Push notification received: ', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            try {
                console.log('Push notification action performed', notification.actionId, notification.inputValue);
            } catch {
                console.log('Push notification received & app is closed ');
            }
        });
    };


}
