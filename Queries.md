## Querying Transactions Within a Specific Time Frame

```graphql
query TransfersInTimeRange(
  $startTime: String
  $endTime: String
  $tokenId: String
) {
  transfers(
    where: {
      blockTimestamp_gte: $startTime
      blockTimestamp_lte: $endTime
      tokenId: $tokenId
    }
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    to
    from
    tokenId
    gasPrice
    blockTimestamp
    transactionHash
  }
}
```

## Query transactions of the last 30 days

```graphql
query GetTransfersFromLast30Days($timestampGte: String) {
  transfers(where: { blockTimestamp_gte: $timestampGte }) {
    to
    from
    tokenId
    gasPrice
    blockTimestamp
    transactionHash
  }
}
```

Fetching `$timestamp_gt` like so:

```js
const date = Math.round(Date.now() / 1000) - 30 * 24 * 60 * 60;
```

## Query Owner Data

```graphql
query GetAccountData($accountId: String!) {
  accounts(where: { id: $accountId }) {
    id
    nftCount
    totalGasSpent
    transactions
  }
}
```

## Query account data by wallet address

```graphql
query GetAccountData($accountId: String!) {
  account(id: $accountId) {
    id
    totalGasSpent
    transactions
    nftCount
    ownedTokenIds
  }
}
```

## Query current owner and transactions by token id

```graphql
query GetTokenData($tokenId: string) {
  token(id: $tokenId) {
    id
    tokenId
    transferHistory {
      receiver {
        id
      }
      sender {
        id
      }
    }
    owner {
      id
    }
  }
}
```
