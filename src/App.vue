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
        </div>
        <div v-if="currentTab === 'settings'" class="cs1 ce12 grid scrollable">
            <div class="cs1 ce12">
                <h4>Language of Stickies and Prompt</h4>
                <label class="radiobutton">
                    <input type="radio" name="lang-radio" :checked="promptLanguage === 'de'"
                           @click="switchPromptLanguage('de')">
                    <span>Deutsch</span>
                </label>
                <label class="radiobutton">
                    <input type="radio" name="lang-radio" :checked="promptLanguage === 'en'"
                           @click="switchPromptLanguage( 'en')">
                    <span>English</span>
                </label>
            </div>
            <div class="cs1 ce12 grid">
                <h4 class="cs1 ce12">Signature Emoji</h4>
                <input class="cs1 ce3 input" type="text" :value="signatureEmoji" @blur="setSignatureEmoji"/>
            </div>
            <div class="cs1 ce12 grid">
                <h4 class="cs1 ce12">Temperature</h4>
                <input class="cs1 ce3 input" type="number" min="0" max="1" step=".1" :value="temperature"
                       @blur="setTemperature"/>
            </div>
            <div class="cs1 ce12">
                <h4>Verison of Language Model</h4>
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
                           @click="switchModelVersion( 'gpt-4')">
                    <span>gpt-4 (slow, 8k token context)</span>
                </label>
            </div>
        </div>
        <div v-if="currentTab === 'load'" class="cs1 ce12">
            <div class="cs1 ce12">
                <div class="scrollable mid-height">
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
                <button type="button" class="cs1 ce12 button button-primary" :disabled="completeDisabled"
                        @click="complete()">
                    {{ completeDisabled ? '🚨 No sticky notes selected' : completeButtonText }}
                </button>
            </div>
        </div>
        <div v-if="currentTab === 'feedback'" class="cs1 ce12">
            <div class="cs1 ce12">
                <h4>TODO XXX Quick Start Guide</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Miro Board "Quickstart Miro-GPT"
                </a>
                <h4>TODO XXX Feature Requests und Feedback</h4>
                <a class="load-link p-medium" target="_blank" href="https://example.com">
                    Miro Board "Feedback Miro-GPT"
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
                    {{ gitCommitHash }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {createCompletion, createNameForSavedInstruction, GptModel} from "./openai";
import {lang, isEnglish} from "./lang";
import {addSticky, getCenterOfGravity, getHeight} from "./miro";
import {StickyNote} from "@mirohq/websdk-types";
import {ago, stripHtmlString} from "./utils";
import {getCompletions, logCompletion} from "./storage";

const signatureEmoji = ref('');
const saveDisabled = ref(true);
const saveButtonText = ref('');
const completeButtonText = ref('🤜 Run Miro-GPT');
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

let colorfulEmojis = ["🌈", "🎉", "🤖", "🌴", "🦧", "🕶️", "👒", "🎈", "🎊", "🏮", "🎨", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🎂", "🍰", "🧁", "🍦", "🍧", "🍨", "🍓", "🍎", "🥦", "🍄", "🍅", "🍇", "🌽", "🌶️", "🍋", "🍌", "🍉", "🍈", "🍒", "🍍", "🥭", "🥥", "🥝", "🍅", "🥑", "🍇", "🍈", "🍉", "🍋", "🍌"];

const getRandomEmoji = () => {
    let randomIndex = Math.floor(Math.random() * colorfulEmojis.length);
    return colorfulEmojis[randomIndex];
}

const isEmoji = (str: string) => {
    const emojiRegexp = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Script=Hangul}\p{Emoji}]/gu;
    return emojiRegexp.test(str);
}

const setSignatureEmoji = (e: Event) => {
    if (!isEmoji(e.target.value)) return;
    localStorage.signatureEmoji = e.target.value;
    signatureEmoji.value = e.target.value;
}

const setTemperature = (e: Event) => {
    localStorage.temperature = parseFloat(e.target.value);
    temperature.value = parseFloat(e.target.value);
}

const updateSelectedItems = async () => {
    const selectedItems = await miro.board.getSelection();
    selectedStickyNotes.value = selectedItems.filter((item) => item.type === 'sticky_note') as StickyNote[]
}

const languagesAreCompatible = () => {
    const items = selectedStickyNotes.value.map(item => item.content).reduce((acc: string, content) => {
        return acc + '\n' + '* ' + stripHtmlString(content);
    }, '');
    const itemsIsEnglish = isEnglish(items);
    const instructionIsEnglish = isEnglish(instruction.value);

    return promptLanguage.value === 'en' && itemsIsEnglish && instructionIsEnglish
        || promptLanguage.value === 'de' && !itemsIsEnglish && !itemsIsEnglish
}

const complete = async () => {

    completeButtonText.value = '🤖 Waiting for the machine ...';
    const {x: selectionCenterX, y: selectionCenterY} = await getCenterOfGravity(selectedStickyNotes.value);
    const selectionHeight = getHeight(selectedStickyNotes.value);
    const resultStickyNoteHeight = getHeight(selectedStickyNotes.value[0] ? selectedStickyNotes.value[0] : []);

    let currentPrompt = prompt.value;
    let content;
    try {
        content = await createCompletion(currentPrompt, parseFloat(temperature.value), modelVersion.value);
    } catch (e) {
        content = 'error in communication with LLM: ' + e.toString();
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

    if (!languagesAreCompatible()) {
        addSticky(lang[promptLanguage.value].langWarning, resultStickyNoteHeight, {
            x: selectionCenterX,
            y: selectionCenterY + (selectionHeight / 2) + (0.9 * resultStickyNoteHeight) + 0.5 * resultStickyNoteHeight
        });
        completeButtonText.value = '🤜 Run Miro-GPT';
    }

    completeButtonText.value = '🤜 Run Miro-GPT';
    cacheCompletion(currentPrompt, content, instruction.value);
};

const saveLatestCompletion = async () => {
    saveButtonText.value = '🤸 Saving ...';
    const name = localStorage.lastCompletionName;
    const emojiName = signatureEmoji.value + ' ' + name;
    logCompletion(emojiName, localStorage.lastPrompt, localStorage.lastContent, localStorage.lastInstruction, localStorage.lastPromptLanguage);
    saveButtonText.value = `✅ Saved: ${name}`;
    saveDisabled.value = true;
}

const cacheCompletion = async (prompt: string, content: any, instruction: string) => {
    const name = await createNameForSavedInstruction(instruction);

    localStorage.lastInstruction = instruction;
    localStorage.lastPrompt = prompt;
    localStorage.lastContent = content;
    localStorage.lastPromptLanguage = promptLanguage.value;
    localStorage.lastCompletionName = name;

    saveButtonText.value = signatureEmoji.value + ` Save: ${name}`;
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
    updateSelectedItems();

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
    if (localStorage.signatureEmoji) {
        signatureEmoji.value = localStorage.signatureEmoji;
        saveButtonText.value = localStorage.signatureEmoji + ' Save';
    } else {
        signatureEmoji.value = getRandomEmoji();
        localStorage.signatureEmoji = signatureEmoji.value;
        saveButtonText.value = localStorage.signatureEmoji + ' Save';

    }
});

onBeforeUnmount(() => {
    miro.board.ui.off('selection:update', updateSelectedItems);
});

</script>

<style>
.mid-height {
    height: calc(100vh - 320px);
}

.full-height {
    height: calc(100vh - 200px);
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

.second-tab-bar {
    margin-top: -0.6rem;
}
</style>
