import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { ToastController, Events } from 'ionic-angular';
import { AES, enc } from 'crypto-js';

import { Properties } from '../../shared/properties';
import { Logger } from 'ionic-logger-new';

import { ApiServiceProvider } from '../api-service/api-service';
import { ConnectivityServiceProvider } from '../connectivity-service/connectivity-service';
import { StorageServiceProvider } from '../storage-service/storage-service';
import { MappingServiceProvider } from '../mapping-service/mapping-service';
import { resolve } from 'path';

@Injectable()
export class AuthServiceProvider {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  constructor(
    public http: HttpClient,
    private apiService: ApiServiceProvider,
    private connectivityService: ConnectivityServiceProvider,
    private toastCtrl: ToastController, private properties: Properties,
    private events: Events,
    private storageService: StorageServiceProvider,
    private mappingService: MappingServiceProvider,
    private logger: Logger
  ) { }

  validateUser(authmodel): Promise<any> {
    var user = {
      'user': {
        username: AES.encrypt(authmodel.userName, this.adminKey).toString(),
        password: AES.encrypt(authmodel.password, this.adminKey).toString(),
        newPassword: AES.encrypt(authmodel.newPassword, this.adminKey).toString()
      }
    };

    return new Promise((resolve, reject) => {
      if (this.connectivityService.onDevice) {
        this.apiService.validateUserN(user).then((res) => {
          if (res.status === 200) {
            this.properties.token = res.body.Token;
            const decoded: any = jwt.decode(this.properties.token);
            this.storageService.setUser(authmodel.userName, AES.encrypt(this.properties.token, this.key).toString());
            this.setProperties(decoded);
            resolve(res);
          } else {
            resolve(res);
          }
        }, (err) => {
          reject(err);
        }).catch(error => {
          this.logger.error("Validate user error: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(error);
        });
      }
    });
  }

  verifyEmail(email): Promise<any> {
    let confirmUser = {
      email: AES.encrypt(email, this.adminKey).toString()
    };

    return new Promise((resolve, reject) => {
      if (this.connectivityService.onDevice) {
        return this.apiService.verifyEmail(confirmUser, {
          observe: 'response',
          headers: new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'Application/json',
          })
        }).then((res) => {
          console.log(res);
          if (res.status === 200) {

            resolve(res);
          } else {
            resolve(res);
          }
        }).catch(error => {
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
      code: code
    };

    return new Promise((resolve, reject) => {
      if (this.connectivityService.onDevice) {
        return this.apiService.resetPassword(reset, {
          observe: 'response',
          headers: new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'Application/json',
          })
        }).then((res) => {
          console.log(res);
          if (res.status === 200) {

            resolve(res);
          } else {
            resolve(res);
          }
        }).catch(error => {
          console.log(error);
          reject(error);
        });
      }
    });
  }

  changeUserSettings(type, user): Promise<any> {
    var user;
    return new Promise((resolve) => {
    if(type === 'profile'){
      user= {
        userName: AES.encrypt(user.userName, this.adminKey).toString(),
        firstName: user.dislayName,
        lastName: '',
        image: user.displayImage
      };
    } else if (type === 'password') {
      user = {
        userName: AES.encrypt(user.userName, this.adminKey).toString(),
        oldPassword: AES.encrypt(user.oldPassword, this.adminKey).toString(),
        newPassword: AES.encrypt(user.newPassword, this.adminKey).toString(),
      };
    } else if (type === 'image'){
      user = {
        userName: AES.encrypt(user.userName, this.adminKey).toString(),
        image: user.image,
        name: user.name
      };
    }
  });
  }

  // get local profile
  authorizeLocalProfile(): Promise<any> {
    return new Promise((resolve) => {
      this.storageService.getLocalProfile().then((res) => {
        if (res) {
          var decryptedToken = AES.decrypt(res, this.key).toString(enc.Utf8);
          this.properties.token = decryptedToken;
          this.checkTokenExpire(decryptedToken).then((notExpired) => {
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
      }).catch((err) => {
        resolve(false);
      });
    });
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom'
    });
    toast.present();
  }

  // check token expiration
  checkTokenExpire(token): Promise<boolean> {
    return new Promise((resolve) => {
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
    this.properties.userName = decodedToken["username"];
    this.properties.tenant = decodedToken['tenantID'];
    this.properties.displayName = decodedToken['name'];
    this.properties.company = decodedToken['company'];
    this.properties.userType = decodedToken['type'];
    this.properties.displayImage = decodedToken['displayImage'];
    this.events.publish('dislayName', this.properties.displayName);
    this.events.publish('company', this.properties.company);
    this.setDisplayImagetoStorage();
  }

  setDisplayImagetoStorage() {
    if (this.properties.displayImage !== 'none') {
      this.mappingService.toBase64Url(this.properties.displayImage, 'image/jpeg').then((base64Image) => {
        this.storageService.setImage(this.properties.userName, base64Image);
      }).catch((err) => {
        this.logger.error("Setting display image to storage failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    }
  }
}
