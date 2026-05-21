import Select, { type MultiValue, type SingleValue } from 'react-select'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'


export type Option = { value: string; label: string }

export function SingleSelect<TFieldValues extends FieldValues>(props: {
  field: ControllerRenderProps<TFieldValues, any>
  options: Option[]
  placeholder?: string
}) {
  const { field, options, placeholder } = props
  return (
    <Select<Option, false>
      options={options}
      placeholder={placeholder}
      value={options.find((o) => o.value === field.value) ?? null}
      onChange={(opt: SingleValue<Option>) => field.onChange(opt?.value ?? null)}
    />
  )
}

export function MultiSelect<TFieldValues extends FieldValues>(props: {
  field: ControllerRenderProps<TFieldValues, any>
  options: Option[]
  placeholder?: string
}) {
  const { field, options, placeholder } = props
  const selected = options.filter((o) => Array.isArray(field.value) && field.value.includes(o.value))
  return (
    <Select<Option, true>
      isMulti
      options={options}
      placeholder={placeholder}
      value={selected}
      onChange={(opts: MultiValue<Option>) => field.onChange(opts.map((o) => o.value))}
    />
  )
}

