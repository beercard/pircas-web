import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_shop_accessories_kind" AS ENUM('celosia', 'mosquitero', 'reja');
  CREATE TYPE "public"."enum__products_v_version_shop_accessories_kind" AS ENUM('celosia', 'mosquitero', 'reja');
  CREATE TABLE "products_shop_accessories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_products_shop_accessories_kind",
  	"price" numeric
  );
  
  CREATE TABLE "_products_v_version_shop_accessories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__products_v_version_shop_accessories_kind",
  	"price" numeric,
  	"_uuid" varchar
  );
  
  ALTER TABLE "product_categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "_product_categories_v" ADD COLUMN "version_parent_id" integer;
  ALTER TABLE "orders" ADD COLUMN "transfer_total" numeric;
  ALTER TABLE "orders" ADD COLUMN "installments" numeric;
  ALTER TABLE "orders" ADD COLUMN "installment_amount" numeric;
  ALTER TABLE "orders" ADD COLUMN "customer_city" varchar;
  ALTER TABLE "orders" ADD COLUMN "whatsapp_sent" boolean;
  ALTER TABLE "orders" ADD COLUMN "source" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "validity_days" numeric DEFAULT 7;
  ALTER TABLE "products_shop_accessories" ADD CONSTRAINT "products_shop_accessories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_shop_accessories" ADD CONSTRAINT "_products_v_version_shop_accessories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_shop_accessories_order_idx" ON "products_shop_accessories" USING btree ("_order");
  CREATE INDEX "products_shop_accessories_parent_id_idx" ON "products_shop_accessories" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_shop_accessories_order_idx" ON "_products_v_version_shop_accessories" USING btree ("_order");
  CREATE INDEX "_products_v_version_shop_accessories_parent_id_idx" ON "_products_v_version_shop_accessories" USING btree ("_parent_id");
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_version_parent_id_product_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
  CREATE INDEX "_product_categories_v_version_version_parent_idx" ON "_product_categories_v" USING btree ("version_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_shop_accessories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_shop_accessories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_shop_accessories" CASCADE;
  DROP TABLE "_products_v_version_shop_accessories" CASCADE;
  ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_parent_id_product_categories_id_fk";
  
  ALTER TABLE "_product_categories_v" DROP CONSTRAINT "_product_categories_v_version_parent_id_product_categories_id_fk";
  
  DROP INDEX "product_categories_parent_idx";
  DROP INDEX "_product_categories_v_version_version_parent_idx";
  ALTER TABLE "product_categories" DROP COLUMN "parent_id";
  ALTER TABLE "_product_categories_v" DROP COLUMN "version_parent_id";
  ALTER TABLE "orders" DROP COLUMN "transfer_total";
  ALTER TABLE "orders" DROP COLUMN "installments";
  ALTER TABLE "orders" DROP COLUMN "installment_amount";
  ALTER TABLE "orders" DROP COLUMN "customer_city";
  ALTER TABLE "orders" DROP COLUMN "whatsapp_sent";
  ALTER TABLE "orders" DROP COLUMN "source";
  ALTER TABLE "shop_settings" DROP COLUMN "validity_days";
  DROP TYPE "public"."enum_products_shop_accessories_kind";
  DROP TYPE "public"."enum__products_v_version_shop_accessories_kind";`)
}
