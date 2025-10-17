import { IconType } from "react-icons";

interface AuthSocialButtonProps {
  icon: IconType;
  onClick: () => void;
}

/**
 * Displays a button with an icon for the third party authentication provider.
 * Depending on the provider, it will call the `onClick` function with the provider name.
 *
 * @param param0: icon and onClick function for the third party authentication provider
 * @returns (JSX.Element): button with icon for the third party authentication provider
 */
const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        w-full 
        justify-center 
        rounded-lg 
        bg-white 
        px-4 
        py-3 
        text-gray-500 
        shadow-xs 
        ring-1 
        ring-inset 
        ring-gray-300 
        hover:bg-gray-50 
        focus:outline-offset-0
      "
    >
      <Icon />
    </button>
  );
};

export default AuthSocialButton;
