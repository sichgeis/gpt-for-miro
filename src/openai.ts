import {Configuration, OpenAIApi} from 'openai';


export type GptModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4';
const createCompletion = async (openaiApiKey: string, prompt: string, temperature: number, modelVersion: GptModel) => {
    const configuration = new Configuration({
        apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: modelVersion,
        messages: [{role: 'user', content: prompt}],
        max_tokens: 2000,
        temperature,
    });

    if (!completion.data.choices[0].message) {
        throw new Error('Message object in openai response is empty.');
    }

    const content = completion.data.choices[0].message.content;

    if (!content) {
        throw new Error('Content in message object in openai response is empty.');
    }

    return content;
};

const createNameForSavedInstruction = async (openaiApiKey: string, instruction: string) => {
    const prompt = 'Summarize the following instruction. Answer with a maximum of 5 words. You answer is used as a title of this instruction.\n\n```\n' + instruction + '\n```\n';
    return createCompletion(openaiApiKey, prompt, 0, 'gpt-3.5-turbo');
};

export {createCompletion, createNameForSavedInstruction};
