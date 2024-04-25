import axios from "axios";
import fs from "fs";
import algosdk, { mnemonicToSecretKey } from "algosdk";
import dotenv from "dotenv";
dotenv.config();

function rolln(n) {
  // Generate a random number between 1 and n
  var randomNumber = Math.floor(Math.random() * n) + 1;
  // Check if the random number is 1
  if (randomNumber === 1) {
    // Return true if it's 1 (1 in n chance)
    return true;
  } else {
    // Return false otherwise
    return false;
  }
}

function roll10() {
  return rolln(10);
}

const VSA_EAT_CASSETTE = 29103397;

const { MN } = process.env;

const mnemonic = MN || "";

const { addr: address, sk } = mnemonicToSecretKey(mnemonic);

const ALGO_SERVER = "https://testnet-api.voi.nodly.io";
const ALGO_INDEXER_SERVER = "https://testnet-idx.voi.nodly.io";

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN || "",
  process.env.ALGOD_SERVER || ALGO_SERVER,
  process.env.ALGOD_PORT || ""
);

const indexerClient = new algosdk.Indexer(
  process.env.INDEXER_TOKEN || "",
  process.env.INDEXER_SERVER || ALGO_INDEXER_SERVER,
  process.env.INDEXER_PORT || ""
);

const state = JSON.parse(fs.readFileSync("cassette-high.json", "utf8"));

const lastRound = state?.lastRound || 0; 

const url = `https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales?collectionId=29088600&min-round=${state.lastRound}`;

const res = await axios.get(url);

const currentRound = res.data["current-round"];
const sales = res.data.sales;

let leader = [];
let max = 0;
for (const sale of sales) {
  const { transactionId, tokenId, price, seller, buyer, timestamp, round } =
    sale;
  const priceSu = price / 1e6;
  const isElligible = priceSu - 100_000 >= 0 ? 1 : 0;
  if (isElligible) {
    console.log(
      round,
      transactionId.slice(0, 4),
      tokenId,
      price,
      seller.slice(0, 4),
      buyer.slice(0, 4),
      timestamp,
      isElligible
    );
    fs.appendFileSync(
      "cassette-high.log",
      `${round} ${transactionId.slice(0, 4)} ${tokenId} ${price} ${seller.slice(
        0,
        4
      )} ${buyer.slice(0, 4)} ${timestamp} ${isElligible}\n`
    );
    if (priceSu > max) {
      leader = [seller];
      max = priceSu;
    } else if (priceSu === max) {
      leader.push(seller);
    } else {
      continue;
    }
  }
}
const uniqueAddrs = [...new Set(leader)];
console.log(uniqueAddrs);

if (uniqueAddrs.length === 0) {
  console.log("No winner");
  process.exit(0);
}

const select = Math.floor((Math.random() * uniqueAddrs.length) | 0);

const winner = uniqueAddrs[select];

console.log(
  `Send EA Token to ${winner} fpr highest sale between rounds ${lastRound} and ${currentRound}!`
);
fs.appendFileSync("cassette-high.log", `Send EA Token to ${winner}\n`);

const assetTransferTxn =
  algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: winner,
    assetIndex: VSA_EAT_CASSETTE,
    amount: 1,
    note: new Uint8Array(
      Buffer.from(
        "Congratulations, you won a Cassette NFT for Highest sale! Go to Highforge.io to claim!",
        "utf-8"
      )
    ),
    suggestedParams: await algodClient.getTransactionParams().do(),
  });
const signedTxn = assetTransferTxn.signTxn(sk);
const tx = await algodClient.sendRawTransaction(signedTxn).do();

fs.writeFileSync(
  "cassette-high.json",
  JSON.stringify({ lastRound: currentRound }, null, 2)
);
