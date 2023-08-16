<template>

    <div class="grid cs1 ce12">
        <div class="tabs cs1 ce12">
            <div class="tabs-header-list">
                <div ref="tabs" tabindex="0" class="tab cs1 ce3" :class="{ 'tab-active' : currentTab === 'start' }"
                     @click="currentTab = ('start')" @keyup.space="currentTab = ('start')">
                    <div class="tab-text">Instruction</div>
                </div>
                <div ref="tabs" tabindex="0" class="tab cs4 ce6"
                     :class="{ 'tab-active' : currentTab === 'selectedItems' }"
                     @click="currentTab = ('selectedItems')" @keyup.space="currentTab = ('selectedItems')">
                    <div class="tab-text">Items</div>
                </div>
                <div ref="tabs" tabindex="0" class="tab cs7 ce9" :class="{ 'tab-active' : currentTab === 'prompt' }"
                     @click="currentTab = 'prompt'" @keyup.space="currentTab = 'prompt'">
                    <div class="tab-text">Prompt</div>
                </div>
                <div ref="tabs" tabindex="0" class="tab cs10 ce12" :class="{ 'tab-active' : currentTab === 'load' }"
                     @click="loadAndSwitchTab()" @keyup.space="loadAndSwitchTab()">
                    <div class="tab-text">Load</div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'start'" class="grid cs1 ce12 scrollable">
            <div class="cs1 ce12">
                <p v-if="quickHelpText" class="p-small">
                    Select sticky-notes on the Miro board and give an instruction what to do with them.
                    Write the instruction here and run GPT for Miro. The instruction is applied to the selected sticky
                    notes. You can also reference the color of the stickies within your instruction.
                </p>
                <textarea
                        class="textarea textarea-small mid-height-quick-help"
                        :class="{ 'mid-height' : !quickHelpText }"
                        placeholder="Placeholder text"
                        spellcheck="true"
                        id="textarea-example"
                        v-model="instruction"
                ></textarea>
            </div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-primary" :disabled="completeDisabled"
                        @click="complete()">
                    {{ completeDisabled ? '🚨 No sticky notes selected' : completeButtonText }}
                </button>
            </div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-secondary no-overflow" :disabled="saveDisabled"
                        @click="saveLatestCompletion()">
                    {{ saveButtonText }}
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'selectedItems'" class="cs1 ce12 grid">
            <div class="cs1 ce12">
                <p v-if="quickHelpText" class="p-small">
                    Here your selected sticky notes are shown. You can reference the color of the sticky notes within
                    your instruction. Use the name of the color as seen in the color tag below. Check the "Prompt" tab
                    to understand how the color of the stickies is submitted to the LLM.
                </p>
                <div class="full-height-quick-help scrollable"
                     :class="{ 'full-height' : !quickHelpText }">
                    <div class="p-medium" v-for="item in selectedStickyNotes" :key="item.id">
                        • [color: {{ item.style.fillColor }}] {{ stripHtmlString(item.content) }}
                        <br>
                        <br>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'prompt'" class="cs1 ce12 grid scrollable">
            <div class="cs1 ce12">
                <p v-if="quickHelpText" class="p-small">
                    This is the prompt which will be send to the LLM. The prompt is constructed from your instruction
                    and the selected stickies. Understand it to write better instructions. Change the prompt
                    language in the settings. If you have questions or requests, use the ? in the footer.
                </p>
                <textarea
                        class="textarea textarea-small mid-height-quick-help"
                        :class="{ 'mid-height' : !quickHelpText }"
                        placeholder="Placeholder text"
                        spellcheck="true"
                        id="textarea-example"
                        v-model="prompt"
                        readonly
                        @keyup.enter="complete()"
                ></textarea>
            </div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-primary" :disabled="completeDisabled"
                        @click="complete()">
                    {{ completeDisabled ? '🚨 No sticky notes selected' : completeButtonText }}
                </button>
            </div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-secondary no-overflow" :disabled="saveDisabled"
                        @click="saveLatestCompletion()">
                    {{ saveButtonText }}
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'load'" class="cs1 ce12">
            <div class="cs1 ce12">
                <div class="scrollable mid-height-quick-help">
                    <div class="load-item" v-for="completion in savedCompletions" :key="completion.id">
                        <div class="p-small">{{ ago(new Date(completion.timestamp)) }}</div>
                        <a class="load-link p-medium" @click="loadCompletion(completion)">
                            {{ completion.name }}
                        </a>
                        <div v-if="completion.id === completionId">
                        </div>
                    </div>
                </div>
            </div>
            <hr/>
            <div class="cs1 ce12">
                <textarea
                        class="textarea textarea-small load-instruction"
                        placeholder="Placeholder text"
                        spellcheck="true"
                        id="textarea-example"
                        v-model="instruction"
                        readonly
                        @keyup.enter="complete()"
                ></textarea>
            </div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-primary"
                        :disabled="completeDisabled"
                        @click="complete()">
                    {{ completeDisabled ? '🚨 No sticky notes selected' : completeButtonText }}
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'feedback'" class="cs1 ce12">
            <div class="cs1 ce12 scrollable feedback-content flex-container">
                <h4 class="feedback-heading">Quick Start Examples</h4>
                <a class="load-link p-medium" target="_blank"
                   href="https://drive.google.com/file/d/15eKkrzqESZNXgShgR51wZ4BseErl-Ijh/view">
                    ☝️ Introduction to "GPT for Miro"
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://drive.google.com/file/d/1vT4Qynikx50X2KV2riU-K3Ug-6JbTK08/view">
                    🇪🇸 Translate a sticky-note
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://drive.google.com/file/d/1MJJf7UNkMfz_Jj34nWx5ATMGofmdZpLf/view">
                    📌 Saving and loading instructions
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://drive.google.com/file/d/1Qov7GclUkzmXvGeNQY_FN-42-ICEZycK/view">
                    💡 Identify main ideas
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://drive.google.com/file/d/1wPZGb6gH8-bfKbXHb5TzUIEKG6ix0U13/view">
                    🌈 Reference color of the sticky
                </a>
                <h4 class="feedback-heading">Feature Requests und Feedback</h4>
                <a class="load-link p-medium" target="_blank" href="mailto:christian.geisler@orbitdigital.de">
                    Contact the authors
                </a>
                <h4 class="feedback-heading">Source Code</h4>
                <a class="load-link p-medium" target="_blank" href="https://github.com/sichgeis/gpt-for-miro">
                    Open GPT for Miro on Github
                </a>
                <p class="p-medium">
                    Version: {{ gitCommitHash.substring(0, 8) }}
                </p>
                <h4 class="feedback-heading">More about Orbit Ventures</h4>
                <a class="load-link p-medium" target="_blank"
                   href="https://orbitdigital.de/">
                    Orbit - delivering impact together
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://techsnack.orbitdigital.de/">
                    Techsnack: our tech blog
                </a>
                <a class="load-link p-medium" target="_blank"
                   href="https://orbitdigital.de/career">
                    We are hiring 😉
                </a>
                <div class="flex-grow"></div>
            </div>
        </div>

        <div v-if="currentTab === 'settings'" class="cs1 ce12 scrollable settings-content flex-container">
            <div class="cs1 ce12 grid">
                <h4 class="cs1 ce12 input-label">OpenAI API Key</h4>
                <input class="cs1 ce12 input" type="text" :value="openaiApiKey" @blur="setOpenaiApiKey"/>
            </div>
            <div class="cs1 ce12">
                <h4 class="radio-label">Quick Help</h4>
                <label class="checkbox">
                    <input type="checkbox" tabindex="0" v-model="quickHelpText"/>
                    <span>Show help texts</span>
                </label>
            </div>
            <div class="cs1 ce12">
                <h4 class="radio-label">Language of Stickies and Prompt</h4>
                <label class="radiobutton">
                    <input type="radio" name="lang-radio" :checked="promptLanguage === 'en'"
                           @click="switchPromptLanguage( 'en')">
                    <span>English</span>
                </label>
                <label class="radiobutton">
                    <input type="radio" name="lang-radio" :checked="promptLanguage === 'de'"
                           @click="switchPromptLanguage('de')">
                    <span>Deutsch</span>
                </label>
            </div>
            <div class="cs1 ce12 grid">
                <h4 class="cs1 ce12 input-label">Temperature</h4>
                <input class="cs1 ce3 input" type="number" min="0" max="1" step=".1" :value="temperature"
                       @blur="setTemperature"/>
            </div>
            <div class="cs1 ce12">
                <h4 class="radio-label">Version of Language Model</h4>
                <label class="radiobutton">
                    <input type="radio" name="model-radio" :checked="modelVersion === 'gpt-3.5-turbo'"
                           @click="switchModelVersion('gpt-3.5-turbo')">
                    <span>gpt-3.5-turbo (4k token context)</span>
                </label>
                <label class="radiobutton">
                    <input type="radio" name="model-radio" :checked="modelVersion === 'gpt-3.5-turbo-16k'"
                           @click="switchModelVersion('gpt-3.5-turbo-16k')">
                    <span>gpt-3.5-turbo-16k (16k token context)</span>
                </label>
                <label class="radiobutton">
                    <input type="radio" name="model-radio" :checked="modelVersion === 'gpt-4'"
                           :disabled="!gpt4Available"
                           @click="switchModelVersion( 'gpt-4')">
                    <span>gpt-4 (slow, 8k token context)</span>
                </label>
            </div>
            <div class="flex-grow"></div>
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-danger no-overflow"
                        @click="clearLocalStorage()">
                    Reset GPT for Miro (clear browser cache)
                </button>
            </div>
        </div>

        <div class="cs1 ce12 grid">
            <div class="cs1 ce9 p-small footer-left">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>
            <div class="cs10 ce12 grid p-small footer-right">
                <div>
                    <span v-if="currentTab === 'settings'" class="icon icon-deactivated" @click="currentTab = 'start'"/>
                    <span v-else class="icon icon-settings" @click="currentTab = 'settings'"/>
                </div>
                <div>
                    <span v-if="currentTab === 'feedback'" class="icon icon-deactivated" @click="currentTab = 'start'"/>
                    <span v-else class="icon icon-help-question" @click="currentTab = 'feedback'"/>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createCompletion, createNameForSavedInstruction, GptModel, isGpt4Available } from "./openai";
