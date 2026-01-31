/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  useForm,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";
import type { TField } from "./types";

interface FormBuilderProps<T extends FieldValues> extends UseFormProps<T, any> {
  fields: TField<T>[];
  onSubmit: (data: T) => void;
  isEdit?: boolean;
  onSubmitEdit?: (data: T) => void;
  values?: T;
  btnLable?: string;
  defaultValues?: UseFormProps<T, any>["defaultValues"];
  isSubmitting?: boolean;
}

export function FormBuilder<T extends FieldValues>({
  fields,
  onSubmit,
  onSubmitEdit,
  isEdit,
  values,
  btnLable,
  ...props
}: FormBuilderProps<T>) {
  const { handleSubmit, control, reset } = useForm<T>({
    values,
    ...props,
  });

  const handelOnSubmit = (values: T) => {
    if (isEdit) {
      onSubmitEdit?.(values);
    } else {
      onSubmit(values);
    }
    reset(props?.defaultValues as T);
  };

  return (
    <form
      onSubmit={handleSubmit(handelOnSubmit)}
      className=" mx-auto p-4 space-y-4 bg-white shadow-md rounded-lg w-full md:w-1/2 px-3 mb-4 md:mb-0"
      
    >
      {fields.map((fieldConfig) => (
        <div key={fieldConfig.name as string} className="flex flex-col">
          {fieldConfig.label && fieldConfig.type !== "checkbox" && (
            <label
              htmlFor={fieldConfig.name as string}
              className="mb-1 font-medium block text-sm text-gray-700"
            >
              {fieldConfig.label}
            </label>
          )}

          <Controller
            control={control}
            name={fieldConfig.name as any}
            rules={fieldConfig.validation}
            render={({ field, formState }) => {
              switch (fieldConfig.type) {
                case "text":
                case "number":
                  return (
                    <div>
                      <input
                        {...field}
                        id={field.name}
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {formState?.errors[field.name]?.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {String(formState.errors[field.name]?.message)}
                        </p>
                      )}
                    </div>
                  );

                case "textarea":
                  return (
                    <div>
                      <textarea
                        {...field}
                        id={field.name}
                        placeholder={fieldConfig.placeholder}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {formState?.errors[field.name]?.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {String(formState.errors[field.name]?.message)}
                        </p>
                      )}
                    </div>
                  );

                case "select":
                  return (
                    <div>
                      <select
                        {...field}
                        id={field.name}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select...</option>
                        {fieldConfig.data?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {formState?.errors[field.name]?.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {String(formState.errors[field.name]?.message)}
                        </p>
                      )}
                    </div>
                  );

                case "checkbox":
                  return (
                    <div className="flex items-center gap-2">
                      <input
                        {...field}
                        id={field.name}
                        type="checkbox"
                        checked={!!field.value}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={field.name as string}
                        className="text-gray-700"
                      >
                        {fieldConfig.label}
                      </label>
                      {formState?.errors[field.name]?.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {String(formState.errors[field.name]?.message)}
                        </p>
                      )}
                    </div>
                  );

                case "file":
                  return (
                    <div>
                      <input
                        id={field.name}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                        }}
                        className="w-full border rounded-md px-3 py-2 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {formState?.errors[field.name]?.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {String(formState.errors[field.name]?.message)}
                        </p>
                      )}
                    </div>
                  );

                default:
                  return <></>;
              }
            }}
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full h-12 bg-teal-600 text-white rounded-lg font-medium text-lg hover:bg-teal-700 transition focus:ring-2 focus:ring-teal-400 disabled:bg-gray-400 flex justify-center items-center"
      >
        {btnLable ?? "Submit"}
      </button>
    </form>
  );
}
