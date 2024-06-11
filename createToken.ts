import 'rpc-websockets/dist/lib/client.cjs';

import {
  Connection,
  Keypair,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

// Function to load the wallet keypair from a file
function loadWalletKey(keypairFile: string): Keypair {
  const resolvedPath = path.resolve(keypairFile);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Keypair file not found: ${resolvedPath}`);
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')))
  );
  return loaded;
}

const createToken = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Load the specific payer keypair from the file
  const payer = loadWalletKey("./src/TREjDz6bXQyPWgKVqzaMrAtK1uhxkLiY58yZfn1XBrN.json");

  // Create new token mint
  const mint = await createMint(connection, payer, payer.publicKey, null, 9);

  // Get the token account of the wallet address
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);

  // Mint 1 billion tokens to the wallet address
  const mintAmount = BigInt(1_000_000_000 * 1_000_000_000); // 1_000_000_000 tokens with 9 decimals
  await mintTo(connection, payer, mint, payerTokenAccount.address, payer, mintAmount);

  console.log('Mint Address:', mint.toBase58());
  console.log('Token Account:', payerTokenAccount.address.toBase58());
};

createToken().catch(err => {
  console.error(err);
});
