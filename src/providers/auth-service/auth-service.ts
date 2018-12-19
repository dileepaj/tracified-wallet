import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { ConnectivityServiceProvider } from '../connectivity-service/connectivity-service';
import { ToastController } from 'ionic-angular';
import { AES, enc } from 'crypto-js';

@Injectable()
export class AuthServiceProvider {
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  constructor(public http: HttpClient,
    private apiService: Api,
    private connectivityService: ConnectivityServiceProvider,
    private toastCtrl: ToastController, ) {
    console.log('Hello AuthServiceProvider Provider');

  }

  validateUser(authmodel): Promise<any> {
    var user = {
      "user": {
        username: AES.encrypt(authmodel.userName, this.adminKey).toString(),
        password: AES.encrypt(authmodel.password, this.adminKey).toString(),
        newPassword: AES.encrypt(authmodel.newPassword, this.adminKey).toString()
      }
    };
    return new Promise((resolve, reject) => {
      console.log(user);
      if (this.connectivityService.onDevice) {
        this.apiService.validateUser(user, {
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

  verifyEmail(email): Promise<any> {
    let confirmUser = {
      email: AES.encrypt(email, this.adminKey).toString()
    };
    // return this.apiService.verifyEmail(confirmUser, {
    //   observe: 'response',
    //   headers: new HttpHeaders({
    //     'Accept': 'application/json',
    //     'Content-Type': 'Application/json',
    //   })
    // }).then(res => {
    //   return res;
    // });

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

  resetPassword(email, password, code ): Promise<any> {
    let reset = {
      email: AES.encrypt(email, this.adminKey).toString(),
      password: AES.encrypt(password, this.adminKey).toString(),
      code: code
    };
    // return this.apiService.resetPassword(reset, {
    //   observe: 'response',
    //   headers: new HttpHeaders({
    //     'Accept': 'application/json',
    //     'Content-Type': 'Application/json',
    //   })
    // }).then(res => {
    //   return res;
    // });

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

}
