import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const plugin=fileURLToPath(new URL('../plugins/withCarPlay.cjs',import.meta.url));
const modules=fileURLToPath(new URL('../node_modules',import.meta.url));
const cli=fileURLToPath(new URL('../node_modules/expo/bin/cli',import.meta.url));
function inspect(t,enabled,previouslyEnabled=false){
 const root=mkdtempSync(join(tmpdir(),'vehiclesensex-carplay-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 symlinkSync(modules,join(root,'node_modules'),'dir');
 writeFileSync(join(root,'package.json'),JSON.stringify({name:'vehiclesensex-carplay-test',version:'1.0.0',dependencies:{expo:'~58.1.0'}}));
 writeFileSync(join(root,'app.json'),JSON.stringify({expo:{name:'Test',slug:'test',ios:{bundleIdentifier:'com.vehiclesensex.test',entitlements:previouslyEnabled?{'com.apple.developer.carplay-driving-task':true,'com.apple.developer.carplay-audio':true}:{},infoPlist:{VehicleSenseXPreserved:'keep',...(previouslyEnabled?{VehicleSenseXCarPlayEnabled:true}:{}),UIApplicationSceneManifest:{UISceneConfigurations:{UIWindowSceneSessionRoleApplication:[{UISceneConfigurationName:'Phone'}],...(previouslyEnabled?{CPTemplateApplicationSceneSessionRoleApplication:[{UISceneDelegateClassName:'VehicleSenseXCarPlaySceneDelegate'},{UISceneDelegateClassName:'OtherCarPlayScene'}]}:{})}}}},plugins:[[plugin,{enabled}]]}}));
 const result=spawnSync(process.execPath,[cli,'config','--type','introspect','--json'],{cwd:root,encoding:'utf8',env:{...process.env,CI:'1',EXPO_NO_TELEMETRY:'1'},timeout:30000});
 assert.equal(result.status,0,result.stderr+result.stdout);return JSON.parse(result.stdout)._internal.modResults.ios;
}
test('default build does not request unapproved CarPlay entitlement or register a scene',t=>{
 const ios=inspect(t,false);assert.equal(ios.entitlements['com.apple.developer.carplay-driving-task'],undefined);
 assert.equal(ios.infoPlist.UIApplicationSceneManifest.UISceneConfigurations.CPTemplateApplicationSceneSessionRoleApplication,undefined);
});
test('explicit CarPlay build registers native template scene and preserves phone scene configuration',t=>{
 const ios=inspect(t,true);assert.equal(ios.entitlements['com.apple.developer.carplay-driving-task'],true);
 assert.equal(ios.infoPlist.VehicleSenseXCarPlayEnabled,true);
 assert.equal(ios.infoPlist.VehicleSenseXPreserved,'keep');
 const scenes=ios.infoPlist.UIApplicationSceneManifest.UISceneConfigurations;
 assert.equal(scenes.UIWindowSceneSessionRoleApplication[0].UISceneConfigurationName,'Phone');
 assert.equal(scenes.CPTemplateApplicationSceneSessionRoleApplication[0].UISceneDelegateClassName,'VehicleSenseXCarPlaySceneDelegate');
});

test('disabling a previously configured build removes owned configuration and preserves other scenes',t=>{
 const ios=inspect(t,false,true);
 assert.equal(ios.entitlements['com.apple.developer.carplay-driving-task'],undefined);
 assert.equal(ios.entitlements['com.apple.developer.carplay-audio'],true);
 assert.equal(ios.infoPlist.VehicleSenseXCarPlayEnabled,undefined);
 const scenes=ios.infoPlist.UIApplicationSceneManifest.UISceneConfigurations;
 assert.equal(scenes.UIWindowSceneSessionRoleApplication[0].UISceneConfigurationName,'Phone');
 assert.deepEqual(scenes.CPTemplateApplicationSceneSessionRoleApplication,[{UISceneDelegateClassName:'OtherCarPlayScene'}]);
});
