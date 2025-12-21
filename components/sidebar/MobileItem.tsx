import Link from "next/link";
import clsx from "clsx";

interface MobileItemProps {
  href: string; // the link to redirect to
  icon: any; // the icon to display
  active?: boolean; // if the item is active
  onClick?: () => void; // function to execute when the item is clicked
}

/**
 * A button item component displayed at the bottom allowing the user to navigate through the app.
 * This is called from the `MobileFooter` component.
 *
 * @param param0 { href, icon, active, onClick}: props for the button item
 * @returns (JSX.Element): mobile item component
 */
function MobileItem({
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
        `
        group 
        flex 
        gap-x-3 
        text-sm 
        leading-6 
				rounded-md
        font-semibold 
        w-full 
        justify-center 
        p-4 
				m-1
        text-gray-500 
        hover:text-black 
        hover:bg-gray-100
      `,
        active && "bg-gray-100 text-black"
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
};

export default MobileItem;
