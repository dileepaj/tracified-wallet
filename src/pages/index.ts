import { ItemReceivedPage } from "./item-received/item-received";
import { TransferPage } from "./transfer/transfer";
import { ItemSentPage } from "./item-sent/item-sent";
import { TabsPage } from "./tabs/tabs";
import { LoginPage } from "./login/login";

// The page the user lands on after opening the app and without a session
export const FirstRunPage = LoginPage;
// export const FirstRunPage = 'BcAccountPage';

// The main page the user will see as they use the app over a long period of time.
// Change this if not using tabs
// export const MainPage = 'BcAccountPage';
export const MainPage = TabsPage;

// The initial root pages for our tabs (remove if not using tabs)
export const Tab1Root = ItemReceivedPage;
export const Tab2Root = ItemSentPage;
export const Tab3Root = TransferPage;
