import { Button } from "@/components/ui/button";
import { loadKeys, storeKeys } from "@/lib/keyStorage";
import { createLazyFileRoute, redirect } from "@tanstack/react-router";
import { Client, Signer, useClient, XMTPProvider } from "@xmtp/react-sdk";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const Login = () => {
  const [signer, setSigner] = useState<null | Signer>(null);

  const connectWallet = async () => {
    let newSigner = null;
    let provider;

    try {
      // @ts-expect-error ethereum is defined in the browser
      if (window.ethereum == null) {
        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed,
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults");
        provider = ethers.getDefaultProvider();
      } else {
        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        // @ts-expect-error ethereum is defined in the browser
        provider = new ethers.BrowserProvider(window.ethereum);

        // It also provides an opportunity to request access to write
        // operations, which will be performed by the private key
        // that MetaMask manages for the user.
        newSigner = await provider.getSigner();

        setSigner(newSigner);
        const address = await newSigner?.getAddress();
        localStorage.setItem("signerAddress", address);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function runEffect() {
      const storedSignerAddress = localStorage.getItem("signerAddress");
      if (storedSignerAddress) {
        // @ts-expect-error ethereum is defined in the browser
        const provider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
      }
    }
    runEffect();
  }, []);

  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <Button className="home-button" onClick={() => connectWallet()}>
        {signer ? "Connected" : "Connect Wallet"}
      </Button>
      {signer ? (
        <XMTPProvider>
          <XmtpLogin signer={signer} />
        </XMTPProvider>
      ) : null}
    </div>
  );
};

function XmtpLogin({ signer }: { signer: Signer }) {
  const { error, isLoading, initialize } = useClient();

  const initXmtpWithKeys = async () => {
    const address = await signer?.getAddress();
    if (!address) {
      return;
    }
    let keys = loadKeys(address);
    if (!keys) {
      keys = await Client.getKeys(signer, {
        env: "dev",
      });
      storeKeys(address, keys);
    }
    await initialize({ signer, options: { env: "dev" }, keys });
    console.log("wallet initialized");
    redirect({ to: "/space/$spaceId", params: { spaceId: "abc" } });
  };

  useEffect(() => {
    void initXmtpWithKeys();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to initialize Account: {error.message}</div>;
  }

  return (
    <div>
      <h1>Connected</h1>
    </div>
  );
}

export const Route = createLazyFileRoute("/login")({
  component: Login,
});
