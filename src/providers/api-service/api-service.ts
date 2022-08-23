import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

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
  resetPassword,
  verifyEmail
} from '../../shared/config';

@Injectable()
export class ApiServiceProvider {
  //TODO  : Move APi to env file
  url: string = "http://localhost:6081/otp/validate";
  gatewayMintNFTURL: string = "http://localhost:9080"
  baseUrlSVG:string='http://localhost:6081/svg';
  LocalAdminURL: string = 'https://staging.admin.api.tracified.com';
  reqOpts: any;
  nftbeurl='http://localhost:6081';
  updateSVGurl: string= "http://localhost:6081/svgmap/";


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

  getSVGByHash(Hash:string){
    //request to get collection name according to user public key
    console.log("inside get svg service: ",Hash)
    return this.http.get(`${this.updateSVGurl}/${Hash}`);
  }

  updateSVG(svgid:any,hash:string){
    let nft= {
      svgid: svgid,
      hash:hash
    }
    console.log("data passed for update: ",nft)
    return this.http.put(this.updateSVGurl,nft);
    
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

ValidateUserOTP(otp:any,email:any){
  console.log("Inside service")
  let otpModel = {
    email : email,
    otp : otp
  }
  return this.http.post(this.url,otpModel);

}

  verifyEmail(body: any, reqOpts?: any): Promise<any> {
    let confirm = { 'confirmUser': body };
    return new Promise((resolve, reject) => {
      this.http.post(verifyEmail, confirm, reqOpts)
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
      this.http.post(resetPassword, confirm, reqOpts)
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

  getNewIssuerPublicKey(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      this.http.get(this.gatewayMintNFTURL + "/nft/createNFTIssuerAccount").subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  getAccountFunded(publickey,nftName,issuer): Promise<any> {
    console.log("data passed:",publickey,nftName,issuer)
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
     // `/nft/updateStellarMarketplaceBuy?sellingStatus=${sellingStatus}&currentPK=${currentPK}&previousPK=${previousPK}&nfthash=${nfthash}`
      this.http.get(this.gatewayMintNFTURL + `/nft/sponsor?publickey=${publickey}&nftName=${nftName}&issuer=${issuer}`).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  getTrustFunded(publickey,nftName,issuer): Promise<any> {
    console.log("data passed olddddd:",publickey,nftName,issuer)
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
     // `/nft/updateStellarMarketplaceBuy?sellingStatus=${sellingStatus}&currentPK=${currentPK}&previousPK=${previousPK}&nfthash=${nfthash}`
      this.http.get(this.gatewayMintNFTURL + `/nft/sponsortrust?publickey=${publickey}&nftName=${nftName}&issuer=${issuer}`).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  minNFTStellar(
    transactionResultSuccessful,
    issuerPublicKey,
    distributorPublickKey,
    asset_code,
    collection,
    Categories,
    NFTBlockChain,
    created_at,
    Tags,
    NFTURL
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      console.log("inside the service")
      let NFTModel = {
        DistributorPublickKey: distributorPublickKey,
        IssuerPublicKey:issuerPublicKey,
        Asset_code: asset_code,
        NFTURL: NFTURL,
        Description:'Ruri Gems',
        Collection:collection,
        Tags: Tags,
        Categories:Categories,
        Copies:'1',
        NFTLinks:'',
        NFTBlockChain: NFTBlockChain,
        ArtistName:'RURI',
        ArtistLink:'',
        Successfull: transactionResultSuccessful,
        TrustLineCreatedAt: created_at,
      };
      this.http
        .post(this.gatewayMintNFTURL + "/nft/mintStellar", NFTModel, this.reqOpts)
        .subscribe(
          (response) => {
            resolve(response);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  retriveNFT(sellingStatus, distributorPK): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      this.http
        .get(
          this.gatewayMintNFTURL + `/nft/retriveNFTByStatusAndPK?sellingstatus=${sellingStatus}&distributorPK=${distributorPK}`,
          this.reqOpts
        )
        .subscribe(
          (response) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }


}