import { lang } from "./lang";
import { addSticky, getCenterOfGravity, getHeight } from "./miro";
import { StickyNote } from "@mirohq/websdk-types";
import { ago, stripHtmlString } from "./utils";
import { getCompletions, logCompletion } from "./storage";

const openaiApiKey = ref('❗️  Insert your OpenAI API Key here');
const saveDisabled = ref(true);
const saveButtonText = ref('📌 Save');
const completeButtonText = ref('🚀 Run GPT for Miro');
const completeDisabled = computed(() => {
    return selectedStickyNotes.value.length === 0;
})
const instruction = ref('List the three main ideas of these sticky notes.');
const selectedStickyNotes = ref<StickyNote[]>([]);
const currentTab = ref('start');
const savedCompletions = ref<any>([]);
const completionId = ref();
const promptLanguage = ref('en');
const modelVersion = ref<GptModel>('gpt-3.5-turbo');
const prompt = computed(() => {
    const identity = lang[promptLanguage.value].identity;
    const context = lang[promptLanguage.value].context + items.value;
    const task = lang[promptLanguage.value].task;
    const conditions = lang[promptLanguage.value].conditions;

    return identity + '\n\n'
        + context + '\n\n'
        + task + '\n\n'
        + conditions + '\n\n'
        + lang[promptLanguage.value].instruction + ' ```\n' + instruction.value + '\n```\n\n'
        + lang[promptLanguage.value].result;
});
const items = computed(() => {
    return selectedStickyNotes.value.reduce((acc: string, item) => {
        return acc + '\n' + '* ' + '[color: ' + item.style.fillColor + '] ' + stripHtmlString(item.content);
    }, '');
});
const temperature = ref(0.7);
const gitCommitHash = import.meta.env.VITE_COMMIT_SHA;
const gpt4Available = ref(false);
const quickHelpText = ref(true);

