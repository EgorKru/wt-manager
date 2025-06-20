import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { apiClient } from "@/lib/api-client";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";

const app = new Hono()
  .get("/current", sessionMiddleware, (c) => {
    const user = c.get("user");
    return c.json({ data: user });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      // Используем наш API клиент для логина (передаем email как username)
      const response = await apiClient.login(email, password);

      // Устанавливаем JWT токены в cookies
      setCookie(c, ACCESS_TOKEN_COOKIE, response.accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 день для access token
      });

      setCookie(c, REFRESH_TOKEN_COOKIE, response.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 дней для refresh token
      });

      return c.json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Invalid credentials" }, 401);
    }
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    try {
      const { email, password, name } = c.req.valid("json");

      // TODO: Реализовать когда будет endpoint для регистрации
      console.log("Register attempt:", { email, name });
      
      // Пока возвращаем ошибку
      return c.json({ error: "Registration not implemented yet" }, 501);

      // Когда будет endpoint:
      // const { account } = await createAdminClient();
      // await account.create(ID.unique(), email, password, name);
      // const session = await account.createEmailPasswordSession(email, password);
      // setCookie(c, ACCESS_TOKEN_COOKIE, session.secret, ...);
      // return c.json({ success: true });
    } catch (error) {
      console.error("Registration error:", error);
      return c.json({ error: "Registration failed" }, 400);
    }
  })
  .post("/logout", sessionMiddleware, async (c) => {
    try {
      // Удаляем cookies
      deleteCookie(c, ACCESS_TOKEN_COOKIE);
      deleteCookie(c, REFRESH_TOKEN_COOKIE);

      // TODO: Добавить вызов API для logout когда будет endpoint
      // const account = c.get("account");
      // await account.deleteSession("current");

      return c.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      return c.json({ error: "Logout failed" }, 400);
    }
  });

export default app;
