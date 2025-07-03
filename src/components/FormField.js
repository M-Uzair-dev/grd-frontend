export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full px-4 py-2.5 rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}