import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type SelectOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'ui-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly options = input.required<SelectOption[]>();
  readonly allOptionLabel = input<string>();

  readonly valueChange = output<string>();

  readonly id = crypto.randomUUID();

  onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
