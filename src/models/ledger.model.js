const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({

    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true,"Ledger must be associated with an account!!"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required to create Ledger Entry!"],
        index:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        required:[true,"Ledger must be associated with an Transaction!"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can either be CREDIT or DEBIT"
        },
        required:[true,"Ledger type is required!"],
        index:true,
        immutable:true
    }
},{timestamps:true})

const preventLedgerModification = (next) =>{
     next(new Error("Ledger entries are immutable and cannot be modified or deleted"));
}

ledgerSchema.pre("findOneAndUpdate",preventLedgerModification);
ledgerSchema.pre("findOneAndDelete",preventLedgerModification);
ledgerSchema.pre("findOneAndReplace",preventLedgerModification);
ledgerSchema.pre("updateOne",preventLedgerModification);
ledgerSchema.pre("deleteOne",preventLedgerModification);
ledgerSchema.pre("deleteMany",preventLedgerModification);
ledgerSchema.pre("updateMany",preventLedgerModification);


const ledgerModel = mongoose.model("Ledger",ledgerSchema)

module.exports = ledgerModel