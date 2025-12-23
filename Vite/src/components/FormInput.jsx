import { InputText } from "primereact/inputtext";

export default function FormInput({
  name,
  register,
  error,
  ...rest
}) {
  return (
    <div className="space-y-1">
      <InputText
        {...register(name)}
        {...rest}
        className="w-full"
      />
      {error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
}

