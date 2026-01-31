/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  PathValue,
  UseFormStateReturn,
} from "react-hook-form";

export type TFieldType = "text" | "number" | "select" | "textarea" | "checkbox"| "file";
export type TField<T extends FieldValues> = {
  id?: string;
  position?: number;
  type: TFieldType;
  label?: string;
  defaultValue?: PathValue<FieldValues, any>;
  name: T extends Array<infer U> ? keyof U : keyof T;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
  icon?: any;
  page?: number;
    validation?: any;

  data?:
    | {
        label: string;
        value: string;
        description?: string;
      }[]
    | undefined;
};
export type ControllerProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, any>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<T>;
  defaultProps: Record<string, any>;
};
