const { bot } = require("../bot");
const Users = require("../../model/users");
const {
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRu,
} = require("../menu/keyboard");

const sentOrderToChanel = async (text) => {
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  const message = await bot.sendMessage(CHANNEL_ID, text);
  return message;
};

const updateOrderInChannel = async (messageId, newText) => {
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

  const message = await bot.editMessageText(newText, {
    chat_id: CHANNEL_ID,
    message_id: messageId,
  });

  return message;
};

const deleteOrderMessage = async (messageId) => {
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

  try {
    await bot.deleteMessage(CHANNEL_ID, messageId);
    console.log(`Message ${messageId} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

module.exports = {
  sentOrderToChanel,
  updateOrderInChannel,
  deleteOrderMessage,
};
