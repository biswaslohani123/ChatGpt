import imageKit from "../config/imageKit.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import axios from 'axios'

// Text based ai chat message controller
const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

      // check credits 
        if (req.user.credits < 1) {

            return res.json({success: false, message:"You don't have enough credits to use this feature." })
            
        }

    const { chatId, prompt } = req.body;


    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "User",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Google gemini

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
     res.json({success: true, reply})

    chat.messages.push(reply);
    await Chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

   

  } catch (error) {

    res.json({success: false, message: error.message})

  }

};

// Image generation Message controller

const imageMessageController = async (req, res) => {

    try {
        
        const userId = req.user._id

        // check credits 
        if (req.user.credits < 2) {

            return res.json({success: false, message:"You don't have enough credits to use this feature." })
            
        }
        const {prompt, chatId, isPublished} =  req.body;

        //find chat
        const chat = await Chat.findOne({userId, _id: chatId})

        //push user message
        chat.messages.push({
            
             role: "User",
             content: prompt,
             timestamp: Date.now(),
             isImage: false,
        })

        // Encoding the prompt
        const encodePrompt = encodeURIComponent(prompt)

        //const generatedImageUrl Ai generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodePrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        // Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, {responseType: "arraybuffer"})

        // COnvert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;

        //Upload to imageKit media library
        const uploadResponse = await imageKit.upload({
          file: base64Image,
          fileName: `${Date.now()}.png`,
          folder: "quickgpt"
        })

        const reply = {
          role: 'assistant',
          content: uploadResponse.url,
          timestamp: Date.now(),
          isImage: true,
          isPublished
        }

        res.json({success: true, reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    } catch (error) {
          res.json({success: false, message: error.message})
    }

}

export { textMessageController, imageMessageController };
