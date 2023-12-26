// import { useState } from "react";
// import { Web3Wallet } from "@walletconnect/web3wallet/dist/types/client";



// export default function Approve(
//     id: number,
//     namespaces: any,
//     setOpenApprove: any,
//     web3wallet?: Web3Wallet,
// ) {
//   const approve = async () => {
//     if(!web3wallet) {
//         console.error("no wallet found");
//         return
//     }
//     try {
//       const session = await web3wallet.approveSession({
//         id,
//         namespaces
//       });
//       return session;
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   const reject = async () => {
//     if(!web3wallet) {
//         console.error("no wallet found");
//         return
//     }
//     await web3wallet.rejectSession({
//       id,
//       reason: getSdkError("USER_REJECTED")
//     })
//   }
// }