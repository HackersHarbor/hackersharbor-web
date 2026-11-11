
import type { ReactNode } from "react";

type DockLayoutProps = {
  children: ReactNode;
};

export default function DockLayout({ children }: DockLayoutProps) {
  return <>{children}</>;
}
