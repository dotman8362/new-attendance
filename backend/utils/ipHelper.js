// ✅ Normalize IP & optionally reduce it to subnet
export const normalizeIP = (ip, level = 2) => {
  if (!ip) return "";

  // Remove IPv6 prefix (::ffff:)
  if (ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

  // Handle localhost
  if (ip === "::1") ip = "127.0.0.1";

  // Return subnet if level < 4
  const parts = ip.split(".");
  return parts.slice(0, level).join(".");
};
