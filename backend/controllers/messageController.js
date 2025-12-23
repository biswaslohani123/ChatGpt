import imageKit from "../config/imageKit.js";
import openai from "../config/openAi.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import axios from "axios";

/* ===============================
   TEXT MESSAGE CONTROLLER
================================ */
const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Body safety check
    const { chatId, prompt } = req.body || {};
    if (!chatId || !prompt) {
      return res.json({
        success: false,
        message: "chatId and prompt are required",
      });
    }

    // ✅ Credit check
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature.",
      });
    }

    // ✅ Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // ✅ Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // ✅ Gemini API call
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ Extract reply safely
    const reply = {
      role: "assistant",
      content: completion.choices[0].message.content,
      timestamp: Date.now(),
      isImage: false,
    };

    // ✅ Save chat first
    chat.messages.push(reply);
    await chat.save();

    // ✅ Deduct credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    // ✅ Send response
    res.json({ success: true, reply });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ===============================
   IMAGE MESSAGE CONTROLLER
================================ */
const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body || {};

    if (!prompt || !chatId) {
      return res.json({
        success: false,
        message: "prompt and chatId are required",
      });
    }

    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature.",
      });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // User message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode prompt
    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data
    ).toString("base64")}`;

    const uploadResponse = await imageKit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    res.json({ success: true, reply });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { textMessageController, imageMessageController };
