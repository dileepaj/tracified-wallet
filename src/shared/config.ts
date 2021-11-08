import { ENV } from '@app/env';

const gateway = ENV.GATEWAY;
const admin = ENV.API_ADMIN;
const blockchainNetwork = ENV.BLOCKCHAIN_NETWORK;
const blockchainType = ENV.NETWORK_TYPE;
const backend = ENV.API_TRACIFIED;


// Backend GET
export const identifierStatus: string = backend + '/identifiers/status';


// Admin GET
export const blockchainAccs: string = admin + '/api/bc/user'; // GET
export const blockchainAccsByTenant: string = admin + '/api/bc/users/accounts'; // GET

// Admin POST
export const detailChange: string = admin + '/api/changedetails';
export const passwordChange: string = admin + '/api/changepassword';
export const changeDisplayImage: string = admin + '/api/user/profilepicture';
export const transactionPasswordChange: string = admin + '/api/bc/user/mainAccount/sk';

export const addMainAcc: string = admin + '/api/bc/user/mainAccount'; // POST
export const updateSubAcc: string = admin + '/api/bc/user/subAccount'; // PUT
export const getMainPublicKey: string = admin + '/api/bc/user/mainAccount/publicKey'; // GET
export const getMainPublicKeys: string = admin + '/api/bc/user/mainAccount/publicKeys'; // POST
export const validateMainAcc: string = admin + '/api/bc/user/mainAccount/validate'; // GET

export const login: string = admin + '/sign/login'; // POST
export const subAccStatus: string = admin + '/transaction/coc/subAccountStatus'; // POST
export const verifyEmail: string = admin + '/sign/forgetpassword'; // POST 
export const resetPassword: string = admin + '/sign/forgetpassword'; // POST

// Gateway GET
export const previosTxnId: string = gateway + '/transaction/lastTxn/'; // GET
export const cocReceived: string = gateway + '/getcocbyreceiver/';
export const cocSent: string = gateway + '/getcocbysender/';
export const allOrganization: string = gateway + '/organization';
export const testimonialAPI: string = gateway + '/testimonial';
export const testimonialReceived: string = gateway + '/testimonial/receiver/';
export const testimonialSent: string = gateway + '/testimonial/sender/';

// Gateway POST
export const subAccountsStatus: string = gateway + '/transaction/coc/subAccountStatus'
export const sendCoC: string = gateway + '/insertcoccollection';
export const updateCoC: string = gateway + '/insertcoccollection';

// Blockchain access point
export const blockchainNet: string = blockchainNetwork;
export const blockchainNetType: string = blockchainType;

export const currency: string = 'Lumens';
export const mainAccountBalance: number = 1;
export const tracSuperAcc: string = "GCXMIUX4LK5PSVWVGTWLNWAPHKGE3O7RUISAG5DJEPOKXEIUNTASXZUU";

