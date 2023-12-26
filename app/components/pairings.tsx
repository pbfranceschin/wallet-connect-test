import { useState, useEffect } from "react";
import { Web3Wallet as Web3WalletType } from "@walletconnect/web3wallet/dist/types/client";
import { getSdkError } from '@walletconnect/utils'

export default function Pairings(web3wallet: Web3WalletType) {
  const [pairings, setPairings] = useState<any[]>();
  console.log('pairings', pairings);
//   console.log('core', web3wallet.core);
  console.log('wallet', web3wallet);

  useEffect(() => {
    if(!web3wallet) return;
    console.log('core', web3wallet.core);
    setPairings(web3wallet.core?.pairing.getPairings());
  }, [web3wallet]);

  async function onDelete(topic: string) {
    if(!pairings) return;
    await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
    const newPairings = pairings.filter((pairing :any) => pairing.topic !== topic)
    setPairings(newPairings)
  }

  return(
    <>
    {pairings
      ? pairings.length &&
        pairings.map((pairing: any) => {
          console.log('pairing', pairing);
          const { peerMetadata } = pairing;

          return (
            <div key={pairing.topic} className="border rounded bg-slate-400" onClick={() => onDelete(pairing.topic)}>
              <img src={peerMetadata?.icons[0]} />
              <h1>Connected</h1>              
            </div>
          )
        })
      : ""
    }
    </>
  )
}