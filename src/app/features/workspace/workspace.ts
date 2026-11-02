import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardActivity, DashboardComponent, DashboardMetric } from '../dashboard/dashboard.component';
import { JobsComponent } from '../jobs/jobs.component';
import { MessagesComponent } from '../messages/messages.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProposalsComponent } from '../proposals/proposals.component';
import {
  AccountRole,
  MarketplaceData,
  UserProfile,
  WorkspaceView,
} from '../../shared/models/marketplace.models';
import { MarketplaceRepository } from '../../shared/data-access/marketplace.repository';

const viewTitles: Record<WorkspaceView, string> = {
  dashboard: 'Overview',
  jobs: 'Jobs & projects',
  proposals: 'Proposals',
  messages: 'Messages',
  profile: 'My profile',
};

@Component({
  imports: [
    CommonModule,
    DashboardComponent,
    JobsComponent,
    MessagesComponent,
    ProfileComponent,
    ProposalsComponent,
  ],
  selector: 'app-root',
  templateUrl: './workspace.html',
})
export class WorkspaceShell {
  private readonly repository = inject(MarketplaceRepository);

  protected readonly data = signal<MarketplaceData | null>(null);
  protected readonly error = signal('');
  protected readonly isLoading = signal(true);
  protected readonly activeRole = signal<AccountRole>('freelancer');
  protected readonly view = signal<WorkspaceView>('dashboard');
  protected readonly searchQuery = signal('');
  protected readonly jobFilter = signal('All');
  protected readonly profileNotice = signal('');
  protected readonly jobFilters = ['All', 'Open', 'In progress', 'Completed'];
  protected readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
    .format(new Date())
    .toUpperCase();

