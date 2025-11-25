// src/components/forms/FormInput.tsx
import React from 'react';
import { UseFormRegister, FieldErrors, Path, FieldValues } from 'react-hook-form';

type FormInputProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>;
  label: string;
  register: UseFormRegister<TFormValues>;
  errors: FieldErrors<TFormValues>;
  type?: string;
  helpText?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = <TFormValues extends FieldValues>({
  name,
  label,
  register,
  errors,
  type = 'text',
  helpText,
  ...rest
}: FormInputProps<TFormValues>) => {
  const error = errors && errors[name];

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={name}
          type={type}
          {...register(name)}
          {...rest}
          className={`input-field ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          aria-invalid={!!error}
        />
        {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {typeof error.message === 'string' ? error.message : 'Invalid input'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormInput;
