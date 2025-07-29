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
import TokenLaunchpad from './TokenLaunchpad';

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
            
            <div className="max-w-6xl mx-auto px-6 py-8">
              
              {/* Header */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-5xl font-bold text-white">Solana dApp</h1>
                </div>
                
                <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                  Connect your wallet and explore the power of Solana blockchain with our comprehensive toolkit
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500/20 border border-green-500/30 text-green-300">
                    🟢 Devnet Environment
                  </span>
                  <div className="flex items-center gap-3">
                    <WalletMultiButtonDynamic />
                    <WalletDisconnectButtonDynamic />
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="space-y-12">
                
                {/* Core Features Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  
                  {/* Airdrop Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-white/20">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Request Airdrop</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Get free SOL for testing and development</p>
                    </div>
                    <Airdrop />
                  </div>

                  {/* Balance Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-white/20">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Wallet Balance</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Check your current SOL balance</p>
                    </div>
                    <Balance />
                  </div>

                  {/* Send Token Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-white/20">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Send Token</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Transfer SOL to another wallet</p>
                    </div>
                    <SendToken />
                  </div>

                  {/* Sign Message Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-white/20">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Sign Message</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Sign messages with your wallet</p>
                    </div>
                    <SignMessage />
                  </div>

                </div>

                {/* Token Launchpad Section */}
                <div className="max-w-4xl mx-auto">
                  <TokenLaunchpad />
                </div>

              </div>

              {/* Footer */}
              <div className="mt-20 text-center">
                <div className="border-t border-white/10 pt-8">
                  <p className="text-gray-400 text-sm">
                    Made with ❤️ by Mayank
                  </p>
                 
                </div>
              </div>

            </div>

          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};