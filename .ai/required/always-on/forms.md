# Angular Forms Guide

## Purpose

This document defines the required form architecture for Angular applications in this repository.

It is written for both humans and AI agents.

The goal is to make forms:

- predictable
- typed
- easy to validate
- easy to test
- aligned with the feature component architecture

This guide is a forms contract, not a loose preference.

## Core Rule

Use reactive forms as the default form strategy.

Forms must follow the same container/presentation split as the rest of the feature architecture:

- form containers own state integration, submission, and orchestration
- form presentation components render fields and communicate through inputs and outputs

Do not let leaf form components access feature state directly.

## Preferred Form Strategy

Default:

- typed reactive forms
- `FormGroup`, `FormControl`, `FormArray`
- explicit validators
- container-owned submission flow

Avoid template-driven forms for production feature work unless there is a very small, local, low-risk use case.

## Why Reactive Forms

Reactive forms fit this repository better because they are:

- explicit
- testable
- composable
- easier to integrate with facades/stores
- easier for AI agents to generate consistently

## Form Roles

### Form Containers

Form containers are state-aware.

They may:

- inject facades or stores
- build and own the `FormGroup`
- patch initial values
- submit data
- react to validation state
- map form values into feature commands

They must not:

- become giant UI-only components
- push feature orchestration into child form sections

Typical locations:

- `pages/`
- feature-local smart components when a subsection truly needs its own orchestration

### Form Presentation Components

Form presentation components are state-agnostic.

They may:

- receive a `FormGroup` or specific controls through inputs
- render labels, inputs, errors, and layout
- emit UI intent through outputs when needed

They must not:

- inject facades or stores
- submit directly to APIs
- know where form data comes from
- own feature-level persistence logic

Typical locations:

- `components/`
- `shared/forms/` or `shared/ui/` if reusable

## Recommended Structure

```text
features/
  profile/
    pages/
      profile-settings-page.component.ts
    components/
      profile-form.component.ts
      profile-address-section.component.ts
    models/
      profile-form.dto.ts
    state/
      profile.facade.ts
```

Interpretation:

- page or feature container owns the form
- child form sections remain presentation-oriented

## Typed Forms

Prefer typed forms by default.

Example:

```ts
export type ProfileFormDto = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
};

type ProfileFormGroup = FormGroup<ProfileFormDto>;
```

Recommended location:

```text
features/
  profile/
    models/
      profile-form.dto.ts
```

Rules:

- define the form control shape once in a feature-owned DTO/type
- reuse that DTO/type across the page container and presentation form components
- do not repeat the same inline form structure in multiple files
- keep the form DTO local to the feature unless it is truly shared

Example file:

```ts
import { FormControl } from '@angular/forms';

export type ProfileFormDto = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
};
```

Rules:

- use non-nullable controls when appropriate
- keep control types explicit
- avoid `any`

## Building Forms

Do not assume every form must be defined inline inside a page component.

Default rule:

- simple forms may be defined directly in the container component
- larger features or features with multiple forms should move form creation into a feature-local form service or helper

The important boundary is:

- the container owns orchestration
- the form definition may live in the container or in a feature-local form builder service

Use a form service when:

- the feature has multiple related forms
- create/edit forms share the same structure
- initialization logic is getting too large
- validators or form arrays would make the page noisy

Avoid a form service when:

- the form is small and used in only one place
- extraction would add indirection without real value

Preferred:

```ts
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileFacade } from '../state/profile.facade';
import { ProfileFormDto } from '../models/profile-form.dto';

@Component({
  selector: 'app-profile-settings-page',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-settings-page.component.html',
})
export class ProfileSettingsPageComponent {
  private readonly profileFacade = inject(ProfileFacade);

  readonly form = new FormGroup<ProfileFormDto>({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly isSaving = this.profileFacade.isSaving;
  readonly error = this.profileFacade.error;
}
```

Rule:

- the component that submits the form should usually own the form instance, even if a form service creates it

## Form Service Pattern

When a feature has many forms or a complex form definition, use a feature-local form service.

Recommended location:

```text
features/
  profile/
    forms/
      profile-form.service.ts
    models/
      profile-form.dto.ts
```

