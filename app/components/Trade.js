import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

function Trade({
  toggleTrade,
  token,
  provider,
  factory,
  handleActionComplete,
}) {
  const [cost, setCost] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0n);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) return null;

  async function buyTokens(form) {
    const amount = form.get("amount");

    try {
      setLoading(true);
      if (!provider) throw new Error("No provider found");
      if (!amount || Number(amount) <= 0)
        throw new Error("Enter a valid amount");

      const totalCost = cost * BigInt(amount);
      const signer = await provider.getSigner();
      const transaction = await factory
        .connect(signer)
        .buyToken(token.token, ethers.parseUnits(amount, 18), {
          value: totalCost,
        });
      await transaction.wait();

      toast.success("Tokens Bought!");
    } catch (err) {
      setLoading(false);
      toast.error(err?.reason || err?.message || "Transaction failed");
    } finally {
      setLoading(false);
      toggleTrade();
      handleActionComplete();
    }
  }

  async function getSaleDetails() {
    const _cost = await factory.getCost(token.sold);
    setCost(_cost);
  }

  const handleAmountChange = (e) => {
    const val = e.target.value;

    try {
      const parsedAmount = ethers.parseUnits(val || "0", 18);
      const total = (cost * parsedAmount) / BigInt(1e18);
      setTotalPrice(total);
    } catch {
      setTotalPrice(0n);
    }
  };

  const handleDeposit = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const tx = await factory.connect(signer).deposit(token.token);
      await tx.wait();
      toast.success("Tokens & ETH withdrawn to creator!");
    } catch (err) {
      setLoading(false);
      toast.error(err?.reason || err?.message || "Deposit failed");
    } finally {
      setLoading(false);
      toggleTrade();
      handleActionComplete();
    }
  };

  useEffect(() => {
    getSaleDetails();
  }, []);

  useEffect(() => {
    const loadAccount = async () => {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address.toLowerCase());
    };
    if (provider) loadAccount();
  }, [provider]);

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
          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => {
              navigator.clipboard.writeText(token.token);
              toast.success("Copied token address to clipboard!");
            }}
            title="Click to copy"
          >
            <span className="text-2xl font-nabla text-yellow-400">
              Token Address
            </span>
            <span className="text-white font-mono group-hover:text-yellow-400 transition-colors">
              {token.token.slice(0, 6)}...{token.token.slice(-4)}
            </span>
          </div>

          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => {
              navigator.clipboard.writeText(token.token);
              toast.success("Copied token address to clipboard!");
            }}
            title="Click to copy"
          >
            <span className="text-2xl font-nabla text-yellow-400">Creator</span>
            <span className="text-white font-mono group-hover:text-yellow-400 transition-colors">
              {token.creator.slice(0, 6)}...{token.creator.slice(38, 42)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-2xl font-nabla text-yellow-400">
              {token.amountWithdrawn ? "ETH Raised" : "Market Cap"}
            </span>
            <span className="text-white font-mono">
              {ethers.formatUnits(token.raised, 18)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-nabla text-yellow-400">
              {token.amountWithdrawn ? "Tokens Sold" : "Base Cost"}
            </span>
            <span className="text-white font-mono">
              {token.amountWithdrawn
                ? `${ethers.formatUnits(token.sold, 18)}`
                : `${ethers.formatUnits(cost, 18)} ETH`}
            </span>
          </div>
        </div>

        {!token.amountWithdrawn ? (
          !token.isOpen ? (
            <>
              <div className="text-red-400 text-center text-2xl font-nabla mb-6">
                Target Reached !!
              </div>
              {/* Show Deposit button only for creator */}
              {walletAddress === token.creator.toLowerCase() && (
                <button
                  disabled={loading}
                  onClick={handleDeposit}
                  className={`w-full bg-green-700 py-4 rounded-xl text-xl 
           font-nabla hover:bg-green-900 text-white transition-all mt-4 cursor-pointer ${
             loading ? "opacity-50 cursor-not-allowed" : ""
           }`}
                >
                  {loading ? "Loading..." : "Claim ETH & Left Tokens"}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  buyTokens(new FormData(e.target));
                }}
                className="space-y-4"
              >
                <input
                  type="number"
                  name="amount"
                  step="any"
                  onChange={handleAmountChange}
                  placeholder="Enter amount..."
                  className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg
                   border border-gray-800 focus:border-yellow-400 focus:outline-none"
                  required
                />
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-nabla text-yellow-400">
                    Total Price
                  </span>
                  <span className="text-white font-mono">
                    {ethers.formatUnits(totalPrice, 18)} ETH
                  </span>
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full bg-yellow-600 py-4 rounded-xl text-xl 
                   font-nabla hover:bg-yellow-800 transition-all ${
                     loading ? "opacity-50 cursor-not-allowed" : ""
                   }`}
                >
                  {loading ? "Buying" : "Buy Tokens"}
                </button>
              </form>
            </div>
          )
        ) : null}

        {/* Cancel Button */}
        <button
          onClick={toggleTrade}
          disabled={loading}
          className={`w-full mt-4 py-4 text-xl font-nabla text-gray-400 
                   hover:text-yellow-800 transition-colors cursor-pointer ${
                     loading ? "opacity-50 cursor-not-allowed" : ""
                   }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Trade;
