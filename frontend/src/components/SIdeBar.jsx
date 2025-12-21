import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'

const SIdeBar = () => {

    const {chats, setSelectedChats, theme, setTheme, user, navigate} = useAppContext()

    const [search, setSearch] = useState('')

  return (
    <div className='flex flex-col h-screen min-w-72 p-5 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border border-gray-300 backdrop:blur-3xl transition-all duration-500 max-md:absolute left-0 z-1'>
    {/* Logo */}
      <img src={theme === 'dark' ? assets.logo_full: assets.logo_full_dark} alt=""  className='w-full max-w-48'/>

    {/* New Chat Button */}
    <button className='flex justify-center items-center bg-gradient-to-r from-[#A456F7] to-[#3D81F6] w-full py-2 mt-10 text-white text-sm rounded-md cursor-pointer'>
        <span className='mr-2 text-xl'>+</span> New Chat
    </button>

    {/* Search Box */}
    <div className='flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md'>
        <img src={assets.search_icon} alt="" className='w-4 not-dark:invert' />
        <input onChange={(e) => setSearch(e.target.value) } value={search} type="text" placeholder='Search Conversations' className='text-xs placeholder:text-gray-400 outline-none' />
    </div>

    {/* Recent Chats */}
    {
        chats.length > 0 && <p className='mt-4 text-sm'>Recent Chats</p>
        
    }
    <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
        {
            chats.filter((chat ) => 
                chat.messages[0] ? chat.messages[0] ?. content.toLowerCase().includes(search.toLowerCase()) : chat.name.toLowerCase().includes(search.toLowerCase())).map((chat) => {

                    return <div key={chat._id} className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group'>

                        <div>
                            <p className='truncate w-full'>{chat.messages.length > 0 ? chat.messages[0].content.slice(0,32) : chat.name}</p>

                            <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>{moment(chat.updatedAt).fromNow()}</p>
                        </div>
                        <img src={assets.bin_icon} className='hidden group-hover:block w-4 cursor-pointer not-dark:invert' alt="" />

                    </div>
                })
        }
    </div>

    {/* community images */}
    <div onClick={() => {navigate('/community')}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all duration-200'>
        <img src={assets.gallery_icon} alt="" className='w-4.5 not-dark:invert' />
        <div className='flex flex-col text-sm'>
            <p>Community Images</p>
        </div>
    </div>


    {/* Credit Purchase Option */}
    <div onClick={() => {navigate('/credits')}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all duration-200'>
        <img src={assets.diamond_icon} alt="" className='w-4.5 dark:invert' />
        <div className='flex flex-col text-sm'>
            <p>Credits : {user?.credits}</p>
            <p className='text-xs text-gray-400'>Purchase credits to use quickgpt</p>
        </div>
    </div>

    {/* Dark Mode toggle */}
    <div  className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md justify-between '>
       
        <div className='flex items-center gap-2 text-sm'>
            <img src={assets.theme_icon} className='w-4 not-dark:invert' alt="" />
            <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex cursor-pointer '>
            <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className='sr-only peer' checked={theme === 'dark'} />
            <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'>
            </div>
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
    </div>

    </div>
  )
}

export default SIdeBar
