import 'dotenv/config'

import OpenAI from 'openai'

const openai = new OpenAI()
const results = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
        { role: 'system', content: 'You are an AI assistant' },
        { role: 'user', content: 'hi' }
    ]
})

console.log(results);
