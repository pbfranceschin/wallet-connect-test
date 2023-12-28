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
import { Web3Wallet as Web3WalletType  } from "@walletconnect/web3wallet/dist/types/client";
import Pairings from "./components/pairings";

const clientId = 'BEladcxiN547-jOdKsH6udt5ghJMymep8ZtuP_p3gLRcAtjxGgp2SzDUeJKv8CWDifXYJ5cMAVyi6C1O9s-44cE';
const chainId = sepolia.id;
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_SEPOLIA;
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;

export interface PeerMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

export default function Home() {
  const [web3wallet, setWeb3wallet] = useState<Web3WalletType>();
  const [inputValue, setInputValue] = useState<any>();
  const [id, setId] = useState<number>();
  const [namespaces, setNamespaces] = useState<any>();
  const [peerMetadata, setPeerMetadata] = useState<PeerMetadata>();
  const [openApprove, setOpenApprove] = useState<boolean>(false);
  
  useEffect(() => {
    console.log('projectId', projectId);
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
  }, []);

  async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal){
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
    });
    // ------- end namespaces builder util ------------ //
    setId(id);
    setNamespaces(approvedNamespaces);
    setPeerMetadata(params.proposer.metadata);
    setOpenApprove(true);
  }
  useEffect(() => {
    if(web3wallet) web3wallet.on('session_proposal', event => onSessionProposal(event));
  }, [web3wallet]);
  

  const pair = async () => {
    if(!web3wallet) {
      console.log("no wallet found");
      return;
    }
    console.log('uri', inputValue);
    await web3wallet.core.pairing.pair({ uri: inputValue });
  }

  const approve = async () => {
    if(!web3wallet) {
        console.error("no wallet found");
        return
    }
    if(!id || !namespaces) {
      console.error("id/namespaces not found");
      return;
    }
    try {
      const session = await web3wallet.approveSession({
        id,
        namespaces
      });
      setId(undefined);
      setOpenApprove(false);
      return session;
    } catch (error) {
      console.log(error);
    }
  }

  const reject = async () => {
    if(!web3wallet) {
      console.error("no wallet found");
      return;
    }
    if(!id) {
      console.error("id not found");
      return;
    }
    await web3wallet.rejectSession({
      id,
      reason: getSdkError("USER_REJECTED")
    });
    setOpenApprove(false);
  }
  
//   console.log('inputValue', inputValue);
  // console.log('openApprove', openApprove);
  return (
    <main>
        <div className="p-6">
          <input name="uri" placeholder="uri" className="m-2 px-6 py-2 text-black rounded border border-m" onChange={(e) => setInputValue(e.target.value)} />
          <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={() => pair()}> Connect </button>
        </div>
        <div>
          {openApprove &&
            peerMetadata
            ? <div> 
               <h1>Connect to {peerMetadata.url} ?</h1>
             </div>
            : <div> <h1>Couldn't find dapp metadata</h1> </div>          
          }
          {openApprove && 
            <div>
              <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={approve}>
                Approve
              </button>
              <button className="px-6 py-2 border-blue-600 rounded bg-transparent hover:bg-red-400 text-white" onClick={reject}>
                Reject
              </button>
            </div>
          }
        </div>
        <div>
          {/* {web3wallet && <Pairings web3wallet={web3wallet} />} */}
        </div>
    </main>
  )


}