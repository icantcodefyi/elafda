import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type User = (typeof authClient.$Infer.Session)['user'];