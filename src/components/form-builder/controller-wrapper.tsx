/* eslint-disable @typescript-eslint/no-explicit-any */
// ControllerWrapper.tsx
import { Controller } from "react-hook-form";

export function ControllerWrapper({ name, control, render }: any) {
  return (
    <Controller
      name={name}
      control={control}
      render={(f) => render(f)}
    />
  );
}
