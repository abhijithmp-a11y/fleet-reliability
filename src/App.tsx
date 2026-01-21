
import React, { useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Activity, 
  Bell, 
  Search,
  PlayCircle,
  AlertCircle,
  Cpu,
  Layers,
  Server,
  LayoutGrid,
  BarChart3,
  LayoutDashboard,
  Settings,
  Zap,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  Info,
  Menu,
  Terminal,
  HelpCircle,
  MoreVertical,
  User,
  HeartPulse,
  Stethoscope,
  Home,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  Box,
  Filter,
  Camera,
  Timer,
  Download
} from 'lucide-react';
import { Card, StatCard, Sparkline, MiniGauge, MiniDonut, TableHeader } from '@/components/Card';
import { GoodputChart, TensorCoreChart, InterruptionsChart } from '@/components/PerformanceCharts';
import { DiagnosticsPanel } from '@/components/DiagnosticsPanel';
import { DiagnosticsRuns } from '@/components/DiagnosticsRuns';
import { FleetDashboard, EfficiencyFunnelChart, problematicReservations, ProjectAcceleratorsTable } from '@/components/FleetDashboard';
import { FleetEfficiencyDetail } from '@/components/FleetEfficiencyDetail';
import { ClusterTopology, REGIONS } from '@/components/ClusterTopology';
import { ClusterDirectorV2 } from '@/components/ClusterDirectorV2';
import { ClusterDetail } from '@/components/ClusterDetail';
import { ScenarioGuide, SCENARIOS } from '@/components/ScenarioGuide';
import { JobDetail } from '@/components/WorkloadDetail';
import { ReservationDetail } from '@/components/ReservationDetail';
import { Job, JobStatus, GoodputType, DashboardFilters } from '@/types';
import { FilterBar } from '@/components/FilterBar';
import { useTable } from '@/hooks/useTable';
import { Pagination } from '@/components/Pagination';
import { ActiveJobsTable } from '@/components/ActiveJobsTable';
import { DashboardHeader } from '@/components/DashboardHeader';

// --- MOCK DATA ---
const MOCK_JOBS: Job[] = [
  // Page 1
  {
    id: 'job-zeta-789',
    name: 'AlphaFold-Protein-Sim',
    user: 'm.curie',
    cluster: 'us-east-tpu-3',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '22h 5m',
    estimatedRemaining: '40h',
    gpuUtil: 98,
    tensorCoreUtil: 95,
    goodput: 97,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 01:00 AM',
    recentRun: 'run-af-sim-20241025',
    accelerator: 'Google TPU v5p',
    jobType: 'Simulation',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Job started successfully',
    reservation: 'iowa-central-reservation1',
  },
  {
    id: 'job-alpha-102',
    name: 'LLAMA-3-70B-Finetune',
    user: 'j.doe',
    cluster: 'us-west-training-v4',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '4h 12m',
    estimatedRemaining: '2h 15m',
    gpuUtil: 92,
    tensorCoreUtil: 88,
    goodput: 94,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 09:00 AM',
    recentRun: 'run-20241024-alpha',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'GKE',
    stepsPerSecond: 4.2,
    targetStepsPerSecond: 4.5,
    computeIdleTime: '12%',
    memoryBwUtil: 78,
    recentEvent: 'Scaling to 1024 chips',
    reservation: 'us-west-reservation2',
  },
  {
    id: 'job-recent-001',
    name: 'Gemini-Flash-Inference',
    user: 'system',
    cluster: 'us-central1-a',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '15m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 65,
    tensorCoreUtil: 60,
    goodput: 99,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 PM',
    recentRun: 'run-gemini-inf-prod',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'New model version deployed',
    reservation: 'europe-north-reservation3',
  },
  // NEW HANGING JOB FOR DEMO SCENARIO
  {
    id: 'job-hang-007',
    name: 'GPT-5-MoE-Training',
    user: 'p.parker',
    cluster: 'us-west-training-v4',
    status: JobStatus.HANGING,
    priority: 'CRITICAL',
    duration: '14h 20m',
    estimatedRemaining: 'Unknown',
    gpuUtil: 0, // Deadlock
    tensorCoreUtil: 0,
    goodput: 10,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '4h 10m',
    submitted: 'Yesterday, 08:00 PM',
    recentRun: 'run-gpt5-moe-iter4',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'Slurm',
    inputPipelineStall: 25,
    hostCpuUtil: 95,
    recentEvent: 'Input pipeline stalled',
    reservation: 'asia-south-reservation4',
  },
  {
    id: 'job-beta-991',
    name: 'ResNet-50-Training',
    user: 'a.smith',
    cluster: 'eu-central-gpu-2',
    status: JobStatus.FAILED,
    priority: 'NORMAL',
    duration: '1h 45m',
    estimatedRemaining: '-',
    gpuUtil: 12,
    tensorCoreUtil: 5,
    goodput: 15,
    goodputType: GoodputType.GKE,
    badNodes: ['node-gke-4', 'node-gke-9'],
    interruptions: 3,
    downtime: '45m',
    submitted: 'Yesterday, 2:30 PM',
    recentRun: 'run-resnet-train-v2',
    accelerator: 'NVIDIA A100',
    jobType: 'Training',
    orchestrator: 'GKE',
    recentEvent: 'Node failure detected',
    reservation: 'iowa-central-reservation1',
  },
  {
    id: 'job-gamma-332',
    name: 'Bert-Large-Inference',
    user: 'm.chen',
    cluster: 'us-east-inference-1',
    status: JobStatus.QUEUED,
    priority: 'LOW',
    duration: '-',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 0,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 12:15 PM',
    recentRun: 'run-bert-inf-test',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'Ray',
    recentEvent: 'Awaiting resource allocation',
    reservation: 'us-west-reservation2',
  },
  {
    id: 'job-delta-404',
    name: 'GPT-4-Distillation',
    user: 'k.west',
    cluster: 'us-west-training-v4',
    status: JobStatus.INTERRUPTED,
    priority: 'HIGH',
    duration: '12h 10m',
    gpuUtil: 85,
    tensorCoreUtil: 76,
    goodput: 80,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '15m',
    submitted: 'Today, 01:00 AM',
    recentRun: 'run-gpt4-distill-x',
    accelerator: 'Google TPU v5p',
    jobType: 'Fine-tuning',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Preempted by higher priority job',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-epsilon-551',
    name: 'Stable-Diffusion-XL',
    user: 's.lee',
    cluster: 'asia-northeast-tpu-1',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '6h 30m',
    gpuUtil: 95,
    tensorCoreUtil: 91,
    goodput: 96,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 AM',
    recentRun: 'run-sd-xl-gen-1',
    accelerator: 'Google TPU v4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'Job running smoothly',
    reservation: 'asia-south-reservation4',
  },
  // Page 2
  {
    id: 'job-eta-111',
    name: 'DLRM-Recommendation',
    user: 'a.lovelace',
    cluster: 'us-central-gpu-1',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '3h 45m',
    estimatedRemaining: '1h 30m',
    gpuUtil: 85,
    tensorCoreUtil: 80,
    goodput: 92,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 12:30 PM',
    recentRun: 'run-dlrm-rec-v3',
    accelerator: 'NVIDIA A100',
    jobType: 'Training',
    orchestrator: 'GKE',
    recentEvent: 'Gradient overflow detected',
    reservation: 'iowa-central-reservation1',
  },
  {
    id: 'job-theta-222',
    name: 'Wavenet-Audio-Gen',
    user: 'system',
    cluster: 'eu-west-inf-2',
    status: JobStatus.RUNNING,
    priority: 'LOW',
    duration: '1h 5m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 55,
    tensorCoreUtil: 50,
    goodput: 98,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:10 PM',
    recentRun: 'run-wavenet-prod-2',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'Ray',
    recentEvent: 'Autoscaling triggered',
    reservation: 'us-west-reservation2',
  },
  {
    id: 'job-iota-333',
    name: 'ViT-Image-Classification',
    user: 'c.babbage',
    cluster: 'us-west-training-v4',
    status: JobStatus.QUEUED,
    priority: 'NORMAL',
    duration: '-',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 0,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 04:00 PM',
    recentRun: 'run-vit-img-class-1',
    accelerator: 'NVIDIA H100',
    jobType: 'Training',
    orchestrator: 'Slurm',
    recentEvent: 'Pending dependencies',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-kappa-444',
    name: 'BERT-Large-Finetune',
    user: 'j.neumann',
    cluster: 'asia-east-gpu-1',
    status: JobStatus.FAILED,
    priority: 'HIGH',
    duration: '6h 20m',
    estimatedRemaining: '-',
    gpuUtil: 5,
    tensorCoreUtil: 2,
    goodput: 8,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: ['node-gke-asia-7'],
    interruptions: 2,
    downtime: '1h 5m',
    submitted: 'Yesterday, 10:00 PM',
    recentRun: 'run-bert-large-ft-v9',
    accelerator: 'NVIDIA A100',
    jobType: 'Fine-tuning',
    orchestrator: 'GKE',
    recentEvent: 'OOM error in training loop',
    reservation: 'asia-south-reservation4',
  },
  {
    id: 'job-lambda-555',
    name: 'GAN-Image-Generation',
    user: 'g.hopper',
    cluster: 'us-central-tpu-2',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '9h 15m',
    estimatedRemaining: '3h',
    gpuUtil: 90,
    tensorCoreUtil: 88,
    goodput: 94,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 1,
    downtime: '10m',
    submitted: 'Today, 07:00 AM',
    recentRun: 'run-gan-img-gen-4',
    accelerator: 'Google TPU v4',
    jobType: 'Training',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Checkpoint saved',
    reservation: 'iowa-central-reservation1',
  },
  {
    id: 'job-mu-666',
    name: 'Pathways-LLM-Inference',
    user: 'system',
    cluster: 'us-east-inf-1',
    status: JobStatus.RUNNING,
    priority: 'CRITICAL',
    duration: '30m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 70,
    tensorCoreUtil: 65,
    goodput: 99,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 PM',
    recentRun: 'run-pathways-prod-inf',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'Healthy',
    reservation: 'us-west-reservation2',
  },
  {
    id: 'job-nu-777',
    name: 'Reinforcement-Learning-Sim',
    user: 'r.feinman',
    cluster: 'eu-central-gpu-2',
    status: JobStatus.INTERRUPTED,
    priority: 'HIGH',
    duration: '18h 40m',
    gpuUtil: 88,
    tensorCoreUtil: 82,
    goodput: 85,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '20m',
    submitted: 'Yesterday, 08:00 PM',
    recentRun: 'run-rl-sim-alpha',
    accelerator: 'NVIDIA H100',
    jobType: 'Simulation',
    orchestrator: 'Slurm',
    recentEvent: 'Job paused by user',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-xi-888',
    name: 'MoE-Sparse-Training',
    user: 's.hawking',
    cluster: 'us-west-training-v4',
    status: JobStatus.HANGING,
    priority: 'CRITICAL',
    duration: '2h 10m',
    estimatedRemaining: 'Unknown',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 5,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '1h 30m',
    submitted: 'Today, 02:00 PM',
    recentRun: 'run-moe-sparse-iter2',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'Slurm',
    recentEvent: 'Deadlock in NCCL communication',
    reservation: 'asia-south-reservation4',
  }
];

