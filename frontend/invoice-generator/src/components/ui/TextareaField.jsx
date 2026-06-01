import React from 'react'

const TextareaField = ({ icon: Icon, label, name, error, fieldErrors, touched, ...props }) => {
  const hasError = fieldErrors && touched && fieldErrors[name] && touched[name];
  return (
    <div>
      <label htmlFor={name} className='block text-sm font-medium text-slate-700 mb-2'>{label}</label>
      <div className={`relative rounded-md border ${hasError ? 'border-red-400' : 'border-slate-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md`}>
        {Icon && 
          <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        }
        <textarea
          id={name}
          name={name}
          className={`w-full min-h-24 pr-3 py-2 border-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none ${Icon ? 'pl-10' : 'pl-3'}`}
          {...props}
        />
      </div>
      {hasError && <p className="mt-1 text-sm text-red-600 animate-shake">{fieldErrors[name]}</p>}
    </div>
  )
}

export default TextareaField