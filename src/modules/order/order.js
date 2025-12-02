const { Errorhandler } = require("../../exseptions/ErrorHandler");
const { sign } = require("../../utils/jwt");
const Users = require("../../model/users");
const {
  updateOrderInChannel,
  deleteOrderMessage,
  sentOrderToChanel,
} = require("../../bot/helper/sent-application");
const order = require("../../model/order");
const { getRegionLabel, formatDate } = require("../../utils/format");

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
        cargoUnit,
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
        belarus: "🇧🇾",
        russia: "🇷🇺",
      };

      // const finalRegionFrom = getRegionLabel(countryFrom, regionFrom);
      // const finalRegionTo = getRegionLabel(countryTo, regionTo);

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

      const formattedAmount =
        paymentAmount && paymentAmount !== "undefined"
          ? Number(paymentAmount).toLocaleString("ru-RU").replace(/,/g, " ")
          : "";

      const today = new Date().toISOString().split("T")[0];

      const loadTimeText =
        pickupDate === today
          ? `Тайёр`
          : `${formatDate(pickupDate).split("/").join(".")} `;
      const capacityText =
        capacity && capacity !== "undefined"
          ? `\n📐 Ҳажми: ${capacity} м³`
          : "";
      const vehicleBodyTypeText =
        vehicleBodyType && vehicleBodyType !== "undefined"
          ? `\n🚋 Прицеп: ${vehicleBodyType}`
          : "";

      const paymentTextLine =
        paymentText != "-" ? `\n💰 Тўлов тури: ${paymentText}` : "";

      const paymentAmountLine = formattedAmount
        ? `\n💸 Нархи: ${formattedAmount} ${
            paymentCurrency === "usd" ? "$" : "сўм"
          }`
        : "";

      const descriptionText =
        description && description !== "undefined"
          ? `\n📝 Тавсиф: ${description}`
          : "";
      const message = `
${flagFrom} *${regionFrom} → ${regionTo}* ${flagTo}

📦 Юк: ${title}
⚖️ Оғирлиги: ${weight} ${
        cargoUnit == "tons" ? "тонна" : "поддон"
      } ${capacityText}
🚛 Авто: ${vehicleType}${vehicleBodyTypeText}${paymentTextLine}${paymentAmountLine}
🕔 Юклаш вақти: ${loadTimeText}${descriptionText}

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
        cargoUnit,
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
        cargoUnit,
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
        belarus: "🇧🇾",
        russia: "🇷🇺",
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

      const loadTimeText =
        pickupDate === today
          ? `Тайёр`
          : `${formatDate(pickupDate).split("/").join(".")} `;
      const capacityText =
        capacity && capacity !== "undefined"
          ? `\n📐 Ҳажми: ${capacity} м³`
          : "";
      const vehicleBodyTypeText =
        vehicleBodyType && vehicleBodyType !== "undefined"
          ? `\n🚋 Прицеп: ${vehicleBodyType}`
          : "";

      const descriptionText =
        description && description !== "undefined"
          ? `\n📝 Тавсиф: ${description}`
          : "";

      const message = `
${flagFrom} *${regionFrom} → ${regionTo}* ${flagTo}

📦 Юк: ${title}
⚖️ Оғирлиги: ${weight} ${
        cargoUnit == "tons" ? "тонна" : "поддон"
      } ${capacityText}
🚛 Авто: ${vehicleType}${vehicleBodyTypeText}
💰 Тўлов тури: ${paymentText}
💸 Нархи: ${formattedAmount} ${paymentCurrency == "usd" ? "$" : "сўм"}
🕔 Юклаш вақти: ${loadTimeText}${descriptionText}

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
          cargoUnit,
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
