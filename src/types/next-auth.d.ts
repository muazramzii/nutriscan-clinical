import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "NURSE" | "DIETITIAN" | "ADMIN";
      ward?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "NURSE" | "DIETITIAN" | "ADMIN";
    ward?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "NURSE" | "DIETITIAN" | "ADMIN";
    ward?: string | null;
  }
}
