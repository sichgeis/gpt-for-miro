import {Configuration, OpenAIApi} from 'openai';
import axios from "axios";

export type GptModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4';

function openAIApi(openaiApiKey: string) {
    const configuration = new Configuration({
        apiKey: openaiApiKey,
    });
    delete configuration.baseOptions.headers['User-Agent'];
    return new OpenAIApi(configuration);
}

const listModels = async (apiKey: string) => {
    const response = await openAIApi(apiKey).listModels();

    return response.data.data.map((item) => item.id);
}

const isGpt35Available = async (apiKey: string) => {
    const prompt = 'Suggest a name for a lolcat.';
    return createCompletion(apiKey, prompt, 0, 'gpt-3.5-turbo');
}

const isGpt4Available = async (openaiApiKey: string) => {
    return (await listModels(openaiApiKey)).includes('gpt-4');
}

const createCompletion = async (apiKey: string, prompt: string, temperature: number, modelVersion: GptModel) => {
    const completion = await openAIApi(apiKey).createChatCompletion({
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

    axios.get('/void');
    return content;
};

const createNameForSavedInstruction = async (apiKey: string, instruction: string) => {
    const prompt = 'Summarize the following instruction. Answer with an emoji and a maximum of 4 words. You answer is used as a title of this instruction.\n\n```\n' + instruction + '\n```\n';
    return createCompletion(apiKey, prompt, 0, 'gpt-3.5-turbo');
};

export {listModels, isGpt35Available, isGpt4Available, createCompletion, createNameForSavedInstruction};
