import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ─── Custom Nodes ─────────────────────────────────────────────────────────────

// 1. Page Node (Screen)
const PageNode = ({ data }: { data: { label: string; description?: string } }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-md bg-[#0a1628] border-2 border-[#d4a574] min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-[#d4a574] !w-3 !h-3" />
      <div className="flex flex-col items-center text-center">
        <div className="text-xs uppercase tracking-widest text-[#d4a574] mb-1">Screen</div>
        <div className="text-sm font-bold text-white">{data.label}</div>
        {data.description && (
          <div className="text-[10px] text-slate-400 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#d4a574] !w-3 !h-3" />
    </div>
  );
};

// 2. Action Node (Button / Interaction)
const ActionNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="px-3 py-2 rounded-full bg-[#1e293b] border border-[#64748b] shadow-sm min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-[#64748b]" />
      <div className="text-xs font-semibold text-center text-white">
        <span className="text-[#94a3b8] mr-1">Click:</span>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#64748b]" />
    </div>
  );
};

// 3. Decision Node (Condition / Logic)
const DecisionNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="relative flex items-center justify-center w-[140px] h-[80px]">
       <Handle type="target" position={Position.Top} className="!bg-[#d4a574] !top-[4px]" />
       {/* Diamond Shape using CSS rotation */}
       <div className="absolute w-[100px] h-[100px] bg-[#0f172a] border border-[#d4a574] rotate-45 -z-10 rounded-sm"></div>
       <div className="text-[11px] font-medium text-center text-[#d4a574] px-2 leading-tight z-10">
         {data.label}
       </div>
       <Handle type="source" position={Position.Bottom} id="true" className="!bg-[#10b981] !bottom-[4px]" />
       <Handle type="source" position={Position.Right} id="false" className="!bg-[#ef4444] !right-[20px]" />
    </div>
  );
};

// 4. Data Node (Backend / State)
const DataNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="px-3 py-2 border-l-4 border-[#d4a574] bg-[#0f172a]/50 text-slate-300 text-xs font-mono">
      <Handle type="target" position={Position.Top} className="!bg-[#d4a574]" />
      <div className="flex items-center gap-2">
        <span className="text-[#d4a574]">DATABASE:</span>
        {data.label}
      </div>
    </div>
  );
};

const nodeTypes = {
  page: PageNode,
  action: ActionNode,
  decision: DecisionNode,
  data: DataNode,
  // fallback for cached nodes to prevent crash
  custom: PageNode,
};

// ─── Flow Data ───────────────────────────────────────────────────────────────

const initialNodes: Node[] = [
  // ─── AUTH FLOW ───
  { id: 'p-landing', type: 'page', position: { x: 250, y: 0 }, data: { label: 'Landing Page' } },
  
  { id: 'a-login', type: 'action', position: { x: 280, y: 100 }, data: { label: '"Instructor Login"' } },
  
  { id: 'p-invite', type: 'page', position: { x: 250, y: 180 }, data: { label: 'Invite Login', description: '/invite/instructor' } },
  
  { id: 'a-submit-email', type: 'action', position: { x: 280, y: 280 }, data: { label: '"Continue"' } },
  
  { id: 'd-email-valid', type: 'decision', position: { x: 270, y: 360 }, data: { label: 'Is Email Valid?' } },
  
  { id: 'p-error', type: 'page', position: { x: 500, y: 380 }, data: { label: 'Error Page', description: 'Invalid Invite' } },
  
  { id: 'p-setup', type: 'page', position: { x: 250, y: 480 }, data: { label: 'Account Setup', description: 'Set Password' } },

  { id: 'a-save-profile', type: 'action', position: { x: 280, y: 580 }, data: { label: '"Create Account"' } },

  // ─── DASHBOARD HUB ───
  { id: 'p-dashboard', type: 'page', position: { x: 250, y: 700 }, data: { label: 'Dashboard', description: 'Home' } },

  // ─── ASSIGNMENT CREATION FLOW ───
  { id: 'a-nav-assign', type: 'action', position: { x: 0, y: 720 }, data: { label: 'Nav: "Assignments"' } },
  
  { id: 'p-assign-list', type: 'page', position: { x: -200, y: 800 }, data: { label: 'Assignments List' } },
  
  { id: 'a-create-btn', type: 'action', position: { x: -200, y: 900 }, data: { label: '"Create Assignment"' } },
  
  { id: 'p-create-form', type: 'page', position: { x: -200, y: 980 }, data: { label: 'Creation Form', description: 'Title, Date, Content' } },
  
  { id: 'a-save-assign', type: 'action', position: { x: -200, y: 1080 }, data: { label: '"Save & Publish"' } },
  
  { id: 'd-form-valid', type: 'decision', position: { x: -180, y: 1160 }, data: { label: 'Form Valid?' } },
  
  { id: 'db-save-assign', type: 'data', position: { x: -220, y: 1280 }, data: { label: 'INSERT INTO assignments' } },

  // ─── GRADING FLOW ───
  { id: 'a-nav-grading', type: 'action', position: { x: 500, y: 720 }, data: { label: 'Click: "Grade Now"' } },
  
  { id: 'p-grading', type: 'page', position: { x: 650, y: 800 }, data: { label: 'Grading Center', description: '/grading/:id' } },
  
  { id: 'd-has-submission', type: 'decision', position: { x: 670, y: 900 }, data: { label: 'Has Submission?' } },
  
  { id: 'p-view-pdf', type: 'page', position: { x: 550, y: 1020 }, data: { label: 'PDF Viewer', description: 'Render Submission' } },
  { id: 'p-view-empty', type: 'page', position: { x: 800, y: 1020 }, data: { label: 'Empty State', description: '"Not Submitted"' } },

  { id: 'a-submit-grade', type: 'action', position: { x: 650, y: 1120 }, data: { label: '"Submit Grade"' } },
  
  { id: 'db-update-grade', type: 'data', position: { x: 630, y: 1200 }, data: { label: 'UPDATE submissions SET grade' } },

];

