// import { useEffect, useState } from "react";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
// import RPC from "./web3RPC";
// import "./App.css";

// const clientId = "YOUR_WEB3AUTH_CLIENT_ID"; // get from https://dashboard.web3auth.io

// function App() {
//   const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
//   const [provider, setProvider] = useState<IProvider

//   useEffect(() => {
//     const init = async () => {
//       try {
//         const web3auth = new Web3Auth({
//           clientId, 
//           web3AuthNetwork: "testnet", // mainnet, aqua,  cyan or testnet
//           chainConfig: {
//             chainNamespace: CHAIN_NAMESPACES.EIP155,
//             chainId: "0x1",
//             rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
//           },
//         });

//         setWeb3auth(web3auth);

//         await web3auth.initModal();

//         if (web3auth.provider) {
//           setProvider(web3auth.provider);
//         };

//       } catch (error) {
//         console.error(error);
//       }
//     };

//     init();
//   }, []);

//   const login = async () => {
//     if (!web3auth) {
//       uiConsole("web3auth not initialized yet");
//       return;
//     }
//     const web3authProvider = await web3auth.connect();
//     setProvider(web3authProvider);
//   };

//   const authenticateUser = async () => {
//     if (!web3auth) {
//       uiConsole("web3auth not initialized yet");
//       return;
//     }
//     const idToken = await web3auth.authenticateUser();
//     uiConsole(idToken);
//   };

//   const getUserInfo = async () => {
//     if (!web3auth) {
//       uiConsole("web3auth not initialized yet");
//       return;
//     }
//     const user = await web3auth.getUserInfo();
//     uiConsole(user);
//   };

//   const logout = async () => {
//     if (!web3auth) {
//       uiConsole("web3auth not initialized yet");
//       return;
//     }
//     await web3auth.logout();
//     setProvider(null);
//   };

//   const getChainId = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const chainId = await rpc.getChainId();
//     uiConsole(chainId);
//   };
//   const getAccounts = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const address = await rpc.getAccounts();
//     uiConsole(address);
//   };

//   const getBalance = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const balance = await rpc.getBalance();
//     uiConsole(balance);
//   };

//   const sendTransaction = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const receipt = await rpc.sendTransaction();
//     uiConsole(receipt);
//   };

//   const signMessage = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const signedMessage = await rpc.signMessage();
//     uiConsole(signedMessage);
//   };

//   const getPrivateKey = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const rpc = new RPC(provider);
//     const privateKey = await rpc.getPrivateKey();
//     uiConsole(privateKey);
//   };

//   function uiConsole(...args: any[]): void {
//     const el = document.querySelector("#console>p");
//     if (el) {
//       el.innerHTML = JSON.stringify(args || {}, null, 2);
//     }
//   }

//   const loggedInView = (
//     <>
//       <div className="flex-container">
//         <div>
//           <button onClick={getUserInfo} className="card">
//             Get User Info
//           </button>
//         </div>
//         <div>
//           <button onClick={authenticateUser} className="card">
//             Get ID Token
//           </button>
//         </div>
//         <div>
//           <button onClick={getChainId} className="card">
//             Get Chain ID
//           </button>
//         </div>
//         <div>
//           <button onClick={getAccounts} className="card">
//             Get Accounts
//           </button>
//         </div>
//         <div>
//           <button onClick={getBalance} className="card">
//             Get Balance
//           </button>
//         </div>
//         <div>
//           <button onClick={signMessage} className="card">
//             Sign Message
//           </button>
//         </div>
//         <div>
//           <button onClick={sendTransaction} className="card">
//             Send Transaction
//           </button>
//         </div>
//         <div>
//           <button onClick={getPrivateKey} className="card">
//             Get Private Key
//           </button>
//         </div>
//         <div>
//           <button onClick={logout} className="card">
//             Log Out
//           </button>
//         </div>
//       </div>

//       <div id="console" style={{ whiteSpace: "pre-line" }}>
//         <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
//       </div>
//     </>
//   );

//   const unloggedInView = (
//     <button onClick={login} className="card">
//       Login
//     </button>
//   );

//   return (
//     <div className="container">
//       <h1 className="title">
//         <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
//           Web3Auth
//         </a>
//         & ReactJS Example
//       </h1>

//       <div className="grid">{provider ? loggedInView : unloggedInView}</div>

//       <footer className="footer">
//         <a href="https://github.com/Web3Auth/web3auth-pnp-examples/" target="_blank" rel="noopener noreferrer">
//           Source code
//         </a>
//       </footer>
//     </div>
//   );
// }

// export default App;