import { Injectable } from '@angular/core';

import { Api } from '../api/api';

@Injectable()
export class Items {

  constructor(public api: Api) { }

  // query(params?: any) {
  //   return this.api.get('/items', params);
  // }

  querycocbysender(params?: any) {
    return this.api.query('getcocbysender', params, {'Content-Type': 'application/json'});
  }
 
  querycocbyReceiver(params?: any) {
    return this.api.query('getcocbyreceiver', params, {'Content-Type': 'application/json'});
  }

  addCOC(body) {
    return this.api.post('insertcoccollection', body, {'Content-Type': 'application/json'});
  }

  updateStatusCOC(body) {
    return this.api.put('insertcoccollection', body, {'Content-Type': 'application/json'});
  }

  delete(item) {
  }

}
