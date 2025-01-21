import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pass-requirements',
  standalone: true,
  imports: [],
  templateUrl: './pass-requirements.component.html',
  styleUrl: './pass-requirements.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          height: 0,
        }),
        animate('200ms ease-in-out', style({ height: '175px' })),
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        style({
          height: '175px',
        }),
        animate('200ms ease-in-out', style({ height: 0 })),
      ]),
    ]),
  ],
})
export class PassRequirementsComponent implements OnChanges {
  @Input('newPass') newPass!: string;

  passRequirements!: {
    enoughLetters: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    specialCharacter: boolean;
  };

  ngOnChanges(changes: SimpleChanges): void {
    const newPass = changes['newPass'].currentValue;

    this.passRequirements = {
      enoughLetters: newPass.length >= 8,
      hasUppercase: newPass !== this.newPass.toLowerCase(),
      hasLowercase: newPass !== this.newPass.toUpperCase(),
      specialCharacter: /[!@#\$%\^\&*\)\(+=._-]/.test(newPass),
    };
  }
}
