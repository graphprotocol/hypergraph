import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from '../../../context/form.js';
import {
  FormComponentRadioGroup,
  FormComponentTextArea,
  FormComponentTextField,
  SubmitButton,
} from '../../FormComponents/index.js';
import { TypeNameCombobox } from './SchemaBuilder/TypeNameCombobox.js';
import { TypeSelect } from './SchemaBuilder/TypeSelect.js';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    FormComponentTextField,
    FormComponentTextArea,
    FormComponentRadioGroup,
    TypeSelect,
    TypeNameCombobox,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
