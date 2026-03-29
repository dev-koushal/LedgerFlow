const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
/**
 * - user register controller
 * - POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await userModel.create({ email, password, name });

    const token = jwt.sign({ userId: user._id,
    userType: user.systemUser ? "SYSTEM" : "USER"}, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * - user Login Controller
 * - POST api/auth/login
 */

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

   const user = await userModel
  .findOne({ email })
  .select("+password +systemUser");
    if (!user) {
      return res
        .status(401)
        .json({ message: "User doesn't exist", success: false });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Password doesn't match!", success: false });
    }

    const token = jwt.sign({userId: user._id,
    userType: user.systemUser ? "SYSTEM" : "USER" }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
      message:"User Logged In",
      success: true
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * - user Logout Controller
 * - POST api/auth/logout
 */
 
  const userLogoutController = async (req, res) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
      if(!token){
        return res.status(400).json({
          message: "Token is required for logout",  
          success: false,
        });
      } 
      res.clearCookie("token"); 
      await tokenBlacklistModel.create({ token });
      res.status(200).json({
        message: "User logged out successfully",
        success: true,
      });
    }
      catch (error) { 
        console.log(error);
        res.status(500).json({
          message: "Server error",
          success: false,
        });
      }
  };


module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
};
