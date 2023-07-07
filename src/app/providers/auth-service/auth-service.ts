import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { ToastController } from '@ionic/angular';
import { AES, enc } from 'crypto-js';

import { Properties } from '../../shared/properties';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from '../logger-service/logger.service';
import { EventsService } from '../event-service/events.service';

import { ApiServiceProvider } from '../api-service/api-service';
import { ConnectivityServiceProvider } from '../connectivity-service/connectivity-service';
import { StorageServiceProvider } from '../storage-service/storage-service';
import { MappingServiceProvider } from '../mapping-service/mapping-service';
import { TOAST_TIMER } from 'src/environments/environment';
import { resolve } from 'dns';
import { rejects } from 'assert';

@Injectable({
   providedIn: 'root',
})
export class AuthServiceProvider {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');
   shopId: any = '';
   gemName: any = '';

   constructor(
      public http: HttpClient,
      private apiService: ApiServiceProvider,
      private connectivityService: ConnectivityServiceProvider,
      private toastCtrl: ToastController,
      private properties: Properties,
      private events: EventsService,
      private storageService: StorageServiceProvider,
      private mappingService: MappingServiceProvider,
      private logger: LoggerService
   ) {}

   validateUser(authmodel): Promise<any> {
      var user = {
         user: {
            username: AES.encrypt(authmodel.userName, this.adminKey).toString(),
            password: AES.encrypt(authmodel.password, this.adminKey).toString(),
            newPassword: AES.encrypt(authmodel.newPassword, this.adminKey).toString(),
         },
      };

      return new Promise((resolve, reject) => {
         if (this.connectivityService.onDevice) {
            this.apiService
               .validateUserN(user)
               .then(
                  res => {
                     if (res.status === 200) {
                        this.properties.token = res.body.Token;
                        const decoded: any = jwt.decode(this.properties.token);
                        this.storageService.setUser(authmodel.userName, AES.encrypt(this.properties.token, this.key).toString());
                        this.setProperties(decoded);
                        resolve(res);
                     } else {
                        resolve(res);
                     }
                  },
                  err => {
                     reject(err);
                  }
               )
               .catch(error => {
                  this.logger.error('Validate user error: ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(error);
               });
         }
      });
   }

   verifyEmail(email): Promise<any> {
      let confirmUser = {
         email: AES.encrypt(email, this.adminKey).toString(),
      };

      return new Promise((resolve, reject) => {
         if (this.connectivityService.onDevice) {
            return this.apiService
               .verifyEmail(confirmUser, {
                  observe: 'response',
                  headers: new HttpHeaders({
                     Accept: 'application/json',
                     'Content-Type': 'Application/json',
                  }),
               })
               .then(res => {
                  console.log(res);
                  if (res.status === 200) {
                     resolve(res);
                  } else {
                     resolve(res);
                  }
               })
               .catch(error => {
                  console.log(error);
                  reject(error);
               });
         }
      });
   }

   resetPassword(email, password, code): Promise<any> {
      let reset = {
         email: AES.encrypt(email, this.adminKey).toString(),
         password: AES.encrypt(password, this.adminKey).toString(),
         code: code,
      };

      return new Promise((resolve, reject) => {
         if (this.connectivityService.onDevice) {
            return this.apiService
               .resetPassword(reset, {
                  observe: 'response',
                  headers: new HttpHeaders({
                     Accept: 'application/json',
                     'Content-Type': 'Application/json',
                  }),
               })
               .then(res => {
                  console.log(res);
                  if (res.status === 200) {
                     resolve(res);
                  } else {
                     resolve(res);
                  }
               })
               .catch(error => {
                  console.log(error);
                  reject(error);
               });
         }
      });
   }

   // get local profile
   authorizeLocalProfile(): Promise<any> {
      return new Promise(resolve => {
         this.storageService
            .getLocalProfile()
            .then(res => {
               if (res) {
                  var decryptedToken = AES.decrypt(res, this.key).toString(enc.Utf8);
                  this.properties.token = decryptedToken;
                  this.checkTokenExpire(decryptedToken).then(notExpired => {
                     if (notExpired) {
                        const decoded: any = jwt.decode(decryptedToken, { complete: true });
                        this.setProperties(decoded.payload);
                        resolve(true);
                     } else if (!notExpired) {
                        this.presentToast('Your logging session has been expired. Please login again.');
                        resolve(false);
                     }
                  });
               } else if (res === false) {
                  resolve(false);
               }
            })
            .catch(err => {
               resolve(false);
            });
      });
   }

   async presentToast(message) {
      const toast = await this.toastCtrl.create({
         message: message,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }

   // check token expiration
   checkTokenExpire(token): Promise<boolean> {
      return new Promise(resolve => {
         const decoded: any = jwt.decode(token, { complete: true });
         const exp = decoded.payload['exp'];
         if (exp !== undefined) {
            const now = Math.floor(Date.now() / 1000);
            if (exp > now) {
               resolve(true);
            } else {
               this.storageService.clearUser();
               resolve(false);
            }
         } else {
            resolve(false);
         }
      });
   }

   setProperties(decodedToken) {
      this.properties.userName = decodedToken['username'];
      this.properties.tenant = decodedToken['tenantID'];
      let fullName = decodedToken['name'].split(' ');
      this.properties.firstName = fullName[0];
      this.properties.lastName = fullName[1];
      this.properties.company = decodedToken['company'];
      this.properties.userType = decodedToken['type'];
      this.properties.displayImage = decodedToken['displayImage'];
      this.events.publish('dislayName', this.properties.firstName);
      this.events.publish('company', this.properties.company);
      this.setDisplayImagetoStorage();
   }

   setDisplayImagetoStorage() {
      if (this.properties.displayImage !== 'none') {
         this.mappingService
            .toBase64Url(this.properties.displayImage, 'image/jpeg')
            .then(base64Image => {
               this.storageService.setImage(this.properties.userName, base64Image);
            })
            .catch(err => {
               this.logger.error('Setting display image to storage failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
      }
   }

   changeUserSettings(type, userModel): Promise<any> {
      var user;
      if (type === 'profile') {
         user = {
            username: AES.encrypt(this.properties.userName, this.adminKey).toString(),
            firstName: userModel.firstName,
            lastName: userModel.lastName,
            imageURL: 'none',
         };
      } else if (type === 'password') {
         user = {
            username: AES.encrypt(this.properties.userName, this.adminKey).toString(),
            oldPassword: AES.encrypt(userModel.oldPassword, this.adminKey).toString(),
            newPassword: AES.encrypt(userModel.newPassword, this.adminKey).toString(),
         };
      } else if (type === 'image') {
         user = {
            username: AES.encrypt(this.properties.userName, this.adminKey).toString(),
            image: userModel.image,
            name: userModel.name,
         };
      }
      return new Promise((resolve, reject) => {
         this.apiService
            .changeUserSettings(type, user, this.properties.token)
            .then(res => {
               if (type === 'profile' && res.status === 200) {
                  this.setDisplayName(res.body.Token);
               } else if (type === 'image' && res.status === 200) {
                  this.setDisplayImage(res.body.Token);
               }
               resolve(res);
            })
            .catch(err => {
               reject(err);
            });
      });
   }

   setDisplayName(token): Promise<any> {
      this.updateStoredToken(this.properties.userName, token);
      return new Promise(resolve => {
         this.decodeToken(token).then(res => {
            this.properties.displayName = res.payload['name'];
            if (this.properties.displayName !== undefined) {
               this.events.publish('dislayName', this.properties.firstName);
               resolve(true);
            }
         });
      });
   }

   setDisplayImage(token): Promise<any> {
      return new Promise(resolve => {
         this.decodeToken(token).then(res => {
            this.properties.displayImage = res.payload['displayImage'];
            if (this.properties.displayImage !== undefined) {
               this.events.publish('displayImage', this.properties.displayImage);
               resolve(true);
            }
         });
      });
   }

   updateStoredToken(username, token) {
      this.storageService.setUser(username, AES.encrypt(token, this.key).toString());
      const decoded = jwt.decode(token);
      this.setProperties(decoded);
   }

   decodeToken(token): Promise<any> {
      return new Promise(resolve => {
         const decoded = jwt.decode(token, { complete: true });
         resolve(decoded);
      });
   }

   setAppLinkParam(shopId, gemName) {
      this.shopId = shopId;
      this.gemName = gemName;
   }

   getAppLindParam(): Promise<any> {
      console.log(this.shopId);
      return new Promise((resolve, rejects) => {
         if (this.shopId && this.gemName) {
            resolve({ shopId: this.shopId, gemName: this.gemName });
         } else rejects(null);
      });
   }
}
