import { forwardRef } from "react";

type BaseProps = {
  label?: string;
  className?: string;
  type?: "text" | "number" | "password" | "email" | "textarea";
};

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextAreaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextAreaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block font-semibold text-gray-300 mb-1"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {type === "textarea" ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              {...(props as TextAreaProps)}
              className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
            />
          ) : (
            <input
              {...(props as InputProps)}
              type={type}
              ref={ref as React.Ref<HTMLInputElement>}
              className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
            />
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
