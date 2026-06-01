import { Loader2 } from 'lucide-react'

const Button = ({
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    children,
    icon: Icon,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-blue-900 text-white hover:bg-blue-800',
        secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    };
    const sizeClasses = {
        small: 'px-3 py-1 h-8 text-sm',
        medium: 'px-4 py-2 h-10 text-sm',
        large: 'px-6 py-3 h-12 text-base',
    };
    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {children}
                </>
            )}
        </button>
    )
}

export default Button