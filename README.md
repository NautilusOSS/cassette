# Cassette

Empty Cassette Scripts

## How it works

1. When a user of Nautilus lists or buys an Empty Cassette (or Treehouse NFT) they are opted into the Early Access Token for Cassette (no Empty Cassette). 
1. For each sale, a dice is rolled to determine if the seller and buy receive a Early Access Token
1. Repeat

The script records transaction in a log file and only considers new transactions.

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
