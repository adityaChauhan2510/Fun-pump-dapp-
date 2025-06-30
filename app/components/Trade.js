import { useEffect, useState } from "react";
import { ethers } from "ethers";

function Trade({ toggleTrade, token, provider, factory }) {
  const [target, setTarget] = useState(0);
  const [limit, setLimit] = useState(0);
  const [cost, setCost] = useState(0);

  async function buyHandler(form) {
    const amount = form.get("amount");
    const cost = await factory.getCost(token.sold);
    const totalCost = cost * BigInt(amount);
    const signer = await provider.getSigner();
    const transaction = await factory
      .connect(signer)
      .buy(token.token, ethers.parseUnits(amount, 18), { value: totalCost });
    await transaction.wait();
    toggleTrade();
  }

  async function getSaleDetails() {
    const target = await factory.TARGET();
    setTarget(target);
    const limit = await factory.TOKEN_LIMIT();
    setLimit(limit);
    const cost = await factory.getCost(token.sold);
    setCost(cost);
  }

  useEffect(() => {
    getSaleDetails();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto p-4">
      <div className="relative mx-auto my-10 w-full max-w-2xl bg-[#1a1b23] rounded-[32px] p-8">
        {/* Close Button */}
        <button
          onClick={toggleTrade}
          className="absolute right-6 top-6 text-gray-500 hover:text-white text-2xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-4xl font-nabla text-center text-yellow-400 mb-8">
          Trade
        </h2>

        {/* Token Image & Name */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <img
            src={token.image}
            alt={token.name}
            width={250}
            height={200}
            className="rounded-full"
          />
          <h3 className="text-3xl font-nabla text-yellow-400">{token.name}</h3>
        </div>

        {/* Token Details */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-nabla text-yellow-400">Creator</span>
            <span className="text-white font-mono">
              {token.creator.slice(0, 6)}...{token.creator.slice(38, 42)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-nabla text-yellow-400">
              Market Cap
            </span>
            <span className="text-white font-mono">
              {ethers.formatUnits(token.raised, 18)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-nabla text-yellow-400">
              Base Cost
            </span>
            <span className="text-white font-mono">
              {ethers.formatUnits(cost, 18)} ETH
            </span>
          </div>
        </div>

        {token.sold >= limit || token.raised >= target ? (
          <div className="text-red-400 text-center text-2xl font-nabla mb-6">
            Target Reached!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-nabla text-yellow-400">
                Amount to Buy
              </span>
            </div>
            <form action={buyHandler} className="space-y-4">
              <input
                type="number"
                name="amount"
                min={1}
                max={10000}
                placeholder="Enter amount..."
                className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg
                         border border-gray-800 focus:border-yellow-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-yellow-400 text-black py-4 rounded-xl text-xl 
                         font-nabla hover:bg-yellow-600 transition-all"
              >
                Buy Tokens
              </button>
            </form>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={toggleTrade}
          className="w-full mt-4 py-4 text-xl font-nabla text-gray-400 
                   hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Trade;
