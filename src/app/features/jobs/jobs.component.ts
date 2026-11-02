import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { AccountRole, Job, NewJob } from '../../shared/models/marketplace.models';

@Component({
  imports: [CommonModule],
  selector: 'app-jobs-feature',
  templateUrl: './jobs.component.html',
})
export class JobsComponent {
  readonly role = input.required<AccountRole>();
  readonly jobs = input.required<Job[]>();
  readonly searchQuery = input.required<string>();
  readonly jobFilter = input.required<string>();
  readonly filters = input.required<string[]>();
  readonly proposalJobIds = input.required<string[]>();
  readonly searchChanged = output<string>();
  readonly filterChanged = output<string>();
  readonly submitProposal = output<string>();
  readonly viewProposals = output<void>();
  readonly createJob = output<NewJob>();

  protected readonly showForm = signal(false);
  protected readonly formError = signal('');
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly category = signal('');
  protected readonly budget = signal('');

  protected inputValue(event: Event): string {
    const target = event.target;
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.value
      : '';
  }

  protected hasProposal(jobId: string): boolean {
    return this.proposalJobIds().includes(jobId);
  }

  protected openForm(): void {
    this.formError.set('');
    this.title.set('');
    this.description.set('');
    this.category.set('');
    this.budget.set('');
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.formError.set('');
  }

  protected publish(event: Event): void {
    event.preventDefault();
    const amount = Number(this.budget());
    if (!Number.isFinite(amount) || amount <= 0) {
      this.formError.set('Enter a budget greater than zero.');
      return;
    }

    this.createJob.emit({
      title: this.title().trim(),
      description: this.description().trim(),
      category: this.category().trim(),
      budget: amount,
    });
    this.closeForm();
  }
}
