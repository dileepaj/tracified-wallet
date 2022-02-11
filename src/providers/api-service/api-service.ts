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
  blockchainAccsByTenant
} from '../../shared/config';

@Injectable()
export class ApiServiceProvider {
  url: string = "http://localhost:9080";
  LocalAdminURL: string = "https://qa.admin.api.tracified.com";
  reqOpts: any;

  constructor(
    public http: HttpClient,
    private properties: Properties,
    private logger: Logger
  ) {}

  ionViewDidLoad() {}

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    return this.http.get(this.url + "/" + endpoint, reqOpts);
  }

  query(endpoint: string, params: any, reqOpts?: any) {
    return this.http.get(this.url + "/" + endpoint + "/" + params, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + "/" + endpoint, body, reqOpts);
  }

  getNames(body) {
    this.reqOpts = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.http.post(getMainPublicKeys, body, this.reqOpts);
  }

  addSubAccount(body): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
          Authorization: "Bearer " + this.properties.token,
        }),
      };
      this.http
        .put(this.LocalAdminURL + "/api/bc/user/subAccount", body, this.reqOpts)
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

  subAccountStatus(body): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      this.http
        .post(
          this.url + "/transaction/coc/subAccountStatus",
          body,
          this.reqOpts
        )
        .subscribe(
          (response) => {
            // console.log(response);

            resolve(response);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  /**
   * @function mintNFTStellar this function call after creating trust line and put request to gateway to mint NFT with this patamter
   * @param transactionResultSuccessful @type Boolean, trustline creation status with NFT issuer account
   * @param issuerPublicKey  NFT initial issuer publickey(generated account) 
   * @param distributorPublickKey NFT fiest NFT owner account(trustline requested wallet-app user)
   * @param asset_code NFT name (asset name)
   * @param TDPtxnhash NFT created to this TDP trasaction hash  
   * @param TDPID NFT created to this TDP id
   * @param NFTBlockChain NFT issued block chain
   * @param created_at trustline reated time stamp
   * @param Identifier TDP identifer
   * @param ProductName TDP product name
   */
  minNFTStellar(
    transactionResultSuccessful,
    issuerPublicKey,
    distributorPublickKey,
    asset_code,
    TDPtxnhash,
    TDPID,
    NFTBlockChain,
    created_at,
    Identifier,
    ProductName
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      let NFTModel = {
        DistributorPublickKey: distributorPublickKey,
        IssuerPublicKey:issuerPublicKey,
        Asset_code: asset_code,
        TDPtxnhash: TDPtxnhash,
        Identifier: Identifier,
        TDPID: TDPID,
        NFTBlockChain: NFTBlockChain,
        Successfull: transactionResultSuccessful,
        TrustLineCreatedAt: created_at,
        ProductName: ProductName,
      };
      this.http
        .post(this.url + "/nft/mintStellar", NFTModel, this.reqOpts)
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

/**
 * @function UpdateSellingStatusNFT this function update the marketplaceNFT collection in a gateway with givent parameter vis gateway request
 * @param currentOwnerPK NFT current owner publick Key
 * @param previousOwnerPK NFT previoue owner publick Key
 * @param nftHash NFT trasaction hash
 * @param sellingStats NFT selling status 
 */
  UpdateSellingStatusNFT(
    nftHash:string,
    sellingStats:string,
    amount:string,
    price:string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      console.log('first',  `/nft/updateStellarMarketplaceSell?sellingStatus=${sellingStats}&amount=${amount}&price=${price}&nfthash=${nftHash}`);
      this.http
        .put(
          this.url +
            `/nft/updateStellarMarketplaceSell?sellingStatus=${sellingStats}&amount=${amount}&price=${price}&nfthash=${nftHash}`,
          this.reqOpts
        )
        .subscribe(
          (response) => {
            // console.log(response);
            resolve(response);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  UpdateBuyingStatusNFT(
    nftHash:string,
    sellingStats:string,
    NFTCuurentOwnerPK,
    NFTPreviousPK,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      this.http
        .put(
          this.url +
            `/nft/updateStellarMarketplaceBuy?sellingStatus=${sellingStats}&currentPK=${NFTCuurentOwnerPK}&previousPK=${NFTPreviousPK}&nfthash=${nftHash}`,
          this.reqOpts
        )
        .subscribe(
          (response) => {
            // console.log(response);
            resolve(response);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }
 
/**
 * @function retriveNFT retive the NFT filterby this twop paramer
 * @param sellingStatus selling status should be NOTFORSALE or FORSALE (use to identify the NFT onsale or not)
 * @param distributorPK this should publickey
 * @returns all nfts fillter by the @sellingStatus and @description
 */
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
          this.url + `/nft/retriveNFTByStatusAndPK?sellingstatus=${sellingStatus}&distributorPK=${distributorPK}`,
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

  /**
   * @function  getNewIssuerPublicKey This function call gateway endpoint to generatenew account
   * @returns generated account public key
   */
  getNewIssuerPublicKey(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };
      this.http.get(this.url + "/nft/createNFTIssuerAccount").subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * @function  getNewIssuerPublicKey This function call gateway endpoint to generatenew account
   * @returns generated account public key
   */
   authTrustLine(currentPK,trustor,nftName,payamentTxn:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.reqOpts = {
        observe: "response",
        headers: new HttpHeaders({
          Accept: "application/json",
          "Content-Type": "Application/json",
        }),
      };

      let dataModel = {
        CurrentPK	: currentPK,
        Trustor: trustor,
        NFTName:nftName,
        PayamentTxn:payamentTxn.hash
      };
      this.http.post(this.url + "/nft/SetAuthTrust",dataModel,this.reqOpts).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  verifyEmail(body: any, reqOpts?: any): Promise<any> {
    let confirm = { confirmUser: body };
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.LocalAdminURL + "/" + "sign/forgetpassword",
          confirm,
          reqOpts
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

  resetPassword(body: any, reqOpts?: any): Promise<any> {
    let confirm = { confirmUser: body };
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.LocalAdminURL + "/" + "sign/forgetpassword",
          confirm,
          reqOpts
        )
        .subscribe(
          (response) => {
            console.log(response);
            resolve(response);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + "/" + endpoint, body, reqOpts);
  }

  private getN(url, headers?): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(url, headers)
        .timeout(25000)
        .subscribe(
          (response) => {
            this.logger.info(
              "[SUCCESS]GET",
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            resolve(response);
          },
          (error) => {
            this.logger.error(
              "[ERROR]GET: " + JSON.stringify(error),
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            reject(error);
          }
        );
    });
  }

  private postN(url, payload, headers?): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(url, payload, headers)
        .timeout(25000)
        .subscribe(
          (response) => {
            this.logger.info(
              "[SUCCESS]POST",
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            resolve(response);
          },
          (error) => {
            this.logger.error(
              "[ERROR]POST: " + JSON.stringify(error),
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            reject(error);
          }
        );
    });
  }

  private putN(url, payload?, headers?) {
    return new Promise((resolve, reject) => {
      this.http
        .put(url, payload, headers)
        .timeout(25000)
        .subscribe(
          (response) => {
            this.logger.info(
              "[SUCCESS]PUT",
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            resolve(response);
          },
          (error) => {
            this.logger.error(
              "[ERROR]PUT: " + JSON.stringify(error),
              this.properties.skipConsoleLogs,
              this.properties.writeToFile
            );
            reject(error);
          }
        );
    });
  }

  validateUserN(payload): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
      }),
    };
    return this.postN(login, payload, headers);
  }

  getSubAccountsStatus(payload): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
      }),
    };
    return this.postN(subAccountsStatus, payload, headers);
  }

  getBCAccountsN(): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.getN(blockchainAccs, headers);
  }

  addTransactionAccount(payload): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.postN(addMainAcc, payload, headers);
  }

  addTransactionSubAccount(payload): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.putN(updateSubAcc, payload, headers);
  }

  validateMainAccountN(payload): Promise<any> {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.getN(validateMainAcc + "?accountName=" + payload, headers);
  }

  getIdentifierStatus(encodedIds) {
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.getN(identifierStatus + "/" + encodedIds, headers);
  }

  changeUserSettings(type, payload, token): Promise<any> {
    var url;
    var user = { user: payload };
    if (type === "profile") {
      url = detailChange;
    } else if (type === "password") {
      url = passwordChange;
    } else if (type === "image") {
      url = changeDisplayImage;
    }
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.postN(url, user, headers);
  }

  changeTranasctionPassword(params): Promise<any> {
    let sk = encodeURI(params.sk);
    let accName = encodeURI(params.accName);
    let url1 =
      transactionPasswordChange + "?sk=" + sk + "&accountName=" + accName;
    let headers = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.putN(url1, "", headers);
  }

  sendCoC(coc): Promise<any> {
    let headers = { "Content-Type": "application/json" };
    return this.postN(sendCoC, coc, headers);
  }

  updateCoC(updatedCoC): Promise<any> {
    let headers = { "Content-Type": "application/json" };
    return this.putN(updateCoC, updatedCoC, headers);
  }

  getPublickey(body: any): Promise<any> {
    let header = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    let url = getMainPublicKey + "?accountName=" + body;
    return this.getN(url, header);
  }

  getPublicAccountsByTenant(): Promise<any> {
    let header = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.getN(blockchainAccsByTenant, header);
  }

  getAccountNames(accountKeys): Promise<any> {
    let header = {
      observe: "response",
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "Application/json",
        Authorization: "Bearer " + this.properties.token,
      }),
    };
    return this.postN(getMainPublicKeys, accountKeys, header);
  }

  queryAllReceivedCoCs(accountKey): Promise<any> {
    let header = {
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    return this.getN(cocReceived + accountKey, header);
  }

  queryAllSentCoCs(accountKey): Promise<any> {
    let header = {
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    return this.getN(cocSent + accountKey, header);
  }
}

