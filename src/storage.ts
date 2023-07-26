import { v4 as uuidv4 } from 'uuid';
import localForage from "localforage";

const logCompletion = async (name: string, prompt: string, completion: any, instruction: string, promptLanguage: string) => {
    const item = {
        id: uuidv4(),
        timestamp: Date.now(),
        name,
        prompt,
        completion,
        instruction,
        promptLanguage,
    };

    await localForage.setItem(item.id, item);
};

const getCompletions = async () => {
    const keys = await localForage.keys();
    const items = await Promise.all(keys.map(key => localForage.getItem(key)));
    return items;
};

export {logCompletion, getCompletions};

