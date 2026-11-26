export const Platform={OS:'android'};
export const state={intents:[],settings:0,utterances:[],stops:0,settingsError:null};
export const Linking={async sendIntent(action){if(state.settingsError)throw state.settingsError;state.intents.push(action);},async openSettings(){state.settings++;}};
export function speak(text,options){state.utterances.push({text,options});}
export async function stop(){state.stops++;}

export async function getAvailableVoicesAsync(){return [{language:'pl-PL'}];}
