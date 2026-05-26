import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.html',
  styleUrls: ['./auth-layout.css'],
  standalone: true
})
export class AuthLayoutComponent {
  @Input() title: string = '';
}
