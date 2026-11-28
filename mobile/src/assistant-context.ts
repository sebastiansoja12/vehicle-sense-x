import {vehicleSummary} from './domain.ts';
import type {AppData} from './domain.ts';
import type {AssistantContext} from './assistant-client.ts';
export function buildAssistantContext(state:AppData,vehicleId:string,month:string):AssistantContext{
 const car=state.vehicles.find(v=>v.id===vehicleId);if(!car)throw new Error('Wybierz samochód.');const summary=vehicleSummary(state,vehicleId,month);
 const context:AssistantContext={vehicle:{make:car.make,model:car.model,year:car.year,engine:car.engine,mileage:car.mileage},fuelSummary:{consumption:summary.consumption,totalCents:summary.fuelCents},recentServices:state.service.filter(r=>r.vehicleId===vehicleId).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20).map(r=>({date:r.date,title:r.title,mileage:r.mileage,costCents:r.costCents}))};
 const latest=state.diagnostics.filter(d=>d.vehicleId===vehicleId).sort((a,b)=>b.timestamp-a.timestamp)[0];
 // Partial and imported readings must not be mistaken for a complete fault scan by the model.
 if(latest?.source==='obd'&&latest.readStatuses.length===3&&latest.codes.length<=50)context.diagnostics={timestamp:latest.timestamp,codes:latest.codes.map(c=>c.code),parameters:{rpm:latest.parameters.rpm,coolantC:latest.parameters.coolantC,loadPercent:latest.parameters.loadPercent,voltageV:latest.parameters.voltageV},...(latest.ecu?{ecu:{protocol:latest.ecu.protocol,responseId:latest.ecu.responseId}}:{})};
 return context;
}
