import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings_shipping_methods" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shop_settings_shipping_methods" CASCADE;
  ALTER TABLE "products_shop_colors" ALTER COLUMN "value" SET DATA TYPE text;
  -- Solo quedan blanco y negro.
  DELETE FROM "products_shop_colors" WHERE "value" NOT IN ('blanco', 'negro');
  DROP TYPE "public"."enum_products_shop_colors";
  CREATE TYPE "public"."enum_products_shop_colors" AS ENUM('blanco', 'negro');
  ALTER TABLE "products_shop_colors" ALTER COLUMN "value" SET DATA TYPE "public"."enum_products_shop_colors" USING "value"::"public"."enum_products_shop_colors";
  ALTER TABLE "_products_v_version_shop_colors" ALTER COLUMN "value" SET DATA TYPE text;
  DELETE FROM "_products_v_version_shop_colors" WHERE "value" NOT IN ('blanco', 'negro');
  DROP TYPE "public"."enum__products_v_version_shop_colors";
  CREATE TYPE "public"."enum__products_v_version_shop_colors" AS ENUM('blanco', 'negro');
  ALTER TABLE "_products_v_version_shop_colors" ALTER COLUMN "value" SET DATA TYPE "public"."enum__products_v_version_shop_colors" USING "value"::"public"."enum__products_v_version_shop_colors";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  -- Pedidos de la tienda → estados del presupuesto.
  UPDATE "orders" SET "status" = CASE "status"
    WHEN 'pending' THEN 'pending'
    WHEN 'cancelled' THEN 'lost'
    WHEN 'delivered' THEN 'won'
    ELSE 'contacted' END;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'contacted', 'won', 'lost');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  DROP INDEX "orders_payment_status_idx";
  ALTER TABLE "shop_settings" ALTER COLUMN "announcement" SET DEFAULT 'Presupuesto automático en el acto por WhatsApp';
  ALTER TABLE "shop_settings" ALTER COLUMN "thanks_message" SET DEFAULT 'Te escribimos por WhatsApp para resolver tus dudas, coordinar la entrega o la colocación.';
  ALTER TABLE "products" DROP COLUMN "shop_mp_discount";
  ALTER TABLE "products" DROP COLUMN "shop_track_stock";
  ALTER TABLE "products" DROP COLUMN "shop_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_mp_discount";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_track_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_shop_stock";
  ALTER TABLE "orders_items" DROP COLUMN "list_price";
  ALTER TABLE "orders" DROP COLUMN "payment_status";
  ALTER TABLE "orders" DROP COLUMN "status_note";
  ALTER TABLE "orders" DROP COLUMN "subtotal";
  ALTER TABLE "orders" DROP COLUMN "discount";
  ALTER TABLE "orders" DROP COLUMN "shipping_cost";
  ALTER TABLE "orders" DROP COLUMN "customer_email";
  ALTER TABLE "orders" DROP COLUMN "customer_document";
  ALTER TABLE "orders" DROP COLUMN "shipping_label";
  ALTER TABLE "orders" DROP COLUMN "shipping_type";
  ALTER TABLE "orders" DROP COLUMN "shipping_quote_later";
  ALTER TABLE "orders" DROP COLUMN "shipping_address";
  ALTER TABLE "orders" DROP COLUMN "shipping_city";
  ALTER TABLE "orders" DROP COLUMN "shipping_province";
  ALTER TABLE "orders" DROP COLUMN "shipping_zip";
  ALTER TABLE "orders" DROP COLUMN "shipping_carrier";
  ALTER TABLE "orders" DROP COLUMN "shipping_tracking_code";
  ALTER TABLE "orders" DROP COLUMN "shipping_tracking_url";
  ALTER TABLE "orders" DROP COLUMN "payment_method";
  ALTER TABLE "orders" DROP COLUMN "payment_reference";
  ALTER TABLE "shop_settings" DROP COLUMN "mp_discount";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_enabled";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_holder";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_bank";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_cbu";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_alias";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_cuit";
  ALTER TABLE "shop_settings" DROP COLUMN "transfer_instructions";
  ALTER TABLE "shop_settings" DROP COLUMN "mercadopago_enabled";
  ALTER TABLE "shop_settings" DROP COLUMN "cash_enabled";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_shipping_type";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_shop_settings_shipping_methods_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'rejected', 'refunded');
  CREATE TYPE "public"."enum_orders_shipping_type" AS ENUM('pickup', 'delivery');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('transfer', 'mercadopago', 'cash');
  CREATE TYPE "public"."enum_shop_settings_shipping_methods_type" AS ENUM('pickup', 'delivery');
  ALTER TYPE "public"."enum_products_shop_colors" ADD VALUE 'anodizado';
  ALTER TYPE "public"."enum_products_shop_colors" ADD VALUE 'madera';
  ALTER TYPE "public"."enum_products_shop_colors" ADD VALUE 'bronce';
  ALTER TYPE "public"."enum__products_v_version_shop_colors" ADD VALUE 'anodizado';
  ALTER TYPE "public"."enum__products_v_version_shop_colors" ADD VALUE 'madera';
  ALTER TYPE "public"."enum__products_v_version_shop_colors" ADD VALUE 'bronce';
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
  
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  UPDATE "orders" SET "status" = CASE "status"
    WHEN 'contacted' THEN 'confirmed'
    WHEN 'won' THEN 'delivered'
    WHEN 'lost' THEN 'cancelled'
    ELSE "status" END;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  ALTER TABLE "shop_settings" ALTER COLUMN "announcement" SET DEFAULT 'Hasta 20% off pagando por transferencia';
  ALTER TABLE "shop_settings" ALTER COLUMN "thanks_message" SET DEFAULT 'Recibimos tu pedido. Te escribimos por WhatsApp o email para coordinar el pago y la entrega.';
  ALTER TABLE "products" ADD COLUMN "shop_mp_discount" numeric;
  ALTER TABLE "products" ADD COLUMN "shop_track_stock" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "shop_stock" numeric DEFAULT 0;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_mp_discount" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_track_stock" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_shop_stock" numeric DEFAULT 0;
  ALTER TABLE "orders_items" ADD COLUMN "list_price" numeric;
  ALTER TABLE "orders" ADD COLUMN "payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "status_note" varchar;
  ALTER TABLE "orders" ADD COLUMN "subtotal" numeric;
  ALTER TABLE "orders" ADD COLUMN "discount" numeric;
  ALTER TABLE "orders" ADD COLUMN "shipping_cost" numeric;
  ALTER TABLE "orders" ADD COLUMN "customer_email" varchar;
  ALTER TABLE "orders" ADD COLUMN "customer_document" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_label" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_type" "enum_orders_shipping_type";
  ALTER TABLE "orders" ADD COLUMN "shipping_quote_later" boolean;
  ALTER TABLE "orders" ADD COLUMN "shipping_address" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_city" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_province" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_zip" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_carrier" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_tracking_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_tracking_url" varchar;
  ALTER TABLE "orders" ADD COLUMN "payment_method" "enum_orders_payment_method" NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "payment_reference" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "mp_discount" numeric DEFAULT 0;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_enabled" boolean DEFAULT true;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_holder" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_bank" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_cbu" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_alias" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_cuit" varchar;
  ALTER TABLE "shop_settings" ADD COLUMN "transfer_instructions" varchar DEFAULT 'Transferí el total y envianos el comprobante por WhatsApp indicando tu número de pedido.';
  ALTER TABLE "shop_settings" ADD COLUMN "mercadopago_enabled" boolean DEFAULT true;
  ALTER TABLE "shop_settings" ADD COLUMN "cash_enabled" boolean DEFAULT true;
  ALTER TABLE "shop_settings_shipping_methods" ADD CONSTRAINT "shop_settings_shipping_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shop_settings_shipping_methods_order_idx" ON "shop_settings_shipping_methods" USING btree ("_order");
  CREATE INDEX "shop_settings_shipping_methods_parent_id_idx" ON "shop_settings_shipping_methods" USING btree ("_parent_id");
  CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");`)
}
