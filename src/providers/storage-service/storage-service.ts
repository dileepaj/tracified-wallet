import { Injectable } from "@angular/core";
import { AES, enc } from "crypto-js";
import * as localforage from "localforage";
import { Logger } from 'ionic-logger-new';
import { Properties } from '../../shared/properties';
import { MintNftPage } from "../../pages/mint-nft/mint-nft";
@Injectable()
export class StorageServiceProvider {
  private createAc : MintNftPage 
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  public profile = localforage.createInstance({
    name: "profileWallet",
    storeName: "profileWallet"
  });

  public blockchainAccounts = localforage.createInstance({
    name: "bcAccounts",
    storeName: "bcAccounts"
  });

  public photo = localforage.createInstance({
    name: "photo",
    storeName: "photo"
  });

  public misc = localforage.createInstance({
    name: "misc",
    storeName: "misc"
  });

  public language = localforage.createInstance({
    name: 'language',
    storeName: 'language'
  });

  constructor(
    private logger: Logger,
    private properties: Properties,
  ) { }

  clearAllLocalStores() {
    this.profile.clear();
    this.blockchainAccounts.clear();
    this.photo.clear();
  }

  setUser(user: string, userData: any): Promise<any> {
    return new Promise(resolve => {
      this.profile.setItem(user, userData).then(() => {
        resolve(true);
      });
    });
  }

  getUser(username): Promise<any> {
    return new Promise(resolve => {
      this.profile.length().then(noOfKeys => {
        if (noOfKeys > 0) {
          this.profile.getItem(username).then(user => {
            resolve(user);
          });
        } else {
          resolve(false);
        }
      });
    });
  }

  getLocalProfile(): Promise<any> {
    return new Promise(resolve => {
      this.profile.length().then(noOfKeys => {
        if (noOfKeys === 0) {
          resolve(false);
        } else {
          this.profile.key(0).then(res => {
            this.getUser(res).then(token => {
              resolve(token);
            });
          });
        }
      });
    });
  }

  clearUser(): Promise<any> {
    return new Promise(resolve => {
      this.profile.clear().then(() => {
        resolve(true);
      });
    });
  }

  setImage(username, image) {
    this.photo.setItem(username, image);
  }

  setBcAccounts(username: string, accounts: any): Promise<any> {
    return new Promise(resolve => {
      let encAccounts = AES.encrypt(JSON.stringify(accounts), this.key).toString();
      this.blockchainAccounts.setItem(username, encAccounts).then(() => {
        resolve(true);
      });
    });
  }

  getBcAccounts(username) {
     return new Promise((resolve, reject) => {
      this.blockchainAccounts.length().then(noOfKeys => {
        console.log("no keys: ",noOfKeys)
        console.log("bc account: ",this.blockchainAccounts.length())
        if (noOfKeys > 0) {
          this.blockchainAccounts.getItem(username).then(accounts => {
            console.log("recived accounts: ",accounts)
            if(accounts != null){
              let decryptedAccs = JSON.parse(AES.decrypt(accounts.toString(), this.key).toString(enc.Utf8));
              resolve(decryptedAccs);
            }else{
              console.log("returning null")
              resolve(null)
              return 
            }
            
          }).catch((err) => {
            this.logger.error("Storage get bc item failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject(false);
          });
        } else {
          this.logger.error("No BC accounts found.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(false);
        }
      }).catch((err) => {
        this.logger.error("Storage check length failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  clearBcAccounts() {
    return new Promise(resolve => {
      this.blockchainAccounts.clear().then(() => {
        resolve(true);
      });
    });
  }

  setDefaultAccount(account): Promise<any> {
    return new Promise(resolve => {
      let encAccount = AES.encrypt(JSON.stringify(account), this.key).toString();
      this.misc.setItem("defaultAccount", encAccount).then(() => {
        resolve(true);
      });
    });
  }

  getDefaultAccount(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.misc.length().then(noOfKeys => {
        if (noOfKeys > 0) {
          this.misc.getItem("defaultAccount").then(account => {
            let decryptedAcc = JSON.parse(AES.decrypt(account.toString(), this.key).toString(enc.Utf8));
            resolve(decryptedAcc);
          }).catch((err) => {
            this.logger.error("Storage get default account failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject(err);
          });
        } else {
          this.logger.error("No default account found.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(false);
        }
      }).catch((err) => {
        this.logger.error("Storage check length failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  public setLanguage(language) {
    this.language.setItem('language', language);
  }

}
