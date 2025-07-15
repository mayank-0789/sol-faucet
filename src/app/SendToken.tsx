import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram} from "@solana/web3.js";

export default function SendToken() {
    const wallet = useWallet();
    const {connection} = useConnection();

    async function sendToken() {
        if (!wallet.publicKey) {
            alert("Please connect your wallet first!");
            return;
        }
        if (!wallet.sendTransaction) {
            alert("Please send the transaction first!");
            return;
        }

        let to = document.getElementById("to") as HTMLInputElement;
        let amount = document.getElementById("amount") as HTMLInputElement;
        const transaction = new Transaction();
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(to.value),
                lamports: LAMPORTS_PER_SOL * Number(amount.value),
            })
        );
        
        try {
            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature);
            alert("Transaction sent successfully!");
        } catch (error) {
            alert("Error sending transaction: " + error);
        }
    }

    return (
        <div className="space-y-4">
            <input
                id="to"
                type="text"
                placeholder="Enter recipient address"
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            />
            <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            />
            <button onClick={sendToken} className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Send Token</button>
        </div>
    )
}