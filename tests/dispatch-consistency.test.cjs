'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const file=path.resolve(__dirname,'../packages/plugin/skills/dispatch-worker/SKILL.md');
const text=fs.readFileSync(file,'utf8');
function check(s){
 assert(s.includes('the top-level Claude Code session executes actual Agent calls'));
 assert(!s.includes('The navigator spawns the Owning Specialist'));
 assert(!s.includes('the navigator spawns each member'));
 assert(s.includes('only after the approval-queue and dispatch-log checks above pass'));
 assert(s.includes('For a drifted payload, do not proceed without an affirmative.'));
 assert(s.includes('This does not waive later checkpoint, push or merge approvals.'));
 assert(s.includes('asks for green light to proceed.'));
 assert(s.includes('rules/ci-test-infra-fix-lane.md'));
}
test('dispatch wording respects existing executor and cadence rules',()=>check(text));
test('direct subagent spawning regression is rejected',()=>assert.throws(()=>check(text+'\nThe navigator spawns the Owning Specialist')));
test('drift approval removal is rejected',()=>assert.throws(()=>check(text.replace('For a drifted payload, do not proceed without an affirmative.','Proceed on drift.'))));
// Text consistency only: no concurrency, durable reservation or runtime dispatch claim.
