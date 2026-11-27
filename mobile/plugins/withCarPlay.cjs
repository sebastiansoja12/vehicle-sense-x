const {withInfoPlist,withEntitlementsPlist}=require('expo/config-plugins');

module.exports=(config,options={})=>{
 if(options.enabled!==true){
  config=withEntitlementsPlist(config,config=>{delete config.modResults['com.apple.developer.carplay-driving-task'];return config;});
  return withInfoPlist(config,config=>{
   const info=config.modResults;delete info.VehicleSenseXCarPlayEnabled;
   const scenes=info.UIApplicationSceneManifest?.UISceneConfigurations;
   const role='CPTemplateApplicationSceneSessionRoleApplication';
   if(Array.isArray(scenes?.[role])){
    const remaining=scenes[role].filter(scene=>scene.UISceneDelegateClassName!=='VehicleSenseXCarPlaySceneDelegate');
    if(remaining.length)scenes[role]=remaining;else delete scenes[role];
   }
   return config;
  });
 }
 config=withEntitlementsPlist(config,config=>{
  const conflicting=Object.keys(config.modResults).find(key=>key.startsWith('com.apple.developer.carplay-')&&key!=='com.apple.developer.carplay-driving-task'&&config.modResults[key]);
  if(conflicting)throw new Error('VehicleSenseX CarPlay Driving Task cannot be combined with another CarPlay category.');
  config.modResults['com.apple.developer.carplay-driving-task']=true;
  return config;
 });
 return withInfoPlist(config,config=>{
  const info=config.modResults;
  const manifest=info.UIApplicationSceneManifest??{};
  const scenes=manifest.UISceneConfigurations??{};
  const role='CPTemplateApplicationSceneSessionRoleApplication';
  const delegate='VehicleSenseXCarPlaySceneDelegate';
  if((scenes[role]??[]).some(scene=>scene.UISceneDelegateClassName!==delegate))throw new Error('A different CarPlay scene is already configured.');
  info.VehicleSenseXCarPlayEnabled=true;
  info.UIApplicationSceneManifest={...manifest,UIApplicationSupportsMultipleScenes:true,UISceneConfigurations:{...scenes,[role]:[{UISceneClassName:'CPTemplateApplicationScene',UISceneConfigurationName:'VehicleSenseXCarPlay',UISceneDelegateClassName:delegate}]}};
  return config;
 });
};
