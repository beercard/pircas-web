import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ADD COLUMN "buttons_card" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "buttons_choose" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "buttons_add" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "buttons_now" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" DROP COLUMN "buttons_card";
  ALTER TABLE "shop_settings" DROP COLUMN "buttons_choose";
  ALTER TABLE "shop_settings" DROP COLUMN "buttons_add";
  ALTER TABLE "shop_settings" DROP COLUMN "buttons_now";`)
}
