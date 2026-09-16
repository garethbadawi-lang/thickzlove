"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Browser auth client (proxies through `/api/auth`). */
export const authClient = createAuthClient();
