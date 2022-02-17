import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Logger } from 'ionic-logger-new';
import { Properties } from '../../shared/properties';
import {
  login,
  blockchainAccs,
  addMainAcc,
  validateMainAcc,
  getMainPublicKey,
  getMainPublicKeys,
  detailChange,
  passwordChange,
  changeDisplayImage,
  transactionPasswordChange,
  subAccountsStatus,
  updateSubAcc,
  sendCoC,
  cocReceived,
  updateCoC,
  cocSent,
  identifierStatus,
  blockchainAccsByTenant,
  allOrganization,
  testimonialReceived,
  testimonialSent,
  subAccountStatus,
  approvedOrganization,
  organizationRequests,
  testimonialAPI,
  approvedOrganziationsPaginated
} from '../../shared/config';
import { Organization } from '../../shared/models/organization';
import { Testimonial } from '../../shared/models/testimonial';

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



  getNames(body) {

    this.reqOpts = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    }

    return this.http.post(getMainPublicKeys, body, this.reqOpts)
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
      this.http.put(this.LocalAdminURL + '/api/bc/user/subAccount', body, this.reqOpts)
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
      this.http.get(url, headers).timeout(25000).subscribe(
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
      this.http.post(url, payload, headers).timeout(25000).subscribe(
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

  private putN(url, payload?, headers?) {
    return new Promise((resolve, reject) => {
      this.http.put(url, payload, headers).timeout(25000).subscribe(
        response => {
          this.logger.info("[SUCCESS]PUT", this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(response);
        },
        error => {
          this.logger.error("[ERROR]PUT: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
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

  getSubAccountsStatus(payload): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
      })
    }

    return this.postN(subAccountsStatus, payload, headers);
  }

  getSubAccountStatus(payload): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
      })
    }

    return this.postN(subAccountStatus, payload, headers);
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

  addTransactionAccount(payload): Promise<any> {
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

  addTransactionSubAccount(payload): Promise<any> {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    };

    return this.putN(updateSubAcc, payload, headers);
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

    return this.getN(validateMainAcc + "?accountName=" + payload, headers);

  }

  getIdentifierStatus(encodedIds) {
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    };

    return this.getN(identifierStatus + "/" + encodedIds, headers);
  }

  changeUserSettings(type, payload, token): Promise<any> {
    var url;
    var user = { 'user': payload };
    if (type === 'profile') {
      url = detailChange;
    } else if (type === 'password') {
      url = passwordChange;
    } else if (type === 'image') {
      url = changeDisplayImage;
    }
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    };
    return this.postN(url, user, headers);
  }

  changeTranasctionPassword(params): Promise<any> {
    let sk = encodeURI(params.sk);
    let accName = encodeURI(params.accName);
    let url1 = transactionPasswordChange + '?sk=' + sk + '&accountName=' + accName;
    let headers = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    }

    return this.putN(url1, '', headers);
  }

  sendCoC(coc): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.postN(sendCoC, coc, headers);
  }

  updateCoC(updatedCoC): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.putN(updateCoC, updatedCoC, headers);
  }

  getPublickey(body: any): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    }

    let url = getMainPublicKey + '?accountName=' + body;

    return this.getN(url, header);
  }
  
  getPublicAccountsByTenant(): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token
      })
    }

    return this.getN(blockchainAccsByTenant, header);
  }

  getAccountNames(accountKeys): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'Application/json',
        'Authorization': 'Bearer ' + this.properties.token,
      })
    }

    return this.postN(getMainPublicKeys, accountKeys, header);
  }

  queryAllReceivedCoCs(accountKey): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(cocReceived + accountKey, header);
  }

  queryAllSentCoCs(accountKey): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(cocSent + accountKey, header);
  }

  //Organization Registration 
  registerOrganization(payload: Organization): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.postN(allOrganization, payload, headers);
  }

  updateOrganization(payload: Organization): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.putN(allOrganization, payload, headers);
  }

  getOrganization(publicKey: string): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(allOrganization + "/" + publicKey, header);
  }

  queryAllOrganizations(): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(approvedOrganization, header);
  }
  
  queryOrganizationsRequests(): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(organizationRequests, header);
  }

  // Testimonials
  getTestimonialsSent(senderPK: string) {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(testimonialSent + senderPK, header);
  }

  getTestimonialsRecieved(receiverPK: string) {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(testimonialReceived + receiverPK, header);
  }
  
  sendTestimonial(payload: Testimonial): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.postN(testimonialAPI, payload, headers);
  }

  updateTestimonial(payload: Testimonial): Promise<any> {
    let headers = { 'Content-Type': 'application/json' };
    return this.putN(testimonialAPI, payload, headers);
  }

  queryAllOrganizationsPaginated(page: number, perPage: number): Promise<any> {
    let header = {
      observe: 'response',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.getN(approvedOrganziationsPaginated + '?page=' + page + '&perPage=' + perPage, header);
  }
}
