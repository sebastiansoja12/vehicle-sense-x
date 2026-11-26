import { StyleSheet } from 'react-native';
export const colors={paper:'#f8f8f6',ink:'#191b1b',muted:'#6e7371',line:'#d9dcd7',red:'#b33c2f',soft:'#eeefe9',green:'#35694c'};
export const styles=StyleSheet.create({
 fill:{flex:1,backgroundColor:colors.paper},content:{paddingHorizontal:22,paddingTop:25,paddingBottom:35,width:'100%',maxWidth:800,alignSelf:'center'},
 row:{flexDirection:'row',alignItems:'center',gap:12},between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
 heading:{fontSize:27,fontWeight:'500',letterSpacing:-1,color:colors.ink,flexShrink:1},kicker:{fontSize:10,letterSpacing:1.3,color:colors.muted,textTransform:'uppercase',marginBottom:10},
 section:{borderTopWidth:1,borderTopColor:colors.line,paddingTop:23,marginTop:26},sectionTitle:{fontSize:16,fontWeight:'600',letterSpacing:-.3,color:colors.ink},
 body:{fontSize:14,lineHeight:22,color:colors.ink},muted:{fontSize:12,lineHeight:19,color:colors.muted},fine:{fontSize:11,lineHeight:17,color:colors.muted},
 button:{minHeight:46,paddingHorizontal:17,paddingVertical:11,alignItems:'center',justifyContent:'center',backgroundColor:colors.ink,borderWidth:1,borderColor:colors.ink,borderRadius:3,flexDirection:'row',gap:8},
 buttonText:{fontSize:13,fontWeight:'500',color:'#fff',textAlign:'center'},secondary:{backgroundColor:'transparent',borderColor:'#afb5ad'},secondaryText:{color:colors.ink},disabled:{opacity:.45},
 listRow:{paddingVertical:18,borderBottomWidth:1,borderBottomColor:colors.line,gap:6},input:{borderWidth:1,borderColor:'#bcc4b4',backgroundColor:'#fff',padding:13,minHeight:48,fontSize:16,color:colors.ink,borderRadius:2},
 label:{fontSize:12,color:colors.muted,marginBottom:7},field:{gap:2,marginBottom:18},error:{fontSize:13,lineHeight:21,color:colors.red,paddingVertical:10},notice:{backgroundColor:colors.soft,padding:15,borderLeftWidth:2,borderLeftColor:'#a1a89c',marginTop:18},
 stats:{flexDirection:'row',flexWrap:'wrap',marginTop:22},stat:{width:'50%',paddingRight:14,paddingBottom:24},statValue:{fontSize:36,fontWeight:'500',letterSpacing:-1,color:colors.ink,marginTop:7,fontVariant:['tabular-nums']},statUnit:{fontSize:12,fontWeight:'400',letterSpacing:0,color:colors.muted},
 pageHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:23},empty:{paddingVertical:30,gap:17},link:{minHeight:44,justifyContent:'center',paddingVertical:10},linkText:{fontSize:13,color:colors.ink},
 vehicle:{borderTopWidth:1,borderBottomWidth:1,borderColor:colors.line,paddingVertical:20},vehicleModel:{fontSize:54,fontWeight:'600',letterSpacing:-2,color:colors.ink,marginTop:4},registration:{fontSize:11,letterSpacing:1,borderWidth:1,borderColor:'#bfc5ba',borderLeftWidth:3,borderLeftColor:'#5c7188',paddingVertical:6,paddingHorizontal:9,backgroundColor:'#fff'},
 modalBackground:{flex:1,backgroundColor:'#10180f66',justifyContent:'center',padding:16},modal:{backgroundColor:colors.paper,width:'100%',maxWidth:480,maxHeight:'92%',alignSelf:'center',padding:22,borderRadius:4},modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:20},
});
