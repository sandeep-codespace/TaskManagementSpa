import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { UserProfile } from '../../shared/models/marketplace.models';

@Component({
  imports: [CommonModule],
  selector: 'app-profile-feature',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  readonly user = input.required<UserProfile>();
  readonly notice = input('');
  readonly noticeChanged = output<string>();
}
