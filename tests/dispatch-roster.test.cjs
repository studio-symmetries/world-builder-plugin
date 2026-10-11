'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../packages/plugin');
const skill=fs.readFileSync(path.join(root,'skills/dispatch-worker/SKILL.md'),'utf8');
const gate=fs.readFileSync(path.join(root,'rules/approval-gate.md'),'utf8');
const strategies=['canon-memory','continuity-governance','business-strategist','marketing-strategist','product-strategist','ai-thinker'];
function check(s,g){
 const owner=s.split('\n').find(l=>l.startsWith('3. **Owning Specialist**'));
 const engineers=s.split('\n').find(l=>l.startsWith('4. **Execution Team**'));
 for(const name of strategies){assert(owner.includes('`'+name+'`'),name);assert(g.includes('`'+name+'`'),name);}
 for(const name of ['api-engineer','app-engineer'])assert(engineers.includes('`'+name+'`'));
 for(const name of ['ai-engineer','publishing-engineer'])assert(!engineers.includes('`'+name+'`'));
 assert(s.includes('stop and surface that dependency; do not substitute another role or dispatch a nonexistent agent'));
 assert(s.includes('the top-level session passes it into the actual'));
 assert(!s.includes('the navigator passes the override into its'));
 assert(!g.includes('`app-engineer` (Phase 2)'));
 assert(!g.includes('the three others'));
}
test('dispatch and approval prose match the current roster and executor',()=>check(skill,gate));
test('every current strategy omission is caught',()=>{
 for(const name of strategies)assert.throws(()=>check(skill.replace('`'+name+'`','`missing-role`'),gate),undefined,'omission must reject: '+name);
});
test('unimplemented engineer advertised as current is caught',()=>{
 assert.throws(()=>check(skill.replace('`api-engineer`, `app-engineer`, or both','`api-engineer`, `app-engineer`, `ai-engineer`, or both'),gate));
});
test('subagent model-override dispatch regression is caught',()=>{
 assert.throws(()=>check(skill.replace('the top-level session passes it into the actual','the navigator passes the override into its'),gate));
});
// These are source-consistency checks, not runtime policy enforcement tests.
