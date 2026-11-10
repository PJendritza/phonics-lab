import {ITEMS,stageById} from '../../app/data.mjs';
import {arrangeStory,resetStory} from '../../app/learning.mjs';
// Fixture preparation for existing whole-course tests; actual ordering/error/
// reset interactions are exercised separately in story-order.test and browser.
export function orderedStory(p){
 if(stageById(p.pending?.stageId)?.mode!=='order')return p;
 p=resetStory(p);
 for(const frame of ITEMS[p.pending.round.target].frames)p=arrangeStory(p,frame);
 return p;
}
