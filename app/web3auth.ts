import { Web3AuthSigner } from "@alchemy/aa-signers/web3auth";

const clientId = 'BEladcxiN547-jOdKsH6udt5ghJMymep8ZtuP_p3gLRcAtjxGgp2SzDUeJKv8CWDifXYJ5cMAVyi6C1O9s-44cE';

export const createWeb3AuthSigner = async () => {
    const signer = new Web3AuthSigner({
        clientId: clientId,
        chainConfig: {
          chainNamespace: "eip155"
        },
    });

    await signer.authenticate({
        init: async () => {
          await signer.inner.initModal();
        },
        connect: async () => {
          await signer.inner.connect();
        }
    });

    return signer;
}