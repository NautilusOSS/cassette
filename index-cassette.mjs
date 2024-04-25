import axios from "axios";
import fs from "fs";
import algosdk, { mnemonicToSecretKey } from "algosdk";
import dotenv from "dotenv";
dotenv.config();

function roll10() {
  // Generate a random number between 1 and 10
  var randomNumber = Math.floor(Math.random() * 10) + 1;
  // Check if the random number is 1
  if (randomNumber === 1) {
    // Return true if it's 1 (1 in 10 chance)
    return true;
  } else {
    // Return false otherwise
    return false;
  }
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

const state = JSON.parse(fs.readFileSync("cassette.json", "utf8"));

const url = `https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales?collectionId=35720076&min-round=${state.lastRound}`;
const url2 = `https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales?collectionId=29088600&min-round=${state.lastRound}`;

const res = await axios.get(url);
const res2 = await axios.get(url2);

const currentRound = res.data["current-round"];
const sales = [...res.data.sales, ...res2.data.sales];

for (const sale of sales) {
  const { transactionId, tokenId, price, seller, buyer, timestamp, round } =
    sale;
  const priceSu = price / 1e6;
  const isElligible = Number(priceSu) - 50_000 === 0 ? 1 : 0;
  const result = roll10() ? 1 : 0;
  const result2 = roll10() ? 1 : 0;
  console.log(
    round,
    transactionId.slice(0, 4),
    tokenId,
    price,
    seller.slice(0, 4),
    buyer.slice(0, 4),
    timestamp,
    isElligible,
    result
  );
  fs.appendFileSync(
    "cassette.log",
    `${round} ${transactionId.slice(0, 4)} ${tokenId} ${price} ${seller.slice(
      0,
      4
    )} ${buyer.slice(0, 4)} ${timestamp} ${isElligible} ${result}\n`
  );
  if (isElligible) {
    if (result) {
      console.log(`Send EA Token to ${seller}`);
      fs.appendFileSync("cassette.log", `Send EA Token to ${seller}\n`);
      const assetTransferTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: address,
          to: seller,
          assetIndex: VSA_EAT_CASSETTE,
          amount: 1,
          note: new Uint8Array(
            Buffer.from(
              "Congratulations, you won a Cassette NFT! Go to Highforge.io to claim!",
              "utf-8"
            )
          ),
          suggestedParams: await algodClient.getTransactionParams().do(),
        });
      const signedTxn = assetTransferTxn.signTxn(sk);
      const tx = await algodClient.sendRawTransaction(signedTxn).do();
    }
    if (result2) {
      console.log(`Send EA Token to ${buyer}`);
      fs.appendFileSync("cassette.log", `Send EA Token to ${buyer}\n`);
      const assetTransferTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: address,
          to: buyer,
          assetIndex: VSA_EAT_CASSETTE,
          amount: 1,
          note: new Uint8Array(
            Buffer.from(
              "Congratulations, you won a Cassette NFT! Go to Highforge.io to claim!",
              "utf-8"
            )
          ),
          suggestedParams: await algodClient.getTransactionParams().do(),
        });
      const signedTxn = assetTransferTxn.signTxn(sk);
      const tx = await algodClient.sendRawTransaction(signedTxn).do();
    }
  }
}

fs.writeFileSync(
  "cassette.json",
  JSON.stringify({ lastRound: currentRound }, null, 2)
);
