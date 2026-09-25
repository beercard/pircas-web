import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_contact_form" AS ENUM('general', 'professional');
  CREATE TYPE "public"."enum_pages_blocks_audiences_items_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_audiences_items_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_pages_blocks_audiences_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_audiences_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_audiences_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_docs_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_docs_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_docs_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_docs_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_form" AS ENUM('general', 'professional');
  CREATE TYPE "public"."enum__pages_v_blocks_audiences_items_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_audiences_items_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__pages_v_blocks_audiences_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_audiences_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_audiences_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__docs_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__docs_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__docs_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__docs_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_contact_form" AS ENUM('general', 'professional');
  CREATE TYPE "public"."enum_homepage_blocks_audiences_items_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_homepage_blocks_audiences_items_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_homepage_blocks_audiences_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_audiences_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_audiences_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_contact_form" AS ENUM('general', 'professional');
  CREATE TYPE "public"."enum__homepage_v_blocks_audiences_items_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__homepage_v_blocks_audiences_items_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__homepage_v_blocks_audiences_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_audiences_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_audiences_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_contact_form" AS ENUM('general', 'professional');
  CREATE TYPE "public"."enum_archives_blocks_audiences_items_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_archives_blocks_audiences_items_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_archives_blocks_audiences_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_audiences_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_audiences_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  ALTER TYPE "public"."enum_proj_grid_source" ADD VALUE 'category' BEFORE 'manual';
  ALTER TYPE "public"."enum__proj_grid_v_source" ADD VALUE 'category' BEFORE 'manual';
  ALTER TYPE "public"."enum_leads_type" ADD VALUE 'project';
  CREATE TABLE "pages_blocks_audiences_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"tone" "enum_pages_blocks_audiences_items_tone" DEFAULT 'light',
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_pages_blocks_audiences_items_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "pages_blocks_audiences_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_audiences_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_audiences_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_audiences_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "docs_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"file_id" integer
  );
  
  CREATE TABLE "docs_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_docs_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "docs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"show_lines" boolean DEFAULT true,
  	"note" varchar,
  	"cta_type" "enum_docs_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_docs_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_docs_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audiences_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"tone" "enum__pages_v_blocks_audiences_items_tone" DEFAULT 'light',
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum__pages_v_blocks_audiences_items_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audiences_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_audiences_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_audiences_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_audiences_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_docs_v_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"file_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_docs_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__docs_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_docs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"show_lines" boolean DEFAULT true,
  	"note" varchar,
  	"cta_type" "enum__docs_v_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__docs_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__docs_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_audiences_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"tone" "enum_homepage_blocks_audiences_items_tone" DEFAULT 'light',
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_homepage_blocks_audiences_items_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "homepage_blocks_audiences_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_audiences_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_audiences_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_audiences_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_audiences_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"tone" "enum__homepage_v_blocks_audiences_items_tone" DEFAULT 'light',
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum__homepage_v_blocks_audiences_items_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_audiences_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_audiences_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_audiences_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_audiences_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_audiences_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "archives_blocks_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"audience" varchar,
  	"tone" "enum_archives_blocks_audiences_items_tone" DEFAULT 'light',
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_archives_blocks_audiences_items_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "archives_blocks_audiences_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_audiences_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_audiences_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_audiences_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "product_lines" ADD COLUMN "datasheet_file_id" integer;
  ALTER TABLE "_product_lines_v" ADD COLUMN "version_datasheet_file_id" integer;
  ALTER TABLE "proj_grid" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form" "enum_pages_blocks_contact_form" DEFAULT 'general';
  ALTER TABLE "_proj_grid_v" ADD COLUMN "category_id" integer;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form" "enum__pages_v_blocks_contact_form" DEFAULT 'general';
  ALTER TABLE "leads" ADD COLUMN "project_company" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_role" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_location" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_stage" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_openings" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_timeline" varchar;
  ALTER TABLE "leads" ADD COLUMN "project_plans_url" varchar;
  ALTER TABLE "homepage_blocks_contact" ADD COLUMN "form" "enum_homepage_blocks_contact_form" DEFAULT 'general';
  ALTER TABLE "_homepage_v_blocks_contact" ADD COLUMN "form" "enum__homepage_v_blocks_contact_form" DEFAULT 'general';
  ALTER TABLE "archives_blocks_contact" ADD COLUMN "form" "enum_archives_blocks_contact_form" DEFAULT 'general';
  ALTER TABLE "pages_blocks_audiences_items_bullets" ADD CONSTRAINT "pages_blocks_audiences_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_audiences_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audiences_items" ADD CONSTRAINT "pages_blocks_audiences_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_audiences_items" ADD CONSTRAINT "pages_blocks_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audiences_settings_hide_on" ADD CONSTRAINT "pages_blocks_audiences_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audiences" ADD CONSTRAINT "pages_blocks_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_files" ADD CONSTRAINT "docs_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "docs_files" ADD CONSTRAINT "docs_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_settings_hide_on" ADD CONSTRAINT "docs_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs" ADD CONSTRAINT "docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audiences_items_bullets" ADD CONSTRAINT "_pages_v_blocks_audiences_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_audiences_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audiences_items" ADD CONSTRAINT "_pages_v_blocks_audiences_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audiences_items" ADD CONSTRAINT "_pages_v_blocks_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audiences_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_audiences_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audiences" ADD CONSTRAINT "_pages_v_blocks_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_docs_v_files" ADD CONSTRAINT "_docs_v_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_docs_v_files" ADD CONSTRAINT "_docs_v_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_docs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_docs_v_settings_hide_on" ADD CONSTRAINT "_docs_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_docs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_docs_v" ADD CONSTRAINT "_docs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_audiences_items_bullets" ADD CONSTRAINT "homepage_blocks_audiences_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_audiences_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_audiences_items" ADD CONSTRAINT "homepage_blocks_audiences_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_audiences_items" ADD CONSTRAINT "homepage_blocks_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_audiences_settings_hide_on" ADD CONSTRAINT "homepage_blocks_audiences_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_audiences" ADD CONSTRAINT "homepage_blocks_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_audiences_items_bullets" ADD CONSTRAINT "_homepage_v_blocks_audiences_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_audiences_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_audiences_items" ADD CONSTRAINT "_homepage_v_blocks_audiences_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_audiences_items" ADD CONSTRAINT "_homepage_v_blocks_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_audiences_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_audiences_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_audiences" ADD CONSTRAINT "_homepage_v_blocks_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_audiences_items_bullets" ADD CONSTRAINT "archives_blocks_audiences_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_audiences_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_audiences_items" ADD CONSTRAINT "archives_blocks_audiences_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_blocks_audiences_items" ADD CONSTRAINT "archives_blocks_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_audiences_settings_hide_on" ADD CONSTRAINT "archives_blocks_audiences_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_audiences" ADD CONSTRAINT "archives_blocks_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_audiences_items_bullets_order_idx" ON "pages_blocks_audiences_items_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_audiences_items_bullets_parent_id_idx" ON "pages_blocks_audiences_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audiences_items_order_idx" ON "pages_blocks_audiences_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_audiences_items_parent_id_idx" ON "pages_blocks_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audiences_items_image_idx" ON "pages_blocks_audiences_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_audiences_settings_hide_on_order_idx" ON "pages_blocks_audiences_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_audiences_settings_hide_on_parent_idx" ON "pages_blocks_audiences_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_audiences_order_idx" ON "pages_blocks_audiences" USING btree ("_order");
  CREATE INDEX "pages_blocks_audiences_parent_id_idx" ON "pages_blocks_audiences" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audiences_path_idx" ON "pages_blocks_audiences" USING btree ("_path");
  CREATE INDEX "docs_files_order_idx" ON "docs_files" USING btree ("_order");
  CREATE INDEX "docs_files_parent_id_idx" ON "docs_files" USING btree ("_parent_id");
  CREATE INDEX "docs_files_file_idx" ON "docs_files" USING btree ("file_id");
  CREATE INDEX "docs_settings_hide_on_order_idx" ON "docs_settings_hide_on" USING btree ("order");
  CREATE INDEX "docs_settings_hide_on_parent_idx" ON "docs_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "docs_order_idx" ON "docs" USING btree ("_order");
  CREATE INDEX "docs_parent_id_idx" ON "docs" USING btree ("_parent_id");
  CREATE INDEX "docs_path_idx" ON "docs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_audiences_items_bullets_order_idx" ON "_pages_v_blocks_audiences_items_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audiences_items_bullets_parent_id_idx" ON "_pages_v_blocks_audiences_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audiences_items_order_idx" ON "_pages_v_blocks_audiences_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audiences_items_parent_id_idx" ON "_pages_v_blocks_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audiences_items_image_idx" ON "_pages_v_blocks_audiences_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_audiences_settings_hide_on_order_idx" ON "_pages_v_blocks_audiences_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_audiences_settings_hide_on_parent_idx" ON "_pages_v_blocks_audiences_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_audiences_order_idx" ON "_pages_v_blocks_audiences" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audiences_parent_id_idx" ON "_pages_v_blocks_audiences" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audiences_path_idx" ON "_pages_v_blocks_audiences" USING btree ("_path");
  CREATE INDEX "_docs_v_files_order_idx" ON "_docs_v_files" USING btree ("_order");
  CREATE INDEX "_docs_v_files_parent_id_idx" ON "_docs_v_files" USING btree ("_parent_id");
  CREATE INDEX "_docs_v_files_file_idx" ON "_docs_v_files" USING btree ("file_id");
  CREATE INDEX "_docs_v_settings_hide_on_order_idx" ON "_docs_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_docs_v_settings_hide_on_parent_idx" ON "_docs_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_docs_v_order_idx" ON "_docs_v" USING btree ("_order");
  CREATE INDEX "_docs_v_parent_id_idx" ON "_docs_v" USING btree ("_parent_id");
  CREATE INDEX "_docs_v_path_idx" ON "_docs_v" USING btree ("_path");
  CREATE INDEX "homepage_blocks_audiences_items_bullets_order_idx" ON "homepage_blocks_audiences_items_bullets" USING btree ("_order");
  CREATE INDEX "homepage_blocks_audiences_items_bullets_parent_id_idx" ON "homepage_blocks_audiences_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_audiences_items_order_idx" ON "homepage_blocks_audiences_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_audiences_items_parent_id_idx" ON "homepage_blocks_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_audiences_items_image_idx" ON "homepage_blocks_audiences_items" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_audiences_settings_hide_on_order_idx" ON "homepage_blocks_audiences_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_audiences_settings_hide_on_parent_idx" ON "homepage_blocks_audiences_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_audiences_order_idx" ON "homepage_blocks_audiences" USING btree ("_order");
  CREATE INDEX "homepage_blocks_audiences_parent_id_idx" ON "homepage_blocks_audiences" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_audiences_path_idx" ON "homepage_blocks_audiences" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_audiences_items_bullets_order_idx" ON "_homepage_v_blocks_audiences_items_bullets" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_audiences_items_bullets_parent_id_idx" ON "_homepage_v_blocks_audiences_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_audiences_items_order_idx" ON "_homepage_v_blocks_audiences_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_audiences_items_parent_id_idx" ON "_homepage_v_blocks_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_audiences_items_image_idx" ON "_homepage_v_blocks_audiences_items" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_audiences_settings_hide_on_order_idx" ON "_homepage_v_blocks_audiences_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_audiences_settings_hide_on_parent_idx" ON "_homepage_v_blocks_audiences_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_audiences_order_idx" ON "_homepage_v_blocks_audiences" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_audiences_parent_id_idx" ON "_homepage_v_blocks_audiences" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_audiences_path_idx" ON "_homepage_v_blocks_audiences" USING btree ("_path");
  CREATE INDEX "archives_blocks_audiences_items_bullets_order_idx" ON "archives_blocks_audiences_items_bullets" USING btree ("_order");
  CREATE INDEX "archives_blocks_audiences_items_bullets_parent_id_idx" ON "archives_blocks_audiences_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_audiences_items_order_idx" ON "archives_blocks_audiences_items" USING btree ("_order");
  CREATE INDEX "archives_blocks_audiences_items_parent_id_idx" ON "archives_blocks_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_audiences_items_image_idx" ON "archives_blocks_audiences_items" USING btree ("image_id");
  CREATE INDEX "archives_blocks_audiences_settings_hide_on_order_idx" ON "archives_blocks_audiences_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_audiences_settings_hide_on_parent_idx" ON "archives_blocks_audiences_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_audiences_order_idx" ON "archives_blocks_audiences" USING btree ("_order");
  CREATE INDEX "archives_blocks_audiences_parent_id_idx" ON "archives_blocks_audiences" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_audiences_path_idx" ON "archives_blocks_audiences" USING btree ("_path");
  ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_datasheet_file_id_media_id_fk" FOREIGN KEY ("datasheet_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v" ADD CONSTRAINT "_product_lines_v_version_datasheet_file_id_media_id_fk" FOREIGN KEY ("version_datasheet_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proj_grid" ADD CONSTRAINT "proj_grid_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_proj_grid_v" ADD CONSTRAINT "_proj_grid_v_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "product_lines_datasheet_file_idx" ON "product_lines" USING btree ("datasheet_file_id");
  CREATE INDEX "_product_lines_v_version_version_datasheet_file_idx" ON "_product_lines_v" USING btree ("version_datasheet_file_id");
  CREATE INDEX "proj_grid_category_idx" ON "proj_grid" USING btree ("category_id");
  CREATE INDEX "_proj_grid_v_category_idx" ON "_proj_grid_v" USING btree ("category_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_audiences_items_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_audiences_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audiences_items_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audiences_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_docs_v_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_docs_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_docs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_audiences_items_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_audiences_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_audiences_items_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_audiences_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "archives_blocks_audiences_items_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "archives_blocks_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "archives_blocks_audiences_settings_hide_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "archives_blocks_audiences" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_audiences_items_bullets" CASCADE;
  DROP TABLE "pages_blocks_audiences_items" CASCADE;
  DROP TABLE "pages_blocks_audiences_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_audiences" CASCADE;
  DROP TABLE "docs_files" CASCADE;
  DROP TABLE "docs_settings_hide_on" CASCADE;
  DROP TABLE "docs" CASCADE;
  DROP TABLE "_pages_v_blocks_audiences_items_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_audiences_items" CASCADE;
  DROP TABLE "_pages_v_blocks_audiences_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_audiences" CASCADE;
  DROP TABLE "_docs_v_files" CASCADE;
  DROP TABLE "_docs_v_settings_hide_on" CASCADE;
  DROP TABLE "_docs_v" CASCADE;
  DROP TABLE "homepage_blocks_audiences_items_bullets" CASCADE;
  DROP TABLE "homepage_blocks_audiences_items" CASCADE;
  DROP TABLE "homepage_blocks_audiences_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_audiences" CASCADE;
  DROP TABLE "_homepage_v_blocks_audiences_items_bullets" CASCADE;
  DROP TABLE "_homepage_v_blocks_audiences_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_audiences_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_audiences" CASCADE;
  DROP TABLE "archives_blocks_audiences_items_bullets" CASCADE;
  DROP TABLE "archives_blocks_audiences_items" CASCADE;
  DROP TABLE "archives_blocks_audiences_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_audiences" CASCADE;
  ALTER TABLE "product_lines" DROP CONSTRAINT "product_lines_datasheet_file_id_media_id_fk";
  
  ALTER TABLE "_product_lines_v" DROP CONSTRAINT "_product_lines_v_version_datasheet_file_id_media_id_fk";
  
  ALTER TABLE "proj_grid" DROP CONSTRAINT "proj_grid_category_id_project_categories_id_fk";
  
  ALTER TABLE "_proj_grid_v" DROP CONSTRAINT "_proj_grid_v_category_id_project_categories_id_fk";
  
  ALTER TABLE "proj_grid" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "proj_grid" ALTER COLUMN "source" SET DEFAULT 'featured'::text;
  DROP TYPE "public"."enum_proj_grid_source";
  CREATE TYPE "public"."enum_proj_grid_source" AS ENUM('featured', 'latest', 'manual');
  ALTER TABLE "proj_grid" ALTER COLUMN "source" SET DEFAULT 'featured'::"public"."enum_proj_grid_source";
  ALTER TABLE "proj_grid" ALTER COLUMN "source" SET DATA TYPE "public"."enum_proj_grid_source" USING "source"::"public"."enum_proj_grid_source";
  ALTER TABLE "_proj_grid_v" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "_proj_grid_v" ALTER COLUMN "source" SET DEFAULT 'featured'::text;
  DROP TYPE "public"."enum__proj_grid_v_source";
  CREATE TYPE "public"."enum__proj_grid_v_source" AS ENUM('featured', 'latest', 'manual');
  ALTER TABLE "_proj_grid_v" ALTER COLUMN "source" SET DEFAULT 'featured'::"public"."enum__proj_grid_v_source";
  ALTER TABLE "_proj_grid_v" ALTER COLUMN "source" SET DATA TYPE "public"."enum__proj_grid_v_source" USING "source"::"public"."enum__proj_grid_v_source";
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "leads" ALTER COLUMN "type" SET DEFAULT 'contact'::text;
  DROP TYPE "public"."enum_leads_type";
  CREATE TYPE "public"."enum_leads_type" AS ENUM('contact', 'quotation');
  ALTER TABLE "leads" ALTER COLUMN "type" SET DEFAULT 'contact'::"public"."enum_leads_type";
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE "public"."enum_leads_type" USING "type"::"public"."enum_leads_type";
  DROP INDEX "product_lines_datasheet_file_idx";
  DROP INDEX "_product_lines_v_version_version_datasheet_file_idx";
  DROP INDEX "proj_grid_category_idx";
  DROP INDEX "_proj_grid_v_category_idx";
  ALTER TABLE "product_lines" DROP COLUMN "datasheet_file_id";
  ALTER TABLE "_product_lines_v" DROP COLUMN "version_datasheet_file_id";
  ALTER TABLE "proj_grid" DROP COLUMN "category_id";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form";
  ALTER TABLE "_proj_grid_v" DROP COLUMN "category_id";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form";
  ALTER TABLE "leads" DROP COLUMN "project_company";
  ALTER TABLE "leads" DROP COLUMN "project_role";
  ALTER TABLE "leads" DROP COLUMN "project_location";
  ALTER TABLE "leads" DROP COLUMN "project_stage";
  ALTER TABLE "leads" DROP COLUMN "project_openings";
  ALTER TABLE "leads" DROP COLUMN "project_timeline";
  ALTER TABLE "leads" DROP COLUMN "project_plans_url";
  ALTER TABLE "homepage_blocks_contact" DROP COLUMN "form";
  ALTER TABLE "_homepage_v_blocks_contact" DROP COLUMN "form";
  ALTER TABLE "archives_blocks_contact" DROP COLUMN "form";
  DROP TYPE "public"."enum_pages_blocks_contact_form";
  DROP TYPE "public"."enum_pages_blocks_audiences_items_tone";
  DROP TYPE "public"."enum_pages_blocks_audiences_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_audiences_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_audiences_settings_background";
  DROP TYPE "public"."enum_pages_blocks_audiences_settings_spacing";
  DROP TYPE "public"."enum_docs_settings_hide_on";
  DROP TYPE "public"."enum_docs_cta_type";
  DROP TYPE "public"."enum_docs_settings_background";
  DROP TYPE "public"."enum_docs_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_contact_form";
  DROP TYPE "public"."enum__pages_v_blocks_audiences_items_tone";
  DROP TYPE "public"."enum__pages_v_blocks_audiences_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_audiences_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_audiences_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_audiences_settings_spacing";
  DROP TYPE "public"."enum__docs_v_settings_hide_on";
  DROP TYPE "public"."enum__docs_v_cta_type";
  DROP TYPE "public"."enum__docs_v_settings_background";
  DROP TYPE "public"."enum__docs_v_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_contact_form";
  DROP TYPE "public"."enum_homepage_blocks_audiences_items_tone";
  DROP TYPE "public"."enum_homepage_blocks_audiences_items_link_type";
  DROP TYPE "public"."enum_homepage_blocks_audiences_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_audiences_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_audiences_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_contact_form";
  DROP TYPE "public"."enum__homepage_v_blocks_audiences_items_tone";
  DROP TYPE "public"."enum__homepage_v_blocks_audiences_items_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_audiences_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_audiences_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_audiences_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_contact_form";
  DROP TYPE "public"."enum_archives_blocks_audiences_items_tone";
  DROP TYPE "public"."enum_archives_blocks_audiences_items_link_type";
  DROP TYPE "public"."enum_archives_blocks_audiences_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_audiences_settings_background";
  DROP TYPE "public"."enum_archives_blocks_audiences_settings_spacing";`)
}