// Simulated historical data for sparklines
const activeJobsHistory = [42, 45, 48, 46, 50, 52, 49, 55, 58, 57];
const interruptionsHistory = [5, 3, 6, 2, 1, 0, 2, 4, 1, 0];

// Helper to convert "duration string" like "4h 12m" to minutes
const parseDurationToMinutes = (dur: string): number => {
  if (!dur || dur === '-') return 0;
  let minutes = 0;
  const hMatch = dur.match(/(\d+)h/);
  const mMatch = dur.match(/(\d+)m/);
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  return minutes;
};

// Helper to estimate chip usage per job accelerator
const getChipCountForJob = (job: Job): number => {
  if (job.status === JobStatus.QUEUED) return 0;
  if (job.accelerator?.includes('H100')) return 8; // e.g. 1 node
  if (job.accelerator?.includes('A100')) return 8;
  if (job.accelerator?.includes('TPU v4')) return 4; // e.g. small slice
  if (job.accelerator?.includes('TPU v5p')) return 4;
  if (job.accelerator?.includes('T4')) return 1;
  return 1;
};

// Helper to parse mock date strings into approximate "hours ago"
const parseTimeAgo = (submitted: string): number => {
  // Assume "Today" is 4:00 PM (16:00) for simulation context
  const CURRENT_HOUR_24 = 16;
  
  if (submitted.includes("Today")) {
    const match = submitted.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return 0;
    let [_, h, m, p] = match;
    let hour = parseInt(h);
    if (p === 'PM' && hour !== 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    
    // Difference from current time (16:00)
    return Math.max(0, CURRENT_HOUR_24 - hour);
  } else if (submitted.includes("Yesterday")) {
    const match = submitted.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return 24;
    let [_, h, m, p] = match;
    let hour = parseInt(h);
    if (p === 'PM' && hour !== 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    
    // Yesterday means 24h + (current time - yesterday time)
    // Actually, simply: (24 - hour) + CURRENT_HOUR_24
    return (24 - hour) + CURRENT_HOUR_24;
  }
  return 48; // Default "old"
};

const getMockSparklineData = (val: number) => {
  if (val === 0) return [0, 0, 0, 0, 0, 0];
  return [val - 5, val + 2, val - 3, val + 5, val - 2, val];
};

// --- COMPONENTS ---



// Rainbow Banner Component
const RainbowBanner: React.FC = () => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div 
      className="w-full h-[60px] flex items-center justify-center text-lg font-bold text-white mb-4 rounded-md shadow-md"
      style={{ background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)' }}
    >
      🌈 This page is a work of progress (as of {dateStr})
    </div>
  );
};

// Navigation Structure
const NAV_GROUPS = [
  {
    title: 'Monitor and optimize',
    id: 'monitor',
    items: [
      { label: 'Fleet efficiency', id: 'fleet', icon: BarChart3 },
      { label: 'Jobs', id: 'jobs', icon: LayoutGrid },
      { label: 'Cost and capacity', id: 'cost', icon: TrendingUp },
    ]
  },
  {
    title: 'Tools',
    id: 'tools',
    items: [
      { label: 'Diagnostics', id: 'diagnostics', icon: Activity },
      { label: 'Bill of health', id: 'health', icon: AlertCircle }
    ]
  },
  {
    title: 'Solutions',
    id: 'solutions',
    items: [
      { label: 'Cluster director', id: 'director', icon: Server },
      { label: 'Google Kubernetes Engine', id: 'gke', icon: Box },
      { label: 'Batch', id: 'batch', icon: Layers }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  // View state controls sub-views within tabs (e.g. List vs Detail)
  const [view, setView] = useState<'dashboard' | 'diagnostics' | 'diagnostics-list' | 'cluster-detail' | 'reservation-detail' | 'fleet-detail'>('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'monitor': true,
    'tools': true,
    'solutions': true
  });
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Local filter state for Overview page Active Jobs table
  const [overviewJobSearch, setOverviewJobSearch] = useState('');

  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
  const [investigateRequest, setInvestigateRequest] = useState<{ type: string; ts: number } | null>(null);
  const [fleetResetKey, setFleetResetKey] = useState(0);

  // Global Scope Filters
  const [filters, setFilters] = useState<DashboardFilters>({
    accelerator: 'All',
    jobType: 'All',
    orchestrator: 'All',
    timeRange: 'Last 24 hours',
    reservation: 'All'
  });
  
  // Scenario State
  const [scenarioActive, setScenarioActive] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIOS[0].id);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  
  // Screen Capture State
  const [autoCapture, setAutoCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Menu State
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Derived Lists & Metrics
  const jobsInScope = useMemo(() => {
    return MOCK_JOBS.filter(job => {
      // Accelerator Filter
      let matchAccelerator = false;
      if (filters.accelerator === 'All') {
        matchAccelerator = true;
      } else if (filters.accelerator === 'TPUs') {
        matchAccelerator = job.accelerator?.includes('TPU') || false;
      } else if (filters.accelerator === 'GPUs') {
        matchAccelerator = job.accelerator?.includes('NVIDIA') || false;
      }

      // Job Type Filter
      let matchJobType = false;
      if (filters.jobType === 'All') {
        matchJobType = true;
      } else if (filters.jobType === 'Training') {
        matchJobType = ['LLM Training', 'Training', 'Fine-tuning'].includes(job.jobType || '');
      } else if (filters.jobType === 'Inference') {
        matchJobType = job.jobType === 'Inference';
      }

      // Orchestrator Filter
      let matchOrchestrator = false;
      if (filters.orchestrator === 'All') {
        matchOrchestrator = true;
      } else if (filters.orchestrator === 'Google Kubernetes Engine') {
        matchOrchestrator = job.orchestrator?.includes('GKE') || false;
      } else if (filters.orchestrator === 'Slurm') {
        matchOrchestrator = job.orchestrator === 'Slurm';
      } else if (filters.orchestrator === 'Custom') {
        matchOrchestrator = job.orchestrator === 'Ray';
      } else {
        matchOrchestrator = job.orchestrator === filters.orchestrator;
      }
      
      // Time Range Filter
      let matchTime = true;
      if (filters.timeRange !== 'All time') {
        const hoursAgo = parseTimeAgo(job.submitted);
        if (filters.timeRange === 'Last 1 hour') matchTime = hoursAgo <= 1;
        else if (filters.timeRange === 'Last 12 hours') matchTime = hoursAgo <= 12;
        else if (filters.timeRange === 'Last 24 hours') matchTime = hoursAgo <= 24;
        else if (filters.timeRange === 'Last 7 days') matchTime = hoursAgo <= 168;
      }

      const matchReservation = filters.reservation === 'All' || job.reservation === filters.reservation;

      return matchAccelerator && matchJobType && matchOrchestrator && matchTime && matchReservation;
    });
  }, [filters]);

  const filteredJobs = useMemo(() => {
    let jobs = jobsInScope;
    
    if (filterStatus !== 'ALL') {
        jobs = jobs.filter(j => j.status === filterStatus);
    }

    return jobs.filter(job => 
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobsInScope, searchTerm, filterStatus]);

  // Specific filtered list for Overview Active Jobs table
    const overviewJobsTable = useTable<Job>({
    initialData: jobsInScope,
    initialSortColumn: 'recentEvent',
    initialSortDirection: 'desc',
  });

  const overviewFilteredJobs = useMemo(() => {
    if (!overviewJobSearch) return jobsInScope;
    const lower = overviewJobSearch.toLowerCase();
    return jobsInScope.filter(j => 
      j.name.toLowerCase().includes(lower) ||
      j.id.toLowerCase().includes(lower) ||
      j.cluster.toLowerCase().includes(lower) ||
      (j.orchestrator || '').toLowerCase().includes(lower)
    );
  }, [jobsInScope, overviewJobSearch]);


  // Calculations for StatCards
  const activeJobsCount = jobsInScope.filter(j => j.status === JobStatus.RUNNING).length;
  const activeGkeJobsCount = jobsInScope.filter(j => j.status === JobStatus.RUNNING && j.orchestrator?.includes('GKE')).length;
  const activeSlurmJobsCount = jobsInScope.filter(j => j.status === JobStatus.RUNNING && j.orchestrator === 'Slurm').length;
  
  const queuedJobsCount = jobsInScope.filter(j => j.status === JobStatus.QUEUED).length;
  
  // 1. Total Active Jobs
  const statActiveJobs = activeJobsCount;

  // 2. Avg Training Goodput
  const trainingJobs = jobsInScope.filter(j => j.status === JobStatus.RUNNING && ['LLM Training', 'Training', 'Fine-tuning'].includes(j.jobType || ''));
  const statAvgGoodput = Math.round(trainingJobs.reduce((acc, curr) => acc + curr.goodput, 0) / (trainingJobs.length || 1));

  // 3. Total Active Chips
  const statActiveChips = jobsInScope.reduce((acc, curr) => acc + getChipCountForJob(curr), 0);

  // 4. Total Available Chips
  const TOTAL_COMMITTED_CHIPS = 5000;
  const statAvailableChips = Math.max(0, TOTAL_COMMITTED_CHIPS - statActiveChips);

  // 5. Avg Interruptions Count
  // Averaging over all non-queued jobs in scope
  const jobsStarted = jobsInScope.filter(j => j.status !== JobStatus.QUEUED);
  const totalInterruptions = jobsInScope.reduce((acc, curr) => acc + curr.interruptions, 0);
  const statAvgInterruptions = jobsStarted.length ? (totalInterruptions / jobsStarted.length).toFixed(1) : "0.0";

  // 6. Avg MTBI (Mean Time Between Interruptions)
  // Total Runtime / Total Interruptions
  const totalRuntimeMinutes = jobsInScope.reduce((acc, curr) => acc + parseDurationToMinutes(curr.duration), 0);
  // Avoid division by zero
  const statMTBI = totalInterruptions > 0 
    ? Math.round((totalRuntimeMinutes / 60) / totalInterruptions) + "h"
    : (totalRuntimeMinutes / 60).toFixed(1) + "h";

  // 7. Avg Chip Utilization (Tensor Core)
  const runningJobs = jobsInScope.filter(j => j.status === JobStatus.RUNNING);
  const statAvgChipUtil = Math.round(runningJobs.reduce((acc, j) => acc + j.tensorCoreUtil, 0) / (runningJobs.length || 1));

  // 8. Number of Unhealthy Nodes
  const jobBadNodes = jobsInScope.reduce((acc, j) => acc + j.badNodes.length, 0);
  // Add a base line of infra bad nodes (e.g. from ClusterTopology data, assumed 3-5)
  const statUnhealthyNodes = jobBadNodes + 3; 

  const avgGoodputGlobal = Math.round(jobsInScope.reduce((acc, curr) => acc + curr.goodput, 0) / (jobsInScope.length || 1));


  // Generate Critical Alerts for Overview
  const criticalAlerts = useMemo(() => {
    const alerts = [];
    
    // Job Alerts
    jobsInScope.forEach(job => {
      if (job.status === JobStatus.HANGING) {
        alerts.push({
          id: job.id,
          type: 'JOB',
          message: `Job ${job.name}`,
          detail: `Downtime: ${job.downtime} • Last heartbeat: 10m ago`,
          severity: 'HIGH',
          chipLabel: 'Hanging',
          action: () => handleViewJob(job)
        });
      } else if (job.status === JobStatus.FAILED) {
         alerts.push({
          id: job.id,
          type: 'JOB',
          message: `Job ${job.name}`,
          detail: `${job.badNodes.length} bad nodes detected`,
          severity: 'CRITICAL',
          chipLabel: 'Failed',
          action: () => handleViewJob(job)
        });
      }
    });

    // Mock Infra Alert (Only show if accelerators filter matches or is All)
    if (filters.accelerator === 'All' || filters.accelerator === 'GPUs') {
      alerts.push({
        id: 'infra-alert-1',
        type: 'INFRASTRUCTURE',
        message: 'Cluster us-west-train-v4 has 4 nodes',
        detail: 'PDU Failure in Rack 04',
        severity: 'CRITICAL',
        chipLabel: 'Offline',
        action: () => handleClusterClick('c1')
      });
    }

    return alerts.sort((a, b) => (a.severity === 'CRITICAL' ? -1 : 1));
  }, [jobsInScope, filters.accelerator]);

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('jobs'); 
    setView('diagnostics');
  };

  const handleViewRunDiagnostics = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('diagnostics');
    setView('diagnostics');
  };

  const handleClusterClick = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('director');
    setView('cluster-detail');
  };

  const handleViewClusterFleet = (clusterName: string) => {
     setActiveTab('fleet');
     setView('fleet-detail');
     setSelectedFleetId(clusterName);
     // Also set investigateRequest if needed for scenario tracking, but primarily rely on View state
     setInvestigateRequest({ type: clusterName, ts: Date.now() });
     document.querySelector('main')?.scrollTo(0, 0);
  };

  const handleReservationClick = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setActiveTab('cost');
    setView('reservation-detail');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedJob(null);
    setSelectedClusterId(null);
    setSelectedReservationId(null);
    setSelectedFleetId(null);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset view states when switching major tabs
    if (tabId === 'diagnostics') {
      setView('diagnostics-list');
      setSelectedJob(null);
    } else if (tabId !== 'jobs') { 
       setView('dashboard');
       setSelectedJob(null);
       setSelectedClusterId(null);
       setSelectedReservationId(null);
       setSelectedFleetId(null);
    }
    
    if (tabId === 'fleet') {
       setFleetResetKey(prev => prev + 1);
       setInvestigateRequest(null);
    }
  };

  // --- BREADCRUMBS ---
  const Breadcrumbs: React.FC = () => {
    const items = useMemo(() => {
        const list = [];
        // Root
        list.push({ id: 'home', label: 'Google Cloud', onClick: undefined });
        list.push({ id: 'chimera', label: 'chimera', onClick: undefined });

        // Group & Tab
        if (activeTab === 'overview') {
            list.push({ id: 'grp-infra', label: 'AI/ML Infrastructure', onClick: undefined });
            list.push({ id: 'overview', label: 'Overview', active: true });
            return list;
        }

        const group = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab));
        const tab = group?.items.find(i => i.id === activeTab);

        if (group) {
            list.push({ id: group.id, label: group.title, onClick: undefined });
        }
        
        if (tab) {
            const isDeep = view !== 'dashboard' && view !== 'diagnostics-list';
            list.push({ 
                id: tab.id, 
                label: tab.label, 
                onClick: isDeep ? () => handleTabChange(tab.id) : undefined,
                active: !isDeep
            });
        }

        // Deep Views
        if (view === 'diagnostics' && selectedJob) {
             list.push({ id: 'job-detail', label: selectedJob.name || selectedJob.id, active: true });
        }
        else if (view === 'cluster-detail' && selectedClusterId) {
             const region = REGIONS.find(r => r.clusters.some(c => c.id === selectedClusterId));
             const cluster = region?.clusters.find(c => c.id === selectedClusterId);
             list.push({ id: 'cluster-detail', label: cluster?.name || selectedClusterId, active: true });
        }
        else if (view === 'reservation-detail' && selectedReservationId) {
             list.push({ id: 'res-detail', label: selectedReservationId, active: true });
        }
        else if (view === 'fleet-detail' && selectedFleetId) {
             list.push({ id: 'fleet-detail', label: selectedFleetId, active: true });
        }

        return list;
    }, [activeTab, view, selectedJob, selectedClusterId, selectedReservationId, selectedFleetId]);

    return (
        <div className="border-b border-slate-200 px-4 py-2 bg-white flex items-center gap-1.5 text-xs text-slate-500 shadow-sm z-30 sticky top-0">
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={12} className="text-slate-300" />}
                    {item.active ? (
                        <span className="font-semibold text-slate-800">{item.label}</span>
                    ) : (
                        <span 
                            onClick={item.onClick} 
                            className={`font-medium ${item.onClick ? 'hover:text-[#1967D2] cursor-pointer transition-colors' : 'cursor-default'}`}
                        >
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
  };

  // --- SCREENSHOT LOGIC ---
  const handleScreenshot = async (customFilename?: string) => {
    if (isCapturing) return;
    setIsCapturing(true);
    setShowMoreMenu(false);
    
    // 1. Target main elements
    const mainElement = document.querySelector('main');
    const asideElement = document.querySelector('aside');
    const wrapperElement = mainElement?.parentElement;

    if (!mainElement || !asideElement || !wrapperElement) {
        setIsCapturing(false);
        return;
    }

    // 2. Save original styles
    const originalMainStyle = {
      overflow: mainElement.style.overflow,
      height: mainElement.style.height
    };
    const originalWrapperStyle = {
      overflow: wrapperElement.style.overflow,
      height: wrapperElement.style.height
    };
    const originalAsideStyle = {
      height: asideElement.style.height
    };

    // 3. Temporarily expand container to full height
    mainElement.style.overflow = 'visible';
    mainElement.style.height = 'auto';
    
    wrapperElement.style.overflow = 'visible';
    wrapperElement.style.height = 'auto';

    // 4. Force sidebar to match the full height of the content
    const fullHeight = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight,
      mainElement.scrollHeight
    );
    asideElement.style.height = `${fullHeight}px`;

    // 5. Scroll to top to ensure clean capture start
    window.scrollTo(0, 0);

    // Add a small delay to ensure layout repaint
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(document.body, {
          backgroundColor: '#f8fafc',
          scale: 2,
          useCORS: true,
          height: fullHeight, // Explicitly set height
          windowHeight: fullHeight // Ensure viewport matches
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = customFilename ? `${customFilename}.png` : `mle-dashboard-snapshot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("Screenshot failed:", e);
      } finally {
        // 6. Restore original styles
        mainElement.style.overflow = originalMainStyle.overflow;
        mainElement.style.height = originalMainStyle.height;
        
        wrapperElement.style.overflow = originalWrapperStyle.overflow;
        wrapperElement.style.height = originalWrapperStyle.height;

        asideElement.style.height = originalAsideStyle.height;
        
        setIsCapturing(false);
      }
    }, 500); // 500ms delay
  };

  const handleExportHtml = () => {
    setShowMoreMenu(false);
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mle-dashboard-export-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- SCENARIO LOGIC ---
  const startScenario = (id: string) => {
    setSelectedScenarioId(id);
    setScenarioActive(true);
    setScenarioStep(0);
    setActiveTab('overview');
    setView('dashboard');
    setSelectedJob(null);
    setShowScenarioMenu(false);
    setFilterStatus('ALL');
    setFilters({ accelerator: 'All', jobType: 'All', orchestrator: 'All', timeRange: 'All time' });
  };

  const handleScenarioNext = () => {
    const nextStep = scenarioStep + 1;
    setScenarioStep(nextStep);

    // AUTOMATION LOGIC
    if (selectedScenarioId === 'job-failure') {
        if (nextStep === 2) {
          setActiveTab('jobs');
          setView('dashboard');
          setSearchTerm('');
          setFilterStatus('ALL');
        } else if (nextStep === 3) {
          const hangingJob = MOCK_JOBS.find(j => j.status === JobStatus.HANGING);
          if (hangingJob) {
            setSelectedJob(hangingJob);
            setView('diagnostics');
          }
        }
    } 
    else if (selectedScenarioId === 'infra-failure') {
        if (nextStep === 1) {
          setActiveTab('fleet');
          setView('dashboard');
        } else if (nextStep === 2) {
          setInvestigateRequest({ type: 'NVIDIA H100', ts: Date.now() });
        } else if (nextStep === 4) {
           const job = MOCK_JOBS.find(j => j.id === 'job-hang-007');
           if (job) handleViewJob(job);
        }
    }
  };

  const handleScenarioPrev = () => {
    setScenarioStep(Math.max(0, scenarioStep - 1));
  };

  // Auto-capture on step change
  useEffect(() => {
    if (scenarioActive && autoCapture) {
      // Wait for route/view transitions animations to settle
      const timer = setTimeout(() => {
         const stepName = `scenario-${selectedScenarioId}-step-${scenarioStep + 1}`;
         handleScreenshot(stepName);
      }, 1200); // 1.2s delay to allow animations to finish
      return () => clearTimeout(timer);
    }
  }, [scenarioStep, scenarioActive, autoCapture, selectedScenarioId]);

  const activeScenarioDef = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  const hasIssues = (job: Job) => {
    return job.status === JobStatus.FAILED || 
           job.status === JobStatus.HANGING || 
           job.status === JobStatus.INTERRUPTED || 
           job.badNodes.length > 0;
  };

  // ... (renderOverviewContent and other render functions omitted for brevity as they haven't changed)
  const renderOverviewContent = () => (
    <div className="space-y-4 animate-fadeIn">
        <h1 className="text-xl font-bold text-slate-900">Overview</h1>
        <FilterBar filters={filters} setFilters={setFilters} />
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
             <h3 className="text-sm font-bold text-slate-900">Critical Alerts</h3>
             <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between bg-white p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow group ${
                    alert.severity === 'CRITICAL' 
                      ? 'border-l-rose-500 border-y border-r border-slate-200' 
                      : 'border-l-amber-500 border-y border-r border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                       {alert.severity === 'CRITICAL' ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {alert.message}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${alert.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          {alert.chipLabel}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{alert.detail}</p>
                    </div>
                  </div>
                  <button 
                    onClick={alert.action}
                    className="text-[10px] bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded font-medium transition-colors shadow-sm flex items-center gap-1"
                  >
                    Investigate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Executive Scorecard - 8 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Active Jobs */}
          <StatCard 
            label="Active jobs" 
            value={statActiveJobs} 
            trend="Stable"
            trendUp={true}
            onClick={() => {
               setFilterStatus(JobStatus.RUNNING);
               handleTabChange('jobs');
            }}
            tooltip="Total number of jobs currently in the RUNNING state."
          />

          {/* 2. Avg Training Goodput */}
          <StatCard 
            label="Avg training goodput" 
            value={`${statAvgGoodput}%`} 
            trend="+2.1%" 
            trendUp={true}
            onClick={() => {
                 setFilterStatus('ALL');
                 setFilters(prev => ({ ...prev, jobType: 'Training' }));
            }}
            tooltip="Average Model Goodput across all active training jobs."
          />

          {/* 3. Active Chips */}
          <StatCard 
            label="Active chips" 
            value={statActiveChips.toLocaleString()} 
            trend="High usage"
            trendUp={true}
            onClick={() => handleTabChange('fleet')}
            tooltip="Estimated total chips currently allocated to running jobs."
          />

          {/* 4. Available Chips */}
          <StatCard 
            label="Available chips" 
            value={statAvailableChips.toLocaleString()} 
            trend={statAvailableChips < 500 ? "Low Capacity" : "Available"}
            trendUp={statAvailableChips > 500}
            onClick={() => handleTabChange('fleet')}
            tooltip="Total chips committed minus active chips."
          />

          {/* 5. Avg Interruptions */}
          <StatCard 
            label="Avg interruptions" 
            value={statAvgInterruptions} 
            trend="-0.2" 
            trendUp={true}
            tooltip="Average number of interruptions per job."
          />

          {/* 6. Mean Time Between Interruptions */}
          <StatCard 
            label="Avg MTBI" 
            value={statMTBI} 
            trend="Improved"
            trendUp={true}
            tooltip="Mean Time Between Interruptions (Total Runtime / Total Interruptions)."
          />

          {/* 7. Avg Chip Utilization */}
          <StatCard 
            label="Avg chip utilization" 
            value={`${statAvgChipUtil}%`} 
            trend="+1.5%" 
            trendUp={true}
            tooltip="Average TensorCore utilization across all running jobs."
          />

          {/* 8. Unhealthy Nodes */}
          <StatCard 
            label="Unhealthy nodes" 
            value={statUnhealthyNodes} 
            trend="+1" 
            trendUp={false}
            onClick={() => handleTabChange('health')}
            tooltip="Count of nodes marked as unhealthy or failed."
          />
        </div>

        {/* Project Topology */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm font-bold text-slate-900">Project topology</h3>
             <button onClick={() => handleTabChange('director')} className="text-xs text-[#1967D2] hover:text-[#1557B0] font-medium flex items-center gap-1">
               View cluster director <ArrowRight size={12} />
             </button>
          </div>
          <Card className="bg-slate-50/50">
            <ClusterTopology onClusterClick={handleClusterClick} jobs={jobsInScope} />
          </Card>
        </div>
        
        {/* Jobs */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm font-bold text-slate-900">Active jobs</h3>
             <button onClick={() => handleTabChange('jobs')} className="text-xs text-[#1967D2] hover:text-[#1557B0] font-medium flex items-center gap-1">
               View all jobs <ArrowRight size={12} />
             </button>
          </div>
          <Card className="overflow-hidden !p-0">
             <div className="px-4 py-2 border-b border-slate-100 flex justify-end bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input 
                    type="text" 
                    placeholder="Filter by name, cluster, orchestrator..." 
                    value={overviewJobSearch}
                    onChange={(e) => setOverviewJobSearch(e.target.value)}
                    className="w-56 bg-white border border-slate-300 text-slate-700 pl-8 pr-3 py-1 rounded-md text-xs focus:outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] shadow-sm transition-all"
                  />
                </div>
             </div>
             <div>
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <TableHeader label="Job name" tooltip="Unique identifier." />
                      <TableHeader label="Most recent run" tooltip="Latest execution run." />
                      <TableHeader label="Cluster" tooltip="Compute cluster." />
                      <TableHeader label="Duration" tooltip="Time elapsed." />
                      <TableHeader label="Orchestrator" tooltip="Job scheduler." />
                      <TableHeader label="Chips" tooltip="Number of accelerators." />
                      <TableHeader label="TensorCore %" tooltip="Utilization." />
                      <TableHeader label="Interruptions" tooltip="Count of involuntary evictions." />
                      <TableHeader label="Action" tooltip="View deep diagnostics." />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {overviewFilteredJobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => handleViewJob(job)}
                            className="font-medium text-[#1967D2] hover:underline text-left block"
                          >
                            {job.name}
                          </button>
                          <div className="text-[10px] text-slate-500">{job.id}</div>
                        </td>
                        <td className="px-4 py-2 font-mono text-[11px]">
                          {job.recentRun ? (
                            <button 
                              onClick={() => handleViewRunDiagnostics(job)}
                              className="text-[#1967D2] hover:underline text-left"
                            >
                              {job.recentRun}
                            </button>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Server size={10} className="text-slate-400" />
                            <button
                              onClick={() => handleViewClusterFleet(job.cluster)}
                              className="hover:text-[#1967D2] hover:underline text-left"
                            >
                              {job.cluster}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-600">{job.duration}</td>
                        <td className="px-4 py-2 text-slate-600">{job.orchestrator}</td>
                        <td className="px-4 py-2 text-slate-600">{getChipCountForJob(job)}</td>
                        <td className="px-4 py-2">
                           {job.tensorCoreUtil > 0 ? (
                             <div className="flex items-center gap-2">
                               <span className="font-mono text-slate-700 w-6 text-right">{job.tensorCoreUtil}%</span>
                               <div className="w-12">
                                 <Sparkline data={getMockSparklineData(job.tensorCoreUtil)} color={job.tensorCoreUtil > 80 ? "#10b981" : "#f59e0b"} />
                               </div>
                             </div>
                           ) : '-'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{job.interruptions}</td>
                        <td className="px-4 py-2">
                           {hasIssues(job) && (
                            <button onClick={() => handleViewJob(job)} className="text-[10px] bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded font-medium transition-colors shadow-sm flex items-center gap-1">
                             Investigate
                           </button>
                           )}
                        </td>
                      </tr>
                    ))}
                    {overviewFilteredJobs.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-500 text-xs">
                          No jobs match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
             {jobsInScope.length > 5 && !overviewJobSearch && (
                <div className="p-2 border-t border-slate-200 bg-slate-50 text-center">
                   <button onClick={() => handleTabChange('jobs')} className="text-[10px] font-bold text-slate-500 hover:text-[#1967D2]">
                     + {jobsInScope.length - 5} more jobs
                   </button>
                </div>
             )}
          </Card>
        </div>

        {/* Accelerators */}
        <div>
           <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm font-bold text-slate-900">Fleet utilization</h3>
             <button onClick={() => handleTabChange('fleet')} className="text-xs text-[#1967D2] hover:text-[#1557B0] font-medium flex items-center gap-1">
               View fleet efficiency <ArrowRight size={12} />
             </button>
          </div>
           <Card className="overflow-hidden !p-0">
              <ProjectAcceleratorsTable 
                filters={filters}
                showAll={true}
                onInvestigate={(type) => {
                  setInvestigateRequest({ type, ts: Date.now() });
                  handleTabChange('fleet');
                }}
                onReservationClick={handleReservationClick}
                onViewDetail={(id) => {
                   setActiveTab('fleet');
                   setView('fleet-detail');
                   setSelectedFleetId(id);
                   document.querySelector('main')?.scrollTo(0, 0);
                }}
              />
           </Card>
        </div>
    </div>
  );

  const renderCostCapacityContent = () => {
    if (view === 'reservation-detail' && selectedReservationId) {
      return (
        <ReservationDetail 
          reservationId={selectedReservationId}
          onBack={handleBack}
        />
      );
    }

    return (
      <div className="space-y-4 animate-fadeIn">
          <RainbowBanner />
          <h1 className="text-xl font-bold text-slate-900">Cost and capacity</h1>
          <FilterBar filters={filters} setFilters={setFilters} />
      </div>
    );
  };

  // 3. JOBS CONTENT
  const renderJobsContent = () => {
    // If we're in "Diagnostics" tab (sidebar)
    if (activeTab === 'diagnostics') {
       if (view === 'diagnostics' && selectedJob) {
          // Show the new "Diagnostics Details" page
          return <DiagnosticsPanel job={selectedJob} onBack={() => setView('diagnostics-list')} />;
       }
       // Default to the new "Runs" list
       return (
         <DiagnosticsRuns 
           onRunClick={(jobStub) => {
             // For the demo, ensure we have a full job object if possible, or use the stub
             const fullJob = MOCK_JOBS.find(j => j.id === jobStub.id) || { ...MOCK_JOBS[0], ...jobStub };
             setSelectedJob(fullJob as Job);
             setView('diagnostics');
           }} 
           onJobClick={(jobName) => {
             // Find full job by name or stub it
             const fullJob = MOCK_JOBS.find(j => j.name === jobName) || MOCK_JOBS[0];
             handleViewJob(fullJob);
           }}
         />
       );
    }

    // Standard Jobs > Diagnostics flow
    if (view === 'diagnostics' && selectedJob) {
      return (
        <JobDetail 
          job={selectedJob} 
          onBack={handleBack} 
          onViewDiagnostics={() => {
              setActiveTab('diagnostics');
              setView('diagnostics');
          }}
        />
      );
    }

    // Default Jobs Dashboard
    return (
      <div className="space-y-4 animate-fadeIn">
          <h1 className="text-xl font-bold text-slate-900">Jobs</h1>
          <FilterBar filters={filters} setFilters={setFilters} />
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard 
               label="Active GKE jobs" 
               value={activeGkeJobsCount} 
               trend="Stable"
               trendUp={true}
               onClick={() => {
                 setFilterStatus(JobStatus.RUNNING);
                 setFilters(prev => ({ ...prev, orchestrator: 'Google Kubernetes Engine' }));
               }}
               tooltip="Running jobs managed by GKE."
             />
             <StatCard 
               label="Active Slurm jobs" 
               value={activeSlurmJobsCount} 
               trend="Low usage"
               trendUp={false}
               onClick={() => {
                 setFilterStatus(JobStatus.RUNNING);
                 setFilters(prev => ({ ...prev, orchestrator: 'Slurm' }));
               }}
               tooltip="Running jobs managed by Slurm."
             />
             <StatCard 
               label="Avg training goodput" 
               value={`${statAvgGoodput}%`} 
               trend="+2.1%" 
               trendUp={true}
               onClick={() => {
                 setFilterStatus(JobStatus.RUNNING);
                 setFilters(prev => ({ ...prev, jobType: 'Training' }));
               }}
               tooltip="Average Model Goodput across all active training jobs."
             />
             <StatCard 
               label="Total interruptions" 
               value={totalInterruptions} 
               trend="-1" 
               trendUp={true}
               onClick={() => setFilterStatus(JobStatus.INTERRUPTED)}
               tooltip="Aggregate count of involuntary job terminations (preemptions, hardware failures) in past 24h."
             />
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title="Overall training goodput" className="lg:col-span-2">
                <GoodputChart timeRange={filters.timeRange} />
            </Card>

            <Card title={`Job interruptions by ${filters.timeRange}`}>
               <InterruptionsChart timeRange={filters.timeRange} />
            </Card>
          </div>

          {/* Combined All Jobs Table */}
          <div className="space-y-3 mt-1">
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-3">
                <div className="flex items-center gap-2">
                   <h2 className="text-lg font-bold text-slate-900">Job status</h2>
                   {filterStatus !== 'ALL' && (
                     <button 
                       onClick={() => setFilterStatus('ALL')}
                       className="text-[10px] bg-[#1967D2]/20 text-[#1967D2] px-1.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-[#1967D2]/30 transition-colors font-medium"
                     >
                       Filter: {filterStatus} <X size={10} />
                     </button>
                   )}
                </div>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search jobs, users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-56 bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 rounded-md text-xs focus:outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] shadow-sm"
                  />
                </div>
             </div>

             <Card className="overflow-hidden !p-0">
              <div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <TableHeader label="Job name" tooltip="Unique identifier." />
                      <TableHeader label="Most recent run" tooltip="Latest execution run." />
                      <TableHeader label="Cluster" tooltip="Compute cluster." />
                      <TableHeader label="Duration" tooltip="Time elapsed." />
                      <TableHeader label="Orchestrator" tooltip="Job scheduler." />
                      <TableHeader label="Chips" tooltip="Number of accelerators." />
                      <TableHeader label="TensorCore %" tooltip="Utilization." />
                      <TableHeader label="Interruptions" tooltip="Count of involuntary evictions." />
                      <TableHeader label="Action" tooltip="View deep diagnostics." />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => handleViewJob(job)}
                            className="font-medium text-[#1967D2] hover:underline text-left block"
                          >
                            {job.name}
                          </button>
                          <div className="text-[10px] text-slate-500">{job.id}</div>
                        </td>
                        <td className="px-4 py-2 font-mono text-[11px]">
                          {job.recentRun ? (
                            <button 
                              onClick={() => handleViewRunDiagnostics(job)}
                              className="text-[#1967D2] hover:underline text-left"
                            >
                              {job.recentRun}
                            </button>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Server size={10} className="text-slate-400" />
                            <button
                              onClick={() => handleViewClusterFleet(job.cluster)}
                              className="hover:text-[#1967D2] hover:underline text-left"
                            >
                              {job.cluster}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-600">{job.duration}</td>
                        <td className="px-4 py-2 text-slate-600">{job.orchestrator}</td>
                        <td className="px-4 py-2 text-slate-600">{getChipCountForJob(job)}</td>
                        <td className="px-4 py-2">
                           {job.tensorCoreUtil > 0 ? (
                             <div className="flex items-center gap-2">
                               <span className="font-mono text-slate-700 w-6 text-right">{job.tensorCoreUtil}%</span>
                               <div className="w-12">
                                 <Sparkline data={getMockSparklineData(job.tensorCoreUtil)} color={job.tensorCoreUtil > 80 ? "#10b981" : "#f59e0b"} />
                               </div>
                             </div>
                           ) : '-'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{job.interruptions}</td>
                        <td className="px-4 py-2">
                           {hasIssues(job) && (
                            <button onClick={() => handleViewJob(job)} className="text-[10px] bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded font-medium transition-colors shadow-sm flex items-center gap-1">
                             Investigate
                           </button>
                           )}
                        </td>
                      </tr>
                    ))}
                    {filteredJobs.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-500 text-xs">
                          No jobs match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
             </Card>
          </div>
      </div>
    );
  };

  // ... (Header and layout logic remains the same)
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* ... (Header preserved) ... */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 relative z-40 shadow-sm">
        <div className="flex items-center gap-3">
           <button className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
              <Menu size={18} />
           </button>
           <div className="flex items-center gap-2 pr-4 border-r border-slate-200 h-6">
              <span className="text-base font-medium text-slate-600 flex items-center gap-1">
                 <span className="font-bold text-slate-800">Google</span> Cloud
              </span>
           </div>
           <button className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 transition-colors">
              <Layers size={12} className="text-slate-500" />
              <span>chimera</span>
              <ChevronDown size={12} className="text-slate-400" />
           </button>
        </div>

        <div className="flex-1 max-w-xl px-6 hidden md:block">
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                 <Search size={14} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-[#1967D2] focus:border-[#1967D2] text-xs transition-shadow shadow-inner" 
                placeholder="Search for resources, docs, products and more" 
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                 <div className="text-slate-400 text-[10px] border border-slate-200 px-1 py-0.5 rounded bg-white">/</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-1.5">
           <div className="relative mr-1">
              <button 
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className={`p-1.5 rounded-full transition-colors ${
                  scenarioActive ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Run Scenario"
              >
                <Play size={18} className={scenarioActive ? "fill-[#1967D2]" : ""} />
              </button>
              
              {showScenarioMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-fadeIn">
                   <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Scenario</div>
                   {SCENARIOS.map(scenario => (
                     <button 
                       key={scenario.id}
                       onClick={() => startScenario(scenario.id)}
                       className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                     >
                        <div className="font-bold text-slate-800 text-xs">{scenario.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{scenario.description}</div>
                     </button>
                   ))}
                </div>
              )}
           </div>

           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Terminal size={18} />
           </button>
           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={18} />
           </button>
           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <HelpCircle size={18} />
           </button>
           
           {/* More Menu (Dropdown) */}
           <div className="relative">
             <button 
               onClick={() => setShowMoreMenu(!showMoreMenu)}
               className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
             >
                <MoreVertical size={18} />
             </button>
             {showMoreMenu && (
               <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-fadeIn">
                 <button 
                   onClick={() => handleScreenshot()}
                   className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2"
                 >
                   <Camera size={14} /> Take screenshot
                 </button>
                 <button 
                   onClick={handleExportHtml}
                   className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2"
                 >
                   <Download size={14} /> Export as HTML
                 </button>
               </div>
             )}
           </div>

           <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold ml-1 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500 transition-all">
              SW
           </div>
        </div>
      </header>

      {/* --- BREADCRUMBS --- */}
      <Breadcrumbs />

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
           <div className="p-3">
              <div className="flex items-center gap-2 mb-3 px-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI/ML Infrastructure</div>
                 <span className="bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">NEW</span>
              </div>
              
              <nav className="space-y-3">
                 {/* Overview Standalone */}
                 <button 
                    onClick={() => handleTabChange('overview')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border-l-2 ${
                      activeTab === 'overview' 
                        ? 'bg-[#1967D2]/10 text-[#1967D2] border-[#1967D2]' 
                        : 'text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <span>Overview</span>
                  </button>

                {NAV_GROUPS.map(group => (
                  <div key={group.id}>
                    <button 
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded transition-colors"
                    >
                      <span>{group.title}</span>
                      {expandedMenus[group.id] ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                    </button>
                    
                    {expandedMenus[group.id] && (
                      <div className="mt-0.5 space-y-0.5 pl-2">
                        {group.items.map(item => (
                          <button 
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border-l-2 ${
                              activeTab === item.id 
                                ? 'bg-[#1967D2]/10 text-[#1967D2] border-[#1967D2]' 
                                : 'text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-300'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 scroll-smooth">
          <div className="max-w-7xl">
            {activeTab === 'overview' && renderOverviewContent()}
            {activeTab === 'cost' && renderCostCapacityContent()}
            
            {(activeTab === 'jobs' || activeTab === 'diagnostics') && renderJobsContent()}
            
            {activeTab === 'fleet' && (
              <>
                {view === 'fleet-detail' && selectedFleetId ? (
                   <FleetEfficiencyDetail 
                     sliceId={selectedFleetId} 
                     onBack={() => { setView('dashboard'); setSelectedFleetId(null); }} 
                     onNavigateToJob={handleViewJob as any}
                   />
                ) : (
                  <FleetDashboard 
                    key={fleetResetKey}
                    onNavigateToJobs={(jobId) => {
                      if (jobId) {
                         const job = MOCK_JOBS.find(j => j.id === jobId);
                         if (job) {
                           handleViewJob(job);
                           return;
                         }
                      }
                      handleTabChange('jobs');
                    }} 
                    investigateRequest={investigateRequest} 
                    filters={filters}
                    setFilters={setFilters}
                    onReservationClick={handleReservationClick}
                    onViewDetail={(type) => {
                       setView('fleet-detail');
                       setSelectedFleetId(type + ' Cluster Group');
                    }}
                  />
                )}
              </>
            )}

            {/* Cluster Director View - NEW UI */}
            {activeTab === 'director' && (
               <div className="space-y-4 animate-fadeIn">
                  {view === 'cluster-detail' && selectedClusterId ? (
                     <ClusterDetail 
                       clusterId={selectedClusterId}
                       onBack={() => {
                         setView('dashboard');
                         setSelectedClusterId(null);
                       }}
                       jobs={jobsInScope}
                       onViewJob={handleViewJob}
                       onNavigateToJobs={() => handleTabChange('jobs')}
                     />
                  ) : (
                     <ClusterDirectorV2 /> 
                  )}
               </div>
            )}

            {/* Health View */}
            {activeTab === 'health' && (
              <div className="flex flex-col animate-fadeIn space-y-4">
                 <RainbowBanner />
                 <h1 className="text-xl font-bold text-slate-900">Bill of health</h1>
                 <FilterBar filters={filters} setFilters={setFilters} />
              </div>
            )}
            
            {/* GKE View: Placeholder */}
            {activeTab === 'gke' && (
              <div className="flex flex-col animate-fadeIn space-y-4">
                 <RainbowBanner />
                 <h1 className="text-xl font-bold text-slate-900">Google Kubernetes Engine</h1>
                 <FilterBar filters={filters} setFilters={setFilters} />
                 <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg text-sm">
                    GKE Cluster view coming soon.
                 </div>
              </div>
            )}

            {/* Batch View: Placeholder */}
            {activeTab === 'batch' && (
              <div className="flex flex-col animate-fadeIn space-y-4">
                 <RainbowBanner />
                 <h1 className="text-xl font-bold text-slate-900">Google Cloud Batch</h1>
                 <FilterBar filters={filters} setFilters={setFilters} />
                 <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg text-sm">
                    Batch view coming soon.
                 </div>
              </div>
            )}

            {/* Scenario Overlay */}
            {scenarioActive && (
               <ScenarioGuide 
                 scenario={activeScenarioDef} 
                 step={scenarioStep}
                 onNext={handleScenarioNext}
                 onPrev={handleScenarioPrev}
                 onClose={() => setScenarioActive(false)}
                 autoCapture={autoCapture}
                 onToggleAutoCapture={() => setAutoCapture(!autoCapture)}
                 isCapturing={isCapturing}
               />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
