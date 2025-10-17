import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined; // type of the button
  fullWidth?: boolean; // if the button should be full width
  children?: React.ReactNode; // children of the button to be rendered inside
  onClick?: () => void; // onClick function
  secondary?: boolean; // if the button should be secondary
  danger?: boolean; // if the button should be danger
  disabled?: boolean; // if the button should be disabled
}

/**
 * Button component that renders a button with the given children.
 * Depending on the props, the button will be styles differently and will have different functionality.
 * @param param0 { type, fullWidth, children, onClick, secondary, danger, disabled}: ButtonProps
 * @returns (JSX.Element): button component
 */
const Button: React.FC<ButtonProps> = ({
  type = "button",
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={clsx(
        `
        flex 
        justify-center 
        rounded-lg 
        px-3 
        py-2 
        text-sm 
        font-semibold 
        focus-visible:outline-solid 
        focus-visible:outline-2 
        focus-visible:outline-offset-2 
        `,
        disabled && "opacity-50 cursor-default",
        fullWidth && "w-full",
        secondary ? "text-gray-900" : "text-white",
        danger &&
          "bg-rose-800 hover:bg-rose-900 focus-visible:outline-rose-900",
        !secondary &&
          !danger &&
          "bg-red-500 hover:bg-red-600 focus-visible:outline-red-600"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
