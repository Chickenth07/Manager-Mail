import dns from "dns/promises";

export async function hasMxRecord(email) {
  try {
    if (!email || !email.includes("@")) return false;

    const domain = email.split("@")[1].toLowerCase();

    const records = await dns.resolveMx(domain);

    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    return false;
  }
}
