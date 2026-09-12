import clsx from "clsx";
import Link from "next/link";
import type { IconType } from "react-icons";

interface DesktopItemProps {
  label: string;
  icon: IconType;
  href: string;
  onClick?: () => void;
  active?: boolean;
}

/**
 * A desktop item component displayed on the side allowing the user to navigate through the app.
 * @param param0: DesktopItemProps
 * @returns desktop item component
 */
export default function DesktopItem({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: DesktopItemProps) {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };

  return (
    <li onClick={handleClick} key={label}>
      <Link
        href={href}
        className={clsx(
          `group flex gap-x-3 rounded-md p-3 font-semibold text-gray-500 text-sm leading-6 hover:bg-gray-100 hover:text-black`,
          active && "bg-gray-100 text-black",
        )}
      >
        <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />

        {/* Show label on the server only for search optimisation */}
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
}
