export default function FormField({ label, htmlFor, children }) {
    return (
        <div className="mb-4">
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-[.75rem] font-bold uppercase tracking-[.05em] text-[#6679a3]"
            >
                {label}
            </label>
            {children}
        </div>
    )
}
