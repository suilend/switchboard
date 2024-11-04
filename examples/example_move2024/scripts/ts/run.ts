import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64 as fromB64 } from "@mysten/sui/utils";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const MAINNET_SUI_RPC = "https://fullnode.testnet.sui.io:443";
const client = new SuiClient({
  url: MAINNET_SUI_RPC,
});
let keypair: Ed25519Keypair | null = null;

const suiKeyIdx = parseInt(process.env.SUI_KEY_IDX || "3");

try {
  // Read the keystore file (usually in JSON format)
  const keystorePath = path.join(
    os.homedir(),
    ".sui",
    "sui_config",
    "sui.keystore"
  );
  const keystore = JSON.parse(fs.readFileSync(keystorePath, "utf-8"));

  // Ensure the keystore has at least key
  if (keystore.length < suiKeyIdx + 1) {
    throw new Error(`Keystore has fewer than ${suiKeyIdx + 1} keys.`);
  }

  // Access the 4th key (index 3) and decode from base64
  const secretKey = fromB64(keystore[suiKeyIdx]);
  keypair = Ed25519Keypair.fromSecretKey(secretKey.slice(1)); // Slice to remove the first byte if needed
} catch (error) {
  console.log("Error:", error);
}

if (!keypair) {
  throw new Error("Keypair not loaded");
}

//================================================================================================
// Initialization and Logging
//================================================================================================

// create new user
const userAddress = keypair.getPublicKey().toSuiAddress();

console.log(`User account ${userAddress} loaded.`);

const exampleAddress =
  "0x2f4b7485d25aedbca3e630c6da5d72a97fd4290bfbf9ac23e5739efc1cbad545";

const aggregatorAddress =
  "0xc0c5a26a1186787e39c92a974caf07c5eaccf186c9a6d0c00c0722a9674448a4";

const tx = new Transaction();

tx.moveCall({
  target: `${exampleAddress}::move2024::example_move2024`,
  arguments: [tx.object(aggregatorAddress)],
});

const res = await client.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
  options: {
    showEffects: true,
    showObjectChanges: true,
  },
});

console.log("On Demand Example Run Response: ", res);
