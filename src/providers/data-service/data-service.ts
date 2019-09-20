import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

// Shared Services
import { Properties } from '../../shared/properties';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

@Injectable()
export class DataServiceProvider {

  constructor(
    public http: HttpClient,
    private apiService: ApiServiceProvider,
    private storage: StorageServiceProvider,
    private properties: Properties,
    private blockchainService: BlockchainServiceProvider,
    private authService: AuthServiceProvider
  ) { }

  getBlockchainAccounts(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.getBCAccountsN().then((res) => {
        if (res.status == 200) {
          let accounts = res.body.accounts.accounts;
          let otherAccs = this.blockchainService.removeFoAccount(accounts);
          if (otherAccs) {
            resolve(otherAccs);
          } else {
            reject({ status: 406 });
          }
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  storeBlockchainAccounts(accounts): Promise<any> {
    return this.storage.setBcAccounts(this.properties.userName, accounts);
  }

  retrieveBlockchainAccounts(): Promise<any> {
    return this.storage.getBcAccounts(this.properties.userName);
  }

  addTransactionAccount(account): Promise<any> {
    return this.apiService.addTransactionAccount(account);
  }

  addSubAccount(account): Promise<any> {
    return this.apiService.addSubAccount(account);
  }

  clearLocalData() {
    this.storage.clearAllLocalStores();
  }

  retrieveDefaultAccount(): Promise<any> {
    return this.storage.getDefaultAccount();
  }

  setDefaultAccount(account): Promise<any> {
    return this.storage.setDefaultAccount(account);
  }

  changeUserDetails(type, userModel): Promise<any> {
    return this.authService.changeUserSettings(type, userModel);
  }

  changeTransactionAccPassword(passwordModel) {
    return this.blockchainService.changeTransactionPassword(passwordModel);
  }

  subAccountsStatus(subAccounts) {
    return this.apiService.getSubAccountsStatus(subAccounts);
  }

  sendCoC(coc): Promise<any> {
    return this.apiService.sendCoC(coc);
  }

  updateCoC(updatedCoC): Promise<any> {
    return this.apiService.updateCoC(updatedCoC);
  }

  getAccountNamesOfKeys(accountKeys): Promise<any> {
    return this.apiService.getAccountNames(accountKeys);
  }

  getAllReceivedCoCs(accountKey): Promise<any> {
    return this.apiService.queryAllReceivedCoCs(accountKey);
  }

  getAllSentCoCs(accountKey): Promise<any> {
    return this.apiService.queryAllSentCoCs(accountKey);
  }
}
