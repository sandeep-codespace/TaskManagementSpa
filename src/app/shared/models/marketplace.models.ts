export type AccountRole = 'client' | 'freelancer';
export type WorkspaceView = 'dashboard' | 'jobs' | 'proposals' | 'messages' | 'profile';
export type JobStatus = 'Open' | 'In progress' | 'Completed';
export type ProposalStatus = 'Pending' | 'Accepted' | 'Declined';

export interface UserProfile {
  id: string;
  role: AccountRole;
  name: string;
  initials: string;
  headline: string;
  location: string;
  rating: number;
  completedProjects: number;
  hourlyRate: number;
  available: boolean;
  about: string;
  skills: string[];
}

export interface Job {
  id: string;
  ownerId: string;
  freelancerId?: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  duration: string;
  status: JobStatus;
  postedAt: string;
  proposalCount: number;
  clientName: string;
  freelancerName?: string;
  icon: string;
  color: string;
  skills: string[];
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  message: string;
  amount: number;
  status: ProposalStatus;
  sentAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  freelancerId: string;
  name: string;
  initials: string;
  projectTitle: string;
  time: string;
  messages: ChatMessage[];
}

export interface MarketplaceData {
  users: UserProfile[];
  jobs: Job[];
  proposals: Proposal[];
  conversations: Conversation[];
}

export interface NewJob {
  title: string;
  description: string;
  category: string;
  budget: number;
}
