import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'https://tracified-gateway.herokuapp.com';
  LocalAdminURL: string = 'https://staging.admin.api.tracified.com';
  loginurl: string = 'http://www.mocky.io/v2';
  reqOpts: any;


  constructor(public http: HttpClient) { }

  ionViewDidLoad() { }

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
      this.http.post(this.LocalAdminURL + '/' + 'sign/login', body, reqOpts)
        .subscribe(response => {
          resolve(response);
        },
          error => {
            console.log(error);
            reject(error);
          });
    });
  }

  getPublickey(body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
        })
      }
      this.http.post(this.LocalAdminURL + '/' + 'api/bc/key/account/public', body, this.reqOpts)
        .subscribe(response => {

          resolve(response);
        },
          error => {
            console.log(error);
            reject(error);
          });
    });
  }

  getPreviousTXNID(Identifier): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
        })
      }
      this.http.get(this.url + '/transaction/lastTxn/' + Identifier, this.reqOpts)
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

  getBCAccount(): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(JSON.parse(localStorage.getItem('_token')))
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
        })
      }
      this.http.get(this.LocalAdminURL + '/api/bc/keys', this.reqOpts)
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

  addMainAccount(body): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(JSON.parse(localStorage.getItem('_token')))
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
        })
      }
      console.log(body);
      this.http.post(this.LocalAdminURL + '/api/bc/key/main', body, this.reqOpts)
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

  getNames(body) {

    this.reqOpts = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
      })
    }
    console.log(body);
    return this.http.post(this.LocalAdminURL + '/api/bc/names/account/public', body, this.reqOpts)
  }

  addSubAccount(body): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(JSON.parse(localStorage.getItem('_token')))
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
        })
      }
      this.http.put(this.LocalAdminURL + '/api/bc/key/sub', body, this.reqOpts)
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

  subAccountStatus(body): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(JSON.parse(localStorage.getItem('_token')))
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
        })
      }
      this.http.post(this.url + '/transaction/coc/subAccountStatus', body, this.reqOpts)
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

  validateMainAccount(body): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(JSON.parse(localStorage.getItem('_token')))
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': `bearer ${JSON.parse(localStorage.getItem('_token'))}`,
        })
      }
      this.http.post(this.LocalAdminURL + '/api/bc/key/main/account', body, this.reqOpts)
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

  verifyEmail(body: any, reqOpts?: any): Promise<any> {
    let confirm = { 'confirmUser': body };
    return new Promise((resolve, reject) => {
      this.http.post(this.LocalAdminURL + '/' + 'sign/forgetpassword', confirm, reqOpts)
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
      this.http.post(this.LocalAdminURL + '/' + 'sign/forgetpassword', confirm, reqOpts)
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
