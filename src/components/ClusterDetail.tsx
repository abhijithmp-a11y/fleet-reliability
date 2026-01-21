
import React, { useState } from 'react';
import { 
  Server, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Play, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  RotateCw, 
  SkipForward, 
  Search
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { REGIONS } from './ClusterTopology';
import { Job, JobStatus } from '../types';

interface ClusterDetailProps {
  clusterId: string;
  onBack: () => void;
  jobs: Job[];
  onViewJob: (job: Job) => void;
  onNavigateToJobs?: (status?: JobStatus) => void;
}

// Visual constants matching the provided image
const COLORS = {
  healthy: '#67e8f9', // Cyan-300 (Visual match)
  suspected: '#fbbf24', // Amber-400
  unhealthy: '#f43f5e', // Rose-500
  bg: '#f8fafc'
};

const HEALTH_DATA = [
  { name: 'Healthy', value: 414, color: COLORS.healthy },
  { name: 'Suspected', value: 13, color: COLORS.suspected },
  { name: 'Unhealthy', value: 3, color: COLORS.unhealthy },
];

const MOCK_SUPER_BLOCKS = [
  {
    id: 'sb1',
    title: 'Super block 1',
    unhealthyCount: 2,
    suspectedCount: 9,
    isOpen: true,
    blocks: [
      {
        id: 'b1',
        label: 'Block 1',
        nodes: [
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(3).fill('healthy'), 'unhealthy'
        ]
      },
      {
        id: 'b2',
        label: 'Block 2',
        nodes: [
          ...Array(4).fill('healthy'),
          ...Array(3).fill('suspected'), 'healthy',
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(3).fill('healthy'), 'suspected' // Target for tooltip
        ]
      }
    ]
  },
  {
    id: 'sb2',
    title: 'Super block 2',
    unhealthyCount: 1,
    suspectedCount: 4,
    isOpen: false,
    blocks: []
  },
  {
    id: 'sb3',
    title: 'Super block 3',
    unhealthyCount: 0,
    suspectedCount: 0,
    isOpen: false,
    blocks: []
  },
  {
    id: 'sb4',
    title: 'Super block 4',
    unhealthyCount: 0,
    suspectedCount: 0,
    isOpen: false,
    blocks: []
  }
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

const NodeHealthDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string;
  status: 'healthy' | 'degraded' | 'unhealthy'
}> = ({ nodeIdx, blockLabel, status }) => {
  const config = {
    healthy: {
      color: 'bg-cyan-300',
      textColor: 'text-cyan-600',
      label: 'HEALTHY',
      detailLabel: 'Status',
      detailValue: 'Normal',
      action: 'None needed'
    },
    degraded: {
      color: 'bg-amber-400',
      textColor: 'text-amber-600',
      label: 'DEGRADED',
      detailLabel: 'Straggler node',
      detailValue: 'High Latency',
      action: <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Investigate metrics</button>
    },
    unhealthy: {
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      label: 'UNHEALTHY',
      detailLabel: 'Error Code',
      detailValue: 'XID 31 (Memory)',
      action: <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Drain & Replace</button>
    }
  }[status];

  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
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
            {status !== 'healthy' && (
              <>
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
              </>
            )}

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
          <div className={`text-xs font-bold ${config.textColor}`}>{config.label}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">{config.detailLabel}</div>
          <div className="text-xs font-bold text-slate-700">{config.detailValue}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <div className="text-[10px] font-bold text-slate-500">{config.action}</div>
        </div>
      </div>
    </div>
  );
};

const NodeMaintenanceDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string; 
  status: 'uptodate' | 'available' | 'inprogress' 
}> = ({ nodeIdx, blockLabel, status }) => {
  const config = {
    uptodate: {
      color: 'bg-blue-300',
      textColor: 'text-blue-600',
      label: 'UP TO DATE',
      driver: 'v535.154.05',
      gce: 'v20240214',
      action: 'None needed'
    },
    available: {
      color: 'bg-amber-400',
      textColor: 'text-amber-600',
      label: 'UPDATE AVAILABLE',
      driver: 'v535.129.03',
      nextDriver: 'v535.154.05',
      gce: 'v20240110',
      nextGce: 'v20240214',
      action: <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Schedule update</button>
    },
    inprogress: {
      color: 'bg-pink-400',
      textColor: 'text-pink-600',
      label: 'UPDATING',
      driver: 'v535.154.05 (Applying...)',
      gce: 'v20240214 (Applying...)',
      action: <div className="flex items-center gap-1 text-pink-500 animate-pulse"><RefreshCw size={10} /> In progress</div>
    }
  }[status];

  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            Node {nodeIdx} Software Stack ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">Current firmware and orchestration versions</p>
        </div>
        <div className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500">
          OS: Ubuntu 22.04 LTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">GPU Driver</div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-slate-700">{config.driver}</div>
            {status === 'available' && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                <SkipForward size={10} /> {config.nextDriver}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">GCE Software</div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-slate-700">{config.gce}</div>
            {status === 'available' && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                <SkipForward size={10} /> {config.nextGce}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Status</div>
          <div className={`text-xs font-bold ${config.textColor}`}>{config.label}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Last Reboot</div>
          <div className="text-xs font-bold text-slate-700">12 days ago</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <div className="text-[10px] font-bold text-slate-500">{config.action}</div>
        </div>
      </div>
    </div>
  );
};

export const ClusterDetail: React.FC<ClusterDetailProps> = ({ clusterId, onBack }) => {
  const [viewMode, setViewMode] = useState<'HEALTH' | 'UTILIZATION' | 'MAINTENANCE'>('HEALTH');
  const [superBlocks, setSuperBlocks] = useState(MOCK_SUPER_BLOCKS);
  const [selectedNode, setSelectedNode] = useState<{
    sbId: string, 
    bId: string, 
    idx: number,
    status: any
  } | null>(() => {
    // Auto-select first unhealthy node if navigating from a warning cluster
    const sb1 = MOCK_SUPER_BLOCKS[0];
    const b1 = sb1.blocks[0];
    const unhealthyIdx = b1.nodes.findIndex(n => n === 'unhealthy');
    if (unhealthyIdx !== -1) {
      return { sbId: sb1.id, bId: b1.id, idx: unhealthyIdx, status: 'unhealthy' };
    }
    return null;
  });

  const handleTabChange = (mode: 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE') => {
    setViewMode(mode);
    setSelectedNode(null);
  };

  const region = REGIONS.find(r => r.clusters.some(c => c.id === clusterId));
  const foundCluster = region?.clusters.find(c => c.id === clusterId);
  
  const clusterData = foundCluster 
    ? { ...foundCluster, regionName: region?.name || 'Unknown Region' }
    : { name: 'Cluster', regionName: 'Unknown', type: 'Unknown', count: 0 };

  const toggleSuperBlock = (id: string) => {
    setSuperBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, isOpen: !sb.isOpen } : sb));
  };

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-slate-900 text-xs">
      {/* Breadcrumb / Header */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={14} /> Back to fleet
        </button>
        <div className="text-xs text-slate-500">
           <span className="font-bold text-slate-700">{clusterData.name}</span> • {clusterData.regionName}
        </div>
      </div>

      {/* Health Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-4 border-b border-slate-100 pb-4">
            {/* Filter Controls */}
            <div className="flex gap-3 items-center">
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Clusters</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[140px] flex justify-between items-center">
                        {clusterData.name} <ChevronDown size={12} />
                    </div>
                </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Filter mode</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[120px] flex justify-between items-center">
                        Partition <ChevronDown size={12} />
                    </div>
                </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Partitions</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[160px] flex justify-between items-center">
                        Partition A, Partition B <ChevronDown size={12} />
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
                <button 
                  onClick={() => handleTabChange('HEALTH')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-colors uppercase tracking-wide ${viewMode === 'HEALTH' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'bg-white border border-[#1967D2]/20 text-[#1967D2] hover:bg-slate-50'}`}
                >
                    <CheckCircle2 size={12} /> Health
                </button>
                <button 
                  onClick={() => handleTabChange('UTILIZATION')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-colors uppercase tracking-wide ${viewMode === 'UTILIZATION' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'bg-white border border-[#1967D2]/20 text-[#1967D2] hover:bg-slate-50'}`}
                >
                    <AlertOctagon size={12} /> Utilization
                </button>
                <button 
                  onClick={() => handleTabChange('MAINTENANCE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-colors uppercase tracking-wide ${viewMode === 'MAINTENANCE' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'bg-white border border-[#1967D2]/20 text-[#1967D2] hover:bg-slate-50'}`}
                >
                    <RefreshCw size={12} /> Maintenance
                </button>
            </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={HEALTH_DATA}
                            innerRadius={45}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {HEALTH_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-700">430</span>
                    <span className="text-[10px] text-slate-400 font-medium">Total VMs</span>
                </div>
            </div>

            {/* Health Details Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                {/* Column 1: Status Legend */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs">Health check status</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-cyan-300"></div>
                            <span>Healthy: <strong className="text-slate-800">414 VMs</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span>Suspected: <strong className="text-slate-800">13 VMs</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span>Unhealthy: <strong className="text-slate-800">3 VMs</strong></span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Unhealthy/Suspected Summary */}
                <div className="space-y-4">
                     <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Unhealthy nodes</h4>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-base">
                             <AlertOctagon size={16} /> 3 / 430 VMs
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Last check 02/14/2025 at 12:00:00 UTC</div>
                        <button className="text-[#1967D2] text-[10px] font-bold hover:underline mt-0.5">Replace all bad nodes</button>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Suspected nodes</h4>
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-base">
                             <AlertTriangle size={16} /> 13 / 430 VMs
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Based on HCC's <span className="text-[#1967D2] cursor-pointer">AI health predictor</span></div>
                        <button className="text-[#1967D2] text-[10px] font-bold hover:underline mt-0.5">Rerun health check</button>
                     </div>
                </div>

                {/* Column 3: Latest Checks History */}
                <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-2">Latest health checks</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                            12/10/24 at 12:00:00 UTC: <span className="text-[#1967D2] font-medium">94 VMs</span>
                        </li>
                         <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                            11/10/24 at 12:00:00 UTC: <span className="text-[#1967D2] font-medium">73 VMs</span>
                        </li>
                         <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                            09/10/24 at 12:00:00 UTC: <span className="text-[#1967D2] font-medium">41 VMs</span>
                        </li>
                    </ul>
                    <button className="text-[#1967D2] text-[10px] font-bold hover:underline mt-2 ml-3">See all</button>
                </div>
            </div>
        </div>

        {/* Bottom Legend Bar */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex gap-4 text-[10px] font-medium">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-300"></div> Healthy</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Suspected bad node</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Unhealthy</div>
             </div>
             <div className="flex gap-4">
                 <button className="flex items-center gap-1 text-[#1967D2] text-xs font-medium hover:text-[#1557B0]">
                    <Play size={14} className="fill-[#1967D2]" /> Rerun all health checks
                 </button>
                 <button className="flex items-center gap-1 text-[#1967D2] text-xs font-medium hover:text-[#1557B0]">
                    <SkipForward size={14} className="fill-[#1967D2]" /> Replace all bad nodes
                 </button>
             </div>
        </div>
      </div>

      {/* Super Blocks List */}
      <div className="space-y-3">
         {superBlocks.map(sb => (
            <div key={sb.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all">
               {/* Super Block Header */}
               <div 
                 onClick={() => toggleSuperBlock(sb.id)}
                 className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 select-none rounded-t-lg ${!sb.isOpen ? 'rounded-b-lg' : ''}`}
               >
                  <div className="flex items-center gap-2">
                     <h3 className="text-base font-medium text-slate-900">{sb.title}</h3>
                     <ChevronDown size={16} className={`text-slate-400 transition-transform ${sb.isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {sb.isOpen && (sb.unhealthyCount > 0 || sb.suspectedCount > 0) && (
                     <div className="flex gap-4 text-[10px] font-bold">
                        {sb.unhealthyCount > 0 && (
                            <div className="flex items-center gap-1 text-rose-600">
                                <div className="px-1 py-0.5 bg-rose-600 text-white rounded text-[9px]">!</div>
                                Unhealthy: {sb.unhealthyCount} VMs
                            </div>
                        )}
                        {sb.suspectedCount > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle size={12} className="fill-amber-500 text-white" />
                                Suspected: {sb.suspectedCount} VMs
                            </div>
                        )}
                         <div className="flex gap-3 text-[#1967D2] ml-3">
                            <span className="flex items-center gap-1 cursor-pointer hover:underline"><Play size={10} className="fill-[#1967D2]" /> Start health check</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:underline"><SkipForward size={10} className="fill-[#1967D2]" /> Replace bad nodes</span>
                        </div>
                     </div>
                  )}
                  {!sb.isOpen && (
                     <div className="flex gap-3 text-[10px]">
                        {sb.unhealthyCount > 0 && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold flex items-center gap-1"><AlertOctagon size={10}/> {sb.unhealthyCount} Unhealthy</span>}
                        {sb.suspectedCount > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-bold flex items-center gap-1"><AlertTriangle size={10}/> {sb.suspectedCount} Suspected</span>}
                         <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold flex items-center gap-1"><CheckCircle2 size={10}/> {sb.isOpen ? '' : '414'} Healthy</span>
                     </div>
                  )}
               </div>

               {/* Content */}
               {sb.isOpen && (
                 <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sb.blocks.map(block => (
                        <div key={block.id}>
                            <h5 className="text-xs text-slate-500 mb-2">{block.label}</h5>
                            <div className="flex flex-wrap gap-1">
                                {block.nodes.map((status, idx) => {
                                    const isSelected = selectedNode?.sbId === sb.id && selectedNode?.bId === block.id && selectedNode?.idx === idx;
                                    
                                    let mappedStatus: any;
                                    if (viewMode === 'HEALTH') {
                                      mappedStatus = status === 'unhealthy' ? 'unhealthy' :
                                                     status === 'suspected' ? 'degraded' : 'healthy';
                                    } else if (viewMode === 'MAINTENANCE') {
                                      // Mock maintenance status based on health status for demo
                                      mappedStatus = status === 'unhealthy' ? 'inprogress' :
                                                     status === 'suspected' ? 'available' : 'uptodate';
                                    } else {
                                      mappedStatus = 'healthy';
                                    }

                                    return (
                                        <div 
                                          key={idx}
                                          onClick={() => {
                                            if (isSelected) setSelectedNode(null);
                                            else setSelectedNode({ sbId: sb.id, bId: block.id, idx, status: mappedStatus });
                                          }}
                                          className={`
                                            w-8 h-6 rounded-[2px] cursor-pointer transition-all relative
                                            ${viewMode === 'HEALTH' ? (
                                              status === 'healthy' ? 'bg-cyan-300 hover:bg-cyan-400' :
                                              status === 'suspected' ? 'bg-amber-400 hover:bg-amber-500' :
                                              'bg-rose-500 hover:bg-rose-600'
                                            ) : (
                                              // Maintenance colors
                                              status === 'healthy' ? 'bg-blue-300 hover:bg-blue-400' :
                                              status === 'suspected' ? 'bg-amber-400 hover:bg-amber-500' :
                                              'bg-pink-400 hover:bg-pink-500'
                                            )}
                                            ${isSelected ? 'ring-2 ring-offset-1 ring-[#1967D2] z-20 scale-110' : 'z-0'}
                                          `}
                                          title={`Node ${idx} (${status})`}
                                        >
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Inline Health Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'HEALTH' && (
                      <NodeHealthDetail 
                        nodeIdx={selectedNode.idx} 
                        blockLabel={sb.blocks.find(b => b.id === selectedNode.bId)?.label || ''} 
                        status={selectedNode.status}
                      />
                    )}

                    {/* Inline Maintenance Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'MAINTENANCE' && (
                      <NodeMaintenanceDetail 
                        nodeIdx={selectedNode.idx} 
                        blockLabel={sb.blocks.find(b => b.id === selectedNode.bId)?.label || ''} 
                        status={selectedNode.status}
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
