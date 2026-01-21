
import React, { useState } from 'react';
import { 
  ChevronDown, 
  Shield, 
  Play, 
  SkipForward, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  TrendingUp, 
  Plus, 
  LayoutGrid
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

// --- TYPES & CONSTANTS ---

type ViewMode = 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE';

const COLORS = {
  health: {
    healthy: '#67e8f9', // Cyan-300
    suspected: '#fbbf24', // Amber-400
    unhealthy: '#f43f5e', // Rose-500
  },
  utilization: {
    low: '#93c5fd', // Blue-300
    med: '#60a5fa', // Blue-400
    high: '#3b82f6', // Blue-500
    reserved: '#e2e8f0', // Slate-200
    straggler: '#f97316', // Orange-500
  },
  maintenance: {
    uptodate: '#93c5fd', // Blue-300
    available: '#fbbf24', // Amber-400
    inprogress: '#f472b6', // Pink-400
  }
};

// --- MOCK DATA ---

const MOCK_BLOCKS = [
  {
    id: 'sb1',
    label: 'Super block 1',
    isOpen: true,
    blocks: [
      { id: 'b1', label: 'Block 1', nodes: Array(16).fill(0) },
      { id: 'b2', label: 'Block 2', nodes: Array(16).fill(0) },
    ]
  },
  {
    id: 'sb2',
    label: 'Super block 2',
    isOpen: false,
    extraLabel: 'Unhealthy: 1 VMs',
    blocks: []
  },
  {
    id: 'sb3',
    label: 'Super block 3',
    isOpen: false,
    blocks: []
  },
  {
    id: 'sb4',
    label: 'Super block 4',
    isOpen: false,
    blocks: []
  }
];

// Health Data
const HEALTH_DONUT = [
  { name: 'Healthy', value: 414, color: COLORS.health.healthy },
  { name: 'Suspected', value: 13, color: COLORS.health.suspected },
  { name: 'Unhealthy', value: 3, color: COLORS.health.unhealthy },
];

// Utilization Data
const UTIL_DONUT = [
  { name: 'Used', value: 510, color: '#a855f7' }, // Purple
  { name: 'Free', value: 120, color: '#e2e8f0' },
];

// Maintenance Data
const MAINT_DONUT = [
  { name: 'Up-to-date', value: 247, color: COLORS.maintenance.uptodate },
  { name: 'Available', value: 150, color: COLORS.maintenance.available },
  { name: 'In Progress', value: 33, color: COLORS.maintenance.inprogress },
];

const SPARKLINE_DATA = [
  { v: 10 }, { v: 12 }, { v: 8 }, { v: 15 }, { v: 20 }, { v: 18 }, { v: 25 }
];

const NODE_HEALTH_HISTORY = [
  { time: '09:00', temp: 45, util: 85 },
  { time: '09:15', temp: 48, util: 88 },
  { time: '09:30', temp: 52, util: 92 },
  { time: '09:45', temp: 88, util: 95 }, // Thermal spike
  { time: '10:00', temp: 82, util: 40 }, // Performance drop
  { time: '10:15', temp: 75, util: 10 }, // XID error
  { time: '10:30', temp: 65, util: 0 },
];

// --- COMPONENTS ---

const NodeHealthDetail: React.FC<{ nodeIdx: number; blockLabel: string }> = ({ nodeIdx, blockLabel }) => {
  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            Node {nodeIdx} Health Diagnostics ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">Real-time telemetry and error markers</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
              <div className="w-2 h-0.5 bg-rose-500" /> Temperature (°C)
           </div>
           <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
              <div className="w-2 h-0.5 bg-blue-500" /> Utilization (%)
           </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={NODE_HEALTH_HISTORY} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            
            {/* Markers */}
            <ReferenceLine 
              x="09:45" 
              stroke="#f43f5e" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Thermal Spike', 
                position: 'top', 
                fill: '#f43f5e', 
                fontSize: 10, 
                fontWeight: 'bold' 
              }} 
            />
            <ReferenceLine 
              x="10:15" 
              stroke="#e11d48" 
              strokeWidth={2}
              label={{ 
                value: 'XID Error', 
                position: 'top', 
                fill: '#e11d48', 
                fontSize: 10, 
                fontWeight: 'bold' 
              }} 
            />

            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#f43f5e" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#f43f5e' }} 
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="util" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6' }} 
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Status</div>
          <div className="text-xs font-bold text-rose-600">UNHEALTHY</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Error Code</div>
          <div className="text-xs font-bold text-slate-700">XID 31 (Memory)</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Drain & Replace</button>
        </div>
      </div>
    </div>
  );
};

