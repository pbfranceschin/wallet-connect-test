'use client'

import { useEffect, useState } from "react";
import { sepolia } from "viem/chains";
import { Core } from '@walletconnect/core'
import { SignClient } from "@walletconnect/sign-client";
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;

export default function Home() {
  const [signClient, setSignClient] = useState<any>();
  const [inputValue, setInputValue] = useState<any>();
  const [session, setSession] = useState<any>();

  useEffect(()=> {
    console.log('projectId', projectId);
    const resolveSignClient = async () => {
      const _signClient = await SignClient.init({
        projectId
      });
      setSignClient(_signClient);
    }
    resolveSignClient();
  }, []);
  
  async function onSessionProposal({ id, params }: any){
    try{
      // ------- namespaces builder util ------------ //
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: ['eip155:1'],
            methods: ['eth_sendTransaction', 'personal_sign'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: ['eip155:1:0x8Cab0cF0AC308f7d50fa8f3Ac7487fc4C0f58c9d']
          }
        }
      })
      // ------- end namespaces builder util ------------ //
  
      const approveResponse = await signClient.approve({
        id,
        namespaces: approvedNamespaces
      });
    //   setSession(_session);
      console.log('approveResponse', approveResponse);
      const ack = await approveResponse.acknowledged();
      console.log('acknowledged response', ack);

    } catch(error){
      // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
      console.log(error);
    }
  }

  useEffect(() => {
    if(signClient) {
        console.log('subscription');
        signClient.on('session_proposal', (event: any) => onSessionProposal(event));
    }
  }, [signClient]);

  const pair = async () => {
    if(!signClient) {
      console.log("signClient not initialized");
      return;
    }
    console.log('uri', inputValue);
    await signClient.core.pairing.pair({ uri: inputValue });
  }  

  return (
    <main>
        <div className="p-6">
            <input 
            name="uri" placeholder="uri" className="m-2 px-6 py-2 text-black rouded border border-m" 
            onChange={(e) => setInputValue(e.target.value)} 
            />
            <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={() => pair()}> Connect </button>
        </div>
    </main>
  )

}
