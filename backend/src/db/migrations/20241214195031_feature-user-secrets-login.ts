import type { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TableName.UserSecretsLoginCredentials);
  if (!hasTable) {
    await knex.schema.createTable(TableName.UserSecretsLoginCredentials, (table) => {
      table.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      table.text("name");
      table.string("usernameEncrypted");
      table.string("passwordEncrypted");
    });
    await createOnUpdateTrigger(knex, TableName.UserSecretsLoginCredentials);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.UserSecretsLoginCredentials);
}
