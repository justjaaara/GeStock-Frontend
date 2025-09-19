import { Component } from '@angular/core';
import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input/input-field';

@Component({
  selector: 'app-login-card',
  imports: [InputField, Button],
  templateUrl: './login-card.html',
  styleUrl: './login-card.css',
})
export class LoginCard {}
