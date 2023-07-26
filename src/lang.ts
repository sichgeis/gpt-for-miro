import LanguageDetect from "languagedetect";

const lang = {
  de: {
    identity: 'Du bist das Backend eines Plugins für Miro.',
    context: 'Gegeben ist eine List von farbigen Notizen. Notizen der gleichen Farbe gehören zur gleichen Klasse. Die Notizen haben eine Farbe, die durch `[color: `FARBE`]` festgelegt wird. Hier ist die Liste der farbigen Notizen:',
    task: 'Wende die folgende Anweisung eines Miro-Nutzers auf die oben genannten Notizen an. Antworte ausschließlich mit einem JSON-Array. Dieses JSON-Array enthält eine Liste von Strings als Antworten. Antworte nur mit einem JSON-Array aus Strings.',
    conditions: 'Wenn die Antwort nicht klar ist oder du dir unsicher bist, dann antworte mit "🤷".',
    instruction: 'Anweisung:',
    result: 'Ergebnis:',
    langWarning: 'Die Sprache der Instruction, der Notizen und des Plugins passen nicht zusammen. Bitte unter "Settings" die Sprache anpassen.'
  },
  en: {
    identity: 'You are the backend of a plugin for Miro.',
    context: 'Given is a list of colored sticky notes. Notes with the same color belong to the same class. The color of the sticky notes is indicated with the color tag `[color: $COLOR]`. Here is the list of colored Notes:',
    task: 'Apply the following instruction from a Miro user to the above sticky notes. Answer the instruction exclusively in form of a json array that contains the answer items. The answers are strings in the json array. Only answer in the form of a json array of strings.',
    conditions: 'If the answer is not provided above or you are unsure, reply with "🤷".',
    instruction: 'Instruction:',
    result: 'Result:',
    langWarning: 'The language of instruction, sticky notes and plugin are not compatible. Please set the language of the plugin in "Settings".'
  },
};

const isEnglish = (str: string) => {
  const lngDetector = new LanguageDetect();
  return lngDetector.detect(str, 3).some(([language, _score]) => language === 'english');
}

export {lang, isEnglish};
