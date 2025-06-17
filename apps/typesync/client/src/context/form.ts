import { type AnyFieldApi, type AnyFormApi, createFormHookContexts } from '@tanstack/react-form';

const context = createFormHookContexts();

export const fieldContext: React.Context<AnyFieldApi> = context.fieldContext;
export const useFieldContext = context.useFieldContext;
export const formContext: React.Context<AnyFormApi> = context.formContext;
export const useFormContext = context.useFormContext;
