import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';

// Shared Services
import { Properties } from '../../shared/properties';

@Injectable()
export class DataServiceProvider {

  constructor(
    public http: HttpClient,
    private apiService: ApiServiceProvider,
    private storage: StorageServiceProvider,
    private properties: Properties
  ) { }

  getBlockchainAccounts(): Promise<any> {
    return this.apiService.getBCAccountsN();
  }

  storeBlockchainAccounts(accounts): Promise<any> {
    return this.storage.setBcAccounts(this.properties.userName, accounts);
  }

  addTransactionAccount(account): Promise<any> {
    return this.apiService.addTransactionAccount(account);
  }

}
