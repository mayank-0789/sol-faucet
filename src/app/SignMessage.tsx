import { ed25519 } from '@noble/curves/ed25519';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import React from 'react';

export default function SignMessage() {
    const {publicKey, signMessage} = useWallet();

    const handleSignMessage = async () => {
        if (!publicKey) {
            alert("Please connect your wallet first!");
            return;
        }
        if (!signMessage) {
            alert("Please sign the message first!");
            return;
        }

        const message = (document.getElementById("message") as HTMLInputElement)?.value;
        if (!message) {
            alert("Please enter a message!");
            return;
        }
        const messageBytes = new TextEncoder().encode(message);
        const signature = await signMessage(messageBytes);
        const signatureString = bs58.encode(signature);
        if(ed25519.verify(signature, messageBytes, publicKey.toBytes())) {
            alert(`Success! Signature: ${signatureString}`);
            console.log(signatureString);
        } else {
            alert('Error: Invalid signature');
        }
    }

    return (
        <div className="space-y-4">
            <input
                id="message"
                type="text"
                placeholder="Enter message to sign"
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            />
            <button
                onClick={handleSignMessage}
                className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
                Sign Message
            </button>
        </div>
    )
}