import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { AccountRole, MarketplaceData, Proposal, UserProfile } from '../../shared/models/marketplace.models';

interface ProposalCard {
  proposal: Proposal;
  title: string;
  subtitle: string;
  initials: string;
  message: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-proposals-feature',
  templateUrl: './proposals.component.html',
})
export class ProposalsComponent {
  readonly role = input.required<AccountRole>();
  readonly data = input.required<MarketplaceData>();
  readonly userId = input.required<string>();
  readonly accept = output<string>();
  readonly browseJobs = output<void>();

  protected readonly proposals = computed<ProposalCard[]>(() => {
    const data = this.data();
    return data.proposals.flatMap((proposal) => {
      const job = data.jobs.find((item) => item.id === proposal.jobId);
      if (!job) {
        return [];
      }

      if (this.role() === 'client' && job.ownerId !== this.userId()) {
        return [];
      }
      if (this.role() === 'freelancer' && proposal.freelancerId !== this.userId()) {
        return [];
      }

      const freelancer = this.userForId(proposal.freelancerId);
      const client = this.userForId(job.ownerId);
      return [{
        proposal,
        title: this.role() === 'client' ? freelancer?.name ?? 'Freelancer' : job.title,
        subtitle: this.role() === 'client'
          ? job.title
          : `Sent to ${client?.name ?? 'client'}`,
        initials: this.role() === 'client' ? freelancer?.initials ?? 'F' : client?.initials ?? 'C',
        message: proposal.message,
      }];
    });
  });

  private userForId(userId: string): UserProfile | undefined {
    return this.data().users.find((user) => user.id === userId);
  }
}
