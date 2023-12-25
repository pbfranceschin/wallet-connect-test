'use client'

import { createWeb3AuthSigner } from "./web3auth";
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { IProvider, CHAIN_NAMESPACES } from "@web3auth/base";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { sepolia } from "viem/chains";
import { createConfig, WagmiConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from "@alchemy/aa-accounts";
import { Web3AuthSigner } from "@alchemy/aa-signers/web3auth";
import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes  } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
// import { Web3Wallet } from "@walletconnect/web3wallet/dist/types/client";


const clientId = 'BEladcxiN547-jOdKsH6udt5ghJMymep8ZtuP_p3gLRcAtjxGgp2SzDUeJKv8CWDifXYJ5cMAVyi6C1O9s-44cE';
const chainId = sepolia.id;
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_SEPOLIA;
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;


export default function Home() {
  const [web3wallet, setWeb3wallet] = useState<any>();
  const [inputValue, setInputValue] = useState<any>();
  
  useEffect(() => {
    const core = new Core({
      projectId
    });
    const resolveWeb3Wallet = async () => {
        const wallet = await Web3Wallet.init({
            core,
            metadata: {
                name: 'Venn Smart Wallet',
                description	: 'Venn Protocol Smart Account Wallet',
                url: '',
                icons:[]
            }
        });
        setWeb3wallet(wallet);
    }
    resolveWeb3Wallet();
  });

  async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal){
    try{
      // ------- namespaces builder util ------------ //
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: ['eip155:1'],
            methods: ['eth_sendTransaction', 'personal_sign'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: [
              'eip155:1:0x8Cab0cF0AC308f7d50fa8f3Ac7487fc4C0f58c9d',            
            ]
          }
        }
      })
      // ------- end namespaces builder util ------------ //
  
      const session = await web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces
      })
    } catch(error){
      // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
      console.log(error);
    //   await web3wallet.rejectSession({
    //     id: proposal.id,
    //     reason: getSdkError("USER_REJECTED")
    //   })
    }
  }
  useEffect(() => {
    if(web3wallet) web3wallet.on('session_proposal', onSessionProposal);
  }, [web3wallet]);
  

  const pair = async () => {
    if(!web3wallet) {
      console.log("no wallet found");
      return;
    }
    console.log('uri', inputValue);
    await web3wallet.core.pairing.pair({ inputValue });
  }
  
//   console.log('inputValue', inputValue);
  return (
    <main>
        <div className="p-6">
            <input name="uri" placeholder="uri" className="m-2 px-6 py-2 text-black rouded border border-m" onChange={(e) => setInputValue(e.target.value)} />
            <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={() => pair()}> Connect </button>
        </div>
    </main>
  )


}