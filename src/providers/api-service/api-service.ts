import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Logger } from 'ionic-logger-new';
import { Properties } from '../../shared/properties';
import { login, blockchainAccs, addMainAcc, validateMainAcc } from '../../shared/config';

@Injectable()
export class ApiServiceProvider {
  url: string = 'https://tracified-gateway.herokuapp.com';
  LocalAdminURL: string = 'https://staging.admin.api.tracified.com';
  reqOpts: any;


  constructor(
    public http: HttpClient, 
    private properties: Properties,
    private logger: Logger
    ) { }

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

  getPublickey(body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': 'Bearer ' + this.properties.token
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

  getNames(body) {

    this.reqOpts = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    }
    console.log(body);
    return this.http.post(this.LocalAdminURL + '/api/bc/names/account/public', body, this.reqOpts)
  }

  addSubAccount(body): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: 'response',
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'Application/json',
          'Authorization': 'Bearer ' + this.properties.token,
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

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }


  /* REFACTORED CODE BELOW */

  private getN(url, headers?): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(url, headers).timeout(2500).subscribe(
        response => {
          this.logger.info("[SUCCESS]GET", this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(response);
        },
        error => {
          this.logger.error("[ERROR]GET: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(error);
        }
      );
    });
  }

  private postN(url, payload, headers?): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(url, payload, headers).timeout(2500).subscribe(
        response => {
          this.logger.info("[SUCCESS]POST", this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(response);
        },
        error => {
          this.logger.error("[ERROR]POST: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(error);
        }
      );
    });
  }

  validateUserN(payload): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json'
      })
    };
    
    return this.postN(login, payload, headers);
    
  }

  getBCAccountsN(): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    };

    return this.getN(blockchainAccs, headers);
  }

  addMainAccountN(payload): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    };

    return this.postN(addMainAcc, payload, headers);
  }

  validateMainAccountN(payload): Promise<any> {

    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    };

    return this.postN(validateMainAcc, payload, headers);

  }


}
