import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let _client: PrismaClient | null = (global as any).prisma ?? null;

function createClient() {
  const clientOptions: any = {};
  if (process.env.DATABASE_URL) {
    clientOptions.adapter = { provider: "postgres", url: process.env.DATABASE_URL };
  }
  const c = new PrismaClient(clientOptions);
  if (process.env.NODE_ENV !== "production") (global as any).prisma = c;
  return c;
}

const handler: ProxyHandler<any> = {
  get(_, prop, receiver) {
    if (!_client) _client = createClient();
    const value = Reflect.get(_client as any, prop, receiver);
    return typeof value === "function" ? value.bind(_client) : value;
  },
  set(_, prop, value) {
    if (!_client) _client = createClient();
    return Reflect.set(_client as any, prop, value);
  },
};

const prismaProxy = new Proxy({}, handler) as unknown as PrismaClient;

export default prismaProxy;
