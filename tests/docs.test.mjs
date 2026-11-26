import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const checker=fileURLToPath(new URL('../scripts/check-docs.py',import.meta.url));
function repository(t){
 const root=mkdtempSync(join(tmpdir(),'vehiclesensex-docs-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const init=spawnSync('git',['init','--quiet',root],{encoding:'utf8'});assert.equal(init.status,0,init.stderr);
 return {root,write(name,text){const path=join(root,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,text);},check(){return spawnSync('python3',[checker],{cwd:root,encoding:'utf8'});}};
}
function triplet(repo,stem,bodies=['# Tytuł\n\n`npm test`','# Title\n\n`npm test`','# Titel\n\n`npm test`']){
 for(const [index,suffix] of ['','.en','.de'].entries())repo.write(stem+suffix+'.md',`[Polski](${stem}.md) | [English](${stem}.en.md) | [Deutsch](${stem}.de.md)\n\n${bodies[index]}\n`);
}
test('complete localized documentation passes without requiring translated agent instructions',t=>{
 const repo=repository(t);triplet(repo,'README');repo.write('AGENTS.md','Machine instructions');
 const result=repo.check();assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/1 documentation topics/);
});
test('a missing language and an orphan translation both fail the documentation check',t=>{
 const repo=repository(t);triplet(repo,'README');rmSync(join(repo.root,'README.de.md'));
 let result=repo.check();assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,/missing README.de.md/);
 repo.write('orphan.en.md','English only');result=repo.check();assert.equal(result.status,1);assert.match(result.stdout,/missing orphan.md/);
});
test('a broken local link fails even when every translation contains the same target',t=>{
 const repo=repository(t);triplet(repo,'README',['# PL\n\n[Link](missing.json)','# EN\n\n[Link](missing.json)','# DE\n\n[Link](missing.json)']);
 const result=repo.check();assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,/broken README.md: missing.json/);
});
test('translated documentation must link to the corresponding language',t=>{
 const repo=repository(t);triplet(repo,'README',['# PL','# EN\n\n[Back](README.md)','# DE']);
 const result=repo.check();assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,/wrong language README.en.md/);
});
test('translations cannot silently change executable commands or technical identifiers',t=>{
 const repo=repository(t);triplet(repo,'README',['# PL\n\n`vehicleId`\n\n```sh\nnpm test\n```','# EN\n\n`vehicleID`\n\n```sh\nnpm start\n```','# DE\n\n`vehicleId`\n\n```sh\nnpm test\n```']);
 const result=repo.check();assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,/code fences differ README.en.md/);assert.match(result.stdout,/inline identifiers differ README.en.md/);
});
test('empty documents report invalid navigation rather than crashing',t=>{
 const repo=repository(t);triplet(repo,'README');repo.write('README.en.md','');
 const result=repo.check();assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,/navigation README.en.md/);assert.doesNotMatch(result.stderr,/Traceback/);
});
