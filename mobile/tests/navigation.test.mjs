import test from 'node:test';
import assert from 'node:assert/strict';
import {activeNavigation,isWideWeb,navigationItems} from '../src/navigation.ts';
test('desktop shell is web-only and uses the same breakpoint as the tab bar',()=>{
 assert.equal(isWideWeb(1100,'web'),true);assert.equal(isWideWeb(1099,'web'),false);assert.equal(isWideWeb(1400,'ios'),false);assert.equal(isWideWeb(1400,'android'),false);
});
test('secondary views highlight exactly one real navigation destination',()=>{
 for(const [path,expected] of [['/','/'],['/cockpit','/diagnostics'],['/connections','/diagnostics'],['/analytics','/trips'],['/vehicle-evidence','/garage'],['/vehicle-outlook','/garage'],['/privacy','/settings'],['/insights','/insights'],['/parts','/parts'],['/accessories','/accessories']])assert.equal(activeNavigation(path),expected);
 assert.equal(activeNavigation('/parts-unknown'),null);assert.equal(activeNavigation('/unknown'),null);
 assert.equal(new Set(navigationItems.map(item=>item.href)).size,navigationItems.length);
});