Example service:

```ts
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProfileFormDto } from '../models/profile-form.dto';

@Injectable()
export class ProfileFormService {
  createForm(): FormGroup<ProfileFormDto> {
    return new FormGroup<ProfileFormDto>({
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
    });
  }

  patchForm(
    form: FormGroup<ProfileFormDto>,
    value: { firstName: string; lastName: string; email: string }
  ): void {
    form.patchValue(value);
  }
}
```

Container example with service:

```ts
import { Component, inject } from '@angular/core';
import { ProfileFormService } from '../forms/profile-form.service';
import { ProfileFacade } from '../state/profile.facade';

@Component({
  selector: 'app-profile-settings-page',
  providers: [ProfileFormService],
  templateUrl: './profile-settings-page.component.html',
})
export class ProfileSettingsPageComponent {
  private readonly profileFacade = inject(ProfileFacade);
  private readonly profileFormService = inject(ProfileFormService);

  readonly form = this.profileFormService.createForm();
  readonly isSaving = this.profileFacade.isSaving;
  readonly error = this.profileFacade.error;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.profileFacade.saveProfile(this.form.getRawValue());
  }
}
```

Rules:

- keep the form service feature-local
- use the service for form construction and patching, not submission orchestration
- the page/container still decides when to submit, reset, or initialize
- do not turn the form service into a second facade or API layer

## Form Submission

Submission belongs to the form container.

Preferred:

```ts
onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.profileFacade.saveProfile(this.form.getRawValue());
}
```

Rules:

- validate before submit
- mark fields touched when blocking submit
- submit feature-ready values, not raw DOM events

## Initial Values And Patching

Containers own form initialization and patching.

Use this for:

- loading existing entity values
- editing flows
- resetting from feature state

Example:

```ts
loadProfileIntoForm(profile: ProfileFormValue): void {
  this.form.patchValue(profile);
}
```

Rules:

- patch in the container
- or call a feature-local form service from the container to patch consistently
- do not make leaf field components responsible for feature data hydration
- use `setValue` only when the full structure is guaranteed

## Validation Strategy

Keep validation explicit and layered.

Use:

- built-in validators for common rules
- custom validators for domain-specific rules
- async validators only when truly necessary

Recommended layers:

1. control-level validators
2. group-level validators for cross-field rules
3. server validation handled after submission

Rules:

- keep validation logic close to the form that owns it
- do not hide critical validation rules inside unrelated helpers
- prefer deterministic synchronous validators unless async validation is truly required

## Cross-Field Validation

Use form-group validators for rules that span multiple controls.

Example:

```ts
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
}
```

Rules:

- cross-field rules belong at group level
- do not duplicate the same rule in many child controls

## Error Display

Form presentation components may render validation messages, but they should not decide submission strategy.

Recommended display rule:

- show errors when a control is invalid and touched
- optionally show form-level errors after submit attempts

Example:

```html
@if (emailControl.invalid && emailControl.touched) {
  <p class="form-field__error">Enter a valid email address.</p>
}
```

Rules:

- keep error rendering consistent
- avoid showing all errors on first paint unless the UX intentionally requires it

## Form Presentation Components

Presentation form components should be input/output driven.

Example:

```ts
import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProfileFormDto } from '../models/profile-form.dto';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent {
  readonly form = input.required<FormGroup<ProfileFormDto>>();
}
```

Rules:

- pass the form or required controls in through inputs
- keep the component unaware of submission persistence
- render fields and validation state only

## Shared Form Components

Shared form components must remain reusable and presentation-only.

Good candidates:

- text field wrappers
- select field wrappers
- checkbox field wrappers
- validation message components

Shared form components must not:

- know feature-specific facade/store logic
- depend on one feature's form model

## Form Arrays

Use `FormArray` when the UI captures repeated structured items.

Examples:

- addresses
- phone numbers
- line items

Rules:

- keep array item shape explicit
- let the container own add/remove orchestration
- let presentational sections render each row

## Async Validation

Async validators are allowed, but use them sparingly.

Use when:

- the rule truly depends on the server
- early validation provides real UX value

Avoid when:

- the same check can happen during normal submit
- it creates noisy API traffic for little benefit

