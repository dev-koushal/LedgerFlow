const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * POST /transactions
 */
const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(200).json(existingTransaction);
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        message: "Both accounts must be active to perform a transaction",
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance: ${balance}`,
      });
    }

    session.startTransaction();

    const transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session }
      )
    )[0];

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Transaction successful",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    res.status(500).json({
      message: "Transaction failed",
    });
  }
};

/**
 * POST /transactions/system/intial-funds
 */
const createIntialFundsTransaction = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(200).json(existingTransaction);
    }

    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    const fromUserAccount = await accountModel.findOne({
      user: req.user._id,
    });

    if (!fromUserAccount) {
      return res.status(404).json({ message: "System account not found" });
    }

    session.startTransaction();

    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Initial funds transaction created successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    res.status(500).json({
      message: "Initial funds transaction failed",
    });
  }
};

module.exports = {
  createTransaction,
  createIntialFundsTransaction,
};