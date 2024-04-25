# Cassette

Empty Cassette Scripts

## How it works

1. When a user of Nautilus lists or buys an Empty Cassette (or Treehouse NFT) they are opted into the Early Access Token for Cassette (no Empty Cassette). 
1. For each sale, a dice is rolled to determine if the seller and buy receive a Early Access Token
1. Repeat

The script records transaction in a log file and only considers new transactions.

## How EA Token options work

The [ulujs](https://github.com/temptemp3/ulujs) library has a method called `setOptins` that can be used to add optins to a transaction group. We check if the collection id is for empty cassette. If it is we include a EA Token optin to airdrop cassette winners later after sale.

Source: https://github.com/NautilusOSS/nautilus-interface/blob/main/src/pages/Account/index.tsx#L715

## Files

1. index-cassette.mjs   
Send EA Token to seller or buys of empty cassette following rules if dice is right
1. index-cassette-high.mjs  
Send EA Token to seller with highest sale in 24hrs

## Prerequisite

1. Nautilus NFT Marketplace
1. NFT Indexer

## Requirments

1. NodeJS
1. .env file
