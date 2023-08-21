import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';

// import { Logger } from 'ionic-logger-new';
import { LoggerService } from '../logger-service/logger.service';
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
   verifyEmail,
   nftbackUrl,
   gatewayUrl,
   updateSVG,
   adminUrl,
   claimNft,
} from '../../shared/config';

@Injectable({
   providedIn: 'root',
})
export class ApiServiceProvider {
   reqOpts: any;
   // url: string = 'http://localhost:8000';
   // baseUrlSVG: string = 'http://localhost:6081/svgmap';
   // LocalAdminURL: string = 'https://staging.admin.api.tracified.com';
   // nftbeurl = 'https://qa.api.nft.tracified.com';
   // updateSVGurl: string = 'http://localhost:6081/svgmap/';

   constructor(public http: HttpClient, private properties: Properties, private logger: LoggerService) {}

   ionViewDidLoad() {}

   get(endpoint: string, params?: any, reqOpts?: any) {
      if (!reqOpts) {
         reqOpts = {
            params: new HttpParams(),
         };
      }

      // Support easy query params for GET requests
      if (params) {
         reqOpts.params = new HttpParams();
         for (let k in params) {
            reqOpts.params = reqOpts.params.set(k, params[k]);
         }
      }

      return this.http.get(gatewayUrl + '/' + endpoint, reqOpts);
   }

   query(endpoint: string, params: any, reqOpts?: any) {
      return this.http.get(gatewayUrl + '/' + endpoint + '/' + params, reqOpts);
   }

   post(endpoint: string, body: any, reqOpts?: any) {
      return this.http.post(gatewayUrl + '/' + endpoint, body, reqOpts);
   }

   getNames(body) {
      this.reqOpts = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.http.post(getMainPublicKeys, body, this.reqOpts);
   }

   getSVGByHash(Hash: string) {
      //request to get collection name according to user public key

      return this.http.get(`${updateSVG}/${Hash}`);
   }

