import { Component } from '@angular/core';
import { AuthHeader } from '../../components/auth-header/auth-header';
import { LoginCard } from '../../components/login-card/login-card';
import { WelcomeMessage } from '../../components/welcome-message/welcome-message';

@Component({
  selector: 'app-login',
  imports: [LoginCard, WelcomeMessage, AuthHeader],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
