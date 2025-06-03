import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from '../../../context/form.js';
import {
  FormComponentRadioGroup,
  FormComponentTextArea,
  FormComponentTextField,
  SubmitButton,
} from '../../FormComponents/index.js';
import { TypeCombobox } from './SchemaBuilder/TypeCombobox.js';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    FormComponentTextField,
    FormComponentTextArea,
    FormComponentRadioGroup,
    TypeCombobox,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
