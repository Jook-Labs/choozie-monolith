const openai = require('../config/chatgpt')

const gptMessage = async (messages, menuData, preferences, message) => {
    let msgArr = await createGptMsgArr(messages, menuData, preferences, message)
    const completion = await openai.chat.completions.create({
        messages: msgArr,
        model: "gpt-4-turbo-preview",
      });
      return completion.choices[0].message.content
};

const createGptMsgArr = async (messages, menuData, preferences, message) => {
    console.log("preferences: ", preferences)
    let arr = []
    arr.push({
        "role": "system",
        "content": `Your name is Choozie and you are an expert at helping other choose food and/or drinks from different businesses/restaurants/cafes.
        Please be knowledgable about food preferences and food allergies. You are a friendly, kind and patience assistant when helping others. Please keep your responses really short and/or if possible, use bullet points.
         The user is asking for help on what item(s) to choose. The current menu has these items: ${menuData}.`
    })
    arr.push({
        "role": "user",
        "content": `Hello! Here is what you need to know about me (These are my preferences and allergies): ${preferences}`
    })
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].sentFrom === messages[i].userFirstName) {
            arr.push({
                "role": "user",
                "content": `${messages[i].message}`
            })
        } else {
            arr.push({
                "role": "assistant",
                "content": `${messages[i].message}`
            })
        }
    }
    arr.push({
        "role": "assistant",
        "content": `Please respond to this message from the user in a kind, friendly and energetic way and try to keep the response as simple and short as possible: ${message}`
    })
    return arr
};

module.exports = { gptMessage, createGptMsgArr }