const { Errorhandler } = require("../../exseptions/ErrorHandler");
const { sign } = require("../../utils/jwt");
const Users = require("../../model/users");
const {
  updateOrderInChannel,
  deleteOrderMessage,
  sentOrderToChanel,
} = require("../../bot/helper/sent-application");
const order = require("../../model/order");

module.exports = {
  async GET(req, res, next) {
    try {
      const { username } = req.query;

      const filter = {};

      if (username) {
        filter.username = username;
      }
      filter.status = "1";
      console.log(filter, "filter");
      const findOrders = await order.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        message: "Orders fetched successfully",
        status: 200,
        data: findOrders,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async GETONE(req, res, next) {
    try {
      const { id } = req.params;
      const findOrder = await order.findOne({ status: "1", _id: id });
      if (!findOrder) {
        return res.status(404).json({
          message: "Order not found",
          status: 404,
        });
      }
      res.status(200).json({
        message: "Orders fetched successfully",
        status: 200,
        data: findOrder,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async CREATE(req, res, next) {
    try {
      const {
        countryFrom,
        countryTo,
        regionFrom,
        regionTo,
        description,
        paymentAmount,
        paymentCurrency,
        capacity,
        paymentType,
        phone_number,
        pickupDate,
        title,
        vehicleBodyType,
        vehicleType,
        weight,
      } = req.body;

      const countryFlags = {
        uzbekistan: "🇺🇿",
        kazakhstan: "🇰🇿",
        china: "🇨🇳",
        turkey: "🇹🇷",
        kyrgyzstan: "🇰🇬",
        tajikistan: "🇹🇯",
        turkmenistan: "🇹🇲",
        pakistan: "🇵🇰",
        iran: "🇮🇷",
        afghanistan: "🇦🇫",
        georgia: "🇬🇪",
      };

      const flagFrom = countryFlags[countryFrom] || "";
      const flagTo = countryFlags[countryTo] || "";

      const findUser = await Users.findById(req.id);
      const paymentText =
        paymentType === "cash"
          ? "нақд"
          : paymentType === "online"
          ? "карта"
          : paymentType === "combo"
          ? "комбо"
          : "-";

      const formattedAmount = Number(paymentAmount)
        .toLocaleString("ru-RU")
        .replace(/,/g, " ");
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("uz-UZ"); // 27.11.2025 formatda qaytaradi
      };
      const loadTimeText =
        pickupDate === today ? `Тайёр` : `${formatDate(pickupDate)} `;

      const message = `
${flagFrom} *${regionFrom} → ${regionTo}* ${flagTo}

📦 Юк: ${title}
⚖️ Оғирлиги: ${weight} тонна
📐 Ҳажми: ${capacity && capacity !== "undefined" ? capacity : "-"} м³
🚛 Авто: ${vehicleType}
🚋 Прицеп: ${
        vehicleBodyType && vehicleBodyType !== "undefined"
          ? vehicleBodyType
          : "-"
      }
💰 Тўлов тури: ${paymentText}
💸 Нархи: ${formattedAmount} ${paymentCurrency == "usd" ? "$" : "сўм"}
🕔 Юклаш вақти: ${loadTimeText}
📝 Тавсиф: ${description && description !== "undefined" ? description : "-"}

📞 Алоқа: ${phone_number}
`;
      console.log(message);
      const sentMessage = await sentOrderToChanel(message);

      const createOrder = await order.create({
        description,
        countryFrom,
        countryTo,
        regionFrom,
        regionTo,
        capacity,
        paymentAmount,
        paymentCurrency,
        paymentType,
        phone_number,
        pickupDate,
        title,
        vehicleBodyType,
        vehicleType,
        weight,
        messegeId: sentMessage.message_id,
        user_id: findUser._id,
        username: findUser.username,
      });

      console.log(createOrder, "sended to channel");
      res.status(200).json({
        message: "Yuk ma'lumoti Telegramga yuborildi ✅",
        status: 200,
        data: createOrder,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async UPDATE(req, res, next) {
    try {
      const {
        countryFrom,
        countryTo,
        regionFrom,
        regionTo,
        description,
        paymentAmount,
        paymentCurrency,
        capacity,
        paymentType,
        phone_number,
        pickupDate,
        title,
        vehicleBodyType,
        vehicleType,
        weight,
      } = req.body;
      const { id } = req.params;

      const countryFlags = {
        uzbekistan: "🇺🇿",
        kazakhstan: "🇰🇿",
        china: "🇨🇳",
        turkey: "🇹🇷",
        kyrgyzstan: "🇰🇬",
        tajikistan: "🇹🇯",
        turkmenistan: "🇹🇲",
        pakistan: "🇵🇰",
        iran: "🇮🇷",
        afghanistan: "🇦🇫",
        georgia: "🇬🇪",
      };

      const flagFrom = countryFlags[countryFrom] || "";
      const flagTo = countryFlags[countryTo] || "";

      const findUser = await Users.findById(req.id);
      const paymentText =
        paymentType === "cash"
          ? "нақд"
          : paymentType === "online"
          ? "карта"
          : paymentType === "combo"
          ? "комбо"
          : "-";

      const formattedAmount = Number(paymentAmount)
        .toLocaleString("ru-RU")
        .replace(/,/g, " ");
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("uz-UZ"); // 27.11.2025 formatda qaytaradi
      };
      const loadTimeText =
        pickupDate === today ? `Тайёр` : `${formatDate(pickupDate)} `;

      const message = `
${flagFrom} *${regionFrom} → ${regionTo}* ${flagTo}

📦 Юк: ${title}
⚖️ Оғирлиги: ${weight} тонна
📐 Ҳажми: ${capacity && capacity !== "undefined" ? capacity : "-"} м³
🚛 Авто: ${vehicleType}
🚋 Прицеп: ${
        vehicleBodyType && vehicleBodyType !== "undefined"
          ? vehicleBodyType
          : "-"
      }
💰 Тўлов тури: ${paymentText}
💸 Нархи: ${formattedAmount} ${paymentCurrency == "usd" ? "$" : "сўм"}
🕔 Юклаш вақти: ${loadTimeText}
📝 Тавсиф: ${description && description !== "undefined" ? description : "-"}

📞 Алоқа: ${phone_number}
`;
      const findOrder = await order.findById(id);
      console.log(message, "updated message");

      const sentMessage = await updateOrderInChannel(
        findOrder.messegeId,
        message
      );

      const Update = await order.findByIdAndUpdate(
        id,
        {
          description,
          countryFrom,
          countryTo,
          regionFrom,
          regionTo,
          capacity,
          paymentAmount,
          paymentCurrency,
          paymentType,
          phone_number,
          pickupDate,
          title,
          vehicleBodyType,
          vehicleType,
          weight,
        },
        { new: true }
      );

      res.status(200).json({
        message: "Yuk ma'lumoti yangilandi ✅",
        status: 200,
        data: Update,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async DELETE(req, res, next) {
    try {
      const { id } = req.params;
      const findOrder = await order.findOne({ status: "1", _id: id });
      const updateOrder = await order.findByIdAndUpdate(
        {
          _id: findOrder._id,
        },
        {
          status: "0",
        }
      );

      const sentMessage = await deleteOrderMessage(findOrder.messegeId);

      res.status(200).json({
        message: "Order deleted successfully",
        status: 200,
        data: updateOrder,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};
