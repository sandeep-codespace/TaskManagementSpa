import { Observable } from 'rxjs';
import { MarketplaceData, NewJob } from '../models/marketplace.models';

export abstract class MarketplaceRepository {
  abstract load(): Observable<MarketplaceData>;
  abstract createJob(input: NewJob, clientId: string): Observable<MarketplaceData>;
  abstract submitProposal(jobId: string, freelancerId: string): Observable<MarketplaceData>;
  abstract acceptProposal(proposalId: string): Observable<MarketplaceData>;
  abstract sendMessage(
    conversationId: string,
    text: string,
    senderId: string,
  ): Observable<MarketplaceData>;
}
