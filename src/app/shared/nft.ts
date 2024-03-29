export class NFT {
   issuerpublickey: string;
   blockchain: string;
   nftcreator: string;
   nftname: string;
   currentowner: string;
   nftstatus: string;
   timestamp: string;
   shopid: string;
   thumbnail: string;
   txnhash: string;

   constructor(
      issuerpublickey: string,
      blockchain: string,
      nftcreator: string,
      nftname: string,
      currentowner: string,
      nftstatus: string,
      timestamp: string,
      shopid: string,
      thumbnail: string,
      txnhash: string
   ) {
      this.issuerpublickey = issuerpublickey;
      this.blockchain = blockchain;
      this.nftcreator = nftcreator;
      this.nftname = nftname;
      this.currentowner = currentowner;
      this.nftstatus = nftstatus;
      this.timestamp = timestamp;
      this.shopid = shopid;
      this.thumbnail = thumbnail;
      this.txnhash = txnhash;
   }
}
export enum NFTStatus {
   TrustLineToBeCreated = 1,
   TrustLineCreated = 2,
   RequestForTrustLineRejected = 3,
   nftTransferAccepted = 4,
}
export class NFTState {
   id: string;
   issuerpublickey: string;
   nftstatus: NFTStatus;
   constructor(id: string, issuerpublickey: string, nftstatus: NFTStatus) {
      this.id = id;
      this.issuerpublickey = issuerpublickey;
      this.nftstatus = nftstatus;
   }
}

export interface NFTTransfer {
   issuerpublickey: string;
   blockchain: string;
   nftcreator: string;
   nftname: string;
   nftrequested: string;
   currentowner: string;
   nftstatus: number;
   timestamp: string;
   shopid: string;
   thumbnail: string;
   nftid: string;
}
