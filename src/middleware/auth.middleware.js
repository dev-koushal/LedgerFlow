const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access,token is missing" });
    }
    // console.log(token);

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });

    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is blacklisted" });
    } 



    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized access, token is invalid" });
  }
};

const authSystemUserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is missing" });
    }

    const isBlacklisted = await TokenBlacklist.findOne({ token });

    if (isBlacklisted) {  
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is blacklisted" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// console.log(decoded);
    if (decoded.userType !== "SYSTEM") {
      return res.status(403).json({ message: "Access denied, system user required" });
    }

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user.systemUser) {
      return res.status(403).json({ message: "Access denied, system user required" });
    }

    req.user = user;
    return next();


  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized access, token is invalid" });
  }
};


module.exports = {
  authMiddleware,
  authSystemUserMiddleware
};
