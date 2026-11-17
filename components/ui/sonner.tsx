"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted",
          actionButton:
            "group-[.toast]:bg-accent-gradient group-[.toast]:text-[#0b0b0f] group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-surface-2 group-[.toast]:text-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
