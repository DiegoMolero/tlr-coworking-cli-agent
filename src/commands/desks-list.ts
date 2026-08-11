import { apiJson } from "../lib/api-client.js";
import { config } from "../lib/config.js";
import { printError } from "../lib/format.js";

export interface BookableResource {
  _id: string;
  name: string;
  number?: number;
  type: string;
  office: string;
  rate?: { price?: number; name?: string };
  availability?: Array<{ startDate: string; endDate: string | null }>;
}

export interface DesksListOptions {
  date?: string;
  type?: string;
  json?: boolean;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchBookableResources(opts: { date?: string; type?: string }): Promise<BookableResource[]> {
  const date = opts.date ?? todayIso();
  const type = opts.type ?? "hotdesk";
  const query = new URLSearchParams({
    type,
    office: config.officeId,
    date,
    $populate: "rate",
  });
  return apiJson<BookableResource[]>(`/user/resources/bookable?${query.toString()}`);
}

export async function desksListCommand(opts: DesksListOptions): Promise<void> {
  try {
    const resources = await fetchBookableResources(opts);
    if (opts.json) {
      console.log(JSON.stringify(resources, null, 2));
      return;
    }
    if (resources.length === 0) {
      console.log("No resources found for that date/type.");
      return;
    }
    for (const r of resources) {
      const price = r.rate?.price != null ? ` - ${r.rate.price}` : "";
      console.log(`${r._id}  ${r.name}${r.number != null ? ` (#${r.number})` : ""}  [${r.type}]${price}`);
    }
  } catch (err) {
    printError(err, Boolean(opts.json));
    process.exitCode = 1;
  }
}
