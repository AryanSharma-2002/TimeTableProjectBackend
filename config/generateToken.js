const jwt = require("jsonwebtoken");

const generateToken = async (id) => {
  try {
    const token = await jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: "30 days",
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log("error during generating token", error.message);
    return error;
  }
};

module.exports = generateToken;
