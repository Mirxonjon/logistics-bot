const { Errorhandler } = require("../../exseptions/ErrorHandler");
const { sign } = require("../../utils/jwt");
const Users = require("../../model/users");

module.exports = {
  GET(req, res, next) {
    res.json("admin");
  },

  async GET_ME(req, res, next) {
    try {
      const user = await Users.findById(req.id).select("-password -cardNumber"); // parolni chiqarib yubormaymiz
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        message: "Get me successful",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async REGISTER(req, res, next) {
    try {
      const { username, password, phone_number, full_name } = req.body;

      if (!username || !password || !phone_number || !full_name) {
        return res.status(400).json({
          message: "username and password and phone are required",
          status: 400,
        });
      }

      // check if already exists
      const existingUser = await Users.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          message: "User already exists",
          status: 409,
        });
      }

      // create new user
      const user = await Users.create({
        username,
        password,
        phone_number,
        full_name,
      });

      return res.status(201).json({
        message: "User created successfully",
        status: 201,
        data: {
          id: user._id,
          username: user.username,
        },
        access_token: sign({ id: user._id }),
      });
    } catch (error) {
      next(error);
    }
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
