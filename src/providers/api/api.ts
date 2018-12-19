import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'http://localhost:8030';
  adminURL: string = 'http://staging.admin.api.tracified.com';
  loginurl: string = 'http://www.mocky.io/v2';

  constructor(public http: HttpClient) {
  }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(this.url + '/' + endpoint, reqOpts);
  }

  query(endpoint: string, params: any, reqOpts?: any) {
    return this.http.get(this.url + '/' + endpoint + '/' + params, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
  }

  validateUser(body: any, reqOpts?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.adminURL + '/' + 'sign/login', body, reqOpts)
        .subscribe(response => {
          // console.log(response);
          resolve(response);
        },
          error => {
            console.log(error);
            reject(error);
          });
    });
  }

  verifyEmail(body: any, reqOpts?: any): Promise<any> {
    let confirm = { 'confirmUser': body };
    return new Promise((resolve, reject) => {
      this.http.post(this.adminURL + '/' + 'sign/forgetpassword', confirm, reqOpts)
        .subscribe(response => {
          console.log(response);
          resolve(response);
        },
          error => {
            console.log(error);
            reject(error);
          });
    });
  }

  resetPassword(body: any, reqOpts?: any): Promise<any> {
    let confirm = { 'confirmUser': body };
    return new Promise((resolve, reject) => {
      this.http.post(this.adminURL + '/' + 'sign/forgetpassword', confirm, reqOpts)
        .subscribe(response => {
          console.log(response);
          resolve(response);
        },
          error => {
            console.log(error);
            reject(error);
          });
    });
  }



  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.loginurl + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
  }
}
