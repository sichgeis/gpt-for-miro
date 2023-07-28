import { Configuration, OpenAIApi } from "openai";

const successMessage = "Your API key is valid.";
const invalidApiKeyMessage = "The API key you provided is not valid.";

async function storeApiKey() {
    let apiKey = document.getElementById('openai-api-key').value;

    try {
        const configuration = new Configuration({
            apiKey: apiKey,
        });

        const openai = new OpenAIApi(configuration);
        const response = await openai.listModels();
        const modelIdList = response.data.data.map((item) => item.id);

        const gpt3Available = modelIdList.includes('gpt-3.5-turbo');
        const gpt3TurboAvailable = modelIdList.includes('gpt-3.5-turbo-16k');
        const gpt4Available = modelIdList.includes('gpt-4');
        localStorage.setItem("openaiApiKey", apiKey);
        if (gpt4Available) {
            document.getElementById('openai-api-key-error').innerText = successMessage + ' GPT-4 model available.';
            localStorage.setItem("gpt4Available", "true");
        } else {
            document.getElementById('openai-api-key-error').innerText = successMessage + ' GPT-3.5 model available.';
            localStorage.removeItem("gpt4Available");
        }
        document.getElementById('openai-api-key-error').classList.remove('error-text');
        document.getElementById('openai-api-key-error').classList.add('success-text');

        window.dispatchEvent(new CustomEvent('custom:modalclosed'));

        setTimeout(() => miro.board.ui.closeModal(), 3000);

    } catch (error) {
        document.getElementById('openai-api-key-error').innerText = invalidApiKeyMessage;
        document.getElementById('openai-api-key-error').classList.remove('success-text');
        document.getElementById('openai-api-key-error').classList.add('error-text');
    }
}

document.getElementById('openai-api-key-button').addEventListener('click', storeApiKey);