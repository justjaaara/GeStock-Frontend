import { Component } from '@angular/core';
import { AuthHeader } from '../../components/auth-header/auth-header';
import { RegisterCard } from '../../components/register-card/register-card';
import { WelcomeMessage } from '../../components/welcome-message/welcome-message';

@Component({
  selector: 'app-sign-up',
  imports: [RegisterCard, WelcomeMessage, AuthHeader],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {}
