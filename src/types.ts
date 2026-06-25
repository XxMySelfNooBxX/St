export type TaskCategory = 'Urgent & Critical' | 'High Dependency' | 'Micro-Tasks';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedMinutes?: number;
  panicScore?: number;   // 0–10, computed by agent
  atRisk?: boolean;      // true if deadline is dangerously close
  deadline?: string;     // ISO 8601 string if user mentioned a specific deadline
  subtasks?: Task[];     // AI-generated subtask decomposition
  parentId?: string;     // if this is a subtask, the parent task's id
}

export interface ExecutionBlock {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  taskId?: string;
  type: 'work' | 'break' | 'buffer';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface EnergyPoint {
  hour: number;          // 0-23
  energy: number;        // 0-10
  label?: string;        // e.g. "Peak", "Low", "Recovery"
}

export interface TriageResult {
  tasks: Task[];
  schedule: ExecutionBlock[];
  reply: string;
  agentLog?: string[];
  suggestions?: string[];  // AI-generated smart tips specific to current situation
  energyCurve?: EnergyPoint[];  // predicted energy levels per hour
}
