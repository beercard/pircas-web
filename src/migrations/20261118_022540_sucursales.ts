import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"street" varchar NOT NULL,
  	"city" varchar,
  	"region" varchar,
  	"maps_url" varchar
  );
  
  ALTER TABLE "site_settings_branches" ADD CONSTRAINT "site_settings_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_branches_order_idx" ON "site_settings_branches" USING btree ("_order");
  CREATE INDEX "site_settings_branches_parent_id_idx" ON "site_settings_branches" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_branches" CASCADE;`)
}
