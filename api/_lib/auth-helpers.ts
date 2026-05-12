import jwt from "jsonwebtoken";
import { Client } from "pg";

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
  rank: string;
}

export function signToken(payload: TokenPayload): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return jwt.verify(token, secret) as TokenPayload;
}

export function getTokenFromRequest(req: any): string | null {
  const auth = req.headers?.authorization as string | undefined;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export function createDbClient(): Client {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  return new Client({ connectionString: dbUrl });
}

export async function parseBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}
