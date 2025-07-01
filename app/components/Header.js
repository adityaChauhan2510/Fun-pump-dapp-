import { ethers } from "ethers";

function Header({ account, setAccount }) {
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.getAddress(accounts[0]);
    setAccount(account);
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <header>
      <p className="brand">fun.pump</p>
      {account ? (
        <div className="flex gap-4 items-center">
          <span className="text-white btn--fancy text-sm font-mono bg-gray-800 px-3 py-1 rounded-xl">
            [{account.slice(0, 6)}...{account.slice(38, 42)}]
          </span>
          <button
            onClick={disconnectWallet}
            className=" p-3 bg-red-800 hover:bg-red-900 font-semibold rounded-3xl text-xl"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connectWallet} className="btn--fancy">
          Connect
        </button>
      )}
    </header>
  );
}

export default Header;
