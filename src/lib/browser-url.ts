export function browserUrl(value: string, origin: string): string {
  value = value.trim();
  if (!value) throw new Error("Enter a website address.");
  const url = new URL(
    value.startsWith("/")
      ? value
      : /^[a-z]+:/i.test(value)
        ? value
        : `https://${value}`,
    origin,
  );
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("Enter an http or https website address.");
  return url.href;
}
