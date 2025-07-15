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
              <div className="max-w-md mx-auto">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Request Airdrop</h2>
                    <p className="text-gray-400">Get free SOL for testing on devnet</p>
                  </div>
                  
                  <Airdrop />
                </div>
              </div>

            </div>
            
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};
