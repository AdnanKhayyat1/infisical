import type { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TableName.UserSecretsLoginCredentials);
  if (hasTable) {
    console.log("hasTable", hasTable);
    await knex.schema.alterTable(TableName.UserSecretsLoginCredentials, (table) => {
      table.uuid("userId").notNullable();
      table.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      table.uuid("orgId").notNullable();
      table.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      table.binary("name").alter();
      table.binary("usernameEncrypted").alter();
      table.binary("passwordEncrypted").alter();
    });
    await createOnUpdateTrigger(knex, TableName.UserSecretsLoginCredentials);
  }
  if (!hasTable) {
    await knex.schema.createTable(TableName.UserSecretsLoginCredentials, (table) => {
      table.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
    });
    await createOnUpdateTrigger(knex, TableName.UserSecretsLoginCredentials);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.UserSecretsLoginCredentials);
}
