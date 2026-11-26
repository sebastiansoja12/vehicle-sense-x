import * as ImagePicker from 'expo-image-picker';
import {ImageManipulator,SaveFormat} from 'expo-image-manipulator';
import {localDay} from './domain';
import type {Asset} from './media';
export async function pickCarPhoto():Promise<Asset|null>{
 const selection=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:false,exif:false,quality:1});
 if(selection.canceled)return null;
 const image=selection.assets[0];
 if(image.width*image.height>60000000||(image.fileSize??0)>20*1024*1024)throw new Error('Wybierz zdjęcie do 60 MP i 20 MB.');
 const context=ImageManipulator.manipulate(image.uri);
 try{
  const rendered=await context.resize(image.width>=image.height?{width:Math.min(image.width,1200)}:{height:Math.min(image.height,1200)}).renderAsync();
  try{
   const result=await rendered.saveAsync({format:SaveFormat.JPEG,compress:.7,base64:true});
   if(!result.base64)throw new Error('Nie udało się przygotować zdjęcia.');
   return{id:'photo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name:'Samochód-'+localDay()+'.jpg',mime:'image/jpeg',base64:result.base64,date:localDay()};
  }finally{rendered.release();}
 }finally{context.release();}
}
