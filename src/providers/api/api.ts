import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'https://tracified-gateway.herokuapp.com';
  // url: string = 'http://localhost:8030';
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
          const user = {
            "UserName": "Jhon",
            "Email": "Jhon@gmail.com",
            "Password": "passwordhash",
            "AccountName": "admin",
            // "PublicKey": "GCKUXI3JRJANYOF3AM35Z22FGUGYYUIEBPE5TTZ7P3G6XAEFGYZC2POM",
            // "PrivateKey": "U2FsdGVkX19buyZyRq0pkT6vBEtAQ36e5y0ZiuUfdzpBFD7Tj3KgWVKBmnyixlF5mK9RaX+J1VUVZ9jMLcJ1fv1NAk/vjU0vgBcIiZhUCRs="

            "PublicKey": "GD4PIV4DVVKMJRJLERGTTNTKNG6Z67V7JFHYCJNWXMPR2DSQ5FDI2QCT",
            "PrivateKey": "U2FsdGVkX19KzAegZaKEGdlktqrISd5Ks2C2/0Bm7dvj1z9wRQFdPr9JPI3ybo5aa63Zb5J/9zhZypNVU/E4HvFb4xMoh4qOHqN6fjTuE6g="
            // "PublicKey": "GARYFJQY4YQ4V62KUPFSVKZLEZN7LHRDZJKUUWM456MFA2W3CM4XETFG",
            // "PrivateKey": "U2FsdGVkX1/U7TxrrB+kzEiFPa9373k2TUQkRT5pFvUVJQRDURmUQi8Y9jQaSkceZp3kGoFraA1k8oITT8UK6/yjNNXNivug788HaSDJFzc="
          }
          localStorage.setItem('_user', JSON.stringify(user));

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

  subAccountAvailability(body: any, reqOpts?: any): Promise<any> {
    // let confirm = { 'confirmUser': body };
    return new Promise((resolve, reject) => {
      this.http.post("http://www.mocky.io/v2" + '/' + '5c23626d2f00006700049569', body, reqOpts)
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
