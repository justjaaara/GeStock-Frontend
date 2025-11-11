import { AuthHeader } from '@/auth/components/auth-header/auth-header';
import { ForgotPasswordCard } from '@/auth/components/forgot-password-card/forgot-password-card';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ForgotPasswordCard, AuthHeader],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {}