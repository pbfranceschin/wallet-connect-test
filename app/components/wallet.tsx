import { useState, useEffect, useCallback } from "react";
import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes  } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Web3Wallet as Web3WalletType  } from "@walletconnect/web3wallet/dist/types/client";
import { mainnet, sepolia, polygon } from "viem/chains";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { createPublicClient, http, formatEther } from "viem";
import { EIP155_CHAINS, EIP155_SIGNING_METHODS, TEIP155Chain } from "../utils/eip155";
import { formatParams, getSignParamsMessage } from "../utils/utils";
import { formatJsonRpcError, formatJsonRpcResult } from "@json-rpc-tools/utils";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_SEPOLIA;
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;
const network = polygon;
// const network = 1;

export interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}

export interface PeerMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

interface SessionRequest {
    id: number,
    params: {
        chainId: string,
        request: {
            method: string,
            params: any[]
        }
    },
    topic: string,
    verifyContext: {
        verified: {
            origin: string,
            validation: string,
            verifyUrl: string
        }
    }
}

export interface WalletProps {
  account: `0x${string}`,
  provider?: AlchemyProvider
}

const CAIP10 = (chainId: number, account: string) => {
    return "eip155:" + `${chainId}:` + account;
}

// const provider = createPublicClient({
//     chain: sepolia,
//     transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`)
// });

const publicClient = createPublicClient({
    chain: polygon,
    transport: http()
});

