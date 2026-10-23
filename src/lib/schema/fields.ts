/*
 * Field definitions describe every editable piece of content once. They drive:
 *  - the admin forms (src/components/admin/FieldInput.tsx)
 *  - server-side validation (src/lib/schema/validate.ts)
 *  - the MongoDB models (src/lib/models.ts)
 * This file is shared by client and server code, so it must stay dependency-free.
 */

import type { FormKey } from "@/lib/forms";

export interface Option {
  value: string;
  label: string;
}

interface Base {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
  /** Layout hint for the admin form grid. */
  width?: "full" | "half" | "third";
  /** Kept out of everything the public pages read (a sign-in e-mail or code): only the admin panel sees it. */
  private?: boolean;
}

export interface TextField extends Base {
  type: "text" | "textarea" | "richtext" | "email" | "url" | "tel" | "color";
  maxLength?: number;
  rows?: number;
  /** Validation only: a link still being typed (previews), so only a dangerous scheme is refused. */
  draftLink?: boolean;
}
export interface NumberField extends Base {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}
export interface BooleanField extends Base {
  type: "boolean";
}
export interface SelectField extends Base {
  type: "select" | "multiselect";
  options: Option[];
}
export interface DateField extends Base {
  /** date = YYYY-MM-DD, datetime = ISO string (entered in IST), time = HH:mm */
  type: "date" | "datetime" | "time";
}
export interface MediaField extends Base {
  type: "image" | "file";
  accept?: string;
}
export interface StringListField extends Base {
  type: "stringList";
  itemLabel?: string;
  maxItems?: number;
}
export interface ObjectListField extends Base {
  type: "objectList";
  fields: FieldDef[];
  itemLabel: string;
  /** Field used as the collapsed title of each item. */
  titleKey?: string;
  maxItems?: number;
}
export interface GroupField extends Base {
  type: "group";
  fields: FieldDef[];
}
export interface RefField extends Base {
  type: "ref" | "refList";
  resource: string;
}
/** The order of a fixed set of items (a page's sections): each option once, in the order chosen. */
export interface OrderField extends Base {
  type: "order";
  options: Option[];
  /** Items shown above the list that stay where they are (a page's hero). */
  pinned?: string[];
}

/** A public form's fields (src/lib/forms.ts): their names, guides, types of answer and choices, and added questions. */
export interface FormFieldsField extends Base {
  type: "formFields";
  form: FormKey;
  /** Validation only: a preview, where a list still without choices is fine. */
  draft?: boolean;
}

export type FieldDef =
  | TextField
  | NumberField
  | BooleanField
  | SelectField
  | DateField
  | MediaField
  | StringListField
  | ObjectListField
  | GroupField
  | RefField
  | OrderField
  | FormFieldsField;

/** A tab of fields inside a singleton editor (Settings, Hackathon). */
export interface FieldSection {
  key: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

/* Helpers to keep resource definitions short */
export const text = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({ name, label, type: "text", ...extra });
export const textarea = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({ name, label, type: "textarea", rows: 3, ...extra });
export const richtext = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({
  name,
  label,
  type: "richtext",
  rows: 6,
  help: "Supports **bold**, *italic*, [links](https://…) and lists starting with “- ”.",
  ...extra,
});
export const url = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({ name, label, type: "url", placeholder: "https://", ...extra });
export const email = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({ name, label, type: "email", ...extra });
export const bool = (name: string, label: string, extra: Partial<BooleanField> = {}): BooleanField => ({ name, label, type: "boolean", ...extra });
export const num = (name: string, label: string, extra: Partial<NumberField> = {}): NumberField => ({ name, label, type: "number", ...extra });
export const select = (name: string, label: string, options: Option[], extra: Partial<SelectField> = {}): SelectField => ({ name, label, type: "select", options, ...extra });
export const multiselect = (name: string, label: string, options: Option[], extra: Partial<SelectField> = {}): SelectField => ({ name, label, type: "multiselect", options, ...extra });
export const image = (name: string, label: string, extra: Partial<MediaField> = {}): MediaField => ({ name, label, type: "image", accept: "image/*", ...extra });
export const file = (name: string, label: string, extra: Partial<MediaField> = {}): MediaField => ({ name, label, type: "file", accept: "application/pdf,image/*", ...extra });
export const list = (name: string, label: string, extra: Partial<StringListField> = {}): StringListField => ({ name, label, type: "stringList", ...extra });
export const objects = (name: string, label: string, itemLabel: string, fields: FieldDef[], extra: Partial<ObjectListField> = {}): ObjectListField => ({
  name,
  label,
  type: "objectList",
  itemLabel,
  fields,
  titleKey: fields[0]?.name,
  ...extra,
});
export const date = (name: string, label: string, extra: Partial<DateField> = {}): DateField => ({ name, label, type: "date", ...extra });
export const datetime = (name: string, label: string, extra: Partial<DateField> = {}): DateField => ({ name, label, type: "datetime", ...extra });
export const time = (name: string, label: string, extra: Partial<DateField> = {}): DateField => ({ name, label, type: "time", ...extra });
export const ref = (name: string, label: string, resource: string, extra: Partial<RefField> = {}): RefField => ({ name, label, type: "ref", resource, ...extra });
export const refList = (name: string, label: string, resource: string, extra: Partial<RefField> = {}): RefField => ({ name, label, type: "refList", resource, ...extra });
export const color = (name: string, label: string, extra: Partial<TextField> = {}): TextField => ({ name, label, type: "color", ...extra });
export const order = (name: string, label: string, options: Option[], extra: Partial<OrderField> = {}): OrderField => ({ name, label, type: "order", options, ...extra });
export const formFieldList = (name: string, label: string, form: FormKey, extra: Partial<FormFieldsField> = {}): FormFieldsField => ({ name, label, type: "formFields", form, ...extra });
