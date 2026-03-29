const accountModel = require('../models/account.model')



const createAccountController = async (req,res) => {
    try {

        const user = req.user;

        const account = await accountModel.create({
            user:user._id
        })

        return res.status(201).json({account})
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"There is error in creating account!!"})
    }
    
}

const getUserAccountsController = async (req,res) => {
    try {
        const user = req.user;
        const accounts = await accountModel.find({user:user._id})
        return res.status(200).json({accounts})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"There is error in fetching accounts!!"})
    }
}

const getAccountBalanceController = async (req,res) => {
    try {
        const {accountId} = req.params;

        const account = await accountModel.findOne({
            _id:accountId,
            user:req.user._id
        })

        if(!account){
            return res.status(404).json({message:"Account not found!!"})
        }   
    
        const balance = await account.getBalance()

        return res.status(200).json({ accountId: account._id, balance })  


     } catch (error) {
        console.log(error);
        return res.status(400).json({message:"There is error in fetching account balance!!"})
    }
}



module.exports = {createAccountController,getUserAccountsController,getAccountBalanceController}