import { ethers } from "ethers";
import { useState } from "react";
import toast from "react-hot-toast";

function List({ toggleCreate, fee, provider, factory, handleActionComplete }) {
  const [loading, setLoading] = useState(false);

  const onsubmit = async (form) => {
    const name = form.get("name");
    const symbol = form.get("symbol");
    const image_url = form.get("image_url");
    const amount = form.get("amount");
    const target = form.get("target");

    if (!name || !symbol || !image_url || !amount || !target) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const tx = await factory
        .connect(signer)
        .create(
          name,
          symbol,
          ethers.parseUnits(amount, 18),
          ethers.parseEther(target),
          image_url,
          { value: fee }
        );
      await tx.wait();
      toast.success("Token Created!");
    } catch (err) {
      if (err.code === "ACTION_REJECTED" || err?.error?.code === 4001) {
        toast.error("Transaction rejected by user.");
      } else {
        toast.error("Something went wrong.");
        console.error(err);
      }
    } finally {
      setLoading(false);
      toggleCreate();
      handleActionComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto p-4">
      <div className="relative mx-auto my-10 w-full max-w-2xl bg-[#1a1b23] rounded-[32px] p-8">
        {/* Close Button */}
        <button
          onClick={toggleCreate}
          className="absolute right-6 top-6 text-gray-500 hover:text-white text-2xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-4xl font-nabla text-center text-yellow-400 mb-8">
          Create Token
        </h2>

        {/* Fee Info */}
        <div className="text-center text-white mb-6">
          <span className="font-nabla text-xl">
            Creation Fee: {ethers.formatUnits(fee, 18)} ETH
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onsubmit(new FormData(e.target));
          }}
          className="space-y-5"
        >
          <input
            type="text"
            name="name"
            placeholder="Token Name"
            className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg border border-gray-800 focus:border-yellow-400 focus:outline-none"
            required
          />

          <input
            type="text"
            name="symbol"
            placeholder="Token Symbol"
            className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg border border-gray-800 focus:border-yellow-400 focus:outline-none"
            required
          />

          <input
            type="url"
            name="image_url"
            placeholder="Image URL"
            className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg border border-gray-800 focus:border-yellow-400 focus:outline-none"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Token Supply (e.g. 1000000)"
            className="w-full bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg border border-gray-800 focus:border-yellow-400 focus:outline-none"
            required
          />

          <div className="flex gap-2 items-center">
            <input
              type="number"
              name="target"
              step="any"
              placeholder="Target Raise"
              className="flex-1 bg-[#22232b] text-white px-4 py-3 rounded-xl text-lg border border-gray-800 focus:border-yellow-400 focus:outline-none"
              required
            />
            <span className="text-white font-mono">ETH</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-yellow-400 text-black py-4 rounded-xl text-xl font-nabla hover:bg-yellow-600 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Token"}
          </button>
        </form>

        {/* Cancel Button */}
        <button
          onClick={toggleCreate}
          className="w-full mt-4 py-4 text-xl font-nabla text-gray-400 
                   hover:text-white transition-colors cursor-pointer"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default List;
