import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Balance() {
    const wallet = useWallet();
    const { connection } = useConnection();

    async function getBalance() {
        
        if (!wallet.publicKey) {
            alert("Please connect your wallet first!");
            return;
        }

        const balance = await connection.getBalance(wallet.publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;
        const balanceElement = document.getElementById("balance");
        if (balanceElement) {
            balanceElement.innerHTML = solBalance.toFixed(3);
        }
    }
 
    return (
        <div className="text-center py-4">
            <p className="text-gray-300">SOL Balance: <span id="balance">0.000</span></p>
            <button 
                onClick={getBalance}
                className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
                Get Balance
            </button>
        </div>
    );
}