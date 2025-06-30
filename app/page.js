"use client";

import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";

// Components
import Header from "./components/Header";
import List from "./components/List";
import Token from "./components/Token";
import Trade from "./components/Trade";

// ABIs & Config
import Factory from "./abis/Factory.json";
import config from "./config.json";
import images from "./images.json";

import { Toaster } from "react-hot-toast";

export default function Page() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [token, setToken] = useState(null);

  const toggleCreate = () => {
    showCreate ? setShowCreate(false) : setShowCreate(true);
  };

  const toggleTrade = (token) => {
    setToken(token);
    showTrade ? setShowTrade(false) : setShowTrade(true);
  };

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const factory = new ethers.Contract(
      config[network.chainId.toString()].factory.address,
      Factory,
      provider
    );

    setFactory(factory);

    const fee = await factory.fee();
    setFee(fee);

    const totalTokens = await factory.totalTokens();
    const tokens = [];

    for (let i = 0; i < totalTokens; i++) {
      const tokenSale = await factory.getTokenSale(i);
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: images[i],
      };
      tokens.push(token);
    }

    setTokens(tokens.reverse());
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);
  return (
    <>
      <div className="p-[4em]">
        <Header account={account} setAccount={setAccount} />

        <main>
          <div className="create">
            <button
              onClick={factory && account && toggleCreate}
              className="btn--fancy text-xl pointer-none!"
            >
              {!factory
                ? "[ contract not deployed ]"
                : !account
                ? "[ connect wallet ]"
                : "[ start a new token ]"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-items-center">
            {tokens.length === 0 ? (
              <p className="text-center text-sm italic text-white/30 col-span-full">
                No tokens listed...
              </p>
            ) : (
              tokens.map((token, index) => (
                <Token key={index} token={token} toggleTrade={toggleTrade} />
              ))
            )}
          </div>
        </main>

        {showCreate && (
          <List
            fee={fee}
            factory={factory}
            provider={provider}
            toggleCreate={toggleCreate}
          />
        )}

        {showTrade && (
          <Trade
            toggleTrade={toggleTrade}
            token={token}
            provider={provider}
            factory={factory}
          />
        )}
      </div>
      {/* <Toaster /> */}
    </>
  );
}
