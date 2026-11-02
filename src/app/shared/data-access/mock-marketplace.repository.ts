import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import {
  Conversation,
  Job,
  MarketplaceData,
  NewJob,
  Proposal,
} from '../models/marketplace.models';
import { MarketplaceRepository } from './marketplace.repository';

const STORAGE_KEY = 'folk-marketplace-data-v1';

@Injectable()
export class MockMarketplaceRepository extends MarketplaceRepository {
  private readonly http = inject(HttpClient);
  private data: MarketplaceData | null = null;

  load(): Observable<MarketplaceData> {
    const mockDataUrl = new URL('mock-data.json', document.baseURI).toString();

    return this.http.get<MarketplaceData>(mockDataUrl).pipe(
      map((seedData) => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData === null) {
          return seedData;
        }

        try {
          return JSON.parse(savedData) as MarketplaceData;
        } catch (error) {
          throw new Error('Saved demo data could not be read. Reset browser storage to continue.', {
            cause: error,
          });
        }
      }),
      tap((data) => {
        this.data = data;
      }),
    );
  }

  createJob(input: NewJob, clientId: string): Observable<MarketplaceData> {
    const clientName =
      this.requireData().users.find((user) => user.id === clientId)?.name ?? 'Client';
    const job: Job = {
      id: this.createId('job'),
      ownerId: clientId,
      title: input.title,
      category: input.category,
      description: input.description,
      budget: input.budget,
      duration: 'Flexible',
      status: 'Open',
      postedAt: 'just now',
      proposalCount: 0,
      clientName,
      icon: input.category.slice(0, 1).toUpperCase(),
      color: 'project-purple',
      skills: [input.category],
    };

    return this.update((data) => {
      data.jobs.unshift(job);
    });
  }

  submitProposal(jobId: string, freelancerId: string): Observable<MarketplaceData> {
    return this.update((data) => {
      const job = data.jobs.find((item) => item.id === jobId);
      if (!job || job.status !== 'Open') {
        throw new Error('This job is no longer available.');
      }
      if (data.proposals.some((proposal) => proposal.jobId === jobId && proposal.freelancerId === freelancerId)) {
        throw new Error('You have already sent a proposal for this job.');
      }

      const proposal: Proposal = {
        id: this.createId('proposal'),
        jobId,
        freelancerId,
        message: `I would love to help with ${job.title}. My experience is a strong match for this project.`,
        amount: job.budget,
        status: 'Pending',
        sentAt: 'Just now',
      };
      data.proposals.unshift(proposal);
      job.proposalCount += 1;
    });
  }

  acceptProposal(proposalId: string): Observable<MarketplaceData> {
    return this.update((data) => {
      const proposal = data.proposals.find((item) => item.id === proposalId);
      if (!proposal || proposal.status !== 'Pending') {
        throw new Error('This proposal can no longer be accepted.');
      }
      const job = data.jobs.find((item) => item.id === proposal.jobId);
      if (!job || job.status !== 'Open') {
        throw new Error('This job is no longer open for proposals.');
      }

      proposal.status = 'Accepted';
      for (const otherProposal of data.proposals) {
        if (otherProposal.jobId === proposal.jobId && otherProposal.id !== proposal.id) {
          otherProposal.status = 'Declined';
        }
      }

      job.status = 'In progress';
      job.freelancerId = proposal.freelancerId;
      job.freelancerName =
        data.users.find((user) => user.id === proposal.freelancerId)?.name ?? 'Freelancer';
    });
  }

  sendMessage(conversationId: string, text: string, senderId: string): Observable<MarketplaceData> {
    const message = text.trim();
    return this.update((data) => {
      if (!message) {
        throw new Error('Enter a message before sending.');
      }
      const conversation = data.conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        throw new Error('This conversation could not be found.');
      }

      conversation.messages.push({
        id: this.createId('message'),
        text: message,
        time: 'Just now',
        fromMe: senderId === conversation.freelancerId,
      });
      conversation.time = 'Just now';
    });
  }

  private update(change: (data: MarketplaceData) => void): Observable<MarketplaceData> {
    return defer(() => {
      const nextData = structuredClone(this.requireData());
      change(nextData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      this.data = nextData;
      return of(structuredClone(nextData));
    });
  }

  private requireData(): MarketplaceData {
    if (!this.data) {
      throw new Error('Demo workspace data has not loaded yet.');
    }
    return this.data;
  }

  private createId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
  }
}