export const ClusterDirectorV2: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('HEALTH');
  const [superBlocks, setSuperBlocks] = useState(MOCK_BLOCKS);
  const [selectedNode, setSelectedNode] = useState<{ sbId: string; blockId: string; nodeIdx: number } | null>(() => {
    // Auto-select first unhealthy node in Super Block 1 for demo purposes
    const sb1 = MOCK_BLOCKS[0];
    const b1 = sb1.blocks[0];
    // In getNodeColor, key 15 is unhealthy. blockIdx 0, nodeIdx 15 -> key 15.
    return { sbId: sb1.id, blockId: b1.id, nodeIdx: 15 };
  });

  const toggleSuperBlock = (id: string) => {
    setSuperBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, isOpen: !sb.isOpen } : sb));
    if (selectedNode?.sbId === id) setSelectedNode(null);
  };

  const getNodeColor = (blockIdx: number, nodeIdx: number, mode: ViewMode) => {
    // Deterministic mock pattern for visuals
    const key = (blockIdx * 16) + nodeIdx;
    
    if (mode === 'HEALTH') {
      if (key === 15) return COLORS.health.unhealthy;
      if (key > 16 && key < 20) return COLORS.health.suspected;
      if (key === 42) return COLORS.health.unhealthy;
      if (key === 60) return COLORS.health.suspected;
      return COLORS.health.healthy;
    }

    if (mode === 'UTILIZATION') {
      if (key === 21) return COLORS.utilization.straggler;
      if (key === 45) return COLORS.utilization.straggler;
      if (key % 3 === 0) return COLORS.utilization.low;
      if (key % 3 === 1) return COLORS.utilization.med;
      return COLORS.utilization.high;
    }

    if (mode === 'MAINTENANCE') {
      if (key > 5 && key < 10) return COLORS.maintenance.inprogress; // pink
      if (key > 16 && key < 24) return COLORS.maintenance.available; // yellow
      return COLORS.maintenance.uptodate; // blue
    }
    
    return '#e2e8f0';
  };

  const renderDashboardCard = () => {
    switch (viewMode) {
      case 'HEALTH':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Donut */}
            <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={HEALTH_DONUT} innerRadius={45} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {HEALTH_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-bold text-slate-700">430</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
               </div>
            </div>

            {/* Metrics */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Health check status</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-300"/> Healthy: <span className="text-[#1967D2]">414 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Suspected: <span className="text-[#1967D2]">13 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Unhealthy: <span className="text-[#1967D2]">3 VMs</span></div>
                  </div>
               </div>

               <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1">Unhealthy nodes</h4>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-base"><AlertOctagon size={16} /> 3 / 430 VMs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Last check 02/14/2025</div>
                    <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Replace all bad nodes</button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1">Suspected nodes</h4>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-base"><AlertTriangle size={16} /> 13 / 430 VMs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Based on AI Health Predictor</div>
                    <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Rerun health check</button>
                  </div>
               </div>

               <div>
                 <h4 className="font-bold text-slate-800 text-xs mb-2">Latest health checks</h4>
                 <ul className="space-y-1.5 text-[10px] text-slate-600">
                   <li>• 12/10/24: <span className="text-[#1967D2]">94 VMs</span></li>
                   <li>• 11/10/24: <span className="text-[#1967D2]">73 VMs</span></li>
                   <li>• 09/10/24: <span className="text-[#1967D2]">41 VMs</span></li>
                 </ul>
                 <button className="text-[#1967D2] text-[10px] font-bold hover:underline mt-1">See all</button>
               </div>
            </div>
          </div>
        );

      case 'UTILIZATION':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Reserved capacity</h4>
               <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><AlertTriangle size={16} className="text-amber-500" /> 38 / 430 VMs</div>
               <p className="text-[10px] text-slate-500 leading-tight">You have unused reserved capacity. Start using these VMs to use it fully.</p>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">See reservations</button>
             </div>

             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Newly added jobs</h4>
               <div className="text-[10px] space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Job-name-7</span> <span className="text-[#1967D2]">34 VMs</span></div>
                  <div className="flex justify-between"><span>Job-name-8</span> <span className="text-[#1967D2]">28 VMs</span></div>
                  <div className="flex justify-between"><span>Job-name-9</span> <span className="text-[#1967D2]">13 VMs</span></div>
               </div>
               <div className="h-6 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={SPARKLINE_DATA} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">See cluster trends</button>
             </div>

             <div className="relative w-28 h-28 shrink-0 mx-auto">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={UTIL_DONUT} innerRadius={40} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {UTIL_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xl font-bold text-slate-700">510</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total jobs</span>
               </div>
             </div>

             <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Straggler detection <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block ml-0.5"></span></h4>
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><TrendingUp size={16} className="text-orange-500" /> 5 / 430 VMs</div>
                <p className="text-[10px] text-slate-500 leading-tight">Use checkpointing to replace nodes and keep jobs running.</p>
                <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
             </div>
          </div>
        );

      case 'MAINTENANCE':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
             <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={MAINT_DONUT} innerRadius={45} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {MAINT_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-bold text-slate-700">430</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
               </div>
             </div>

             <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Maintenance status</h4>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"/> Up-to-date: <span className="text-[#1967D2]">247 VMs</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Update available: <span className="text-[#1967D2]">150 VMs</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-400"/> In progress: <span className="text-[#1967D2]">33 VMs</span></div>
                </div>
             </div>

             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Upcoming impact:</h4>
               <ul className="space-y-1.5 text-[10px] text-slate-600">
                   <li><span className="text-purple-600 font-bold">•</span> Next 5 days: <span className="text-[#1967D2]">78 VMs</span></li>
                   <li><span className="text-purple-400 font-bold">•</span> In a week: <span className="text-[#1967D2]">56 VMs</span></li>
                   <li><span className="text-blue-500 font-bold">•</span> In a month: <span className="text-[#1967D2]">216 VMs</span></li>
               </ul>
               <p className="text-[9px] text-slate-500 leading-tight">Start partially now to avoid disruption.</p>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
             </div>

             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Unplanned maintenance <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-0.5"></span></h4>
               <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><AlertOctagon size={16} className="fill-red-500 text-white" /> 4 / 430 VMs</div>
               <p className="text-[9px] text-slate-500 leading-tight">Start 02/14/2025 at 12:00 UTC. Add temporary capacity to keep jobs running.</p>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Start maintenance now</button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 pb-10">
      
      {/* Top Navigation */}
      <div className="flex gap-6 border-b border-slate-200">
         <button className="px-1 py-2 border-b-2 border-[#1967D2] text-[#1967D2] font-bold text-xs">TOPOLOGY</button>
         <button className="px-1 py-2 border-b-2 border-transparent text-slate-500 font-bold text-xs hover:text-slate-700">MONITORING</button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
         <div className="flex gap-3">
             <div className="relative">
                <label className="text-[9px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-slate-50 px-1 z-10">Clusters</label>
                <div className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[140px] flex justify-between items-center shadow-sm">
                   cluster-name-1 <ChevronDown size={12} />
                </div>
             </div>
             <div className="relative">
                <label className="text-[9px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-slate-50 px-1 z-10">Filter mode</label>
                <div className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[120px] flex justify-between items-center shadow-sm">
                   {viewMode === 'UTILIZATION' ? 'Job' : 'Partition'} <ChevronDown size={12} />
                </div>
             </div>
             <div className="relative">
                <label className="text-[9px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-slate-50 px-1 z-10">
                   {viewMode === 'UTILIZATION' ? 'Jobs' : 'Partitions'}
                </label>
                <div className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[160px] flex justify-between items-center shadow-sm">
                   {viewMode === 'UTILIZATION' ? 'Job-name-1' : '3 partitions selected'} <ChevronDown size={12} />
                </div>
             </div>
         </div>

         <div className="flex bg-white rounded border border-[#1967D2]/20 shadow-sm overflow-hidden">
             <button 
                onClick={() => setViewMode('HEALTH')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-colors border-r border-[#1967D2]/10 ${viewMode === 'HEALTH' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'hover:bg-slate-50 text-[#1967D2]'}`}
             >
                <Shield size={12} /> Health
             </button>
             <button 
                onClick={() => setViewMode('UTILIZATION')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-colors border-r border-[#1967D2]/10 ${viewMode === 'UTILIZATION' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'hover:bg-slate-50 text-[#1967D2]'}`}
             >
                <LayoutGrid size={12} /> Utilization
             </button>
             <button 
                onClick={() => setViewMode('MAINTENANCE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${viewMode === 'MAINTENANCE' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'hover:bg-slate-50 text-[#1967D2]'}`}
             >
                <RefreshCw size={12} /> Maintenance
             </button>
         </div>
      </div>

      {/* Summary Dashboard Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          {renderDashboardCard()}
          
          {/* Legend Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-b-lg">
             <div className="flex gap-4 text-[10px] font-medium">
                 {viewMode === 'HEALTH' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-300"/> Healthy</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Suspected bad node</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Unhealthy</div>
                    </>
                 )}
                 {viewMode === 'UTILIZATION' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300"/> 0%-40%</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"/> 40%-80%</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> 80%-100%</div>
                    </>
                 )}
                 {viewMode === 'MAINTENANCE' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300"/> Up-to-date</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Update available</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400"/> In progress</div>
                    </>
                 )}
             </div>

             <div className="flex gap-3">
                {viewMode === 'HEALTH' && (
                  <>
                    <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><Play size={12} className="fill-[#1967D2]" /> Rerun all health checks</button>
                    <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><SkipForward size={12} className="fill-[#1967D2]" /> Replace all bad nodes</button>
                  </>
                )}
                {viewMode === 'UTILIZATION' && (
                  <>
                     <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><Plus size={12} /> Add capacity</button>
                     <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><SkipForward size={12} className="fill-[#1967D2]" /> Replace stragglers</button>
                  </>
                )}
                {viewMode === 'MAINTENANCE' && (
                   <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><Play size={12} className="fill-[#1967D2]" /> Start all maintenance now</button>
                )}
             </div>
          </div>
      </div>

      {/* Super Blocks List */}
      <div className="space-y-3">
         {superBlocks.map(sb => (
            <div key={sb.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all">
               {/* Header */}
               <div 
                 onClick={() => toggleSuperBlock(sb.id)}
                 className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 select-none rounded-t-lg ${!sb.isOpen ? 'rounded-b-lg' : ''}`}
               >
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-medium text-slate-900">{sb.label}</h3>
                     <ChevronDown size={16} className={`text-slate-400 transition-transform ${sb.isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Right Actions */}
                  {sb.isOpen ? (
                     <div className="flex gap-4">
                        {viewMode === 'HEALTH' && (
                            <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><Play size={10} className="fill-[#1967D2]" /> Start health check</button>
                        )}
                        {viewMode === 'UTILIZATION' && (
                           <>
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><Plus size={12} /> Add capacity</button>
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><SkipForward size={10} className="fill-[#1967D2]" /> Replace stragglers</button>
                           </>
                        )}
                         {viewMode === 'MAINTENANCE' && (
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><Play size={10} className="fill-[#1967D2]" /> Start maintenance</button>
                        )}
                        {/* More action placeholder */}
                        <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><SkipForward size={10} className="fill-[#1967D2]" /> Replace {viewMode === 'UTILIZATION' ? 'stragglers' : 'bad nodes'}</button>
                     </div>
                  ) : (
                     // Collapsed Summary
                     <div className="flex items-center gap-4 text-[10px] font-bold">
                        {sb.extraLabel && (
                            <div className="flex items-center gap-1 text-rose-600">
                                <AlertOctagon size={12} className="fill-rose-100" /> {sb.extraLabel}
                            </div>
                        )}
                        {viewMode === 'MAINTENANCE' && sb.id === 'sb2' && (
                            <div className="flex items-center gap-1 text-rose-600">
                                <AlertOctagon size={12} className="fill-rose-100" /> Unplanned: 2 VMs
                            </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Content */}
               {sb.isOpen && (
                 <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sb.blocks.map((block, blockIdx) => (
                       <div key={block.id}>
                          <h5 className="text-[10px] text-slate-500 mb-1.5">{block.label}</h5>
                          <div className="flex flex-wrap gap-1">
                             {block.nodes.map((_, nodeIdx) => {
                               const color = getNodeColor(blockIdx, nodeIdx, viewMode);
                               const isUnhealthy = color === COLORS.health.unhealthy;
                               const isSelected = selectedNode?.sbId === sb.id && selectedNode?.blockId === block.id && selectedNode?.nodeIdx === nodeIdx;
                               
                               return (
                                 <div 
                                   key={nodeIdx}
                                   className={`w-6 h-5 rounded-[2px] cursor-pointer transition-all ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-110 z-10' : 'hover:opacity-80'}`}
                                   style={{ backgroundColor: color }}
                                   title={`Node ${nodeIdx}`}
                                   onClick={() => {
                                     if (isUnhealthy) {
                                       if (isSelected) setSelectedNode(null);
                                       else setSelectedNode({ sbId: sb.id, blockId: block.id, nodeIdx });
                                     }
                                   }}
                                 ></div>
                               );
                             })}
                          </div>
                       </div>
                    ))}

                    {/* Inline Health Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && (
                      <NodeHealthDetail 
                        nodeIdx={selectedNode.nodeIdx} 
                        blockLabel={sb.blocks.find(b => b.id === selectedNode.blockId)?.label || ''} 
                      />
                    )}
                 </div>
               )}
            </div>
         ))}
      </div>

    </div>
  );
};
