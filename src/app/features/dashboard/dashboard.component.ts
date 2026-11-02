import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AccountRole, Job } from '../../shared/models/marketplace.models';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  note: string;
  icon: string;
  tone: string;
  neutral?: boolean;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  initials: string;
  color: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-dashboard-feature',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly role = input.required<AccountRole>();
  readonly greeting = input.required<string>();
  readonly firstName = input.required<string>();
  readonly todayLabel = input.required<string>();
  readonly metrics = input.required<DashboardMetric[]>();
  readonly projects = input.required<Job[]>();
  readonly activities = input.required<DashboardActivity[]>();
  readonly navigateJobs = output<void>();
  readonly navigateProposals = output<void>();
}