export default function Wallet({ account, provider }: WalletProps) {
  const [web3wallet, setWeb3wallet] = useState<Web3WalletType>();
  const [inputValue, setInputValue] = useState<any>();
  const [sessionId, setSessionId] = useState<number>();
  const [namespaces, setNamespaces] = useState<any>();
  const [peerMetadata, setPeerMetadata] = useState<PeerMetadata>();
  const [openApproveSession, setopenApproveSession] = useState<boolean>(false);
  const [openApproveRequest, setOpenApproveRequest] = useState<boolean>(false);
  const [sessionRequest, setSessionRequest] = useState<SessionRequest>();
  const [balance, setBalance] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [activeNetwork, setActiveNetwork] = useState(mainnet);
//   console.log('balance', balance);

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
  
  useEffect(() => {
    const resolveBal = async () => {
      setBalance(await publicClient.getBalance({address: account}) )
    }
    resolveBal();
  })

  async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    // ------- namespaces builder util ------------ //
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: [`eip155:${mainnet.id}`, `eip155:${polygon.id}`],
          methods: ['eth_sendTransaction', 'personal_sign', 'eth_sign', 'eth_signTypedData_v4', 'eth_signTypedData', 'eth_signTransaction', 'eth_sendRawTransaction'],
          events: ['accountsChanged', 'chainChanged'],
          accounts: [`eip155:${mainnet.id}:${account}`, CAIP10(polygon.id, account)]
        }
      }
    });
    // ------- end namespaces builder util ------------ //
    setIsLoading(true);
    setSessionId(id);
    setNamespaces(approvedNamespaces);
    setPeerMetadata(params.proposer.metadata);
    setopenApproveSession(true);
  }

  function onSessionRequest(request: SessionRequest) {
    // console.log('onSessionRequest');
    console.log('request', request);
    setSessionRequest(request);
    setOpenApproveRequest(true);
  }

  function onSessionDelete() {
    setPeerMetadata(undefined);
  }
  
  useEffect(() => {
    if(web3wallet) {
      web3wallet.on('session_proposal', event => onSessionProposal(event));
      web3wallet.on('session_request', event => onSessionRequest(event));
      web3wallet.on('session_delete', onSessionDelete);
    }
  }, [web3wallet]);
  

  const pair = useCallback(async () => {
    if(!web3wallet) {
      console.log("no wallet found");
      return;
    }
    console.log('uri', inputValue);
    await web3wallet.core.pairing.pair({ uri: inputValue });
  }, [web3wallet, inputValue]);

  const onApproveSession = useCallback(async () => {
    if(!web3wallet) {
        console.error("no wallet found");
        return
    }
    if(!sessionId || !namespaces) {
      console.error("id/namespaces not found");
      return;
    }
    try {
      const session = await web3wallet.approveSession({
        id: sessionId,
        namespaces
      });
      setSessionId(undefined);
      setopenApproveSession(false);
      setInputValue("");
      setIsLoading(false);
      return session;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  },[web3wallet, sessionId, namespaces]);

  const onRejectSession = useCallback(async () => {
    if(!web3wallet) {
      console.error("no wallet found");
      setIsLoading(false);
      return;
    }
    if(!sessionId) {
      console.error("id not found");
      setIsLoading(false);
      return;
    }
    await web3wallet.rejectSession({
      id: sessionId,
      reason: getSdkError("USER_REJECTED")
    });
    setopenApproveSession(false);
    setIsLoading(false);
  }, [web3wallet, sessionId]);
  
  const onApproveRequest = useCallback(async () => {
    if(isLoading) return;
    if(!sessionRequest){
        console.error("no request found");
        return;
    }
    if(!provider) {
        const error: ProviderRpcError = {name: "Provider Error", message: "no provider found", code: 4900, data: sessionRequest.id }
        return error;
    }
    const { id , topic } = sessionRequest; 
    let response: any;
    try {
        setIsLoading(true)
        let { method , params } = sessionRequest.params.request;
        params = formatParams(method, params);
        const res = await provider.request({ method, params });
        response = formatJsonRpcResult(id, res);
        await web3wallet?.respondSessionRequest({
            topic,
            response
        });
    } catch (error: any) {
        console.log(error);
        alert(error.message);
        response = formatJsonRpcError(id, error.message);
        await web3wallet?.respondSessionRequest({
            topic,
            response
        });
    } finally {
        setSessionRequest(undefined);
        setOpenApproveRequest(false);
        setIsLoading(false);
    }
  }, [provider, sessionRequest, isLoading]);

  const onRejectRequest = useCallback(async () => {
    if(isLoading) return;
    if(!sessionRequest){
        console.error("no request found");
        return;
    }
    const response = formatJsonRpcError(sessionRequest.id, getSdkError('USER_REJECTED'));
    try {
        await web3wallet?.respondSessionRequest({
            topic: sessionRequest.topic,
            response
        });
    } catch (error: any) {
        console.log(error);
        alert(error.message);
    } finally{
        setOpenApproveRequest(false);
        setSessionRequest(undefined);
    }
  }, [isLoading, sessionRequest, web3wallet]);
  
  // console.log('inputValue', inputValue);
  // console.log('openApproveSession', openApproveSession);
//   console.log('openApproveRequest', openApproveRequest);
  console.log('sessionRequest', sessionRequest)
  return (
    <main>
        <div className="p-6">
          <input name="uri" placeholder="uri" className="m-2 px-6 py-2 text-black rounded border border-m" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={() => pair()} disabled={isLoading}> Connect </button>
        </div>
        <div>
          {openApproveSession &&
            peerMetadata
            ? <div> 
               <h1>Connect to {peerMetadata.url} ?</h1>
             </div>
            : <div> {""} </div>          
          }
          {openApproveSession && 
            <div>
              <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={onApproveSession}>
                Approve
              </button>
              <button className="px-6 py-2 border border-blue-600 rounded bg-transparent hover:bg-red-400 text-white" onClick={onRejectSession}>
                Reject
              </button>
            </div>
          }
        </div>
        <div>
            <h1>Account Address: {account}</h1>
        </div>
        <div>{ balance != undefined
                ? <h1>Account Balance: {formatEther(balance)} {network.nativeCurrency.symbol}</h1>
                : <h1>error: couldn't fetch wallet balance</h1>}
        </div>
        <div>
            {openApproveRequest &&
              <>
              <div>
                <h1>Approval needed: 
                    {( sessionRequest?.params.request.method === 'eth_sign' || sessionRequest?.params.request.method === 'personal_sign' )
                        ? "Signature request"
                        :  sessionRequest?.params.request.method === 'eth_sendTransaction'
                            ? "Transaction Request"
                            : "other"
                    } 
                </h1>
                <h1>
                    Source: {sessionRequest?.verifyContext.verified.origin}
                </h1>
              </div>
              <div>
                <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-400 text-white" onClick={onApproveRequest}>
                    {isLoading ? "Waitin Approval...": "Approve"}
                </button>
                <button className="px-6 py-2 border border-blue-600 rounded bg-transparent hover:bg-red-400 text-white" onClick={onRejectRequest} disabled={isLoading}>
                    Reject
                </button>
              </div>
              </>
            }
        </div>
        <div>
          {/* {web3wallet && <Pairings web3wallet={web3wallet} />} */}
        </div>
    </main>
  )

}