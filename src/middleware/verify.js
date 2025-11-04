const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Errorhandler } = require("../exseptions/ErrorHandler");

dotenv.config();

module.exports = (req, res, next) => {
  const { access_token } = req.headers;
  if (!access_token) {
    return next(new Errorhandler("Access token is required", 401));
  }

  jwt.verify(access_token, process.env.SECRET_KEY, (err, decoded) => {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Errorhandler("Invalid token", 401));
    }

    if (!decoded?.id) {
      return next(new Errorhandler("Invalid or missing user ID in token", 401));
    }
console.log(decoded, "decoded");

    req.id = decoded.id;
    next();
  });
};