const setTemperature = (e: Event) => {
    localStorage.temperature = parseFloat((e.target as HTMLInputElement).value);
    temperature.value = parseFloat((e.target as HTMLInputElement).value);
}

const setOpenaiApiKey = async (e: Event) => {
    localStorage.openaiApiKey = (e.target as HTMLInputElement).value;
    openaiApiKey.value = (e.target as HTMLInputElement).value;
    try {
        if (await isGpt4Available(openaiApiKey.value)) {
            localStorage.gpt4Available = 'true';
            gpt4Available.value = true;
        } else {
            localStorage.removeItem("gpt4Available");
            gpt4Available.value = false;
            if (modelVersion.value === 'gpt-4') {
                modelVersion.value = 'gpt-3.5-turbo';
            }
        }
    } catch (e) {
        openaiApiKey.value = '❗️  Invalid OpenAI API Key';
    }
}

const updateSelectedItems = async () => {
    const selectedItems = await miro.board.getSelection();
    selectedStickyNotes.value = selectedItems.filter((item) => item.type === 'sticky_note') as StickyNote[]
}

const complete = async () => {

    completeButtonText.value = '🤖 Waiting for the machine ...';
    const { x: selectionCenterX, y: selectionCenterY } = await getCenterOfGravity(selectedStickyNotes.value);
    const selectionHeight = getHeight(selectedStickyNotes.value);
    const resultStickyNoteHeight = getHeight(selectedStickyNotes.value[0] ? selectedStickyNotes.value[0] : []);

    let currentPrompt = prompt.value;
    let content;
    try {
        content = await createCompletion(openaiApiKey.value, currentPrompt, temperature.value, modelVersion.value);
    } catch (e) {
        console.log('error', e);
        if (e.toString().includes('401')) {
            content = 'OpenAI returned a 401 error. Have you provided a valid API key for OpenAI in the settings? Access the settings in the footer of the app via the ⚙️ icon.';
        } else if (e.toString().includes('404') && modelVersion.value === 'gpt-4') {
            content = 'OpenAI returned a 404 error. You seem to have no access to the OpenAI GPT-4 model. Upgrade your OpenAI subscription to use GPT-4 or switch to GPT-3.5 in the settings. Access the settings in the footer of the app via the ⚙️ icon.';
        } else if (e.toString().includes('429')) {
            content = 'OpenAI returned a 429 error. You seem to have exceeded the rate limit for requests to OpenAI. You need to add a payment method to your free account or make a paid account to use the OpenAI API.';
        } else if (e.toString().includes('setRequestHeader')) {
            content = 'Error in communication with OpenAI. Have you provided a valid API key in the settings? Access the settings in the footer of the app via the ⚙️ icon.';
        } else {
            content = 'Error in communication with OpenAI. ' + e.toString();
        }
    }
    try {
        const contentJson = JSON.parse(content);

        for (const content of contentJson) {
            const index: number = contentJson.indexOf(content);
            const offset = index * 1.05 * resultStickyNoteHeight;

            addSticky(content, resultStickyNoteHeight, {
                x: selectionCenterX,
                y: selectionCenterY + (selectionHeight / 2) + (0.9 * resultStickyNoteHeight) + offset
            });
        }
    } catch (e) {
        addSticky(content, resultStickyNoteHeight, {
            x: selectionCenterX,
            y: selectionCenterY + (selectionHeight / 2) + (0.9 * resultStickyNoteHeight)
        });
    }

    completeButtonText.value = '🚀 Run GPT for Miro';
    cacheCompletion(currentPrompt, content, instruction.value);
};

