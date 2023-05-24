import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

// Shared Services
import { Properties } from '../../shared/properties';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { Testimonial } from 'src/app/shared/models/testimonial';
import { Organization } from 'src/app/shared/models/organization';

@Injectable({
   providedIn: 'root',
})
export class DataServiceProvider {
   constructor(
      public http: HttpClient,
      private apiService: ApiServiceProvider,
      private storage: StorageServiceProvider,
      private properties: Properties,
      private blockchainService: BlockchainServiceProvider,
      private authService: AuthServiceProvider
   ) {}


   getBlockchainAccounts(): Promise<any> {
      return new Promise((resolve, reject) => {
         this.apiService
            .getBCAccountsN()
            .then(res => {
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
            })
            .catch(err => {
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

   validateSecretKey(secretKey: string) {
      return this.blockchainService.validateSecretKey(secretKey);
   }

   validateSecretKeys(secretKey: string, publicKey: string) {
      return this.blockchainService.validateSecretKeys(secretKey, publicKey);
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

   getIdentifierStatus(identifiers): Promise<any> {
      return this.apiService.getIdentifierStatus(identifiers);
   }

   setLanguage(language) {
      this.storage.setLanguage(language);
   }

    // Testimonials
  getTestimonialsSent(senderPK: string): Promise<any> {
   return this.apiService.getTestimonialsSent(senderPK);
 }

 getTestimonialsReceived(receiverPK: string): Promise<any> {
   return this.apiService.getTestimonialsRecieved(receiverPK);
 }

 updateTestimonial(payload: Testimonial): Promise<any> {
   return this.apiService.updateTestimonial(payload);
 }

 getApprovedOrganizations(): Promise<any> {
   return this.apiService.queryAllOrganizations();
 }
 
 getOrganizationsRequests(): Promise<any> {
   return this.apiService.queryOrganizationsRequests();
 }

 getOrganization(publicKey: string): Promise<any> {
   return this.apiService.getOrganization(publicKey);
 }

 sendTestimonial(payload: Testimonial): Promise<any> {
   return this.apiService.sendTestimonial(payload);
 }

encryptKey(key: string, password: string) {
 return this.blockchainService.encryptBlockchainKey(key, password);
}

changeTransactionPasswordWithPrivateKey(updatedInfo): Promise<any> {
 return this.apiService.changeTransactionPasswordWithPrivateKey(
     updatedInfo,
     this.properties.token
 );
}

// Organization Registraion
registerOrganization(payload: Organization): Promise<any> {
   return this.apiService.registerOrganization(payload);
 }

retrievePGPAccounts(): Promise<any> {
 return this.storage.getPGPAccounts(this.properties.userName);
}

updateOrganization(payload: Organization): Promise<any> {
   return this.apiService.updateOrganization(payload);
 }

 getApprovedOrganizationsPaginated(page: number,perPage: number): Promise<any> {
   return this.apiService.queryAllOrganizationsPaginated(page,perPage);
 }

}
