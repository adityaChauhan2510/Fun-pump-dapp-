import { ethers } from "ethers";
import { useState } from "react";
import toast from "react-hot-toast";

function List({ toggleCreate, fee, provider, factory }) {
  const [loading, setLoading] = useState(false);
  const onsubmit = async (form) => {
    const name = form.get("name");
    const symbol = form.get("symbol");

    if (!name || !symbol) {
      toast.custom("Token Name and Symbol required", {
        duration: 500,
      });
      return;
    }

    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const transaction = await factory
        .connect(signer)
        .create(name, symbol, { value: fee });
      await transaction.wait();
      toast.success("Token Created");
    } catch (err) {
      if (err.code === "ACTION_REJECTED" || err?.error?.code === 4001) {
        toast.error("Transaction rejected by user.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error(err); // log full error to console for debugging
      }
    } finally {
      setLoading(false);
      toggleCreate();
    }
  };
  return (
    <div className="list">
      <h2>Create new Token</h2>

      <div className="list_description">
        <p>fee : {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault(); // prevent page reload
          onsubmit(new FormData(e.target)); // pass form data
        }}
      >
        <input type="text" name="name" placeholder="Token Name" />
        <input type="text" name="symbol" placeholder="Token Symbol" />
        <input
          type="submit"
          value={loading ? "[ loading... ]" : "[ create... ]"}
          readOnly
          disabled={loading}
          className={`text-2xl p-3 border rounded ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </form>
      <button
        className={`btn--fancy text-xl p-3 border rounded ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={toggleCreate}
        disabled={loading}
      >
        {loading ? "" : "[ cancel ]"}
      </button>
    </div>
  );
}

export default List;
