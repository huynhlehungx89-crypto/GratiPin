"use client";

import { PinForm, type PinFormProps } from "./PinForm";

export function CreatePinForm(props: Omit<PinFormProps, "mode">) {
  return <PinForm mode="create" {...props} />;
}
