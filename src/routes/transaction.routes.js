const {Router} = require("express")
const {authMiddleware, authSystemUserMiddleware} = require("../middleware/auth.middleware")
const {createTransaction, createIntialFundsTransaction} = require("../controllers/transaction.controller")
const transactionRoutes = Router();


transactionRoutes.post("/",authMiddleware,createTransaction)

transactionRoutes.post("/system/intial-funds",authSystemUserMiddleware,createIntialFundsTransaction)

module.exports = transactionRoutes;
