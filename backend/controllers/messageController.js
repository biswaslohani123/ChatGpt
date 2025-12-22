import Chat from "../models/chatModel.js";


// Text based ai chat message controller
const textMessageController = async (req, res) => {

    try {
        const userId = req.user._id;
        const {chatId, prompt} = req.body; 

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({role: 'User', content: prompt, timestamp: Date.now(), isImage: false})

    } catch (error) {
        
    }

}

export {textMessageController}