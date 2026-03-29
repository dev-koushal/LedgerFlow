# LedgerFlow – Banking Ledger System

LedgerFlow is a backend implementation of a **banking-style ledger system** built with **Node.js, Express, and MongoDB**.
It models how real financial systems record money movement using **double-entry accounting** to guarantee consistency and auditability.

---

# Overview

The system processes transfers between accounts by creating:

* a **Transaction** (high-level record of the transfer)
* two **Ledger Entries**

  * **DEBIT** from sender account
  * **CREDIT** to receiver account

Account balances are **not stored directly**. Instead, balances are **derived from ledger entries**, ensuring the ledger remains the single source of truth.

---

# Core Concepts

## Accounts

Represents a user’s financial account.

Each account:

* belongs to a user
* has a status (`ACTIVE`, `SUSPENDED`, etc.)
* derives its balance from ledger entries.

---

## Transactions

A transaction represents a transfer between two accounts.

Fields include:

* `fromAccount`
* `toAccount`
* `amount`
* `status`
* `idempotencyKey`

The transaction lifecycle:

```
PENDING → COMPLETED
```

---

## Ledger Entries

Every transaction creates two entries:

| Type   | Meaning                   |
| ------ | ------------------------- |
| DEBIT  | Money removed from sender |
| CREDIT | Money added to receiver   |

This ensures:

```
Total Debit = Total Credit
```

which is the foundation of **double-entry accounting**.

---

# System Architecture

```
Client Request
      ↓
Authentication Middleware
      ↓
Transaction Controller
      ↓
MongoDB Transaction Session
      ↓
Create Transaction Record
      ↓
Create Debit Ledger Entry
      ↓
Create Credit Ledger Entry
      ↓
Mark Transaction Completed
```

All operations run inside a **MongoDB transaction session**, ensuring atomicity.

---

# Idempotency Protection

The system uses an **idempotency key** to prevent duplicate transactions.

If the same request is sent multiple times with the same key, the system will return the **existing transaction** instead of creating a new one.

Example:

```
idempotencyKey: "txn-2026-001"
```

---

# Atomic Transactions

LedgerFlow uses **MongoDB sessions and transactions** to guarantee:

* no partial transfers
* consistent ledger state
* safe rollback on failure

If any step fails:

```
session.abortTransaction()
```

This prevents inconsistent money states.

---

# Authentication

The API uses **JWT authentication**.

Two user types exist:

### Normal User

Can perform transfers between accounts.

### System User

Special account that can initialize funds in the system.

---

# API Endpoints

## Register User

```
POST /api/auth/register
```

Creates a new user and returns a JWT token.

---

## Login

```
POST /api/auth/login
```

Authenticates a user and returns a JWT token stored in cookies.

---

## Transfer Money

```
POST /transactions
```

Transfers money between accounts.

Body:

```json
{
  "fromAccount": "account_id",
  "toAccount": "account_id",
  "amount": 100,
  "idempotencyKey": "txn-123"
}
```

---

## Initialize Funds (System Only)

```
POST /transactions/system/intial-funds
```

Used by the system account to add funds to an account.

Body:

```json
{
  "toAccount": "account_id",
  "amount": 1000,
  "idempotencyKey": "init-001"
}
```

---

# Security Features

* JWT based authentication
* role-based middleware
* idempotency protection
* atomic MongoDB transactions
* ledger-based balance calculation

---

# Technology Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

---

# Why Ledger-Based Systems?

Traditional systems store balances directly, which can cause inconsistencies.

Ledger systems:

* provide **complete financial audit trails**
* prevent hidden balance manipulation
* allow **reconstruction of balances from history**

This architecture is used in:

* payment processors
* fintech systems
* banking infrastructure

---

# Future Improvements

Possible extensions:

* distributed transaction handling
* event-driven transaction processing
* fraud detection layer
* ledger reconciliation jobs
* payment gateway integrations

---

# License

ISC License
