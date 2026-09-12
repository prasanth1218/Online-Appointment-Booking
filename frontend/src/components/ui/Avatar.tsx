import { useState } from "react";
import clsx from "clsx";
import { getInitials } from "../../utils/formatters.js";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
  xl: "size-24 text-xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center rounded-full bg-brand-100 font-display font-semibold text-brand-700",
          sizeClasses[size],
          className,
        )}
        aria-label={name}
        role="img"
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={clsx("rounded-full bg-brand-50 object-cover", sizeClasses[size], className)}
    />
  );
}
