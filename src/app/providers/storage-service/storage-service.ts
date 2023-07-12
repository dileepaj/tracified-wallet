import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';
import * as localforage from 'localforage';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from '../logger-service/logger.service';
import { Properties } from '../../shared/properties';

@Injectable({
   providedIn: 'root',
})
export class StorageServiceProvider {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   public profile = localforage.createInstance({
      name: 'profileWallet',
      storeName: 'profileWallet',
   });

   public blockchainAccounts = localforage.createInstance({
      name: 'bcAccounts',
      storeName: 'bcAccounts',
   });

   public photo = localforage.createInstance({
      name: 'photo',
      storeName: 'photo',
   });

   public misc = localforage.createInstance({
      name: 'misc',
      storeName: 'misc',
   });

   public language = localforage.createInstance({
      name: 'language',
      storeName: 'language',
   });

   public temPubKey = localforage.createInstance({
      name: 'temPubKey',
      storeName: 'temPubKey',
   });

   public deviceMnemonic = localforage.createInstance({
      name: 'seedPhrase',
      storeName: 'seedPhrase',
      description: 'Will be used to store the seed phrase of the device user',
   });
   public mnemonicProfiles = localforage.createInstance({
      name: 'mnemonicProfiles',
      storeName: 'mnemonicProfiles',
      description: 'Seed phrase profile storage',
   });

   public otpTimeout = localforage.createInstance({
      name: 'otpTimeout',
      storeName: 'otpTimeout',
   });
   constructor(private logger: LoggerService, private properties: Properties) {}

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
         this.blockchainAccounts
            .length()
            .then(noOfKeys => {
               if (noOfKeys > 0) {
                  this.blockchainAccounts
                     .getItem(username)
                     .then(accounts => {
                        if (accounts != null) {
                           let decryptedAccs = JSON.parse(AES.decrypt(accounts.toString(), this.key).toString(enc.Utf8));
                           resolve(decryptedAccs);
                        } else {
                           resolve(null);
                           return;
                        }
                     })
                     .catch(err => {
                        this.logger.error('Storage get bc item failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        reject(err);
                     });
               } else {
                  this.logger.error('No BC accounts found.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  resolve(null);
               }
            })
            .catch(err => {
               this.logger.error('Storage check length failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
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
         this.misc.setItem('defaultAccount', encAccount).then(() => {
            resolve(true);
         });
      });
   }

   getDefaultAccount(): Promise<any> {
      return new Promise((resolve, reject) => {
         this.misc
            .length()
            .then(noOfKeys => {
               if (noOfKeys > 0) {
                  this.misc
                     .getItem('defaultAccount')
                     .then(account => {
                        let decryptedAcc = JSON.parse(AES.decrypt(account.toString(), this.key).toString(enc.Utf8));
                        resolve(decryptedAcc);
                     })
                     .catch(err => {
                        this.logger.error('Storage get default account failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        reject(err);
                     });
               } else {
                  this.logger.error('No default account found.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(false);
               }
            })
            .catch(err => {
               this.logger.error('Storage check length failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject(err);
            });
      });
   }

   public setLanguage(language) {
      this.language.setItem('language', language);
   }

   public setMnemonic(mnemonic: string, email: string) {
      return new Promise(resolve => {
         let encMnemonic = AES.encrypt(JSON.stringify(mnemonic), this.key).toString();
         this.deviceMnemonic.setItem('device-mnemonic', encMnemonic).then(() => {
            this.deviceMnemonic.setItem('device-mnemonic-email', email).then(() => {
               resolve(true);
            });
         });
      });
   }
   public setMnemonicPassword(password: string) {
      return new Promise(resolve => {
         let encPwd = AES.encrypt(JSON.stringify(password), this.key).toString();
         this.deviceMnemonic.setItem('device-pwd', encPwd).then(() => {
            resolve(true);
         });
      });
   }
   public validateMnemonicPassword(password: string) {
      return new Promise((resolve, reject) => {
         let encPwd = AES.encrypt(JSON.stringify(password), this.key).toString();
         this.deviceMnemonic
            .getItem('device-pwd')
            .then(pwd => {
               if (pwd != null) {
                  if (encPwd == pwd.toString()) {
                     resolve(true);
                  }
               } else {
                  resolve(false);
                  return;
               }
            })
            .catch(err => {
               this.logger.error('Password not set: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject(err);
            });
      });
   }
   public addSeedPhraseAccount(index: string, accName: string) {
      return new Promise(resolve => {
         this.mnemonicProfiles.setItem(index, accName).then(() => {
            resolve(true);
         });
      });
   }

   public async getAllMnemonicProfiles(): Promise<{ key: string; value: any }[]> {
      const profiles: { key: string; value: any }[] = [];
      await this.mnemonicProfiles.iterate((key: string, value) => {
         profiles.push({ key, value });
      });
      return profiles;
   }

   public getMnemonic(): Promise<any> {
      return new Promise((resolve, reject) => {
         this.deviceMnemonic
            .getItem('device-mnemonic')
            .then(accIndex => {
               if (accIndex != null) {
                  let decryptedMnemonic = JSON.parse(AES.decrypt(accIndex.toString(), this.key).toString(enc.Utf8));
                  resolve(decryptedMnemonic);
               } else {
                  resolve(null);
                  return;
               }
            })
            .catch(err => {
               this.logger.error('Storage get Mnemonic failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject(err);
            });
      });
   }

   public clearMnemonic(email: string): Promise<any> {
      return new Promise((resolve, reject) => {
         this.deviceMnemonic
            .getItem('device-mnemonic-email')
            .then(data => {
               if (email != data.toString()) {
                  this.mnemonicProfiles.clear().then(() => {
                     this.deviceMnemonic.clear().then(() => {
                        //triggers when a different user logs in. As a result of this mnemonic is cleared from device
                        resolve(true);
                     });
                  });
               } else {
                  //triggers when the same user logs in
                  reject(null);
               }
            })
            .catch(() => {
               //triggers when the device has no seed phrase set
               reject(null);
            });
      });
   }

   setTempPubKey(username, key) {
      localforage.setItem(username, key);
   }

   async getTempPubKey(key) {
      return await localforage.getItem(key);
   }

   public async setOTPTimeout(date: Date) {
      setTimeout(() => {
         this.clearOTPTimeout();
      }, 1000 * 120);
      await this.otpTimeout.setItem('end', date);
   }

   public getOTPTimeout(): Promise<Date> {
      return this.otpTimeout.getItem('end');
   }

   public async clearOTPTimeout() {
      await this.otpTimeout.clear();
   }
}
