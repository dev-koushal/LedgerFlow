const express =  require("express")
const {authMiddleware} = require("../middleware/auth.middleware");
const { createAccountController, getUserAccountsController, getAccountBalanceController } = require("../controllers/account.controller");
const { get } = require("mongoose");

const router = express.Router();



/**
 * - POST /api/accounts/
 * - Create a new Account
 * - Protected Route
*/

router.post("/",authMiddleware,createAccountController)


/**
 * - GET /api/accounts/
 * - Get all Accounts
 * - Protected Route
 */
router.get("/",authMiddleware,getUserAccountsController)

/**
 * - GET /api/accounts/balance/:accountId
 */

router.get("/balance/:accountId",authMiddleware,getAccountBalanceController)
module.exports = router