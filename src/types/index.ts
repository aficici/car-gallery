import type { Role } from "@prisma/client";

export type { Role };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}