  protected readonly currentUser = computed(
    () => this.data()?.users.find((user) => user.role === this.activeRole()) ?? null,
  );
  protected readonly firstName = computed(() => this.currentUser()?.name.split(' ')[0] ?? '');
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  });
  protected readonly pageTitle = computed(() => viewTitles[this.view()]);
  protected readonly jobs = computed(() => this.visibleJobs());
  protected readonly visibleJobs = computed(() => {
    const data = this.data();
    const user = this.currentUser();
    if (!data || !user) {
      return [];
    }

    const query = this.searchQuery().trim().toLowerCase();
    return data.jobs.filter((job) => {
      const belongsInWorkspace =
        this.activeRole() === 'client'
          ? job.ownerId === user.id
          : job.status === 'Open' || job.freelancerId === user.id;
      const matchesStatus = this.jobFilter() === 'All' || job.status === this.jobFilter();
      const matchesSearch =
        !query ||
        [job.title, job.category, job.description, ...job.skills]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return belongsInWorkspace && matchesStatus && matchesSearch;
    });
  });
  protected readonly dashboardProjects = computed(() => {
    const data = this.data();
    const user = this.currentUser();
    if (!data || !user) {
      return [];
    }

    return data.jobs
      .filter((job) =>
        this.activeRole() === 'client'
          ? job.ownerId === user.id
          : job.freelancerId === user.id,
      )
      .slice(0, 3);
  });
  protected readonly currentProposals = computed(() => {
    const data = this.data();
    const user = this.currentUser();
    if (!data || !user) {
      return [];
    }

    return data.proposals.filter((proposal) => {
      if (this.activeRole() === 'freelancer') {
        return proposal.freelancerId === user.id;
      }

      return data.jobs.some(
        (job) => job.id === proposal.jobId && job.ownerId === user.id,
      );
    });
  });
  protected readonly pendingProposalCount = computed(
    () => this.currentProposals().filter((proposal) => proposal.status === 'Pending').length,
  );
  protected readonly proposalJobIds = computed(() =>
    this.currentProposals().map((proposal) => proposal.jobId),
  );
  protected readonly metrics = computed<DashboardMetric[]>(() => {
    const data = this.data();
    const user = this.currentUser();
    if (!data || !user) {
      return [];
    }

    if (this.activeRole() === 'client') {
      const jobs = data.jobs.filter((job) => job.ownerId === user.id);
      const active = jobs.filter((job) => job.status === 'In progress').length;
      const spent = jobs
        .filter((job) => job.status === 'Completed')
        .reduce((total, job) => total + job.budget, 0);
      return [
        { label: 'Total jobs posted', value: `${jobs.length}`, change: '+2', note: 'this month', icon: '▤', tone: 'icon-lilac' },
        { label: 'Active projects', value: `${active}`, change: 'On track', note: 'across your team', icon: '◷', tone: 'icon-mint', neutral: true },
        { label: 'New proposals', value: `${this.pendingProposalCount()}`, change: '+3', note: 'since last week', icon: '↗', tone: 'icon-peach' },
        { label: 'Total spent', value: this.formatCurrency(spent), change: 'View report', note: 'all completed work', icon: '$', tone: 'icon-blue', neutral: true },
      ];
    }

    const assignedJobs = data.jobs.filter((job) => job.freelancerId === user.id);
    const active = assignedJobs.filter((job) => job.status === 'In progress').length;
    const earned = assignedJobs
      .filter((job) => job.status === 'Completed')
      .reduce((total, job) => total + job.budget, 0);
    return [
      { label: 'Projects worked on', value: `${assignedJobs.length}`, change: '+1', note: 'this month', icon: '▤', tone: 'icon-lilac' },
      { label: 'Active projects', value: `${active}`, change: 'On track', note: 'keep up the good work', icon: '◷', tone: 'icon-mint', neutral: true },
      { label: 'Proposals sent', value: `${data.proposals.filter((proposal) => proposal.freelancerId === user.id).length}`, change: `${this.pendingProposalCount()} pending`, note: 'awaiting a response', icon: '↗', tone: 'icon-peach' },
      { label: 'Total earned', value: this.formatCurrency(earned), change: 'View report', note: 'from completed work', icon: '$', tone: 'icon-blue', neutral: true },
    ];
  });
  protected readonly activityItems = computed<DashboardActivity[]>(() => {
    const data = this.data();
    const user = this.currentUser();
    if (!data || !user) {
      return [];
    }

    if (this.activeRole() === 'client') {
      return data.proposals
        .filter(
          (proposal) =>
            proposal.status === 'Pending' &&
            data.jobs.some((job) => job.id === proposal.jobId && job.ownerId === user.id),
        )
        .slice(0, 3)
        .map((proposal) => {
          const freelancer = data.users.find((item) => item.id === proposal.freelancerId);
          const job = data.jobs.find((item) => item.id === proposal.jobId);
          return {
            id: proposal.id,
            title: `${freelancer?.name ?? 'A freelancer'} sent a proposal`,
            description: job?.title ?? 'Your project',
            time: proposal.sentAt,
            initials: freelancer?.initials ?? 'F',
            color: 'activity-lilac',
          };
        });
    }

    return data.proposals
      .filter((proposal) => proposal.freelancerId === user.id)
      .slice(0, 3)
      .map((proposal) => {
        const job = data.jobs.find((item) => item.id === proposal.jobId);
        const statusText = proposal.status === 'Accepted' ? 'Your proposal was accepted' : `Proposal ${proposal.status.toLowerCase()}`;
        return {
          id: proposal.id,
          title: statusText,
          description: job?.title ?? 'Your project',
          time: proposal.sentAt,
          initials: 'OR',
          color: 'activity-green',
        };
      });
  });

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.repository.load().subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  protected setView(view: WorkspaceView): void {
    this.view.set(view);
    this.searchQuery.set('');
    this.profileNotice.set('');
  }

  protected changeRole(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    this.activeRole.set(target.value === 'client' ? 'client' : 'freelancer');
    this.setView('dashboard');
    this.jobFilter.set('All');
  }

  protected submitProposal(jobId: string): void {
    const freelancerId = this.currentUser()?.id;
    if (!freelancerId) {
      this.error.set('Select a freelancer account before sending a proposal.');
      return;
    }

    this.perform(this.repository.submitProposal(jobId, freelancerId));
  }

  protected acceptProposal(proposalId: string): void {
    this.perform(this.repository.acceptProposal(proposalId));
  }

  protected createJob(input: { title: string; description: string; category: string; budget: number }): void {
    const clientId = this.currentUser()?.id;
    if (!clientId) {
      this.error.set('Select a client account before posting a job.');
      return;
    }

    this.perform(this.repository.createJob(input, clientId), () => this.setView('jobs'));
  }

  protected sendMessage(conversationId: string, message: string): void {
    if (!message.trim()) {
      return;
    }

    const senderId = this.currentUser()?.id;
    if (!senderId) {
      this.error.set('Select an account before sending a message.');
      return;
    }

    this.perform(this.repository.sendMessage(conversationId, message, senderId));
  }

  protected userForId(userId: string): UserProfile | undefined {
    return this.data()?.users.find((user) => user.id === userId);
  }

  private perform(request: Observable<MarketplaceData>, onSuccess?: () => void): void {
    this.error.set('');
    request.subscribe({
      next: (data) => {
        this.data.set(data);
        onSuccess?.();
      },
      error: (error: unknown) => this.error.set(this.errorMessage(error)),
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  }
}
