import { Component } from '@angular/core';
import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input/input-field';

@Component({
  selector: 'app-register-card',
  imports: [InputField, Button],
  templateUrl: './register-card.html',
  styleUrl: './register-card.css',
})
export class RegisterCard {}
