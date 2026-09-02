import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
}

export function UserAvatar({ src, name, className = "", iconClassName = "" }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name || "User profile"}
        className={`object-cover ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (name && name.trim().length > 0) {
    return <span>{name.trim()[0].toUpperCase()}</span>;
  }

  return <UserCircle className={iconClassName || "h-4 w-4"} />;
}
