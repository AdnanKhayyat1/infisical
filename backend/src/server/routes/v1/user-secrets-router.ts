import { z } from "zod";

import { UserSecretsLoginCredentialsSchema } from "@app/db/schemas";
import { readLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerUserSecretsRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      params: z.object({}),
      response: {
        200: z.object({
          logins: z.array(UserSecretsLoginCredentialsSchema)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const res = await req.server.services.userSecretsLoginCredential.getUserSecretLoginCredential({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId
      });
      return {
        logins: res.loginCredentials.map((login) => ({
          ...login,
          userId: req.permission.id,
          orgId: req.permission.orgId
        }))
      };
    }
  });
  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      params: UserSecretsLoginCredentialsSchema,
      response: {
        200: "OK"
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async () => {
      // const { username, password, name } = req.body;
      // const res = await req.server.services.userSecretsLoginCredential.createUserSecretLoginCredential({
      //   actor: req.permission.type,
      //   actorId: req.permission.id,
      //   orgId: req.permission.orgId,
      //   actorAuthMethod: req.permission.authMethod,
      //   actorOrgId: req.permission.orgId,
      //   username: username,
      //   password: password,
      //   name: name
      // });
      return "OK";
    }
  });
};