const initialEdges: Edge[] = [
  // Auth
  { id: 'e1', source: 'p-landing', target: 'a-login', type: 'smoothstep' },
  { id: 'e2', source: 'a-login', target: 'p-invite', type: 'smoothstep' },
  { id: 'e3', source: 'p-invite', target: 'a-submit-email', type: 'smoothstep' },
  { id: 'e4', source: 'a-submit-email', target: 'd-email-valid', type: 'smoothstep' },
  
  { id: 'e5-true', source: 'd-email-valid', sourceHandle: 'true', target: 'p-setup', label: 'Valid', style: { stroke: '#10b981' } },
  { id: 'e5-false', source: 'd-email-valid', sourceHandle: 'false', target: 'p-error', label: 'Invalid', style: { stroke: '#ef4444' } },

  { id: 'e6', source: 'p-setup', target: 'a-save-profile', type: 'smoothstep' },
  { id: 'e7', source: 'a-save-profile', target: 'p-dashboard', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#d4a574' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d4a574' } },

  // To Assignments
  { id: 'e-dash-assign', source: 'p-dashboard', target: 'a-nav-assign', type: 'smoothstep' },
  { id: 'e-nav-list', source: 'a-nav-assign', target: 'p-assign-list', type: 'smoothstep' },
  { id: 'e-list-create', source: 'p-assign-list', target: 'a-create-btn', type: 'smoothstep' },
  { id: 'e-create-form', source: 'a-create-btn', target: 'p-create-form', type: 'smoothstep' },
  { id: 'e-form-save', source: 'p-create-form', target: 'a-save-assign', type: 'smoothstep' },
  { id: 'e-save-check', source: 'a-save-assign', target: 'd-form-valid', type: 'smoothstep' },
  
  { id: 'e-valid-save', source: 'd-form-valid', sourceHandle: 'true', target: 'db-save-assign', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'e-db-return', source: 'db-save-assign', target: 'p-assign-list', type: 'default', animated: true, label: 'Success' },

  // To Grading
  { id: 'e-dash-grade', source: 'p-dashboard', target: 'a-nav-grading', type: 'smoothstep' },
  { id: 'e-grade-page', source: 'a-nav-grading', target: 'p-grading', type: 'smoothstep' },
  { id: 'e-check-sub', source: 'p-grading', target: 'd-has-submission', type: 'smoothstep' },
  
  { id: 'e-sub-yes', source: 'd-has-submission', sourceHandle: 'true', target: 'p-view-pdf', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'e-sub-no', source: 'd-has-submission', sourceHandle: 'false', target: 'p-view-empty', label: 'No', style: { stroke: '#ef4444' } },

  { id: 'e-grade-action', source: 'p-view-pdf', target: 'a-submit-grade', type: 'smoothstep' },
  { id: 'e-grade-db', source: 'a-submit-grade', target: 'db-update-grade', type: 'smoothstep' },
];

export function ArchitecturePage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#0f172a] text-white">
      <div className="absolute top-4 left-4 z-10 bg-[#0a1628]/90 p-4 rounded border border-[#d4a574]/20 backdrop-blur-sm max-w-sm">
        <h1 className="text-xl font-bold text-[#d4a574] mb-2">Detailed System Flow</h1>
        <p className="text-sm text-slate-300">
          Detailed map including logic branches, database interactions, and user actions.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0a1628] border border-[#d4a574] rounded-sm"></div>
            <span>Pages (Screens)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1e293b] border border-[#64748b]"></div>
            <span>User Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rotate-45 border border-[#d4a574] bg-[#0f172a] mb-1 ml-1"></div>
            <span className="ml-1">Conditions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-2 border-[#d4a574] bg-[#0f172a]"></div>
            <span>Database</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0f172a]"
        minZoom={0.5}
      >
        <Controls className="bg-[#1e293b] border-[#334155] fill-white" />
        <MiniMap 
            nodeStrokeColor="#d4a574" 
            nodeColor="#0a1628" 
            maskColor="rgba(0,0,0,0.5)"
            className="bg-[#1e293b] border border-[#334155]" 
        />
        <Background color="#334155" gap={20} />
      </ReactFlow>
    </div>
  );
}
