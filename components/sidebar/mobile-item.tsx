import clsx from "clsx";
import Link from "next/link";
import type { IconType } from "react-icons";

interface MobileItemProps {
  href: string; // the link to redirect to
  icon: IconType; // the icon to display
  active?: boolean; // if the item is active
  onClick?: () => void; // function to execute when the item is clicked
}

/**
 * A button item component displayed at the bottom allowing the user to navigate through the app.
 * This is called from the `MobileFooter` component.
 *
 * @param param0: MobileItemProps
 * @returns mobile item component
 */
export default function MobileItem({
  href,
  icon: Icon,
  active,
  onClick,
}: MobileItemProps) {
  const handleClick = () => {
    // checks if the onClick function is defined as it is optional
    if (onClick) {
      return onClick();
    }
  };

  return (
    <Link
      onClick={handleClick}
      href={href}
      className={clsx(
        `group m-1 flex w-full justify-center gap-x-3 rounded-md p-4 font-semibold text-gray-500 text-sm leading-6 hover:bg-gray-100 hover:text-black`,
        active && "bg-gray-100 text-black",
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
}
