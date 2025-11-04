const { Errorhandler } = require("../../exseptions/ErrorHandler");
const { sign } = require("../../utils/jwt");
const Users = require("../../model/users");

module.exports = {
  GET(req, res, next) {
    res.json("admin");
  },

  async POST(req, res, next) {
    try {
      const { username, password } = req.body;
      console.log(username, password);
      const findUser = await Users.findOne({

        username,
         password,
  
      });
      console.log(findUser);
      if (findUser) {
        return res.status(200).json({
          message: "User found",
          status: 200,
          access_token: sign({ id: findUser.id }),
        });
      }

      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    } catch (error) {
      next(error);
    }
  },
};
