import { AuthHeader } from '@/auth/components/auth-header/auth-header';
import { ResetPasswordCard } from '@/auth/components/reset-password-card/reset-password-card';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ResetPasswordCard, AuthHeader],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {}