import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type NumericMask = 'telefone' | 'cep' | 'cpf' | 'cnpj';

@Directive({
  selector: '[appNumericMask]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NumericMaskDirective),
    multi: true,
  }],
})
export class NumericMaskDirective implements ControlValueAccessor {
  @Input({ required: true }) appNumericMask!: NumericMask;

  private readonly input: HTMLInputElement;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(elementRef: ElementRef<HTMLInputElement>) {
    this.input = elementRef.nativeElement;
  }

  writeValue(value: unknown): void {
    const digits = String(value ?? '').replace(/\D/g, '').slice(0, this.maxLength);
    this.input.value = this.format(digits);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.input.disabled = disabled;
  }

  @HostListener('input')
  onInput(): void {
    const cursor = this.input.selectionStart ?? this.input.value.length;
    const digitsBeforeCursor = this.input.value.slice(0, cursor).replace(/\D/g, '').length;
    const digits = this.input.value.replace(/\D/g, '').slice(0, this.maxLength);
    const formatted = this.format(digits);

    this.input.value = formatted;
    this.onChange(digits);

    const nextCursor = this.cursorAfterDigits(formatted, Math.min(digitsBeforeCursor, digits.length));
    this.input.setSelectionRange(nextCursor, nextCursor);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private get maxLength(): number {
    switch (this.appNumericMask) {
      case 'telefone': return 11;
      case 'cpf': return 11;
      case 'cnpj': return 14;
      default: return 8;
    }
  }

  private format(digits: string): string {
    if (this.appNumericMask === 'cpf') {
      return digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/, '$1-$2');
    }

    if (this.appNumericMask === 'cnpj') {
      return digits.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2').replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d{1,2})$/, '$1-$2');
    }

    if (this.appNumericMask === 'cep') {
      return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    }

    if (digits.length <= 2) return digits.length === 2 ? `(${digits})` : digits ? `(${digits}` : '';

    const areaCode = digits.slice(0, 2);
    const localNumber = digits.slice(2);
    const prefixLength = digits.length === 11 ? 5 : 4;
    const prefix = localNumber.slice(0, prefixLength);
    const suffix = localNumber.slice(prefixLength);

    return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ''}`;
  }

  private cursorAfterDigits(value: string, digitCount: number): number {
    if (digitCount === 0) return 0;

    let count = 0;
    for (let index = 0; index < value.length; index++) {
      if (/\d/.test(value[index])) count++;
      if (count === digitCount) return index + 1;
    }

    return value.length;
  }
}