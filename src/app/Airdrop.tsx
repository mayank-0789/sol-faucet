"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";

export default function Airdrop() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [amount, setAmount] = useState("0.1");
    const [loading, setLoading] = useState(false);

    async function sendAirdropToUser() {
        if (!wallet.publicKey) {
            alert("Please connect your wallet first!");
            return;
        }

        setLoading(true);

        try {
            const lamports = parseFloat(amount) * 1000000000; // Convert SOL to lamports
            
            console.log("🚀 Requesting airdrop...");
            console.log("Wallet address:", wallet.publicKey.toString());
            console.log("Amount (lamports):", lamports);
            console.log("RPC endpoint:", connection.rpcEndpoint);
            
            const signature = await connection.requestAirdrop(wallet.publicKey, lamports);
            console.log("✅ Airdrop signature:", signature);
            
            alert(`🎉 Airdrop of ${amount} SOL requested successfully!\nCheck your wallet in a few seconds.`);
            setAmount("0.1"); // Reset to default
            
        } catch (error: any) {
            console.error("❌ Detailed airdrop error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Full error object:", JSON.stringify(error, null, 2));
            
            if (error.message?.includes("429") || error.code === 429) {
                alert("⏰ Rate limited by RPC. Wait 5-10 minutes or try https://faucet.solana.com");
            } else if (error.message?.includes("insufficient") || error.message?.includes("balance")) {
                alert("💡 Account balance issue. Try https://faucet.solana.com first");
            } else if (error.message?.includes("blockhash") || error.message?.includes("recent")) {
                alert("🔄 Network issue. Please try again in a moment");
            } else {
                alert(`❌ Airdrop failed: ${error.message || error.code || 'Unknown error'}\n\nTry the official faucet: https://faucet.solana.com`);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            
            {/* Amount Input */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Amount (SOL)
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.1"
                    step="0.1"
                    min="0.1"
                    max="2"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Maximum 2 SOL per request
                </p>
            </div>

            {/* Airdrop Button */}
            <button
                onClick={sendAirdropToUser}
                disabled={loading || !wallet.publicKey || !amount || parseFloat(amount) <= 0}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                    loading || !wallet.publicKey || !amount || parseFloat(amount) <= 0
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Requesting...</span>
                    </>
                ) : !wallet.publicKey ? (
                    <span>Connect Wallet First</span>
                ) : (
                    <span>Request Airdrop</span>
                )}
            </button>

            {/* Help Text */}
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    If airdrop fails, try the{" "}
                    <a
                        href="https://faucet.solana.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline"
                    >
                        official Solana faucet
                    </a>
                </p>
            </div>

        </div>
    );
}