Rules:

- debounce outside the validator if needed
- keep async validators focused and documented

## State Integration

Form containers integrate with feature state.

For facade-based features:

- the container builds the form
- the container patches initial values
- the container calls facade commands on submit

For store-based features:

- the container still owns the form
- the form should not be replaced by raw store state mechanics

Rule:

- form state and feature state may interact, but leaf form components must stay unaware of the state strategy

## Route-Driven Forms

For edit/create screens:

- route/page container decides whether the form is in create or edit mode
- route params stay in the container
- form presentation components stay mode-agnostic when possible

Good:

- page container loads entity by route param
- page container patches form
- page container decides whether submit means create or update

## BEM And Styling

Form components should follow the chosen style guide for the app.

If using BEM:

- use form-specific block names such as `profile-form`, `form-field`, `address-section`

If using Tailwind:

- keep form layout classes explicit and readable

Rules:

- styling strategy should not change the container/presentation boundary

## Accessibility

All forms must respect basic accessibility rules.

Required:

- labels associated with controls
- helpful error messages
- clear invalid state
- keyboard accessibility
- appropriate input types

Examples:

- `type="email"` for email
- `type="password"` for passwords
- `aria-invalid="true"` when needed

## Testing Strategy

Test form containers and form presentation components differently.

Container tests should focus on:

- form creation
- validation behavior
- submission flow
- patching initial values
- calling facade/store commands

Presentation form tests should focus on:

- rendering controls
- showing validation state
- emitting UI events if applicable

Rules:

- do not over-test Angular internals
- test role-specific responsibilities

## Anti-Patterns

Avoid these patterns.

### Leaf Form Component Injecting State

```ts
private readonly profileFacade = inject(ProfileFacade);
```

inside a form section component is a violation.

Why it fails:

- destroys reuse
- couples fields to state strategy
- makes testing harder

### Template-Driven Form As Default Architecture

Why it fails:

- weaker typing
- harder orchestration
- less consistent state integration

### Generic Submit Payloads

```ts
submit(value: unknown): void
```

Why it fails:

- weak typing
- unclear contract
- harder refactoring

### Presentation Component Owning Persistence

Why it fails:

- blurs architecture boundaries
- duplicates orchestration
- tightly couples UI to feature logic

### Form Errors Shown Everywhere By Default

Why it fails:

- noisy UX
- weak signal-to-noise ratio
- poor first-render experience

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular forms:

1. Use reactive forms by default.
2. Prefer typed forms.
3. Define a feature-owned form DTO/type once and reuse it across form files.
4. Let form containers own `FormGroup` creation, patching, and submission.
5. Keep form presentation components input/output only.
6. Do not inject facades, stores, or APIs into form presentation components.
7. Keep validation explicit and close to the form.
8. Use group validators for cross-field rules.
9. Mark all controls touched before blocking invalid submit.
10. Submit feature-ready values through the container.
11. If uncertain, keep orchestration higher and keep field components dumb.

## Decision Matrix

| Need | Preferred location |
| --- | --- |
| Build and own `FormGroup` | container/page component |
| Submit form data | container/page component |
| Render field layout and messages | presentation form component |
| Cross-field validator | form group validator |
| Reusable text/select/checkbox field wrapper | `shared/forms/` or `shared/ui/` |
| Feature-specific submit orchestration | `pages/` or feature container |

## Recommended Example

```text
features/
  profile/
    pages/
      profile-settings-page.component.ts
    forms/
      profile-form.service.ts
    components/
      profile-form.component.ts
      profile-address-section.component.ts
    state/
      profile.facade.ts
```

Flow:

```text
profile-settings-page -> owns FormGroup
profile-settings-page -> may create the form directly or via profile-form.service
profile-settings-page -> passes form to presentation form sections
presentation form sections -> render controls only
profile-settings-page -> validates and submits through facade/store
```

## Final Standard

An Angular form architecture is compliant in this repository if:

- reactive forms are the default
- form containers own form orchestration
- presentation form components remain input/output driven
- validation is explicit
- submission stays outside leaf UI components

If a leaf form component knows about facades, stores, route params, or persistence workflows, the form boundary is not strong enough.
