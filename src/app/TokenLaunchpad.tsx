'use client';

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import { 
    TOKEN_2022_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    getAssociatedTokenAddressSync,
    createInitializeMetadataPointerInstruction,
    ExtensionType,
    getMintLen,
    TYPE_SIZE,
    LENGTH_SIZE,
    createInitializeMintInstruction
} from "@solana/spl-token";
import { TokenMetadata, pack, createInitializeInstruction} from "@solana/spl-token-metadata";
import { useState } from "react";

interface TokenForm {
    name: string;
    symbol: string;
    image: string;
    initialSupply: number;
    decimals: number;
}

interface CreatedToken {
    mintAddress: string;
    signature: string;
    name: string;
    symbol: string;
}

export default function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
    
    const [formData, setFormData] = useState<TokenForm>({
        name: '',
        symbol: '',
        image: '',
        initialSupply: 1000000,
        decimals: 9
    });

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Token name is required');
            return false;
        }
        if (!formData.symbol.trim()) {
            setError('Token symbol is required');
            return false;
        }
        if (formData.symbol.length > 10) {
            setError('Token symbol must be 10 characters or less');
            return false;
        }
        if (formData.initialSupply <= 0) {
            setError('Initial supply must be greater than 0');
            return false;
        }
        if (formData.decimals < 0 || formData.decimals > 9) {
            setError('Decimals must be between 0 and 9');
            return false;
        }
        if (formData.image && !isValidUrl(formData.image)) {
            setError('Please enter a valid image URL');
            return false;
        }
        return true;
    };

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const createToken = async () => {
        setError(null);
        setSuccess(null);

        if (!wallet.publicKey || !wallet.signTransaction) {
            setError('Please connect your wallet first');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Generate mint keypair
            const mint = Keypair.generate();
            
            const metadata: TokenMetadata = {
                mint: mint.publicKey,
                name: formData.name,
                symbol: formData.symbol,
                uri: formData.image,
                additionalMetadata: []
            };

            // Calculate space needed for mint with metadata extension
            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
            
            // Calculate rent for the mint account
            const rent = await connection.getMinimumBalanceForRentExemption(mintLen+metadataLen);
            
            // Get associated token account for the wallet
            const associatedTokenAccount = getAssociatedTokenAddressSync(
                mint.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            // Create transaction
            const transaction = new Transaction();

            // Add create account instruction for the mint
            transaction.add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mint.publicKey,
                    space: mintLen,
                    lamports: rent,
                    programId: TOKEN_2022_PROGRAM_ID
                })
            );

            // Add initialize metadata pointer instruction
            transaction.add(
                createInitializeMetadataPointerInstruction(
                    mint.publicKey,
                    wallet.publicKey,
                    mint.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            // Add initialize mint instruction
            transaction.add(
                createInitializeMintInstruction(
                    mint.publicKey,
                    formData.decimals,
                    wallet.publicKey,
                    wallet.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            transaction.add(
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mint.publicKey,
                    metadata: mint.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: wallet.publicKey,
                    updateAuthority: wallet.publicKey
                })
            );

            // Add create associated token account instruction
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    mint.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            // Add mint to instruction for initial supply
            const initialSupplyWithDecimals = BigInt(formData.initialSupply * Math.pow(10, formData.decimals));
            transaction.add(
                createMintToInstruction(
                    mint.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    initialSupplyWithDecimals,
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            );

            // Set transaction parameters
            transaction.feePayer = wallet.publicKey;
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            
            // Sign with mint keypair
            transaction.partialSign(mint);

            // Send transaction
            const signature = await wallet.sendTransaction(transaction, connection);
            
            // Confirm transaction
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            // Add to created tokens list
            const newToken: CreatedToken = {
                mintAddress: mint.publicKey.toString(),
                signature,
                name: formData.name,
                symbol: formData.symbol
            };
            setCreatedTokens(prev => [newToken, ...prev]);

            setSuccess(`Token "${formData.name}" created successfully!`);
            
            // Reset form
            setFormData({
                name: '',
                symbol: '',
                image: '',
                initialSupply: 1000000,
                decimals: 9
            });

        } catch (err) {
            console.error('Error creating token:', err);
            setError(err instanceof Error ? err.message : 'Failed to create token. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
        
        // Clear errors when user starts typing
        if (error) setError(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(null), 2000);
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Token Launchpad</h3>
                <p className="text-gray-400 text-sm">Create your own Token 2022 with metadata</p>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Token Name"
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    disabled={isLoading}
                />

                <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="Token Symbol (max 10 chars)"
                    maxLength={10}
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    disabled={isLoading}
                />

               
                <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Image URL (optional)"
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    disabled={isLoading}
                />

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="initialSupply"
                        value={formData.initialSupply}
                        onChange={handleInputChange}
                        placeholder="Initial Supply"
                        min="1"
                        className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        disabled={isLoading}
                    />

                    <input
                        type="number"
                        name="decimals"
                        value={formData.decimals}
                        onChange={handleInputChange}
                        placeholder="Decimals (0-9)"
                        min="0"
                        max="9"
                        className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        disabled={isLoading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <button
                    onClick={createToken}
                    disabled={isLoading || !wallet.connected}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isLoading || !wallet.connected
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Token...
                        </span>
                    ) : !wallet.connected ? (
                        'Connect Wallet to Create Token'
                    ) : (
                        'Create Token'
                    )}
                </button>
            </div>

            {/* Created Tokens List */}
            {createdTokens.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Your Created Tokens</h4>
                    <div className="space-y-3">
                        {createdTokens.map((token, index) => (
                            <div key={index} className="p-3 bg-black/20 rounded-lg border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-medium text-white">
                                            {token.name} ({token.symbol})
                                        </h5>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {token.mintAddress.slice(0, 20)}...
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(token.mintAddress)}
                                        className="text-orange-400 hover:text-orange-300 text-xs"
                                    >
                                        Copy
                                    </button>
                                </div>
                                
                                <a
                                    href={`https://explorer.solana.com/tx/${token.signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-400 hover:text-orange-300 text-xs"
                                >
                                    View on Explorer →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}