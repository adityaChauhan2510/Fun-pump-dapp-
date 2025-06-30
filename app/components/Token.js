import { ethers } from "ethers";

function Token({ toggleTrade, token }) {
  return (
    <button
      onClick={() => toggleTrade(token)}
      className="w-full bg-[#222] rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 py-8 px-6 flex flex-col items-center space-y-6 cursor-pointer border border-transparent hover:border-[#444] hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#444]"
    >
      <img
        src={token.image}
        alt="token"
        width={200}
        height={200}
        className="object-cover rounded-full shadow-lg border-4 border-[#333] mb-4"
      />
      <div className="w-full flex flex-col items-center space-y-3 mt-2">
        {/* Line 1: Creator */}
        <span className="text-xs text-gray-400 bg-[#282828] px-3 py-1 rounded font-mono tracking-wide shadow-sm">
          {`By ${token.creator.slice(0, 6)}...${token.creator.slice(38, 42)}`}
        </span>
        {/* Line 2: Market cap */}
        <span className="text-sm text-yellow-300 font-semibold uppercase tracking-wider bg-[#222] px-3 py-1 rounded shadow-sm">
          {`${ethers.formatUnits(token.raised, 18)} ETH`}
        </span>
        {/* Line 3: Name */}
        <span className="text-lg py-3 md:text-xl font-nabla tracking-wider font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm uppercase">
          {token.name}
        </span>
      </div>
    </button>
  );
}

export default Token;
