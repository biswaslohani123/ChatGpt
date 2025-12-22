import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

// Text based ai chat message controller
const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
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

            return res.json({success: false, message:"You don't have enough credits to use thus feature." })
            
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



        
    } catch (error) {
          res.json({success: false, message: error.message})
    }

}

export { textMessageController, imageMessageController };
