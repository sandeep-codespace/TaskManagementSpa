import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorkspaceShell } from './workspace';
import { MarketplaceData, NewJob } from '../../shared/models/marketplace.models';
import { MarketplaceRepository } from '../../shared/data-access/marketplace.repository';

const demoData: MarketplaceData = {
  users: [
    {
      id: 'freelancer-01',
      role: 'freelancer',
      name: 'Sofia Davis',
      initials: 'SD',
      headline: 'Product designer',
      location: 'San Francisco',
      rating: 5,
      completedProjects: 2,
      hourlyRate: 80,
      available: true,
      about: 'A product designer.',
      skills: ['Product design'],
    },
    {
      id: 'client-01',
      role: 'client',
      name: 'Olivia Rhye',
      initials: 'OR',
      headline: 'Studio founder',
      location: 'San Francisco',
      rating: 5,
      completedProjects: 1,
      hourlyRate: 0,
      available: true,
      about: 'A studio founder.',
      skills: ['Product'],
    },
  ],
  jobs: [],
  proposals: [],
  conversations: [],
};

class TestMarketplaceRepository extends MarketplaceRepository {
  override load() {
    return of(demoData);
  }

  override createJob(_input: NewJob, _clientId: string) {
    return of(demoData);
  }

  override submitProposal(_jobId: string, _freelancerId: string) {
    return of(demoData);
  }

  override acceptProposal(_proposalId: string) {
    return of(demoData);
  }

  override sendMessage(_conversationId: string, _text: string, _senderId: string) {
    return of(demoData);
  }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceShell],
      providers: [{ provide: MarketplaceRepository, useClass: TestMarketplaceRepository }],
    }).compileComponents();
  });

  it('should render the workspace dashboard with mock data', async () => {
    const fixture = TestBed.createComponent(WorkspaceShell);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Sofia');
    expect(compiled.textContent).toContain('Projects worked on');
  });

  it('should switch between freelancer and client workspaces', async () => {
    const fixture = TestBed.createComponent(WorkspaceShell);
    await fixture.whenStable();
    fixture.detectChanges();

    const roleSwitch = fixture.nativeElement.querySelector('#role-switch') as HTMLSelectElement;
    roleSwitch.value = 'client';
    roleSwitch.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Total jobs posted');
  });
});
