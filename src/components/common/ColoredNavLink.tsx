import { Link, type LinkOptions } from "@tanstack/react-router";
import { type FC, type PropsWithChildren } from "react";

interface ColoredNavLinkProps extends PropsWithChildren, LinkOptions {}

export const ColoredNavLink: FC<ColoredNavLinkProps> = ({ to, children }) => {
  return (
    <Link to={to} className={"text-sky-500"}>
      {children}
    </Link>
  );
};
