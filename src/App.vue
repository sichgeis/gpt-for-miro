<template>

    <div class="grid cs1 ce12">
        <div class="tabs cs1 ce12">
            <div class="tabs-header-list">
                <div tabindex="0" class="tab cs1 ce4" :class="{ 'tab-active' : currentTab === 'start' }"
                     @click="currentTab = 'start'">
                    <div class="tab-text tab-badge">Instruction</div>
                </div>
                <div tabindex="0" class="tab cs5 ce8" :class="{ 'tab-active' : currentTab === 'selectedItems' }"
                     @click="currentTab = 'selectedItems'">
                    <div class="tab-text tab-badge">Items</div>
                </div>
                <div tabindex="0" class="tab cs5 ce8" :class="{ 'tab-active' : currentTab === 'prompt' }"
                     @click="currentTab = 'prompt'">
                    <div class="tab-text tab-badge">Prompt</div>
                </div>
            </div>
        </div>
        <div class="tabs cs1 ce12 second-tab-bar">
            <div class="tabs-header-list">
                <div tabindex="0" class="tab cs1 ce4" :class="{ 'tab-active' : currentTab === 'load' }"
                     @click="loadAndSwitchTab()">
                    <div class="tab-text tab-badge">Load</div>
                </div>
                <div tabindex="0" class="tab cs5 ce8" :class="{ 'tab-active' : currentTab === 'feedback' }"
                     @click="currentTab = 'feedback'">
                    <div class="tab-text tab-badge">Feedback</div>
                </div>
                <div tabindex="0" class="tab cs9 ce12" :class="{ 'tab-active' : currentTab === 'settings' }"
                     @click="currentTab = 'settings'">
                    <div class="tab-text tab-badge">Settings</div>
                </div>
            </div>
        </div>
        <div v-if="currentTab === 'start'" class="grid cs1 ce12 scrollable">
            <div class="cs1 ce12">
                <p class="p-small">This instruction is applied to the selected "sticky notes". You can reference the
                    color of the sticky notes within your instruction. In german use the word "Notiz" for the stickies.
                    The language of the instruction should match the selected sticky notes and the language setting of
                    the plugin.</p>
                <textarea
                        class="textarea textarea-small mid-height"
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
            <div class="cs1 ce12 p-small build-by-orbit">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>

        </div>
        <div v-if="currentTab === 'selectedItems'" class="cs1 ce12 grid">
            <div class="cs1 ce12">
                <p class="p-small">
                    Here your selected sticky notes are shown. You can reference the color of the sticky notes within
                    your instruction. Use the name of the color as seen in the color tag below. Check the "Prompt" tab
                    to understand how the color of the stickies is submitted to the LLM.
                </p>
                <div class="full-height scrollable">
                    <div class="p-medium" v-for="item in selectedStickyNotes" :key="item.id">
                        • [color: {{ item.style.fillColor }}] {{ stripHtmlString(item.content) }}
                        <br>
                        <br>
                    </div>
                </div>
            </div>
            <div class="cs1 ce12 p-small build-by-orbit">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>
        </div>

        <div v-if="currentTab === 'prompt'" class="cs1 ce12 grid scrollable">
            <div class="cs1 ce12">
                <p class="p-small">
                    This is the prompt which will be send to the LLM. The prompt is constructed from your instruction
                    and the selected stickies. Understand it to write better instructions. You can change the prompt
                    language
                    in the "Settings" tab. If you have requests, use the "Feedback" tab.
                </p>
                <textarea
                        class="textarea textarea-small mid-height"
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
            <div class="cs1 ce12 p-small build-by-orbit">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>
        </div>

        <div v-if="currentTab === 'settings'" class="cs1 ce12 grid scrollable">
            <div class="cs1 ce12 grid">
                <h4 class="cs1 ce12 input-label">OpenAI API Key</h4>
                <input class="cs1 ce12 input" type="text" :value="openaiApiKey" @blur="setOpenaiApiKey"/>
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
            <div class="cs1 ce12 grid">
                <button type="button" class="cs1 ce12 button button-danger no-overflow"
                        @click="clearLocalStorage()">
                    Reset GPT for Miro (clear browser cache)
                </button>
            </div>
            <div class="cs1 ce12 p-small build-by-orbit">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>
        </div>

        <div v-if="currentTab === 'load'" class="cs1 ce12">
            <div class="cs1 ce12">
                <div class="scrollable mid-height">
                    <div class="load-item" v-for="completion in savedCompletions" :key="completion.id">
                        <div class="p-small">{{ ago(new Date(completion.timestamp)) }}</div>
                        <a class="load-link p-medium" @click="loadCompletion(completion)">
                            💬 {{ completion.name }}
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
                <button type="button" class="cs1 ce12 button button-primary load-instruction-button" :disabled="completeDisabled"
                        @click="complete()">
                    {{ completeDisabled ? '🚨 No sticky notes selected' : completeButtonText }}
                </button>
            </div>
            <div class="cs1 ce12 p-small build-by-orbit">
                Build with ❤️ in Hamburg by <a class="muted" href="https://orbitdigital.de" target="_blank">Orbit
                Ventures</a>
            </div>
        </div>

        <div v-if="currentTab === 'feedback'" class="cs1 ce12">
            <div class="cs1 ce12">
                <h4>TODO XXX Quick Start Guide</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Miro Board "Quickstart GPT for Miro"
                </a>
                <h4>TODO XXX Feature Requests und Feedback</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Miro Board "Feedback GPT for Miro"
                </a>
                <h4>TODO XXX Contact</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Instant help and feedback here!
                </a>
                <h4>TODO XXX Source Code</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Reference to open-source code.
                </a>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    TODO XXX
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {createCompletion, createNameForSavedInstruction, GptModel, isGpt4Available} from "./openai";
import {lang} from "./lang";
import {addSticky, getCenterOfGravity, getHeight} from "./miro";
import {StickyNote} from "@mirohq/websdk-types";
import {ago, stripHtmlString} from "./utils";
import {getCompletions, logCompletion} from "./storage";

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
const gpt4Available = ref(false);

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
    const {x: selectionCenterX, y: selectionCenterY} = await getCenterOfGravity(selectedStickyNotes.value);
    const selectionHeight = getHeight(selectedStickyNotes.value);
    const resultStickyNoteHeight = getHeight(selectedStickyNotes.value[0] ? selectedStickyNotes.value[0] : []);

    let currentPrompt = prompt.value;
    let content;
    try {
        content = await createCompletion(openaiApiKey.value, currentPrompt, temperature.value, modelVersion.value);
    } catch (e) {
        console.log('error', e);
        if (e.toString().includes('401')) {
            content = 'Authentication error with OpenAI. Have you provided a valid API key for OpenAI in the settings tab?';
        } else if (e.toString().includes('404') && modelVersion.value === 'gpt-4') {
            content = 'You seem to have no access to the OpenAI GPT-4 model. Upgrade your OpenAI subscription to use GPT-4 or switch to GPT-3.5 in the settings tab.';
        } else if (e.toString().includes('setRequestHeader')) {
            content = 'Error in communication with OpenAI. Have you provided a valid API key in the settings tab?.';
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

    saveButtonText.value = `📌 Save: ${name}`;
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
    if (localStorage.openaiApiKey) {
        openaiApiKey.value = localStorage.openaiApiKey;
    } else {
        currentTab.value = 'settings';
    }
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
.mid-height {
    height: calc(100vh - 330px);
}

.full-height {
    height: calc(100vh - 218px);
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
}

.no-overflow {
    overflow: clip;
}

.load-instruction {
    margin-top: 0;
    height: 6.7rem;
    margin-bottom: 1rem;
}

.load-instruction-button {
    margin-bottom: 0.82rem !important;
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

.build-by-orbit {
    margin-top: 0;
    text-align: right;

    & > a:link {
        color: #4f4f4f;
        font-weight: 600;
    }

    /* visited link */

    & > a:visited {
        color: #4f4f4f;
    }

    /* mouse over link */

    & > a:hover {
        color: black;
    }

    /* selected link */

    & > a:active {
        color: black;
    }
}
</style>
