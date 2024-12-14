import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { ForbiddenRequestError } from "@app/lib/errors";

import { ActorAuthMethod, ActorType } from "../auth/auth-type";
import { TKmsServiceFactory } from "../kms/kms-service";
import { TUserSecretsLoginCredentialServiceDALFactory } from "./user-secrets-login-credential-service-dal";

type TUserSecretsLoginCredentialServiceServiceFactoryDep = {
  userSecretsLoginCredentialServiceDAL: TUserSecretsLoginCredentialServiceDALFactory;
  permissionService: Pick<TPermissionServiceFactory, "getOrgPermission">;
  kmsService: TKmsServiceFactory;
};

type TCreateUserSecretLoginCredentialDTO = {
  actor: ActorType;
  actorId: string;
  orgId: string;
  actorAuthMethod: ActorAuthMethod;
  actorOrgId: string;
  name?: string;
  username: string;
  password: string;
};

type TGetUserSecretLoginCredentialDTO = {
  actor: ActorType;
  actorId: string;
  orgId: string;
  actorAuthMethod: ActorAuthMethod;
  actorOrgId: string;
};
export type TUserSecretsLoginCredentialServiceServiceFactory = ReturnType<
  typeof userSecretsLoginCredentialServiceServiceFactory
>;

export const userSecretsLoginCredentialServiceServiceFactory = ({
  userSecretsLoginCredentialServiceDAL,
  permissionService,
  kmsService
}: TUserSecretsLoginCredentialServiceServiceFactoryDep) => {
  const createUserSecretLoginCredential = async (input: TCreateUserSecretLoginCredentialDTO) => {
    const { actor, actorId, orgId, actorAuthMethod, actorOrgId, username, password } = input;
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new ForbiddenRequestError({ name: "User is not a part of the specified organization" });

    const name = input.name ? input.name : `${input.username}-login`;
    // const encrypt = kmsService.encryptWithRootKey();
    const newLoginCredential = await userSecretsLoginCredentialServiceDAL.create({
      name,
      username: Buffer.from(username),
      password: Buffer.from(password),
      userId: actorId,
      orgId
    });
    return {
      id: `${Buffer.from(newLoginCredential.id, "hex").toString("base64url")}`
    };
  };
  const getUserSecretLoginCredential = async (input: TGetUserSecretLoginCredentialDTO) => {
    const { actorOrgId, actor, actorId, orgId, actorAuthMethod } = input;
    if (!actorOrgId) throw new ForbiddenRequestError();

    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });
    const loginCredentials = await userSecretsLoginCredentialServiceDAL.find({ userId: actorId });
    const decrypt = kmsService.decryptWithRootKey();
    const decryptedLoginCredentials = loginCredentials.map((loginCredential) => {
      return {
        id: loginCredential.id,
        name: loginCredential.name,
        username: decrypt(loginCredential.username ?? Buffer.from("")),
        password: decrypt(loginCredential.password ?? Buffer.from(""))
      };
    });
    return {
      loginCredentials: decryptedLoginCredentials
    };
  };
  return {
    createUserSecretLoginCredential,
    getUserSecretLoginCredential
  };
};
