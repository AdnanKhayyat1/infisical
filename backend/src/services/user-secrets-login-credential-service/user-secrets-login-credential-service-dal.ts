import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { ormify } from "@app/lib/knex";

export type TUserSecretsLoginCredentialServiceDALFactory = ReturnType<
  typeof userSecretsLoginCredentialServiceDALFactory
>;

export const userSecretsLoginCredentialServiceDALFactory = (db: TDbClient) => {
  const userSecretsLoginCredentialOrm = ormify(db, TableName.UserSecretsLoginCredentials);
  return { ...userSecretsLoginCredentialOrm };
};
