import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_shop_colors" AS ENUM('blanco', 'negro', 'anodizado', 'madera', 'bronce');
  CREATE TYPE "public"."enum__products_v_version_shop_colors" AS ENUM('blanco', 'negro', 'anodizado', 'madera', 'bronce');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'rejected', 'refunded');
  CREATE TYPE "public"."enum_orders_shipping_type" AS ENUM('pickup', 'delivery');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('transfer', 'mercadopago', 'cash');
  CREATE TYPE "public"."enum_shop_settings_shipping_methods_type" AS ENUM('pickup', 'delivery');
  CREATE TABLE "products_shop_colors" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_shop_colors",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_shop_colors" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_shop_colors",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"variant" varchar,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"product_id" integer,
  	"sku" varchar,
  	"list_price" numeric
  );
  
  CREATE TABLE "orders_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"label" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
  	"status_note" varchar,
  	"subtotal" numeric,
  	"discount" numeric,
  	"shipping_cost" numeric,
  	"total" numeric,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar,
  	"customer_phone" varchar,
  	"customer_document" varchar,
  	"notes" varchar,
  	"shipping_label" varchar,
  	"shipping_type" "enum_orders_shipping_type",
  	"shipping_quote_later" boolean,
  	"shipping_address" varchar,
  	"shipping_city" varchar,
  	"shipping_province" varchar,
  	"shipping_zip" varchar,
  	"shipping_carrier" varchar,
  	"shipping_tracking_code" varchar,
  	"shipping_tracking_url" varchar,
  	"internal_notes" varchar,
  	"order_number" varchar NOT NULL,
  	"payment_method" "enum_orders_payment_method" NOT NULL,
  	"payment_reference" varchar,
  	"access_token" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shop_settings_shipping_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_shop_settings_shipping_methods_type" DEFAULT 'delivery' NOT NULL,
  	"description" varchar,
  	"quote_later" boolean DEFAULT false,
  	"price" numeric,
  	"free_from" numeric
  );
  
  CREATE TABLE "shop_settings_notification_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "shop_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"announcement" varchar DEFAULT 'Hasta 20% off pagando por transferencia',
  	"transfer_discount" numeric DEFAULT 20,
  	"mp_discount" numeric DEFAULT 0,
  	"installments" numeric DEFAULT 3,
  	"thanks_message" varchar DEFAULT 'Recibimos tu pedido. Te escribimos por WhatsApp o email para coordinar el pago y la entrega.',
  	"transfer_enabled" boolean DEFAULT true,
  	"transfer_holder" varchar,
  	"transfer_bank" varchar,
  	"transfer_cbu" varchar,
  	"transfer_alias" varchar,
  	"transfer_cuit" varchar,
  	"transfer_instructions" varchar DEFAULT 'Transferí el total y envianos el comprobante por WhatsApp indicando tu número de pedido.',
  	"mercadopago_enabled" boolean DEFAULT true,
  	"cash_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products" ADD COLUMN "shop_enabled" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "shop_price" numeric;
  ALTER TABLE "products" ADD COLUMN "shop_sku" varchar;
  ALTER TABLE "products" ADD COLUMN "shop_transfer_discount" numeric;
  ALTER TABLE "products" ADD COLUMN "shop_mp_discount" numeric;
  ALTER TABLE "products" ADD COLUMN "shop_installments" numeric;
  ALTER TABLE "products" ADD COLUMN "shop_measure" varchar;
  ALTER TABLE "products" ADD COLUMN "shop_track_stock" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "shop_stock" numeric DEFAULT 0;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_enabled" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_sku" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_transfer_discount" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_mp_discount" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_installments" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_measure" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_track_stock" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_stock" numeric DEFAULT 0;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "products_shop_colors" ADD CONSTRAINT "products_shop_colors_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_shop_colors" ADD CONSTRAINT "_products_v_version_shop_colors_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_timeline" ADD CONSTRAINT "orders_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_settings_shipping_methods" ADD CONSTRAINT "shop_settings_shipping_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_settings_notification_emails" ADD CONSTRAINT "shop_settings_notification_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_shop_colors_order_idx" ON "products_shop_colors" USING btree ("order");
  CREATE INDEX "products_shop_colors_parent_idx" ON "products_shop_colors" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_shop_colors_order_idx" ON "_products_v_version_shop_colors" USING btree ("order");
  CREATE INDEX "_products_v_version_shop_colors_parent_idx" ON "_products_v_version_shop_colors" USING btree ("parent_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_timeline_order_idx" ON "orders_timeline" USING btree ("_order");
  CREATE INDEX "orders_timeline_parent_id_idx" ON "orders_timeline" USING btree ("_parent_id");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_access_token_idx" ON "orders" USING btree ("access_token");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "shop_settings_shipping_methods_order_idx" ON "shop_settings_shipping_methods" USING btree ("_order");
  CREATE INDEX "shop_settings_shipping_methods_parent_id_idx" ON "shop_settings_shipping_methods" USING btree ("_parent_id");
  CREATE INDEX "shop_settings_notification_emails_order_idx" ON "shop_settings_notification_emails" USING btree ("_order");
  CREATE INDEX "shop_settings_notification_emails_parent_id_idx" ON "shop_settings_notification_emails" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_shop_shop_enabled_idx" ON "products" USING btree ("shop_enabled");
  CREATE INDEX "products_shop_shop_price_idx" ON "products" USING btree ("shop_price");
  CREATE INDEX "_products_v_version_shop_version_shop_enabled_idx" ON "_products_v" USING btree ("version_shop_enabled");
  CREATE INDEX "_products_v_version_shop_version_shop_price_idx" ON "_products_v" USING btree ("version_shop_price");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_shop_colors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_shop_colors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_settings_shipping_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_settings_notification_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_shop_colors" CASCADE;
  DROP TABLE "_products_v_version_shop_colors" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_timeline" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "shop_settings_shipping_methods" CASCADE;
  DROP TABLE "shop_settings_notification_emails" CASCADE;
  DROP TABLE "shop_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "products_shop_shop_enabled_idx";
  DROP INDEX "products_shop_shop_price_idx";
  DROP INDEX "_products_v_version_shop_version_shop_enabled_idx";
  DROP INDEX "_products_v_version_shop_version_shop_price_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "products" DROP COLUMN "shop_enabled";
  ALTER TABLE "products" DROP COLUMN "shop_price";
  ALTER TABLE "products" DROP COLUMN "shop_sku";
  ALTER TABLE "products" DROP COLUMN "shop_transfer_discount";
  ALTER TABLE "products" DROP COLUMN "shop_mp_discount";
  ALTER TABLE "products" DROP COLUMN "shop_installments";
  ALTER TABLE "products" DROP COLUMN "shop_measure";
  ALTER TABLE "products" DROP COLUMN "shop_track_stock";
  ALTER TABLE "products" DROP COLUMN "shop_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_sku";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_transfer_discount";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_mp_discount";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_installments";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_measure";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_track_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_stock";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_products_shop_colors";
  DROP TYPE "public"."enum__products_v_version_shop_colors";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_shipping_type";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_shop_settings_shipping_methods_type";`)
}
