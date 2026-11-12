import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_shop_variants_color" AS ENUM('blanco', 'negro');
  CREATE TYPE "public"."enum__products_v_version_shop_variants_color" AS ENUM('blanco', 'negro');
  CREATE TABLE "products_shop_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"measure" varchar,
  	"color" "enum_products_shop_variants_color",
  	"option" varchar,
  	"price" numeric
  );
  
  CREATE TABLE "products_shop_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_version_shop_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"measure" varchar,
  	"color" "enum__products_v_version_shop_variants_color",
  	"option" varchar,
  	"price" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_shop_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "shop_option_label" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_option_label" varchar;
  ALTER TABLE "orders" ADD COLUMN "vat_percent" numeric;
  ALTER TABLE "shop_settings" ADD COLUMN "vat_percent" numeric DEFAULT 21;
  ALTER TABLE "products_shop_variants" ADD CONSTRAINT "products_shop_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_shop_choices" ADD CONSTRAINT "products_shop_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_shop_variants" ADD CONSTRAINT "_products_v_version_shop_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_shop_choices" ADD CONSTRAINT "_products_v_version_shop_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_shop_variants_order_idx" ON "products_shop_variants" USING btree ("_order");
  CREATE INDEX "products_shop_variants_parent_id_idx" ON "products_shop_variants" USING btree ("_parent_id");
  CREATE INDEX "products_shop_choices_order_idx" ON "products_shop_choices" USING btree ("_order");
  CREATE INDEX "products_shop_choices_parent_id_idx" ON "products_shop_choices" USING btree ("_parent_id");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_version_shop_variants_order_idx" ON "_products_v_version_shop_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_shop_variants_parent_id_idx" ON "_products_v_version_shop_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_shop_choices_order_idx" ON "_products_v_version_shop_choices" USING btree ("_order");
  CREATE INDEX "_products_v_version_shop_choices_parent_id_idx" ON "_products_v_version_shop_choices" USING btree ("_parent_id");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_shop_variants" CASCADE;
  DROP TABLE "products_shop_choices" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "_products_v_version_shop_variants" CASCADE;
  DROP TABLE "_products_v_version_shop_choices" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  ALTER TABLE "products" DROP COLUMN "shop_option_label";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_option_label";
  ALTER TABLE "orders" DROP COLUMN "vat_percent";
  ALTER TABLE "shop_settings" DROP COLUMN "vat_percent";
  DROP TYPE "public"."enum_products_shop_variants_color";
  DROP TYPE "public"."enum__products_v_version_shop_variants_color";`)
}
