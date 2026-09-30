import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const trimmedRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim().length > 0 ? null : { required: true };

export function minTrimmedLength(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = String(control.value ?? '').trim().length;
    return length === 0 || length >= minimum ? null : { minlength: { requiredLength: minimum, actualLength: length } };
  };
}