   getAccountFunded(publickey, nftName, issuer): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         // `/nft/updateStellarMarketplaceBuy?sellingStatus=${sellingStatus}&currentPK=${currentPK}&previousPK=${previousPK}&nfthash=${nfthash}`
         this.http.get(gatewayUrl + `/nft/sponsor?publickey=${publickey}&nftName=${nftName}&issuer=${issuer}`).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   getTrustFunded(publickey, nftName, issuer): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         // `/nft/updateStellarMarketplaceBuy?sellingStatus=${sellingStatus}&currentPK=${currentPK}&previousPK=${previousPK}&nfthash=${nfthash}`
         this.http.get(gatewayUrl + `/nft/sponsortrust?publickey=${publickey}&nftName=${nftName}&issuer=${issuer}`).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   addSubAccount(body): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
               Authorization: 'Bearer ' + this.properties.token,
            }),
         };
         this.http.put(adminUrl + '/api/bc/user/subAccount', body, this.reqOpts).subscribe(
            response => {
               //

               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   subAccountStatus(body): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         this.http.post(gatewayUrl + '/transaction/coc/subAccountStatus', body, this.reqOpts).subscribe(
            response => {
               //

               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }
   requestOTP(email: string, shopID: string) {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };
      let OTP = {
         email: email,
         productID: shopID,
      };
      return this.postN(nftbackUrl + '/otpgen', OTP, headers);
   }

   checkOTP(otp: any, mail: any): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      let OTP = {
         Email: mail,
         Otp: otp,
      };
      return this.postN(nftbackUrl + '/validateOTP/', OTP, headers);
   }

   reSendOtp(data: any): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };
      return this.putN(nftbackUrl + '/resendOTP/', data, headers);
   }

   walletNftSave(payload: any): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.postN(nftbackUrl + '/walletnft/save', payload, headers);
   }

   verifyEmail(body: any, reqOpts?: any): Promise<any> {
      let confirm = { confirmUser: body };
      return new Promise((resolve, reject) => {
         this.http.post(verifyEmail, confirm, reqOpts).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   resetPassword(body: any, reqOpts?: any): Promise<any> {
      let confirm = { confirmUser: body };
      return new Promise((resolve, reject) => {
         this.http.post(resetPassword, confirm, reqOpts).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   put(endpoint: string, body: any, reqOpts?: any) {
      return this.http.put(gatewayUrl + '/' + endpoint, body, reqOpts);
   }

   /* REFACTORED CODE BELOW */

   private getN(url, headers?): Promise<any> {
      return new Promise((resolve, reject) => {
         this.http
            .get(url, headers)
            .pipe(timeout(25000))
            .subscribe(
               response => {
                  this.logger.info('[SUCCESS]GET', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  resolve(response);
               },
               error => {
                  this.logger.error('[ERROR]GET: ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(error);
               }
            );
      });
   }

   private postN(url, payload, headers?): Promise<any> {
      return new Promise((resolve, reject) => {
         this.http
            .post(url, payload, headers)
            .pipe(timeout(25000))
            .subscribe(
               response => {
                  this.logger.info('[SUCCESS]POST', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  resolve(response);
               },
               error => {
                  this.logger.error('[ERROR]POST: ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(error);
               }
            );
      });
   }

   private putN(url, payload?, headers?) {
      return new Promise((resolve, reject) => {
         this.http
            .put(url, payload, headers)
            .pipe(timeout(25000))
            .subscribe(
               response => {
                  this.logger.info('[SUCCESS]PUT', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  resolve(response);
               },
               error => {
                  this.logger.error('[ERROR]PUT: ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(error);
               }
            );
      });
   }

   validateUserN(payload): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
         }),
      };

      return this.postN(login, payload, headers);
   }

   getSubAccountsStatus(payload): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
         }),
      };

      return this.postN(subAccountsStatus, payload, headers);
   }

   getBCAccountsN(): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.getN(blockchainAccs, headers);
   }

   addTransactionAccount(payload): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.postN(addMainAcc, payload, headers);
   }

   addTransactionSubAccount(payload): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.putN(updateSubAcc, payload, headers);
   }

   validateMainAccountN(payload): Promise<any> {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.getN(validateMainAcc + '?accountName=' + payload, headers);
   }

   getIdentifierStatus(encodedIds) {
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.getN(identifierStatus + '/' + encodedIds, headers);
   }

   changeUserSettings(type, payload, token): Promise<any> {
      var url;
      var user = { user: payload };
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
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };
      return this.postN(url, user, headers);
   }

   changeTranasctionPassword(params): Promise<any> {
      let payload = {
         sk: params.sk,
         accountName: params.accName,
      };
      let headers = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.putN(transactionPasswordChange, payload, headers);
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
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      let url = getMainPublicKey + '?accountName=' + body;

      return this.getN(url, header);
   }

   getPublicAccountsByTenant(): Promise<any> {
      let header = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.getN(blockchainAccsByTenant, header);
   }

   getAccountNames(accountKeys): Promise<any> {
      let header = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + this.properties.token,
         }),
      };

      return this.postN(getMainPublicKeys, accountKeys, header);
   }

   queryAllReceivedCoCs(accountKey): Promise<any> {
      let header = {
         observe: 'response',
         headers: new HttpHeaders({
            'Content-Type': 'application/json',
         }),
      };

      return this.getN(cocReceived + accountKey, header);
   }

   queryAllSentCoCs(accountKey): Promise<any> {
      let header = {
         observe: 'response',
         headers: new HttpHeaders({
            'Content-Type': 'application/json',
         }),
      };

      return this.getN(cocSent + accountKey, header);
   }

   getNewIssuerPublicKey(): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         this.http.get(gatewayUrl + '/nft/issueaccount').subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   updateSVG(data: any): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };

         this.http.post(updateSVG, data, this.reqOpts).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   updatePutSVG(svgid: any, hash: string) {
      let nft = {
         svgid: svgid,
         hash: hash,
      };

      return this.http.put(updateSVG, nft);
   }

   minNFTStellar(transactionResultSuccessful, issuerPublicKey, distributorPublickKey, asset_code, collection, Categories, NFTBlockChain, created_at, Tags, NFTURL): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
               Authorization: `Bearer ${this.properties.token}`,
            }),
         };

         let NFTModel = {
            DistributorPublickKey: distributorPublickKey,
            IssuerPublicKey: issuerPublicKey,
            Asset_code: asset_code,
            NFTURL: NFTURL,
            Description: 'Ruri Gems',
            Collection: collection,
            Tags: Tags,
            Categories: Categories,
            Copies: '1',
            NFTLinks: '',
            NFTBlockChain: NFTBlockChain,
            ArtistName: 'RURI',
            ArtistLink: '',
            Successfull: transactionResultSuccessful,
            TrustLineCreatedAt: created_at,
         };
         this.http.post(gatewayUrl + '/nft/wallet/mint-stellar', NFTModel, this.reqOpts).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   retriveNFT(sellingStatus, distributorPK): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         this.http.get(gatewayUrl + `/nft/retriveNFTByStatusAndPK?sellingstatus=${sellingStatus}&distributorPK=${distributorPK}`, this.reqOpts).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   getAllNft(pk) {
      return new Promise((resolve, reject) => {
         let reqNft = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         this.http.get(claimNft + pk).subscribe(
            response => {
               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   //account delete request
   accountDelete(payload): Promise<any> {
      return new Promise((resolve, reject) => {
         this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
               Accept: 'application/json',
               'Content-Type': 'Application/json',
            }),
         };
         this.http.post(adminUrl + '/' + 'sign/walletAppAccountDeletion', payload, this.reqOpts).subscribe(
            response => {
               //

               resolve(response);
            },
            error => {
               reject(error);
            }
         );
      });
   }
}
