const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const protect = async (req, res, next) => {
  try {
    // req ke headers mai aa rha hai token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        throw new Error("empty token");
      }
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      const userDoc = await User.findById(decoded.id).select("-password");
      console.log(userDoc);
      req.user = userDoc;
      next();
    } else {
      throw new Error("token not recieved");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
module.exports = protect;
