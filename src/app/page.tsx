"use client";
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import Airdrop from './Airdrop';
import '@solana/wallet-adapter-react-ui/styles.css';
import Balance from './Balance';
import SignMessage from './SignMessage';
import SendToken from './SendToken';

// Dynamic imports to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const WalletDisconnectButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false }
);

export default function Wallet() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
    new UnsafeBurnerWalletAdapter(),
  ], [network]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      <ConnectionProvider endpoint={endpoint}> 
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            
            <div className="max-w-4xl mx-auto px-6 py-12">
              
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <h1 className="text-4xl font-bold text-white">Solana dApp</h1>
                </div>
                
                <p className="text-gray-300 text-lg mb-8">
                  Connect your wallet and request devnet SOL for testing
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🟢 Devnet
                  </span>
                  <div className="flex items-center gap-2">
                    <WalletMultiButtonDynamic />
                    <WalletDisconnectButtonDynamic />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Airdrop Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Request Airdrop</h3>
                    <p className="text-gray-400 text-sm">Get free SOL for testing</p>
                  </div>
                  <Airdrop />
                </div>

                

                {/* Balance Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Wallet Balance</h3>
                  </div>
                  <Balance />
                </div>

                {/* Send Token Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Send Token</h3>
                    <p className="text-gray-400 text-sm">Send SOL to another wallet</p>
                  </div>
                  <SendToken />
                </div>

                {/* Sign Message Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sign Message</h3>
                    <p className="text-gray-400 text-sm">Sign a message with your wallet</p>
                  </div>
                  <SignMessage />
                </div>

              </div>

            </div>
            
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};