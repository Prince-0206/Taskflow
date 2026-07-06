export default function Avatar({ user, size = "md", ring = false }) {
  if (!user) return null;

  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-11 w-11 text-sm",
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      title={user.name}
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white ${
        sizes[size]
      } ${ring ? "ring-2 ring-white" : ""}`}
      style={{ backgroundColor: user.avatarColor || "#5B4FE9" }}
    >
      {initials}
    </div>
  );
}
