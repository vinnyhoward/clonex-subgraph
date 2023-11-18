import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  CloneXRevealed as CloneXRevealedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/CloneX/CloneX";
import {
  Approval,
  ApprovalForAll,
  CloneXRevealed,
  OwnershipTransferred,
  Transfer,
  Account,
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCloneXRevealed(event: CloneXRevealedEvent): void {
  let entity = new CloneXRevealed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.fileId = event.params.fileId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  // transfer
  const transferEntity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transferEntity.from = event.params.from;
  transferEntity.to = event.params.to;
  transferEntity.tokenId = event.params.tokenId;
  transferEntity.blockNumber = event.block.number;
  transferEntity.blockTimestamp = event.block.timestamp;
  transferEntity.transactionHash = event.transaction.hash;
  transferEntity.gasPrice = event.transaction.gasPrice;
  transferEntity.save();

  let fromAccountId = event.params.from;
  let toAccountId = event.params.to;
  let tokenId = event.params.tokenId;

  let fromAccount = Account.load(fromAccountId);
  if (fromAccount == null) {
    fromAccount = new Account(fromAccountId);
    fromAccount.nftCount = BigInt.fromI32(0);
    fromAccount.totalGasSpent = BigInt.fromI32(0);
    fromAccount.transactions = new Array<Bytes>();
    fromAccount.ownedTokenIds = [];
  }
  
  // Check if it's a regular transfer and not a minting event
  if (fromAccountId.toHexString() != "0x0000000000000000000000000000000000000000") {
    fromAccount.nftCount = fromAccount.nftCount.minus(BigInt.fromI32(1));
  
    // Remove the token ID from the ownedTokenIds array
    let tokenIndex = fromAccount.ownedTokenIds.indexOf(tokenId);
    if (tokenIndex > -1) {
      fromAccount.ownedTokenIds.splice(tokenIndex, 1);
    }
  }
  
  if (!fromAccount.totalGasSpent) {
    fromAccount.totalGasSpent = BigInt.fromI32(0);
  }
  
  fromAccount.totalGasSpent = fromAccount.totalGasSpent.plus(event.transaction.gasPrice);
  
  let fromTransactions = fromAccount.transactions;
  if (!fromTransactions) {
    fromTransactions = new Array<Bytes>();
  }
  
  fromTransactions.push(event.transaction.hash);
  fromAccount.transactions = fromTransactions;
  fromAccount.save();

  let toAccount = Account.load(toAccountId);
  if (toAccount == null) {
    toAccount = new Account(toAccountId);
    toAccount.nftCount = BigInt.fromI32(1);
    toAccount.totalGasSpent = BigInt.fromI32(0);
    toAccount.transactions = new Array<Bytes>();
    toAccount.ownedTokenIds = fromAccountId.toHexString() == "0x0000000000000000000000000000000000000000" ? [tokenId] : []; // Only add tokenId for minting
  } else {
    if (!toAccount.ownedTokenIds.includes(tokenId)) {
      toAccount.ownedTokenIds.push(tokenId);
    }
    toAccount.nftCount = toAccount.nftCount.plus(BigInt.fromI32(1)); // Increment nftCount only once
  }

  if (!toAccount.totalGasSpent) {
    toAccount.totalGasSpent = BigInt.fromI32(0);
  }
  toAccount.totalGasSpent = toAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  let toTransactions = toAccount.transactions;

  if (!toTransactions) {
    toTransactions = new Array<Bytes>();
  }

  toTransactions.push(event.transaction.hash);
  toAccount.transactions = toTransactions;
  toAccount.save();
}
