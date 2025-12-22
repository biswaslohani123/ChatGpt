import Chat from "../models/chatModel.js"


// Api controller for creating a new chat
const createChat = async (req, res) => {

    try {
        const userId = req.user._id

        const chatData = {

            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({success: true, message: "Chat created"})
    } catch (error) {
        res.json({success: false, error: error.message})
        
    }
}   

// Api controller for getting all chats

const getChats = async (req, res) => {

    try {
        const userId = req.user._id
        const chats = await Chat.find({userId}).sort({updatedAt: -1});

        
        res.json({success: true, chats})
    } catch (error) {
        res.json({success: false, error: error.message})
        
    }

}

//Api controller for deleting a chat

const deleteChats = async (req, res) => {

    try {
        const userId = req.user._id
        const {chatId} = req.body;

        await Chat.deleteOne({_id: chatId, userId})

        
        res.json({success: true, message: "chat deleted"})
    } catch (error) {
        res.json({success: false, error: error.message})
        
    }

}

export {createChat, getChats, deleteChats};