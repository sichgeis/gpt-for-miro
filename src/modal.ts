import {isGpt4Available} from "./openai";

const successMessage = "Your API key is valid.";
const invalidApiKeyMessage = "The API key you provided is not valid.";

const storeApiKey = async () => {
    let apiKey: string = (document.getElementById('openai-api-key') as HTMLInputElement).value;

    try {
        if (await isGpt4Available(apiKey)) {
            (document.getElementById('openai-api-key-error') as HTMLElement).innerText = successMessage + ' GPT-4 model available.';
            localStorage.setItem("gpt4Available", "true");
        } else {
            (document.getElementById('openai-api-key-error') as HTMLElement).innerText = successMessage + ' GPT-3.5 model available.';
            localStorage.removeItem("gpt4Available");
        }
        localStorage.setItem("openaiApiKey", apiKey);
        (document.getElementById('openai-api-key-error') as HTMLElement).classList.remove('error-text');
        (document.getElementById('openai-api-key-error') as HTMLElement).classList.add('success-text');
    } catch (error) {
        (document.getElementById('openai-api-key-error') as HTMLElement).innerText = invalidApiKeyMessage;
        (document.getElementById('openai-api-key-error') as HTMLElement).classList.remove('success-text');
        (document.getElementById('openai-api-key-error') as HTMLElement).classList.add('error-text');
    }
}

(document.getElementById('openai-api-key-button') as HTMLElement).addEventListener('click', storeApiKey);
