const mongoose = require("mongoose")


const trnasactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required:[true,"Transaction must be associated with a From account"],
        index:true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required:[true,"Transaction must be associated with a To account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Stauts can be either PENDING,COMPLETED,FAILED or REVERSED!"
        },
        default: "PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a transaction"],
        min:[0,"Transaction amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:true,
        index:true,
        unique:true
    }
},{timestamps:true})

const transactionModel = mongoose.model("Transaction",trnasactionSchema);

module.exports = transactionModel