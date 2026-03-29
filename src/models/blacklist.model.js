const mongoose = require('mongoose');


const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
  },    
  blacklistedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
},{timestamps: true});

tokenBlacklistSchema.index({ createdAt: 1 },{
    expireAfterSeconds: 60 * 60 * 24 * 3    
});

const tokenBlackListModel = mongoose.model("TokenBlacklist", tokenBlacklistSchema);

module.exports = tokenBlackListModel;