export class Organization {
    public PGPData:PGPInformation;
    public Name: string;
    public Description: string;
    public Logo: string;
    public Email: string;
    public Phone: string;
    public PhoneSecondary: string;
    public AcceptTxn: string;
    public AcceptXDR: string;
    public RejectTxn: string;
    public RejectXDR: string;
    public TxnHash: string;
    public Author: string;
    public SubAccount: string;
    public SequenceNo: string;
    public Status: string;
    public ApprovedBy: string;
    public ApprovedOn: string;
}

export class PGPInformation {
    public PGPPublicKey: string;
    public StellarPublicKey: string;
    public DigitalSignature: string;
    public SignatureHash:string;
    public StellarTXNToSave: string;
    public StellarTXNToVerify: string;
}