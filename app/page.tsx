'use client'

import { createWeb3AuthSigner } from "./web3auth";
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { IProvider, CHAIN_NAMESPACES } from "@web3auth/base";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { sepolia, polygon } from "viem/chains";
import { createConfig, WagmiConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from "@alchemy/aa-accounts";
import { Web3AuthSigner } from "@alchemy/aa-signers/web3auth";
import Wallet from "./components/wallet";

const clientId = 'BEladcxiN547-jOdKsH6udt5ghJMymep8ZtuP_p3gLRcAtjxGgp2SzDUeJKv8CWDifXYJ5cMAVyi6C1O9s-44cE';
const chainId = sepolia.id;
const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_SEPOLIA;


const chain = polygon;

export default function Home() {
  const [provider, setProvider] = useState<AlchemyProvider>();
  const [signer, setSigner] = useState<Web3AuthSigner>();
  const [account, setAccount] = useState<`0x${string}`>();

  useEffect(() => {
    const resolveProvider = async () => {
      if(!signer) return;
      const _provider = new AlchemyProvider({
        apiKey: 's6hSF4DGHoZgYnAGkYU-13L_V0FK6DDQ',
        chain,
      }).connect(
        (rpcClient) =>
          new LightSmartContractAccount({
            chain,
            owner: signer,
            // factoryAddress: getDefaultLightAccountFactoryAddress(chain),
            factoryAddress: "0x00000055C0b4fA41dde26A74435ff03692292FBD",
            rpcClient,
          })
      );
      setProvider(_provider)
    //   const addr = await signer.getAddress();
    //   console.log('provider', provider)
      const addr = await _provider.getAddress();
      console.log('signer', await signer.getAddress());
      console.log('address', addr);
      setAccount(addr);
    }
    resolveProvider();
  }, [signer]);

  const signIn = async () => {
    setSigner(await createWeb3AuthSigner());
  }

  const signOut = async () => {
    await signer?.inner.logout();
    setSigner(undefined);
  }

  return (
    <main>
      {!signer && <button className="m-6 py-4 px-6 bg-blue-500" onClick={() => signIn()}>Sign In</button>}
      {signer && account &&
       <><button className="m-6 py-4 px-6 bg-blue-500" onClick={() => signOut()}>Sign Out</button><Wallet account={account} provider={provider} /></>
       }
    </main>
  )
}