const saveLatestCompletion = async () => {
    saveButtonText.value = '🤸 Saving ...';
    const name = localStorage.lastCompletionName;
    logCompletion(name, localStorage.lastPrompt, localStorage.lastContent, localStorage.lastInstruction, localStorage.lastPromptLanguage);
    saveButtonText.value = `✅ Saved: ${name}`;
    saveDisabled.value = true;
}

const cacheCompletion = async (prompt: string, content: any, instruction: string) => {
    const name = await createNameForSavedInstruction(openaiApiKey.value, instruction);

    localStorage.lastInstruction = instruction;
    localStorage.lastPrompt = prompt;
    localStorage.lastContent = content;
    localStorage.lastPromptLanguage = promptLanguage.value;
    localStorage.lastCompletionName = name;

    saveButtonText.value = `Save: ${name}`;
    saveDisabled.value = false;
}

const switchPromptLanguage = (lang: 'en' | 'de') => {
    promptLanguage.value = lang;
    localStorage.promptLanguage = lang;
}

const switchModelVersion = (version: GptModel) => {
    modelVersion.value = version;
    localStorage.modelVersion = version;
}

const loadAndSwitchTab = async () => {
    currentTab.value = 'load'
    const completions = await getCompletions();
    completions.sort((a: any, b: any) => b.timestamp - a.timestamp);
    savedCompletions.value = completions;
}

const loadCompletion = async (completion: any) => {
    instruction.value = completion.instruction;
    promptLanguage.value = completion.promptLanguage;
    completionId.value = completion.id;
}

const seedInstructions = async () => {
    if ((await getCompletions()).length === 0) {
        await logCompletion(
            "📋 Identify 3 main ideas.",
            "You are the backend of a plugin for Miro.\n\nGiven is a list of colored sticky notes. Notes with the same color belong to the same class. The color of the sticky notes is indicated with the color tag `[color: $COLOR]`. Here is the list of colored Notes:\n* [color: red] Advances in the 20th and 21st centuries led to thousands of apple varieties, though commercial cultivation focuses on a few popular types, leading to conservation efforts\n* [color: yellow] Modern cultivation faces environmental and workers' rights concerns, leading to a rise in organic and fair-trade bananas.\n* [color: dark_green] Cucumbers originated in India over 3,000 years ago and were spread to other parts of the world by trading with various cultures.\n* [color: yellow] The early 20th century Panama disease outbreak led to a switch from Gros Michel to the Cavendish variety.\n* [color: red] Apples originated in Central Asia 4,000 to 10,000 years ago and spread westward to Europe and the Middle East along Silk Road trade routes.\n* [color: dark_green] They reached Europe via the Romans, and during the 14th century, were introduced to the New World by European explorers.\n* [color: red] European colonists brought apple seeds to North America during the 17th century, leading to widespread cultivation.\n* [color: dark_green] Modern cultivation practices and selective breeding have led to a wide range of cucumber varieties suited to different climates and uses.\n* [color: yellow] Developments in refrigerated transport during the 20th century enabled global banana distribution.\n* [color: yellow] The 19th century saw commercial banana cultivation in the Caribbean and Central America.\n\nApply the following instruction from a Miro user to the above sticky notes. Answer the instruction exclusively in form of a json array that contains the answer items. The answers are strings in the json array. Only answer in the form of a json array of strings.\n\nIf the answer is not provided above or you are unsure, reply with \"🤷\".\n\nInstruction: ```\nWhat is the theme of the yellow stickies?\n```\n\nResult:",
            "[\n  \"The history and evolution of banana cultivation and distribution.\",\n  \"The origin and development of cucumber cultivation.\",\n  \"The origin, spread, and modern cultivation of apples.\"\n]",
            "List the three main ideas of these sticky notes.",
            "en");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await logCompletion(
            "📌 Yellow stickies theme",
            "You are the backend of a plugin for Miro.\n\nGiven is a list of colored sticky notes. Notes with the same color belong to the same class. The color of the sticky notes is indicated with the color tag `[color: $COLOR]`. Here is the list of colored Notes:\n* [color: yellow] The early 20th century Panama disease outbreak led to a switch from Gros Michel to the Cavendish variety.\n* [color: dark_green] Cucumbers originated in India over 3,000 years ago and were spread to other parts of the world by trading with various cultures.\n* [color: dark_green] They reached Europe via the Romans, and during the 14th century, were introduced to the New World by European explorers.\n* [color: yellow] Modern cultivation faces environmental and workers' rights concerns, leading to a rise in organic and fair-trade bananas.\n* [color: red] Apples originated in Central Asia 4,000 to 10,000 years ago and spread westward to Europe and the Middle East along Silk Road trade routes.\n* [color: red] Advances in the 20th and 21st centuries led to thousands of apple varieties, though commercial cultivation focuses on a few popular types, leading to conservation efforts\n* [color: red] European colonists brought apple seeds to North America during the 17th century, leading to widespread cultivation.\n* [color: dark_green] Modern cultivation practices and selective breeding have led to a wide range of cucumber varieties suited to different climates and uses.\n* [color: yellow] Developments in refrigerated transport during the 20th century enabled global banana distribution.\n* [color: yellow] The 19th century saw commercial banana cultivation in the Caribbean and Central America.\n\nApply the following instruction from a Miro user to the above sticky notes. Answer the instruction exclusively in form of a json array that contains the answer items. The answers are strings in the json array. Only answer in the form of a json array of strings.\n\nIf the answer is not provided above or you are unsure, reply with \"🤷\".\n\nInstruction: ```\nList the three main ideas of these sticky notes.\n```\n\nResult:",
            "[\"Banana cultivation and its history\"]",
            "What is the theme of the yellow stickies?",
            "en");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await logCompletion(
            "🍇 3 grape facts",
            "You are the backend of a plugin for Miro.\n\nGiven is a list of colored sticky notes. Notes with the same color belong to the same class. The color of the sticky notes is indicated with the color tag `[color: $COLOR]`. Here is the list of colored Notes:\n* [color: yellow] The early 20th century Panama disease outbreak led to a switch from Gros Michel to the Cavendish variety.\n* [color: dark_green] Cucumbers originated in India over 3,000 years ago and were spread to other parts of the world by trading with various cultures.\n* [color: dark_green] They reached Europe via the Romans, and during the 14th century, were introduced to the New World by European explorers.\n* [color: red] Advances in the 20th and 21st centuries led to thousands of apple varieties, though commercial cultivation focuses on a few popular types, leading to conservation efforts\n* [color: yellow] Modern cultivation faces environmental and workers' rights concerns, leading to a rise in organic and fair-trade bananas.\n* [color: red] Apples originated in Central Asia 4,000 to 10,000 years ago and spread westward to Europe and the Middle East along Silk Road trade routes.\n* [color: red] European colonists brought apple seeds to North America during the 17th century, leading to widespread cultivation.\n* [color: dark_green] Modern cultivation practices and selective breeding have led to a wide range of cucumber varieties suited to different climates and uses.\n* [color: yellow] Developments in refrigerated transport during the 20th century enabled global banana distribution.\n* [color: yellow] The 19th century saw commercial banana cultivation in the Caribbean and Central America.\n\nApply the following instruction from a Miro user to the above sticky notes. Answer the instruction exclusively in form of a json array that contains the answer items. The answers are strings in the json array. Only answer in the form of a json array of strings.\n\nIf the answer is not provided above or you are unsure, reply with \"🤷\".\n\nInstruction: ```\nAdd 3 sticky notes with facts about grapes in the same style.\n```\n\nResult:",
            "[\n\"[color: purple] Grapes originated in the Near East and were spread to other parts of the world by ancient civilizations.\",\n\"[color: purple] Grape cultivation played a major role in the ancient civilizations of Rome and Greece, influencing their cultures and economies.\",\n\"[color: purple] Modern grape cultivation practices have led to a wide range of grape varieties suited for wine production, eating fresh, or drying into raisins.\"\n]",
            "Add 3 sticky notes with facts about grapes in the same style.",
            "en");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await logCompletion(
            "🇪🇸 Translate: Spanish",
            "You are the backend of a plugin for Miro.\n\nGiven is a list of colored sticky notes. Notes with the same color belong to the same class. The color of the sticky notes is indicated with the color tag `[color: $COLOR]`. Here is the list of colored Notes:\n* [color: dark_green] Modern cultivation practices and selective breeding have led to a wide range of cucumber varieties suited to different climates and uses.\n\nApply the following instruction from a Miro user to the above sticky notes. Answer the instruction exclusively in form of a json array that contains the answer items. The answers are strings in the json array. Only answer in the form of a json array of strings.\n\nIf the answer is not provided above or you are unsure, reply with \"🤷\".\n\nInstruction: ```\nTranslate to spanish.\n```\n\nResult:",
            "[\"Prácticas modernas de cultivo y crianza selectiva han llevado a una amplia gama de variedades de pepino adecuadas para diferentes climas y usos.\"]",
            "Translate to spanish.",
            "en");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

watch(quickHelpText, () => {
    localStorage.quickHelpText = quickHelpText.value;
});

onMounted(async () => {
    miro.board.ui.on('selection:update', updateSelectedItems);
    await updateSelectedItems();

    if (localStorage.promptLanguage) {
        promptLanguage.value = localStorage.promptLanguage;
    }
    if (localStorage.lastInstruction) {
        instruction.value = localStorage.lastInstruction;
    }
    if (localStorage.temperature) {
        temperature.value = localStorage.temperature;
    }
    if (localStorage.modelVersion) {
        modelVersion.value = localStorage.modelVersion;
    }
    if (localStorage.gpt4Available) {
        gpt4Available.value = true;
    }
    if (localStorage.quickHelpText) {
        quickHelpText.value = localStorage.quickHelpText === "true";
    }
    if (localStorage.openaiApiKey) {
        openaiApiKey.value = localStorage.openaiApiKey;
    } else {
        currentTab.value = 'settings';
    }

    seedInstructions();
});

const clearLocalStorage = async () => {
    localStorage.clear();
    miro.board.ui.closePanel();
}

onBeforeUnmount(() => {
    miro.board.ui.off('selection:update', updateSelectedItems);
});

</script>

<style>
.mid-height-quick-help {
    height: calc(100vh - 330px);
}

.mid-height {
    height: calc(100vh - 216px);
}

.full-height-quick-help {
    height: calc(100vh - 218px);
}

.full-height {
    height: calc(100vh - 104px);
}

.scrollable {
    overflow-y: auto;
}

.load-item {
    padding-bottom: 10px;
}

.load-link {
    text-decoration: underline;
    cursor: pointer;
    display: block;
    margin-top: 0.4rem;
    margin-bottom: 0;
}

.no-overflow {
    overflow: clip;
}

.load-instruction {
    margin-top: 0;
    height: 7rem;
    margin-bottom: 1rem;
}

.second-tab-bar {
    margin-top: -0.6rem;
}

.input-label {
    margin-bottom: 0.2rem;
    margin-top: 1rem;
}

.radio-label {
    margin-bottom: 0.83rem;
    margin-top: 1rem;
}

.footer-left {
    margin-top: 1.4rem;
    text-align: left;

    & > a:link {
        color: #4f4f4f;
        font-weight: 600;
    }

    & > a:visited {
        color: #4f4f4f;
    }

    & > a:hover {
        color: black;
    }

    & > a:active {
        color: black;
    }
}

.footer-right {
    margin-top: 1.2rem;
    margin-left: 1.4rem;
    margin-bottom: 0.5rem;
}

.flex-container {
    display: flex;
    flex-direction: column;
}

.flex-grow {
    flex-grow: 1;
}

.settings-content {
    height: calc(100vh - 6.5rem);
}

.feedback-content {
    height: calc(100vh - 6.5rem);

    & > h4 {
        margin-bottom: 0.4rem;
        margin-top: 1.5rem;
    }

    & > h4:first-child {
        margin-top: 1rem;
    }

    & > a {
        margin-bottom: 0.3rem;
    }
}
</style>
