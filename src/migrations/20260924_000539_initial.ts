import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_quote_pricing" AS ENUM('line', 'fixed');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_quote_pricing" AS ENUM('line', 'fixed');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_product_lines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__product_lines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_product_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__product_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_hero_variant" AS ENUM('fullBleed', 'editorial', 'intro');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_hero_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_statement_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_statement_variant" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum_pages_blocks_statement_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_pages_blocks_statement_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_statement_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_text_img_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_text_img_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_text_img_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_text_img_variant" AS ENUM('bleed', 'contained');
  CREATE TYPE "public"."enum_text_img_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_text_img_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_text_img_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_benefits_items_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum_pages_blocks_benefits_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_benefits_variant" AS ENUM('grid', 'bordered');
  CREATE TYPE "public"."enum_pages_blocks_benefits_marker" AS ENUM('shapes', 'icon', 'none');
  CREATE TYPE "public"."enum_pages_blocks_benefits_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_benefits_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_prod_lines_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_prod_lines_variant" AS ENUM('cards', 'overlay');
  CREATE TYPE "public"."enum_prod_lines_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_prod_lines_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_prod_cats_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_prod_cats_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_prod_cats_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_prod_cats_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_prod_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_prod_grid_variant" AS ENUM('cards', 'feature');
  CREATE TYPE "public"."enum_prod_grid_source" AS ENUM('featured', 'category', 'line', 'manual');
  CREATE TYPE "public"."enum_prod_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_prod_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_prod_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_process_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_pages_blocks_process_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_pages_blocks_process_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_process_variant" AS ENUM('timeline', 'pillars', 'split');
  CREATE TYPE "public"."enum_pages_blocks_process_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_process_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_advisor_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_advisor_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_advisor_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_quote_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_quote_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_quote_cta_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_quote_cta_variant" AS ENUM('band', 'box');
  CREATE TYPE "public"."enum_quote_cta_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_quote_cta_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_proj_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_proj_grid_source" AS ENUM('featured', 'latest', 'manual');
  CREATE TYPE "public"."enum_proj_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_proj_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_proj_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_gallery_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_gallery_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_gallery_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_faq_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_contact_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_contact_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_pages_blocks_contact_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_contact_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_quote_wiz_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_quote_wiz_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_quote_wiz_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_rich_text_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_rich_text_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_rich_text_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_video_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_video_aspect" AS ENUM('16/9', '9/16');
  CREATE TYPE "public"."enum_pages_blocks_video_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_video_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_variant" AS ENUM('fullBleed', 'editorial', 'intro');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_variant" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__text_img_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__text_img_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__text_img_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__text_img_v_variant" AS ENUM('bleed', 'contained');
  CREATE TYPE "public"."enum__text_img_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__text_img_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__text_img_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_items_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_variant" AS ENUM('grid', 'bordered');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_marker" AS ENUM('shapes', 'icon', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_benefits_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__prod_lines_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__prod_lines_v_variant" AS ENUM('cards', 'overlay');
  CREATE TYPE "public"."enum__prod_lines_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__prod_lines_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__prod_cats_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__prod_cats_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__prod_cats_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__prod_cats_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__prod_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__prod_grid_v_variant" AS ENUM('cards', 'feature');
  CREATE TYPE "public"."enum__prod_grid_v_source" AS ENUM('featured', 'category', 'line', 'manual');
  CREATE TYPE "public"."enum__prod_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__prod_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__prod_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_process_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__pages_v_blocks_process_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_process_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_process_variant" AS ENUM('timeline', 'pillars', 'split');
  CREATE TYPE "public"."enum__pages_v_blocks_process_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_process_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_advisor_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_advisor_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_advisor_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__quote_cta_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__quote_cta_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__quote_cta_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__quote_cta_v_variant" AS ENUM('band', 'box');
  CREATE TYPE "public"."enum__quote_cta_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__quote_cta_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__proj_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__proj_grid_v_source" AS ENUM('featured', 'latest', 'manual');
  CREATE TYPE "public"."enum__proj_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__proj_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__proj_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__quote_wiz_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__quote_wiz_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__quote_wiz_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__rich_text_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__rich_text_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__rich_text_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_video_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_video_aspect" AS ENUM('16/9', '9/16');
  CREATE TYPE "public"."enum__pages_v_blocks_video_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_video_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'quoted', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_type" AS ENUM('contact', 'quotation');
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'editor');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_homepage_blocks_hero_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_homepage_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_homepage_blocks_hero_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_hero_variant" AS ENUM('fullBleed', 'editorial', 'intro');
  CREATE TYPE "public"."enum_homepage_blocks_hero_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_hero_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_statement_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_statement_variant" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum_homepage_blocks_statement_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_homepage_blocks_statement_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_statement_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_items_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_variant" AS ENUM('grid', 'bordered');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_marker" AS ENUM('shapes', 'icon', 'none');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_benefits_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_process_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_homepage_blocks_process_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_homepage_blocks_process_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_process_variant" AS ENUM('timeline', 'pillars', 'split');
  CREATE TYPE "public"."enum_homepage_blocks_process_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_process_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_advisor_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_advisor_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_advisor_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_gallery_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_gallery_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_gallery_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_faq_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_faq_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_faq_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_contact_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_contact_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_homepage_blocks_contact_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_contact_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_blocks_video_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_homepage_blocks_video_aspect" AS ENUM('16/9', '9/16');
  CREATE TYPE "public"."enum_homepage_blocks_video_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_homepage_blocks_video_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_variant" AS ENUM('fullBleed', 'editorial', 'intro');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_hero_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_statement_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_statement_variant" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum__homepage_v_blocks_statement_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__homepage_v_blocks_statement_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_statement_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_items_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_variant" AS ENUM('grid', 'bordered');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_marker" AS ENUM('shapes', 'icon', 'none');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_benefits_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_variant" AS ENUM('timeline', 'pillars', 'split');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_process_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_advisor_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_advisor_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_advisor_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_gallery_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_gallery_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_gallery_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_faq_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_faq_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_faq_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_contact_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_contact_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum__homepage_v_blocks_contact_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_contact_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_blocks_video_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum__homepage_v_blocks_video_aspect" AS ENUM('16/9', '9/16');
  CREATE TYPE "public"."enum__homepage_v_blocks_video_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum__homepage_v_blocks_video_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_archives_blocks_hero_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_archives_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_archives_blocks_hero_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_hero_variant" AS ENUM('fullBleed', 'editorial', 'intro');
  CREATE TYPE "public"."enum_archives_blocks_hero_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_hero_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_statement_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_statement_variant" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum_archives_blocks_statement_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_archives_blocks_statement_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_statement_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_benefits_items_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum_archives_blocks_benefits_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_benefits_variant" AS ENUM('grid', 'bordered');
  CREATE TYPE "public"."enum_archives_blocks_benefits_marker" AS ENUM('shapes', 'icon', 'none');
  CREATE TYPE "public"."enum_archives_blocks_benefits_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_benefits_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_process_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_archives_blocks_process_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_archives_blocks_process_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_process_variant" AS ENUM('timeline', 'pillars', 'split');
  CREATE TYPE "public"."enum_archives_blocks_process_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_process_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_advisor_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_advisor_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_advisor_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_gallery_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_gallery_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_gallery_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_faq_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_faq_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_faq_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_contact_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_contact_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_archives_blocks_contact_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_contact_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_archives_blocks_video_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_archives_blocks_video_aspect" AS ENUM('16/9', '9/16');
  CREATE TYPE "public"."enum_archives_blocks_video_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
  CREATE TYPE "public"."enum_archives_blocks_video_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_header_navigation_mega_menu_columns_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_header_navigation_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_header_navigation_mega_menu_promo_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_header_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_footer_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_footer_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
  CREATE TYPE "public"."enum_footer_navigation_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
  CREATE TYPE "public"."enum_advisor_questions_answers_icon" AS ENUM('ruler', 'home', 'building', 'store', 'briefcase', 'wrench', 'hammer', 'factory', 'truck', 'message-circle', 'shield-check', 'lock', 'thermometer', 'volume-x', 'sun', 'droplets', 'wind', 'sparkles', 'layers', 'square', 'door-open', 'badge-check', 'clock', 'map-pin', 'phone', 'coins', 'settings', 'package', 'star', 'check');
  CREATE TYPE "public"."enum_seo_defaults_organization_type" AS ENUM('HomeAndConstructionBusiness', 'GeneralContractor', 'LocalBusiness');
  CREATE TABLE "products_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "products_configurations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "products_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_technical_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"group" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"category_id" integer,
  	"line_id" integer,
  	"short_description" varchar,
  	"audience" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"applications_intro" varchar,
  	"application_image_id" integer,
  	"datasheet_id" integer,
  	"quote_enabled" boolean DEFAULT false,
  	"quote_pricing" "enum_products_quote_pricing" DEFAULT 'line',
  	"quote_price_per_m2" numeric,
  	"quote_multiplier" numeric DEFAULT 1,
  	"quote_second_side" boolean,
  	"quote_fixed_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_products_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_configurations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_technical_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"group" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_category_id" integer,
  	"version_line_id" integer,
  	"version_short_description" varchar,
  	"version_audience" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_applications_intro" varchar,
  	"version_application_image_id" integer,
  	"version_datasheet_id" integer,
  	"version_quote_enabled" boolean DEFAULT false,
  	"version_quote_pricing" "enum__products_v_version_quote_pricing" DEFAULT 'line',
  	"version_quote_price_per_m2" numeric,
  	"version_quote_multiplier" numeric DEFAULT 1,
  	"version_quote_second_side" boolean,
  	"version_quote_fixed_description" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "product_lines_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "product_lines_card_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "product_lines_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "product_lines_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "product_lines_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "product_lines_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "product_lines_technical_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"group" varchar
  );
  
  CREATE TABLE "product_lines_quote_glass_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"multiplier" numeric DEFAULT 1
  );
  
  CREATE TABLE "product_lines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"positioning" varchar,
  	"badge" boolean,
  	"tagline" varchar,
  	"short_description" varchar,
  	"intro_headline" varchar,
  	"description" jsonb,
  	"ideal_for" varchar,
  	"hero_image_id" integer,
  	"application_image_id" integer,
  	"quote_price_per_m2" numeric,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_product_lines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_product_lines_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_card_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_technical_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"group" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v_version_quote_glass_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"multiplier" numeric DEFAULT 1,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_lines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_positioning" varchar,
  	"version_badge" boolean,
  	"version_tagline" varchar,
  	"version_short_description" varchar,
  	"version_intro_headline" varchar,
  	"version_description" jsonb,
  	"version_ideal_for" varchar,
  	"version_hero_image_id" integer,
  	"version_application_image_id" integer,
  	"version_quote_price_per_m2" numeric,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__product_lines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "product_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_product_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_product_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__product_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"location" varchar,
  	"year" numeric,
  	"openings_count" numeric,
  	"summary" varchar,
  	"intro_headline" varchar,
  	"description" jsonb,
  	"cover_image_id" integer,
  	"line_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"project_categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_location" varchar,
  	"version_year" numeric,
  	"version_openings_count" numeric,
  	"version_summary" varchar,
  	"version_intro_headline" varchar,
  	"version_description" jsonb,
  	"version_cover_image_id" integer,
  	"version_line_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"project_categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "project_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_pages_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_hero_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_hero_variant" DEFAULT 'fullBleed',
  	"show_breadcrumbs" boolean DEFAULT true,
  	"decoration" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"image_id" integer,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_hero_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_statement_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_statement_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_statement_variant" DEFAULT 'stacked',
  	"eyebrow" varchar,
  	"text" varchar,
  	"accent_last_line" boolean DEFAULT true,
  	"body" jsonb,
  	"link_type" "enum_pages_blocks_statement_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_statement_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_statement_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "text_img_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "text_img_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "text_img_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "text_img_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_text_img_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_text_img_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "text_img_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_text_img_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "text_img" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_text_img_variant" DEFAULT 'bleed',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum_text_img_image_position" DEFAULT 'left',
  	"decoration" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_text_img_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_text_img_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_benefits_items_icon",
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_benefits_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_benefits_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_benefits_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"marker" "enum_pages_blocks_benefits_marker" DEFAULT 'shapes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_benefits_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_benefits_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "prod_lines_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_prod_lines_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "prod_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_prod_lines_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_prod_lines_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_prod_lines_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "prod_cats_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_prod_cats_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "prod_cats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"cta_type" "enum_prod_cats_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_prod_cats_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_prod_cats_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "prod_grid_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_prod_grid_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "prod_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_prod_grid_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"source" "enum_prod_grid_source" DEFAULT 'featured',
  	"category_id" integer,
  	"line_id" integer,
  	"limit" numeric DEFAULT 6,
  	"cta_type" "enum_prod_grid_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_prod_grid_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_prod_grid_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_process_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_process_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_pages_blocks_process_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_process_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_process_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_process_variant" DEFAULT 'timeline',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"decoration" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_process_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_process_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_advisor_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_advisor_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_advisor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_advisor_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_advisor_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "quote_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_quote_cta_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_quote_cta_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "quote_cta_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_quote_cta_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "quote_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_quote_cta_variant" DEFAULT 'band',
  	"eyebrow" varchar,
  	"title" varchar,
  	"text" varchar,
  	"show_whatsapp" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_quote_cta_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_quote_cta_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "proj_grid_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_proj_grid_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "proj_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"source" "enum_proj_grid_source" DEFAULT 'featured',
  	"limit" numeric DEFAULT 4,
  	"cta_type" "enum_proj_grid_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_proj_grid_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_proj_grid_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_gallery_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_gallery_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_gallery_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_faq_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Preguntas frecuentes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_faq_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_contact_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promo_eyebrow" varchar DEFAULT 'Más rápido',
  	"promo_text" varchar DEFAULT 'Armá tu presupuesto online y lo ajustamos juntos.',
  	"promo_link_type" "enum_pages_blocks_contact_promo_link_type" DEFAULT 'custom',
  	"promo_link_new_tab" boolean,
  	"promo_link_label" varchar,
  	"promo_link_url" varchar,
  	"promo_link_whatsapp_message" varchar,
  	"show_map" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_contact_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_contact_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "quote_wiz_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_quote_wiz_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "quote_wiz" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_quote_wiz_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_quote_wiz_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "rich_text_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_rich_text_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_rich_text_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_rich_text_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_video_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"url" varchar,
  	"poster_id" integer,
  	"aspect" "enum_pages_blocks_video_aspect" DEFAULT '16/9',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_pages_blocks_video_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_pages_blocks_video_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"desktop" numeric DEFAULT 48,
  	"tablet" numeric DEFAULT 48,
  	"mobile" numeric DEFAULT 24,
  	"divider" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"hide_footer_cta" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer,
  	"product_categories_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_hero_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__pages_v_blocks_hero_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_hero_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_hero_variant" DEFAULT 'fullBleed',
  	"show_breadcrumbs" boolean DEFAULT true,
  	"decoration" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"image_id" integer,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_hero_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_statement_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_statement_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_statement_variant" DEFAULT 'stacked',
  	"eyebrow" varchar,
  	"text" varchar,
  	"accent_last_line" boolean DEFAULT true,
  	"body" jsonb,
  	"link_type" "enum__pages_v_blocks_statement_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_statement_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_statement_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_text_img_v_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_text_img_v_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_text_img_v_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_text_img_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__text_img_v_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__text_img_v_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_text_img_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__text_img_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_text_img_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__text_img_v_variant" DEFAULT 'bleed',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum__text_img_v_image_position" DEFAULT 'left',
  	"decoration" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__text_img_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__text_img_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_benefits_items_icon",
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_benefits_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_benefits_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_benefits_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"marker" "enum__pages_v_blocks_benefits_marker" DEFAULT 'shapes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_benefits_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_benefits_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_prod_lines_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__prod_lines_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_prod_lines_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__prod_lines_v_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__prod_lines_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__prod_lines_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_prod_cats_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__prod_cats_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_prod_cats_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"cta_type" "enum__prod_cats_v_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__prod_cats_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__prod_cats_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_prod_grid_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__prod_grid_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_prod_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__prod_grid_v_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"source" "enum__prod_grid_v_source" DEFAULT 'featured',
  	"category_id" integer,
  	"line_id" integer,
  	"limit" numeric DEFAULT 6,
  	"cta_type" "enum__prod_grid_v_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__prod_grid_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__prod_grid_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_process_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__pages_v_blocks_process_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_process_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_process_variant" DEFAULT 'timeline',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"decoration" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_process_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_process_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_advisor_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_advisor_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_advisor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_advisor_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_advisor_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_quote_cta_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__quote_cta_v_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__quote_cta_v_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_quote_cta_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__quote_cta_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_quote_cta_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__quote_cta_v_variant" DEFAULT 'band',
  	"eyebrow" varchar,
  	"title" varchar,
  	"text" varchar,
  	"show_whatsapp" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__quote_cta_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__quote_cta_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_proj_grid_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__proj_grid_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_proj_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"source" "enum__proj_grid_v_source" DEFAULT 'featured',
  	"limit" numeric DEFAULT 4,
  	"cta_type" "enum__proj_grid_v_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__proj_grid_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__proj_grid_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_gallery_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_gallery_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_gallery_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_faq_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Preguntas frecuentes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_faq_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_contact_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promo_eyebrow" varchar DEFAULT 'Más rápido',
  	"promo_text" varchar DEFAULT 'Armá tu presupuesto online y lo ajustamos juntos.',
  	"promo_link_type" "enum__pages_v_blocks_contact_promo_link_type" DEFAULT 'custom',
  	"promo_link_new_tab" boolean,
  	"promo_link_label" varchar,
  	"promo_link_url" varchar,
  	"promo_link_whatsapp_message" varchar,
  	"show_map" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_contact_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_contact_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_quote_wiz_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__quote_wiz_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_quote_wiz_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__quote_wiz_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__quote_wiz_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_rich_text_v_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__rich_text_v_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__rich_text_v_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__rich_text_v_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_video_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"url" varchar,
  	"poster_id" integer,
  	"aspect" "enum__pages_v_blocks_video_aspect" DEFAULT '16/9',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__pages_v_blocks_video_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__pages_v_blocks_video_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"desktop" numeric DEFAULT 48,
  	"tablet" numeric DEFAULT 48,
  	"mobile" numeric DEFAULT 24,
  	"divider" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_hide_footer_cta" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer,
  	"product_categories_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_mobile_url" varchar,
  	"sizes_mobile_width" numeric,
  	"sizes_mobile_height" numeric,
  	"sizes_mobile_mime_type" varchar,
  	"sizes_mobile_filesize" numeric,
  	"sizes_mobile_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar,
  	"sizes_desktop_url" varchar,
  	"sizes_desktop_width" numeric,
  	"sizes_desktop_height" numeric,
  	"sizes_desktop_mime_type" varchar,
  	"sizes_desktop_filesize" numeric,
  	"sizes_desktop_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "leads_quote_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"line_id" integer,
  	"glass" varchar,
  	"width" numeric,
  	"height" numeric,
  	"side2" numeric,
  	"quantity" numeric,
  	"estimate" numeric
  );
  
  CREATE TABLE "leads_internal_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"author" varchar,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"type" "enum_leads_type" DEFAULT 'contact' NOT NULL,
  	"full_name" varchar,
  	"name" varchar NOT NULL,
  	"last_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"city" varchar,
  	"project_type" varchar,
  	"product_id" integer,
  	"product_line_id" integer,
  	"measurements" varchar,
  	"message" varchar,
  	"quote_need" varchar,
  	"quote_estimated_total" numeric,
  	"quote_visit_requested" boolean,
  	"quote_additional_information" varchar,
  	"source" varchar,
  	"landing_page" varchar,
  	"referrer" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_content" varchar,
  	"utm_term" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" DEFAULT '301' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"product_categories_id" integer,
  	"projects_id" integer,
  	"project_categories_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"leads_id" integer,
  	"users_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_homepage_blocks_hero_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_homepage_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "homepage_blocks_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_hero_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_hero_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_blocks_hero_variant" DEFAULT 'fullBleed',
  	"show_breadcrumbs" boolean DEFAULT true,
  	"decoration" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"image_id" integer,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_hero_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_statement_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_statement_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_blocks_statement_variant" DEFAULT 'stacked',
  	"eyebrow" varchar,
  	"text" varchar,
  	"accent_last_line" boolean DEFAULT true,
  	"body" jsonb,
  	"link_type" "enum_homepage_blocks_statement_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_statement_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_statement_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_homepage_blocks_benefits_items_icon",
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_benefits_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_benefits_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_blocks_benefits_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"marker" "enum_homepage_blocks_benefits_marker" DEFAULT 'shapes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_benefits_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_benefits_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_process_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_homepage_blocks_process_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_homepage_blocks_process_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "homepage_blocks_process_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_process_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_blocks_process_variant" DEFAULT 'timeline',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"decoration" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_process_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_process_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_advisor_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_advisor_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_advisor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_advisor_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_advisor_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "homepage_blocks_gallery_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_gallery_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_gallery_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_gallery_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "homepage_blocks_faq_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_faq_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Preguntas frecuentes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_faq_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_contact_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_contact_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promo_eyebrow" varchar DEFAULT 'Más rápido',
  	"promo_text" varchar DEFAULT 'Armá tu presupuesto online y lo ajustamos juntos.',
  	"promo_link_type" "enum_homepage_blocks_contact_promo_link_type" DEFAULT 'custom',
  	"promo_link_new_tab" boolean,
  	"promo_link_label" varchar,
  	"promo_link_url" varchar,
  	"promo_link_whatsapp_message" varchar,
  	"show_map" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_contact_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_contact_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_video_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_blocks_video_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"url" varchar,
  	"poster_id" integer,
  	"aspect" "enum_homepage_blocks_video_aspect" DEFAULT '16/9',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_homepage_blocks_video_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_homepage_blocks_video_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"desktop" numeric DEFAULT 48,
  	"tablet" numeric DEFAULT 48,
  	"mobile" numeric DEFAULT 24,
  	"divider" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__homepage_v_blocks_hero_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__homepage_v_blocks_hero_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_hero_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_blocks_hero_variant" DEFAULT 'fullBleed',
  	"show_breadcrumbs" boolean DEFAULT true,
  	"decoration" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"image_id" integer,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_hero_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_statement_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_statement_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_blocks_statement_variant" DEFAULT 'stacked',
  	"eyebrow" varchar,
  	"text" varchar,
  	"accent_last_line" boolean DEFAULT true,
  	"body" jsonb,
  	"link_type" "enum__homepage_v_blocks_statement_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_statement_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_statement_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__homepage_v_blocks_benefits_items_icon",
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_benefits_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_benefits_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_blocks_benefits_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"marker" "enum__homepage_v_blocks_benefits_marker" DEFAULT 'shapes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_benefits_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_benefits_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_process_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__homepage_v_blocks_process_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum__homepage_v_blocks_process_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_process_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_process_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_blocks_process_variant" DEFAULT 'timeline',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"decoration" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_process_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_process_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_advisor_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_advisor_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_advisor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_advisor_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_advisor_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_gallery_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_gallery_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_gallery_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_gallery_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_faq_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_faq_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Preguntas frecuentes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_faq_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_contact_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_contact_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promo_eyebrow" varchar DEFAULT 'Más rápido',
  	"promo_text" varchar DEFAULT 'Armá tu presupuesto online y lo ajustamos juntos.',
  	"promo_link_type" "enum__homepage_v_blocks_contact_promo_link_type" DEFAULT 'custom',
  	"promo_link_new_tab" boolean,
  	"promo_link_label" varchar,
  	"promo_link_url" varchar,
  	"promo_link_whatsapp_message" varchar,
  	"show_map" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_contact_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_contact_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_video_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_v_blocks_video_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"url" varchar,
  	"poster_id" integer,
  	"aspect" "enum__homepage_v_blocks_video_aspect" DEFAULT '16/9',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum__homepage_v_blocks_video_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum__homepage_v_blocks_video_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"desktop" numeric DEFAULT 48,
  	"tablet" numeric DEFAULT 48,
  	"mobile" numeric DEFAULT 24,
  	"divider" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "archives_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_archives_blocks_hero_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_archives_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "archives_blocks_hero_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "archives_blocks_hero_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_hero_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_archives_blocks_hero_variant" DEFAULT 'fullBleed',
  	"show_breadcrumbs" boolean DEFAULT true,
  	"decoration" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"image_id" integer,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_hero_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_hero_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_statement_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_statement_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_archives_blocks_statement_variant" DEFAULT 'stacked',
  	"eyebrow" varchar,
  	"text" varchar NOT NULL,
  	"accent_last_line" boolean DEFAULT true,
  	"body" jsonb,
  	"link_type" "enum_archives_blocks_statement_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_statement_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_statement_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_archives_blocks_benefits_items_icon",
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "archives_blocks_benefits_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_benefits_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_archives_blocks_benefits_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"marker" "enum_archives_blocks_benefits_marker" DEFAULT 'shapes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_benefits_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_benefits_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "archives_blocks_process_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_archives_blocks_process_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_archives_blocks_process_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "archives_blocks_process_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_process_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_archives_blocks_process_variant" DEFAULT 'timeline',
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"decoration" boolean DEFAULT true,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_process_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_process_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_advisor_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_advisor_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_advisor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_advisor_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_advisor_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "archives_blocks_gallery_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_gallery_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_gallery_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_gallery_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "archives_blocks_faq_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_faq_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Preguntas frecuentes',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_faq_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_faq_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_contact_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_contact_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promo_eyebrow" varchar DEFAULT 'Más rápido',
  	"promo_text" varchar DEFAULT 'Armá tu presupuesto online y lo ajustamos juntos.',
  	"promo_link_type" "enum_archives_blocks_contact_promo_link_type" DEFAULT 'custom',
  	"promo_link_new_tab" boolean,
  	"promo_link_label" varchar,
  	"promo_link_url" varchar,
  	"promo_link_whatsapp_message" varchar,
  	"show_map" boolean DEFAULT false,
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_contact_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_contact_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_video_settings_hide_on" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_archives_blocks_video_settings_hide_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "archives_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"url" varchar NOT NULL,
  	"poster_id" integer,
  	"aspect" "enum_archives_blocks_video_aspect" DEFAULT '16/9',
  	"settings_hidden" boolean DEFAULT false,
  	"settings_background" "enum_archives_blocks_video_settings_background" DEFAULT 'default',
  	"settings_spacing" "enum_archives_blocks_video_settings_spacing" DEFAULT 'md',
  	"settings_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"desktop" numeric DEFAULT 48,
  	"tablet" numeric DEFAULT 48,
  	"mobile" numeric DEFAULT 24,
  	"divider" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "archives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"products_eyebrow" varchar,
  	"products_title" varchar DEFAULT 'Productos' NOT NULL,
  	"products_intro" varchar DEFAULT 'Ventanas, puertas, mamparas y más, fabricados a medida en aluminio.',
  	"products_image_id" integer,
  	"products_seo_title" varchar,
  	"products_seo_description" varchar,
  	"products_seo_image_id" integer,
  	"lines_eyebrow" varchar,
  	"lines_title" varchar DEFAULT 'Nuestras líneas' NOT NULL,
  	"lines_intro" varchar DEFAULT 'Elegí según tu prioridad: precio, resistencia o máximo aislamiento.',
  	"lines_image_id" integer,
  	"lines_seo_title" varchar,
  	"lines_seo_description" varchar,
  	"lines_seo_image_id" integer,
  	"projects_eyebrow" varchar,
  	"projects_title" varchar DEFAULT 'Proyectos' NOT NULL,
  	"projects_intro" varchar DEFAULT 'Algunas de las obras que realizamos en Coronda y la región.',
  	"projects_image_id" integer,
  	"projects_seo_title" varchar,
  	"projects_seo_description" varchar,
  	"projects_seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "archives_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "site_settings_working_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_product_info_panels_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_product_info_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'PIRCAS Aberturas' NOT NULL,
  	"legal_name" varchar,
  	"tagline" varchar,
  	"logo_id" integer,
  	"logo_light_id" integer,
  	"favicon_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"whatsapp_number" varchar,
  	"whatsapp_default_message" varchar DEFAULT 'Hola PIRCAS, quiero pedir un presupuesto',
  	"whatsapp_show_floating" boolean DEFAULT true,
  	"whatsapp_show_mobile_bar" boolean DEFAULT true,
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_region" varchar,
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'AR',
  	"address_maps_url" varchar,
  	"address_map_embed_query" varchar,
  	"coverage_area" varchar,
  	"instagram" varchar,
  	"facebook" varchar,
  	"youtube" varchar,
  	"tiktok" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_navigation_mega_menu_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_navigation_mega_menu_columns_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "header_navigation_mega_menu_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"large" boolean
  );
  
  CREATE TABLE "header_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_navigation_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"mega_menu_promo_text" varchar,
  	"mega_menu_promo_link_type" "enum_header_navigation_mega_menu_promo_link_type" DEFAULT 'custom',
  	"mega_menu_promo_link_new_tab" boolean,
  	"mega_menu_promo_link_label" varchar,
  	"mega_menu_promo_link_url" varchar,
  	"mega_menu_promo_link_whatsapp_message" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_type" "enum_header_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar NOT NULL,
  	"cta_url" varchar,
  	"cta_whatsapp_message" varchar,
  	"show_whatsapp" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "footer_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_cta_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar,
  	"link_appearance" "enum_footer_cta_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "footer_navigation_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_navigation_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "footer_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_links_link_type" DEFAULT 'custom',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar,
  	"link_whatsapp_message" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_title" varchar DEFAULT '¿Tenés una obra o una reforma?',
  	"cta_text" varchar DEFAULT 'Mandanos las medidas o pasá por el local. Te pasamos precio sin compromiso.',
  	"cta_show_whatsapp" boolean DEFAULT true,
  	"about" varchar DEFAULT 'Aberturas de aluminio fabricadas e instaladas a medida. Coronda, Santa Fe.',
  	"copyright" varchar DEFAULT '© {year} Pircas Aberturas · Aberturas de aluminio',
  	"bottom_note" varchar DEFAULT 'Coronda · Santa Fe · Argentina',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"product_lines_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "advisor_questions_answers_weights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line_id" integer NOT NULL,
  	"points" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "advisor_questions_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" "enum_advisor_questions_answers_icon"
  );
  
  CREATE TABLE "advisor_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "advisor_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line_id" integer NOT NULL,
  	"headline" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "advisor" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"fallback_line_id" integer,
  	"result_eyebrow" varchar DEFAULT 'Te recomendamos',
  	"quote_label" varchar DEFAULT 'Cotizar esta línea',
  	"restart_label" varchar DEFAULT 'Volver a empezar',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "forms_settings_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"preset_product_id" integer
  );
  
  CREATE TABLE "forms_settings_project_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "forms_settings_notification_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "forms_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"visit_label" varchar DEFAULT 'Quiero medición en obra (Coronda y zona, +40 km)',
  	"pricing_show_prices" boolean DEFAULT true,
  	"pricing_min_area" numeric DEFAULT 0.5,
  	"pricing_rounding" numeric DEFAULT 1000,
  	"pricing_min_dimension" numeric DEFAULT 30,
  	"pricing_max_dimension" numeric DEFAULT 600,
  	"pricing_disclaimer" varchar DEFAULT 'Valores de referencia sin instalación ni envío. Se ajustan según medidas en obra, herrajes y terminaciones.',
  	"max_items" numeric DEFAULT 20,
  	"privacy_note" varchar DEFAULT 'Usamos tus datos solo para responder tu consulta. No los compartimos con terceros.',
  	"quote_success_title" varchar DEFAULT 'Recibimos tu consulta.',
  	"quote_success_message" varchar DEFAULT 'Un vendedor revisa tu lista y te contacta en menos de 24 horas hábiles para ajustar el presupuesto final. Si preferís, seguí ahora mismo por WhatsApp con el detalle ya cargado.',
  	"contact_success_title" varchar DEFAULT 'Consulta enviada.',
  	"contact_success_message" varchar DEFAULT 'Te respondemos a la brevedad.',
  	"customer_confirmation_enabled" boolean DEFAULT true,
  	"customer_confirmation_subject" varchar DEFAULT 'Recibimos tu consulta — Pircas Aberturas',
  	"customer_confirmation_intro" varchar DEFAULT 'Gracias por escribirnos. Un vendedor revisa tu consulta y te responde a la brevedad.',
  	"customer_confirmation_closing" varchar DEFAULT 'Si necesitás una respuesta inmediata, escribinos por WhatsApp.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "forms_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_categories_id" integer
  );
  
  CREATE TABLE "analytics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"google_tag_manager_id" varchar,
  	"ga4_measurement_id" varchar,
  	"google_ads_id" varchar,
  	"google_ads_lead_label" varchar,
  	"meta_pixel_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'PIRCAS Aberturas' NOT NULL,
  	"title_template" varchar DEFAULT '%s | PIRCAS Aberturas',
  	"default_title" varchar DEFAULT 'PIRCAS Aberturas | Aberturas de aluminio a medida en Coronda, Santa Fe' NOT NULL,
  	"default_description" varchar DEFAULT 'Fabricamos e instalamos aberturas de aluminio a medida: ventanas, puertas y mamparas. Líneas Herrero y Modena. Coronda, Santa Fe. Pedí tu presupuesto.' NOT NULL,
  	"default_image_id" integer,
  	"twitter_handle" varchar,
  	"organization_type" "enum_seo_defaults_organization_type" DEFAULT 'HomeAndConstructionBusiness',
  	"noindex_site" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products_facts" ADD CONSTRAINT "products_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configurations" ADD CONSTRAINT "products_configurations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_benefits" ADD CONSTRAINT "products_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_applications" ADD CONSTRAINT "products_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_technical_specifications" ADD CONSTRAINT "products_technical_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_application_image_id_media_id_fk" FOREIGN KEY ("application_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_datasheet_id_media_id_fk" FOREIGN KEY ("datasheet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_facts" ADD CONSTRAINT "_products_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_configurations" ADD CONSTRAINT "_products_v_version_configurations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_benefits" ADD CONSTRAINT "_products_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_applications" ADD CONSTRAINT "_products_v_version_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_technical_specifications" ADD CONSTRAINT "_products_v_version_technical_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_product_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_line_id_product_lines_id_fk" FOREIGN KEY ("version_line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_application_image_id_media_id_fk" FOREIGN KEY ("version_application_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_datasheet_id_media_id_fk" FOREIGN KEY ("version_datasheet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_lines_facts" ADD CONSTRAINT "product_lines_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_card_highlights" ADD CONSTRAINT "product_lines_card_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_gallery" ADD CONSTRAINT "product_lines_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_lines_gallery" ADD CONSTRAINT "product_lines_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_features" ADD CONSTRAINT "product_lines_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_applications" ADD CONSTRAINT "product_lines_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_faqs" ADD CONSTRAINT "product_lines_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_technical_specs" ADD CONSTRAINT "product_lines_technical_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines_quote_glass_options" ADD CONSTRAINT "product_lines_quote_glass_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_application_image_id_media_id_fk" FOREIGN KEY ("application_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_facts" ADD CONSTRAINT "_product_lines_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_card_highlights" ADD CONSTRAINT "_product_lines_v_version_card_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_gallery" ADD CONSTRAINT "_product_lines_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_gallery" ADD CONSTRAINT "_product_lines_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_features" ADD CONSTRAINT "_product_lines_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_applications" ADD CONSTRAINT "_product_lines_v_version_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_faqs" ADD CONSTRAINT "_product_lines_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_technical_specs" ADD CONSTRAINT "_product_lines_v_version_technical_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v_version_quote_glass_options" ADD CONSTRAINT "_product_lines_v_version_quote_glass_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_lines_v" ADD CONSTRAINT "_product_lines_v_parent_id_product_lines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v" ADD CONSTRAINT "_product_lines_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v" ADD CONSTRAINT "_product_lines_v_version_application_image_id_media_id_fk" FOREIGN KEY ("version_application_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_lines_v" ADD CONSTRAINT "_product_lines_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_facts" ADD CONSTRAINT "projects_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_facts" ADD CONSTRAINT "_projects_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_line_id_product_lines_id_fk" FOREIGN KEY ("version_line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links" ADD CONSTRAINT "pages_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_highlights" ADD CONSTRAINT "pages_blocks_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_settings_hide_on" ADD CONSTRAINT "pages_blocks_hero_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement_settings_hide_on" ADD CONSTRAINT "pages_blocks_statement_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img_tags" ADD CONSTRAINT "text_img_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img_bullets" ADD CONSTRAINT "text_img_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img_facts" ADD CONSTRAINT "text_img_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img_links" ADD CONSTRAINT "text_img_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img_settings_hide_on" ADD CONSTRAINT "text_img_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "text_img" ADD CONSTRAINT "text_img_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "text_img" ADD CONSTRAINT "text_img_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_benefits_items" ADD CONSTRAINT "pages_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_benefits_settings_hide_on" ADD CONSTRAINT "pages_blocks_benefits_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_benefits" ADD CONSTRAINT "pages_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_lines_settings_hide_on" ADD CONSTRAINT "prod_lines_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_lines" ADD CONSTRAINT "prod_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_cats_settings_hide_on" ADD CONSTRAINT "prod_cats_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_cats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_cats" ADD CONSTRAINT "prod_cats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_grid_settings_hide_on" ADD CONSTRAINT "prod_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_links" ADD CONSTRAINT "pages_blocks_process_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_settings_hide_on" ADD CONSTRAINT "pages_blocks_process_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process" ADD CONSTRAINT "pages_blocks_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_process" ADD CONSTRAINT "pages_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advisor_settings_hide_on" ADD CONSTRAINT "pages_blocks_advisor_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advisor" ADD CONSTRAINT "pages_blocks_advisor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_cta_links" ADD CONSTRAINT "quote_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_cta_settings_hide_on" ADD CONSTRAINT "quote_cta_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_cta" ADD CONSTRAINT "quote_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proj_grid_settings_hide_on" ADD CONSTRAINT "proj_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proj_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proj_grid" ADD CONSTRAINT "proj_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_settings_hide_on" ADD CONSTRAINT "pages_blocks_gallery_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_settings_hide_on" ADD CONSTRAINT "pages_blocks_faq_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_settings_hide_on" ADD CONSTRAINT "pages_blocks_contact_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_wiz_settings_hide_on" ADD CONSTRAINT "quote_wiz_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_wiz"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_wiz" ADD CONSTRAINT "quote_wiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rich_text_settings_hide_on" ADD CONSTRAINT "rich_text_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rich_text" ADD CONSTRAINT "rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_settings_hide_on" ADD CONSTRAINT "pages_blocks_video_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_links" ADD CONSTRAINT "_pages_v_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_highlights" ADD CONSTRAINT "_pages_v_blocks_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_hero_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_statement_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement" ADD CONSTRAINT "_pages_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v_tags" ADD CONSTRAINT "_text_img_v_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v_bullets" ADD CONSTRAINT "_text_img_v_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v_facts" ADD CONSTRAINT "_text_img_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v_links" ADD CONSTRAINT "_text_img_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v_settings_hide_on" ADD CONSTRAINT "_text_img_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_text_img_v" ADD CONSTRAINT "_text_img_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_text_img_v" ADD CONSTRAINT "_text_img_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_benefits_items" ADD CONSTRAINT "_pages_v_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_benefits_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_benefits_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_benefits" ADD CONSTRAINT "_pages_v_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_lines_v_settings_hide_on" ADD CONSTRAINT "_prod_lines_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_lines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_lines_v" ADD CONSTRAINT "_prod_lines_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_cats_v_settings_hide_on" ADD CONSTRAINT "_prod_cats_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_cats_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_cats_v" ADD CONSTRAINT "_prod_cats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_grid_v_settings_hide_on" ADD CONSTRAINT "_prod_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_links" ADD CONSTRAINT "_pages_v_blocks_process_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_process_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process" ADD CONSTRAINT "_pages_v_blocks_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process" ADD CONSTRAINT "_pages_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advisor_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_advisor_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advisor" ADD CONSTRAINT "_pages_v_blocks_advisor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_quote_cta_v_links" ADD CONSTRAINT "_quote_cta_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_quote_cta_v_settings_hide_on" ADD CONSTRAINT "_quote_cta_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_quote_cta_v" ADD CONSTRAINT "_quote_cta_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proj_grid_v_settings_hide_on" ADD CONSTRAINT "_proj_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_proj_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proj_grid_v" ADD CONSTRAINT "_proj_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_gallery_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_faq_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_contact_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_quote_wiz_v_settings_hide_on" ADD CONSTRAINT "_quote_wiz_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_quote_wiz_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_quote_wiz_v" ADD CONSTRAINT "_quote_wiz_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rich_text_v_settings_hide_on" ADD CONSTRAINT "_rich_text_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_rich_text_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rich_text_v" ADD CONSTRAINT "_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_settings_hide_on" ADD CONSTRAINT "_pages_v_blocks_video_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_quote_items" ADD CONSTRAINT "leads_quote_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_quote_items" ADD CONSTRAINT "leads_quote_items_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_quote_items" ADD CONSTRAINT "leads_quote_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_internal_notes" ADD CONSTRAINT "leads_internal_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_product_line_id_product_lines_id_fk" FOREIGN KEY ("product_line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_links" ADD CONSTRAINT "homepage_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_highlights" ADD CONSTRAINT "homepage_blocks_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_settings_hide_on" ADD CONSTRAINT "homepage_blocks_hero_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_statement_settings_hide_on" ADD CONSTRAINT "homepage_blocks_statement_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_statement" ADD CONSTRAINT "homepage_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_benefits_items" ADD CONSTRAINT "homepage_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_benefits_settings_hide_on" ADD CONSTRAINT "homepage_blocks_benefits_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_benefits" ADD CONSTRAINT "homepage_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_process_steps" ADD CONSTRAINT "homepage_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_process_links" ADD CONSTRAINT "homepage_blocks_process_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_process_settings_hide_on" ADD CONSTRAINT "homepage_blocks_process_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_process" ADD CONSTRAINT "homepage_blocks_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_process" ADD CONSTRAINT "homepage_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_advisor_settings_hide_on" ADD CONSTRAINT "homepage_blocks_advisor_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_advisor" ADD CONSTRAINT "homepage_blocks_advisor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_gallery_images" ADD CONSTRAINT "homepage_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_gallery_images" ADD CONSTRAINT "homepage_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_gallery_settings_hide_on" ADD CONSTRAINT "homepage_blocks_gallery_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_gallery" ADD CONSTRAINT "homepage_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_faq_items" ADD CONSTRAINT "homepage_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_faq_settings_hide_on" ADD CONSTRAINT "homepage_blocks_faq_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_faq" ADD CONSTRAINT "homepage_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_contact_settings_hide_on" ADD CONSTRAINT "homepage_blocks_contact_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_contact" ADD CONSTRAINT "homepage_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_video_settings_hide_on" ADD CONSTRAINT "homepage_blocks_video_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_video" ADD CONSTRAINT "homepage_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_video" ADD CONSTRAINT "homepage_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_spacer" ADD CONSTRAINT "homepage_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_links" ADD CONSTRAINT "_homepage_v_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_highlights" ADD CONSTRAINT "_homepage_v_blocks_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_hero_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_statement_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_statement_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_statement" ADD CONSTRAINT "_homepage_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_benefits_items" ADD CONSTRAINT "_homepage_v_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_benefits_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_benefits_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_benefits" ADD CONSTRAINT "_homepage_v_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_process_steps" ADD CONSTRAINT "_homepage_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_process_links" ADD CONSTRAINT "_homepage_v_blocks_process_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_process_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_process_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_process" ADD CONSTRAINT "_homepage_v_blocks_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_process" ADD CONSTRAINT "_homepage_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_advisor_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_advisor_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_advisor" ADD CONSTRAINT "_homepage_v_blocks_advisor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_gallery_images" ADD CONSTRAINT "_homepage_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_gallery_images" ADD CONSTRAINT "_homepage_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_gallery_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_gallery_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_gallery" ADD CONSTRAINT "_homepage_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_faq_items" ADD CONSTRAINT "_homepage_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_faq_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_faq_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_faq" ADD CONSTRAINT "_homepage_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_contact_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_contact_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_contact" ADD CONSTRAINT "_homepage_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_video_settings_hide_on" ADD CONSTRAINT "_homepage_v_blocks_video_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_video" ADD CONSTRAINT "_homepage_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_video" ADD CONSTRAINT "_homepage_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_spacer" ADD CONSTRAINT "_homepage_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_hero_links" ADD CONSTRAINT "archives_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_hero_highlights" ADD CONSTRAINT "archives_blocks_hero_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_hero_settings_hide_on" ADD CONSTRAINT "archives_blocks_hero_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_hero" ADD CONSTRAINT "archives_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_blocks_hero" ADD CONSTRAINT "archives_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_statement_settings_hide_on" ADD CONSTRAINT "archives_blocks_statement_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_statement" ADD CONSTRAINT "archives_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_benefits_items" ADD CONSTRAINT "archives_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_benefits_settings_hide_on" ADD CONSTRAINT "archives_blocks_benefits_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_benefits" ADD CONSTRAINT "archives_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_process_steps" ADD CONSTRAINT "archives_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_process_links" ADD CONSTRAINT "archives_blocks_process_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_process_settings_hide_on" ADD CONSTRAINT "archives_blocks_process_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_process" ADD CONSTRAINT "archives_blocks_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_blocks_process" ADD CONSTRAINT "archives_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_advisor_settings_hide_on" ADD CONSTRAINT "archives_blocks_advisor_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_advisor" ADD CONSTRAINT "archives_blocks_advisor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_gallery_images" ADD CONSTRAINT "archives_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_blocks_gallery_images" ADD CONSTRAINT "archives_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_gallery_settings_hide_on" ADD CONSTRAINT "archives_blocks_gallery_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_gallery" ADD CONSTRAINT "archives_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_faq_items" ADD CONSTRAINT "archives_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_faq_settings_hide_on" ADD CONSTRAINT "archives_blocks_faq_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_faq" ADD CONSTRAINT "archives_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_contact_settings_hide_on" ADD CONSTRAINT "archives_blocks_contact_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_contact" ADD CONSTRAINT "archives_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_video_settings_hide_on" ADD CONSTRAINT "archives_blocks_video_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_video" ADD CONSTRAINT "archives_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_blocks_video" ADD CONSTRAINT "archives_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_blocks_spacer" ADD CONSTRAINT "archives_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_products_image_id_media_id_fk" FOREIGN KEY ("products_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_products_seo_image_id_media_id_fk" FOREIGN KEY ("products_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_lines_image_id_media_id_fk" FOREIGN KEY ("lines_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_lines_seo_image_id_media_id_fk" FOREIGN KEY ("lines_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_projects_image_id_media_id_fk" FOREIGN KEY ("projects_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives" ADD CONSTRAINT "archives_projects_seo_image_id_media_id_fk" FOREIGN KEY ("projects_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_working_hours" ADD CONSTRAINT "site_settings_working_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_product_info_panels_rows" ADD CONSTRAINT "site_settings_product_info_panels_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_product_info_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_product_info_panels" ADD CONSTRAINT "site_settings_product_info_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_light_id_media_id_fk" FOREIGN KEY ("logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_navigation_mega_menu_columns_links" ADD CONSTRAINT "header_navigation_mega_menu_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation_mega_menu_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_mega_menu_columns" ADD CONSTRAINT "header_navigation_mega_menu_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation" ADD CONSTRAINT "header_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_cta_links" ADD CONSTRAINT "footer_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_navigation_links" ADD CONSTRAINT "footer_navigation_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_navigation" ADD CONSTRAINT "footer_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_product_lines_fk" FOREIGN KEY ("product_lines_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advisor_questions_answers_weights" ADD CONSTRAINT "advisor_questions_answers_weights_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "advisor_questions_answers_weights" ADD CONSTRAINT "advisor_questions_answers_weights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."advisor_questions_answers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advisor_questions_answers" ADD CONSTRAINT "advisor_questions_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."advisor_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advisor_questions" ADD CONSTRAINT "advisor_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advisor_results" ADD CONSTRAINT "advisor_results_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "advisor_results" ADD CONSTRAINT "advisor_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."advisor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advisor" ADD CONSTRAINT "advisor_fallback_line_id_product_lines_id_fk" FOREIGN KEY ("fallback_line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms_settings_needs" ADD CONSTRAINT "forms_settings_needs_preset_product_id_products_id_fk" FOREIGN KEY ("preset_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms_settings_needs" ADD CONSTRAINT "forms_settings_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_settings_project_types" ADD CONSTRAINT "forms_settings_project_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_settings_notification_emails" ADD CONSTRAINT "forms_settings_notification_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_settings_rels" ADD CONSTRAINT "forms_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forms_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_settings_rels" ADD CONSTRAINT "forms_settings_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_default_image_id_media_id_fk" FOREIGN KEY ("default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_facts_order_idx" ON "products_facts" USING btree ("_order");
  CREATE INDEX "products_facts_parent_id_idx" ON "products_facts" USING btree ("_parent_id");
  CREATE INDEX "products_configurations_order_idx" ON "products_configurations" USING btree ("_order");
  CREATE INDEX "products_configurations_parent_id_idx" ON "products_configurations" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_benefits_order_idx" ON "products_benefits" USING btree ("_order");
  CREATE INDEX "products_benefits_parent_id_idx" ON "products_benefits" USING btree ("_parent_id");
  CREATE INDEX "products_applications_order_idx" ON "products_applications" USING btree ("_order");
  CREATE INDEX "products_applications_parent_id_idx" ON "products_applications" USING btree ("_parent_id");
  CREATE INDEX "products_technical_specifications_order_idx" ON "products_technical_specifications" USING btree ("_order");
  CREATE INDEX "products_technical_specifications_parent_id_idx" ON "products_technical_specifications" USING btree ("_parent_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_line_idx" ON "products" USING btree ("line_id");
  CREATE INDEX "products_featured_image_idx" ON "products" USING btree ("featured_image_id");
  CREATE INDEX "products_application_image_idx" ON "products" USING btree ("application_image_id");
  CREATE INDEX "products_datasheet_idx" ON "products" USING btree ("datasheet_id");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");
  CREATE INDEX "products_order_idx" ON "products" USING btree ("order");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "_products_v_version_facts_order_idx" ON "_products_v_version_facts" USING btree ("_order");
  CREATE INDEX "_products_v_version_facts_parent_id_idx" ON "_products_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_configurations_order_idx" ON "_products_v_version_configurations" USING btree ("_order");
  CREATE INDEX "_products_v_version_configurations_parent_id_idx" ON "_products_v_version_configurations" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_benefits_order_idx" ON "_products_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_products_v_version_benefits_parent_id_idx" ON "_products_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_applications_order_idx" ON "_products_v_version_applications" USING btree ("_order");
  CREATE INDEX "_products_v_version_applications_parent_id_idx" ON "_products_v_version_applications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_technical_specifications_order_idx" ON "_products_v_version_technical_specifications" USING btree ("_order");
  CREATE INDEX "_products_v_version_technical_specifications_parent_id_idx" ON "_products_v_version_technical_specifications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_line_idx" ON "_products_v" USING btree ("version_line_id");
  CREATE INDEX "_products_v_version_version_featured_image_idx" ON "_products_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_products_v_version_version_application_image_idx" ON "_products_v" USING btree ("version_application_image_id");
  CREATE INDEX "_products_v_version_version_datasheet_idx" ON "_products_v" USING btree ("version_datasheet_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_featured_idx" ON "_products_v" USING btree ("version_featured");
  CREATE INDEX "_products_v_version_version_order_idx" ON "_products_v" USING btree ("version_order");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "product_lines_facts_order_idx" ON "product_lines_facts" USING btree ("_order");
  CREATE INDEX "product_lines_facts_parent_id_idx" ON "product_lines_facts" USING btree ("_parent_id");
  CREATE INDEX "product_lines_card_highlights_order_idx" ON "product_lines_card_highlights" USING btree ("_order");
  CREATE INDEX "product_lines_card_highlights_parent_id_idx" ON "product_lines_card_highlights" USING btree ("_parent_id");
  CREATE INDEX "product_lines_gallery_order_idx" ON "product_lines_gallery" USING btree ("_order");
  CREATE INDEX "product_lines_gallery_parent_id_idx" ON "product_lines_gallery" USING btree ("_parent_id");
  CREATE INDEX "product_lines_gallery_image_idx" ON "product_lines_gallery" USING btree ("image_id");
  CREATE INDEX "product_lines_features_order_idx" ON "product_lines_features" USING btree ("_order");
  CREATE INDEX "product_lines_features_parent_id_idx" ON "product_lines_features" USING btree ("_parent_id");
  CREATE INDEX "product_lines_applications_order_idx" ON "product_lines_applications" USING btree ("_order");
  CREATE INDEX "product_lines_applications_parent_id_idx" ON "product_lines_applications" USING btree ("_parent_id");
  CREATE INDEX "product_lines_faqs_order_idx" ON "product_lines_faqs" USING btree ("_order");
  CREATE INDEX "product_lines_faqs_parent_id_idx" ON "product_lines_faqs" USING btree ("_parent_id");
  CREATE INDEX "product_lines_technical_specs_order_idx" ON "product_lines_technical_specs" USING btree ("_order");
  CREATE INDEX "product_lines_technical_specs_parent_id_idx" ON "product_lines_technical_specs" USING btree ("_parent_id");
  CREATE INDEX "product_lines_quote_glass_options_order_idx" ON "product_lines_quote_glass_options" USING btree ("_order");
  CREATE INDEX "product_lines_quote_glass_options_parent_id_idx" ON "product_lines_quote_glass_options" USING btree ("_parent_id");
  CREATE INDEX "product_lines_hero_image_idx" ON "product_lines" USING btree ("hero_image_id");
  CREATE INDEX "product_lines_application_image_idx" ON "product_lines" USING btree ("application_image_id");
  CREATE INDEX "product_lines_meta_meta_image_idx" ON "product_lines" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "product_lines_slug_idx" ON "product_lines" USING btree ("slug");
  CREATE INDEX "product_lines_order_idx" ON "product_lines" USING btree ("order");
  CREATE INDEX "product_lines_updated_at_idx" ON "product_lines" USING btree ("updated_at");
  CREATE INDEX "product_lines_created_at_idx" ON "product_lines" USING btree ("created_at");
  CREATE INDEX "product_lines__status_idx" ON "product_lines" USING btree ("_status");
  CREATE INDEX "_product_lines_v_version_facts_order_idx" ON "_product_lines_v_version_facts" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_facts_parent_id_idx" ON "_product_lines_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_card_highlights_order_idx" ON "_product_lines_v_version_card_highlights" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_card_highlights_parent_id_idx" ON "_product_lines_v_version_card_highlights" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_gallery_order_idx" ON "_product_lines_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_gallery_parent_id_idx" ON "_product_lines_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_gallery_image_idx" ON "_product_lines_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_product_lines_v_version_features_order_idx" ON "_product_lines_v_version_features" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_features_parent_id_idx" ON "_product_lines_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_applications_order_idx" ON "_product_lines_v_version_applications" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_applications_parent_id_idx" ON "_product_lines_v_version_applications" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_faqs_order_idx" ON "_product_lines_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_faqs_parent_id_idx" ON "_product_lines_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_technical_specs_order_idx" ON "_product_lines_v_version_technical_specs" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_technical_specs_parent_id_idx" ON "_product_lines_v_version_technical_specs" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_version_quote_glass_options_order_idx" ON "_product_lines_v_version_quote_glass_options" USING btree ("_order");
  CREATE INDEX "_product_lines_v_version_quote_glass_options_parent_id_idx" ON "_product_lines_v_version_quote_glass_options" USING btree ("_parent_id");
  CREATE INDEX "_product_lines_v_parent_idx" ON "_product_lines_v" USING btree ("parent_id");
  CREATE INDEX "_product_lines_v_version_version_hero_image_idx" ON "_product_lines_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_product_lines_v_version_version_application_image_idx" ON "_product_lines_v" USING btree ("version_application_image_id");
  CREATE INDEX "_product_lines_v_version_meta_version_meta_image_idx" ON "_product_lines_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_product_lines_v_version_version_slug_idx" ON "_product_lines_v" USING btree ("version_slug");
  CREATE INDEX "_product_lines_v_version_version_order_idx" ON "_product_lines_v" USING btree ("version_order");
  CREATE INDEX "_product_lines_v_version_version_updated_at_idx" ON "_product_lines_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_lines_v_version_version_created_at_idx" ON "_product_lines_v" USING btree ("version_created_at");
  CREATE INDEX "_product_lines_v_version_version__status_idx" ON "_product_lines_v" USING btree ("version__status");
  CREATE INDEX "_product_lines_v_created_at_idx" ON "_product_lines_v" USING btree ("created_at");
  CREATE INDEX "_product_lines_v_updated_at_idx" ON "_product_lines_v" USING btree ("updated_at");
  CREATE INDEX "_product_lines_v_latest_idx" ON "_product_lines_v" USING btree ("latest");
  CREATE INDEX "_product_lines_v_autosave_idx" ON "_product_lines_v" USING btree ("autosave");
  CREATE INDEX "product_categories_image_idx" ON "product_categories" USING btree ("image_id");
  CREATE INDEX "product_categories_meta_meta_image_idx" ON "product_categories" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_order_idx" ON "product_categories" USING btree ("order");
  CREATE INDEX "product_categories_updated_at_idx" ON "product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "product_categories" USING btree ("created_at");
  CREATE INDEX "product_categories__status_idx" ON "product_categories" USING btree ("_status");
  CREATE INDEX "_product_categories_v_parent_idx" ON "_product_categories_v" USING btree ("parent_id");
  CREATE INDEX "_product_categories_v_version_version_image_idx" ON "_product_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_product_categories_v_version_meta_version_meta_image_idx" ON "_product_categories_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_product_categories_v_version_version_slug_idx" ON "_product_categories_v" USING btree ("version_slug");
  CREATE INDEX "_product_categories_v_version_version_order_idx" ON "_product_categories_v" USING btree ("version_order");
  CREATE INDEX "_product_categories_v_version_version_updated_at_idx" ON "_product_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_categories_v_version_version_created_at_idx" ON "_product_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_product_categories_v_version_version__status_idx" ON "_product_categories_v" USING btree ("version__status");
  CREATE INDEX "_product_categories_v_created_at_idx" ON "_product_categories_v" USING btree ("created_at");
  CREATE INDEX "_product_categories_v_updated_at_idx" ON "_product_categories_v" USING btree ("updated_at");
  CREATE INDEX "_product_categories_v_latest_idx" ON "_product_categories_v" USING btree ("latest");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE INDEX "projects_facts_order_idx" ON "projects_facts" USING btree ("_order");
  CREATE INDEX "projects_facts_parent_id_idx" ON "projects_facts" USING btree ("_parent_id");
  CREATE INDEX "projects_cover_image_idx" ON "projects" USING btree ("cover_image_id");
  CREATE INDEX "projects_line_idx" ON "projects" USING btree ("line_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");
  CREATE INDEX "projects_order_idx" ON "projects" USING btree ("order");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_project_categories_id_idx" ON "projects_rels" USING btree ("project_categories_id");
  CREATE INDEX "projects_rels_products_id_idx" ON "projects_rels" USING btree ("products_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_projects_v_version_facts_order_idx" ON "_projects_v_version_facts" USING btree ("_order");
  CREATE INDEX "_projects_v_version_facts_parent_id_idx" ON "_projects_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_cover_image_idx" ON "_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_projects_v_version_version_line_idx" ON "_projects_v" USING btree ("version_line_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_featured_idx" ON "_projects_v" USING btree ("version_featured");
  CREATE INDEX "_projects_v_version_version_order_idx" ON "_projects_v" USING btree ("version_order");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_project_categories_id_idx" ON "_projects_v_rels" USING btree ("project_categories_id");
  CREATE INDEX "_projects_v_rels_products_id_idx" ON "_projects_v_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "project_categories_slug_idx" ON "project_categories" USING btree ("slug");
  CREATE INDEX "project_categories_order_idx" ON "project_categories" USING btree ("order");
  CREATE INDEX "project_categories_updated_at_idx" ON "project_categories" USING btree ("updated_at");
  CREATE INDEX "project_categories_created_at_idx" ON "project_categories" USING btree ("created_at");
  CREATE INDEX "pages_blocks_hero_links_order_idx" ON "pages_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_links_parent_id_idx" ON "pages_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_highlights_order_idx" ON "pages_blocks_hero_highlights" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_highlights_parent_id_idx" ON "pages_blocks_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_settings_hide_on_order_idx" ON "pages_blocks_hero_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_hero_settings_hide_on_parent_idx" ON "pages_blocks_hero_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_statement_settings_hide_on_order_idx" ON "pages_blocks_statement_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_statement_settings_hide_on_parent_idx" ON "pages_blocks_statement_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_statement_order_idx" ON "pages_blocks_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_statement_parent_id_idx" ON "pages_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_path_idx" ON "pages_blocks_statement" USING btree ("_path");
  CREATE INDEX "text_img_tags_order_idx" ON "text_img_tags" USING btree ("_order");
  CREATE INDEX "text_img_tags_parent_id_idx" ON "text_img_tags" USING btree ("_parent_id");
  CREATE INDEX "text_img_bullets_order_idx" ON "text_img_bullets" USING btree ("_order");
  CREATE INDEX "text_img_bullets_parent_id_idx" ON "text_img_bullets" USING btree ("_parent_id");
  CREATE INDEX "text_img_facts_order_idx" ON "text_img_facts" USING btree ("_order");
  CREATE INDEX "text_img_facts_parent_id_idx" ON "text_img_facts" USING btree ("_parent_id");
  CREATE INDEX "text_img_links_order_idx" ON "text_img_links" USING btree ("_order");
  CREATE INDEX "text_img_links_parent_id_idx" ON "text_img_links" USING btree ("_parent_id");
  CREATE INDEX "text_img_settings_hide_on_order_idx" ON "text_img_settings_hide_on" USING btree ("order");
  CREATE INDEX "text_img_settings_hide_on_parent_idx" ON "text_img_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "text_img_order_idx" ON "text_img" USING btree ("_order");
  CREATE INDEX "text_img_parent_id_idx" ON "text_img" USING btree ("_parent_id");
  CREATE INDEX "text_img_path_idx" ON "text_img" USING btree ("_path");
  CREATE INDEX "text_img_image_idx" ON "text_img" USING btree ("image_id");
  CREATE INDEX "pages_blocks_benefits_items_order_idx" ON "pages_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_benefits_items_parent_id_idx" ON "pages_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_benefits_settings_hide_on_order_idx" ON "pages_blocks_benefits_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_benefits_settings_hide_on_parent_idx" ON "pages_blocks_benefits_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_benefits_order_idx" ON "pages_blocks_benefits" USING btree ("_order");
  CREATE INDEX "pages_blocks_benefits_parent_id_idx" ON "pages_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_benefits_path_idx" ON "pages_blocks_benefits" USING btree ("_path");
  CREATE INDEX "prod_lines_settings_hide_on_order_idx" ON "prod_lines_settings_hide_on" USING btree ("order");
  CREATE INDEX "prod_lines_settings_hide_on_parent_idx" ON "prod_lines_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "prod_lines_order_idx" ON "prod_lines" USING btree ("_order");
  CREATE INDEX "prod_lines_parent_id_idx" ON "prod_lines" USING btree ("_parent_id");
  CREATE INDEX "prod_lines_path_idx" ON "prod_lines" USING btree ("_path");
  CREATE INDEX "prod_cats_settings_hide_on_order_idx" ON "prod_cats_settings_hide_on" USING btree ("order");
  CREATE INDEX "prod_cats_settings_hide_on_parent_idx" ON "prod_cats_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "prod_cats_order_idx" ON "prod_cats" USING btree ("_order");
  CREATE INDEX "prod_cats_parent_id_idx" ON "prod_cats" USING btree ("_parent_id");
  CREATE INDEX "prod_cats_path_idx" ON "prod_cats" USING btree ("_path");
  CREATE INDEX "prod_grid_settings_hide_on_order_idx" ON "prod_grid_settings_hide_on" USING btree ("order");
  CREATE INDEX "prod_grid_settings_hide_on_parent_idx" ON "prod_grid_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "prod_grid_order_idx" ON "prod_grid" USING btree ("_order");
  CREATE INDEX "prod_grid_parent_id_idx" ON "prod_grid" USING btree ("_parent_id");
  CREATE INDEX "prod_grid_path_idx" ON "prod_grid" USING btree ("_path");
  CREATE INDEX "prod_grid_category_idx" ON "prod_grid" USING btree ("category_id");
  CREATE INDEX "prod_grid_line_idx" ON "prod_grid" USING btree ("line_id");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_links_order_idx" ON "pages_blocks_process_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_links_parent_id_idx" ON "pages_blocks_process_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_settings_hide_on_order_idx" ON "pages_blocks_process_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_process_settings_hide_on_parent_idx" ON "pages_blocks_process_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_process_order_idx" ON "pages_blocks_process" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_parent_id_idx" ON "pages_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_path_idx" ON "pages_blocks_process" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_image_idx" ON "pages_blocks_process" USING btree ("image_id");
  CREATE INDEX "pages_blocks_advisor_settings_hide_on_order_idx" ON "pages_blocks_advisor_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_advisor_settings_hide_on_parent_idx" ON "pages_blocks_advisor_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_advisor_order_idx" ON "pages_blocks_advisor" USING btree ("_order");
  CREATE INDEX "pages_blocks_advisor_parent_id_idx" ON "pages_blocks_advisor" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_advisor_path_idx" ON "pages_blocks_advisor" USING btree ("_path");
  CREATE INDEX "quote_cta_links_order_idx" ON "quote_cta_links" USING btree ("_order");
  CREATE INDEX "quote_cta_links_parent_id_idx" ON "quote_cta_links" USING btree ("_parent_id");
  CREATE INDEX "quote_cta_settings_hide_on_order_idx" ON "quote_cta_settings_hide_on" USING btree ("order");
  CREATE INDEX "quote_cta_settings_hide_on_parent_idx" ON "quote_cta_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "quote_cta_order_idx" ON "quote_cta" USING btree ("_order");
  CREATE INDEX "quote_cta_parent_id_idx" ON "quote_cta" USING btree ("_parent_id");
  CREATE INDEX "quote_cta_path_idx" ON "quote_cta" USING btree ("_path");
  CREATE INDEX "proj_grid_settings_hide_on_order_idx" ON "proj_grid_settings_hide_on" USING btree ("order");
  CREATE INDEX "proj_grid_settings_hide_on_parent_idx" ON "proj_grid_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "proj_grid_order_idx" ON "proj_grid" USING btree ("_order");
  CREATE INDEX "proj_grid_parent_id_idx" ON "proj_grid" USING btree ("_parent_id");
  CREATE INDEX "proj_grid_path_idx" ON "proj_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_settings_hide_on_order_idx" ON "pages_blocks_gallery_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_gallery_settings_hide_on_parent_idx" ON "pages_blocks_gallery_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_settings_hide_on_order_idx" ON "pages_blocks_faq_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_faq_settings_hide_on_parent_idx" ON "pages_blocks_faq_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_settings_hide_on_order_idx" ON "pages_blocks_contact_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_contact_settings_hide_on_parent_idx" ON "pages_blocks_contact_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "quote_wiz_settings_hide_on_order_idx" ON "quote_wiz_settings_hide_on" USING btree ("order");
  CREATE INDEX "quote_wiz_settings_hide_on_parent_idx" ON "quote_wiz_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "quote_wiz_order_idx" ON "quote_wiz" USING btree ("_order");
  CREATE INDEX "quote_wiz_parent_id_idx" ON "quote_wiz" USING btree ("_parent_id");
  CREATE INDEX "quote_wiz_path_idx" ON "quote_wiz" USING btree ("_path");
  CREATE INDEX "rich_text_settings_hide_on_order_idx" ON "rich_text_settings_hide_on" USING btree ("order");
  CREATE INDEX "rich_text_settings_hide_on_parent_idx" ON "rich_text_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "rich_text_order_idx" ON "rich_text" USING btree ("_order");
  CREATE INDEX "rich_text_parent_id_idx" ON "rich_text" USING btree ("_parent_id");
  CREATE INDEX "rich_text_path_idx" ON "rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_settings_hide_on_order_idx" ON "pages_blocks_video_settings_hide_on" USING btree ("order");
  CREATE INDEX "pages_blocks_video_settings_hide_on_parent_idx" ON "pages_blocks_video_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_poster_idx" ON "pages_blocks_video" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "pages_rels_product_lines_id_idx" ON "pages_rels" USING btree ("product_lines_id");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_product_categories_id_idx" ON "pages_rels" USING btree ("product_categories_id");
  CREATE INDEX "_pages_v_blocks_hero_links_order_idx" ON "_pages_v_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_links_parent_id_idx" ON "_pages_v_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_highlights_order_idx" ON "_pages_v_blocks_hero_highlights" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_highlights_parent_id_idx" ON "_pages_v_blocks_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_settings_hide_on_order_idx" ON "_pages_v_blocks_hero_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_hero_settings_hide_on_parent_idx" ON "_pages_v_blocks_hero_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_statement_settings_hide_on_order_idx" ON "_pages_v_blocks_statement_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_statement_settings_hide_on_parent_idx" ON "_pages_v_blocks_statement_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_statement_order_idx" ON "_pages_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statement_parent_id_idx" ON "_pages_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_path_idx" ON "_pages_v_blocks_statement" USING btree ("_path");
  CREATE INDEX "_text_img_v_tags_order_idx" ON "_text_img_v_tags" USING btree ("_order");
  CREATE INDEX "_text_img_v_tags_parent_id_idx" ON "_text_img_v_tags" USING btree ("_parent_id");
  CREATE INDEX "_text_img_v_bullets_order_idx" ON "_text_img_v_bullets" USING btree ("_order");
  CREATE INDEX "_text_img_v_bullets_parent_id_idx" ON "_text_img_v_bullets" USING btree ("_parent_id");
  CREATE INDEX "_text_img_v_facts_order_idx" ON "_text_img_v_facts" USING btree ("_order");
  CREATE INDEX "_text_img_v_facts_parent_id_idx" ON "_text_img_v_facts" USING btree ("_parent_id");
  CREATE INDEX "_text_img_v_links_order_idx" ON "_text_img_v_links" USING btree ("_order");
  CREATE INDEX "_text_img_v_links_parent_id_idx" ON "_text_img_v_links" USING btree ("_parent_id");
  CREATE INDEX "_text_img_v_settings_hide_on_order_idx" ON "_text_img_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_text_img_v_settings_hide_on_parent_idx" ON "_text_img_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_text_img_v_order_idx" ON "_text_img_v" USING btree ("_order");
  CREATE INDEX "_text_img_v_parent_id_idx" ON "_text_img_v" USING btree ("_parent_id");
  CREATE INDEX "_text_img_v_path_idx" ON "_text_img_v" USING btree ("_path");
  CREATE INDEX "_text_img_v_image_idx" ON "_text_img_v" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_benefits_items_order_idx" ON "_pages_v_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_benefits_items_parent_id_idx" ON "_pages_v_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_benefits_settings_hide_on_order_idx" ON "_pages_v_blocks_benefits_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_benefits_settings_hide_on_parent_idx" ON "_pages_v_blocks_benefits_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_benefits_order_idx" ON "_pages_v_blocks_benefits" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_benefits_parent_id_idx" ON "_pages_v_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_benefits_path_idx" ON "_pages_v_blocks_benefits" USING btree ("_path");
  CREATE INDEX "_prod_lines_v_settings_hide_on_order_idx" ON "_prod_lines_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_prod_lines_v_settings_hide_on_parent_idx" ON "_prod_lines_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_prod_lines_v_order_idx" ON "_prod_lines_v" USING btree ("_order");
  CREATE INDEX "_prod_lines_v_parent_id_idx" ON "_prod_lines_v" USING btree ("_parent_id");
  CREATE INDEX "_prod_lines_v_path_idx" ON "_prod_lines_v" USING btree ("_path");
  CREATE INDEX "_prod_cats_v_settings_hide_on_order_idx" ON "_prod_cats_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_prod_cats_v_settings_hide_on_parent_idx" ON "_prod_cats_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_prod_cats_v_order_idx" ON "_prod_cats_v" USING btree ("_order");
  CREATE INDEX "_prod_cats_v_parent_id_idx" ON "_prod_cats_v" USING btree ("_parent_id");
  CREATE INDEX "_prod_cats_v_path_idx" ON "_prod_cats_v" USING btree ("_path");
  CREATE INDEX "_prod_grid_v_settings_hide_on_order_idx" ON "_prod_grid_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_prod_grid_v_settings_hide_on_parent_idx" ON "_prod_grid_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_prod_grid_v_order_idx" ON "_prod_grid_v" USING btree ("_order");
  CREATE INDEX "_prod_grid_v_parent_id_idx" ON "_prod_grid_v" USING btree ("_parent_id");
  CREATE INDEX "_prod_grid_v_path_idx" ON "_prod_grid_v" USING btree ("_path");
  CREATE INDEX "_prod_grid_v_category_idx" ON "_prod_grid_v" USING btree ("category_id");
  CREATE INDEX "_prod_grid_v_line_idx" ON "_prod_grid_v" USING btree ("line_id");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_links_order_idx" ON "_pages_v_blocks_process_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_links_parent_id_idx" ON "_pages_v_blocks_process_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_settings_hide_on_order_idx" ON "_pages_v_blocks_process_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_process_settings_hide_on_parent_idx" ON "_pages_v_blocks_process_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_process_order_idx" ON "_pages_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_parent_id_idx" ON "_pages_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_path_idx" ON "_pages_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_image_idx" ON "_pages_v_blocks_process" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_advisor_settings_hide_on_order_idx" ON "_pages_v_blocks_advisor_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_advisor_settings_hide_on_parent_idx" ON "_pages_v_blocks_advisor_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_advisor_order_idx" ON "_pages_v_blocks_advisor" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_advisor_parent_id_idx" ON "_pages_v_blocks_advisor" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_advisor_path_idx" ON "_pages_v_blocks_advisor" USING btree ("_path");
  CREATE INDEX "_quote_cta_v_links_order_idx" ON "_quote_cta_v_links" USING btree ("_order");
  CREATE INDEX "_quote_cta_v_links_parent_id_idx" ON "_quote_cta_v_links" USING btree ("_parent_id");
  CREATE INDEX "_quote_cta_v_settings_hide_on_order_idx" ON "_quote_cta_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_quote_cta_v_settings_hide_on_parent_idx" ON "_quote_cta_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_quote_cta_v_order_idx" ON "_quote_cta_v" USING btree ("_order");
  CREATE INDEX "_quote_cta_v_parent_id_idx" ON "_quote_cta_v" USING btree ("_parent_id");
  CREATE INDEX "_quote_cta_v_path_idx" ON "_quote_cta_v" USING btree ("_path");
  CREATE INDEX "_proj_grid_v_settings_hide_on_order_idx" ON "_proj_grid_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_proj_grid_v_settings_hide_on_parent_idx" ON "_proj_grid_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_proj_grid_v_order_idx" ON "_proj_grid_v" USING btree ("_order");
  CREATE INDEX "_proj_grid_v_parent_id_idx" ON "_proj_grid_v" USING btree ("_parent_id");
  CREATE INDEX "_proj_grid_v_path_idx" ON "_proj_grid_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_image_idx" ON "_pages_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_settings_hide_on_order_idx" ON "_pages_v_blocks_gallery_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_gallery_settings_hide_on_parent_idx" ON "_pages_v_blocks_gallery_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_settings_hide_on_order_idx" ON "_pages_v_blocks_faq_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_faq_settings_hide_on_parent_idx" ON "_pages_v_blocks_faq_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_settings_hide_on_order_idx" ON "_pages_v_blocks_contact_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_contact_settings_hide_on_parent_idx" ON "_pages_v_blocks_contact_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_quote_wiz_v_settings_hide_on_order_idx" ON "_quote_wiz_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_quote_wiz_v_settings_hide_on_parent_idx" ON "_quote_wiz_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_quote_wiz_v_order_idx" ON "_quote_wiz_v" USING btree ("_order");
  CREATE INDEX "_quote_wiz_v_parent_id_idx" ON "_quote_wiz_v" USING btree ("_parent_id");
  CREATE INDEX "_quote_wiz_v_path_idx" ON "_quote_wiz_v" USING btree ("_path");
  CREATE INDEX "_rich_text_v_settings_hide_on_order_idx" ON "_rich_text_v_settings_hide_on" USING btree ("order");
  CREATE INDEX "_rich_text_v_settings_hide_on_parent_idx" ON "_rich_text_v_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_rich_text_v_order_idx" ON "_rich_text_v" USING btree ("_order");
  CREATE INDEX "_rich_text_v_parent_id_idx" ON "_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "_rich_text_v_path_idx" ON "_rich_text_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_settings_hide_on_order_idx" ON "_pages_v_blocks_video_settings_hide_on" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_video_settings_hide_on_parent_idx" ON "_pages_v_blocks_video_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_poster_idx" ON "_pages_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_rels_product_lines_id_idx" ON "_pages_v_rels" USING btree ("product_lines_id");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_product_categories_id_idx" ON "_pages_v_rels" USING btree ("product_categories_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_mobile_sizes_mobile_filename_idx" ON "media" USING btree ("sizes_mobile_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "media_sizes_desktop_sizes_desktop_filename_idx" ON "media" USING btree ("sizes_desktop_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "leads_quote_items_order_idx" ON "leads_quote_items" USING btree ("_order");
  CREATE INDEX "leads_quote_items_parent_id_idx" ON "leads_quote_items" USING btree ("_parent_id");
  CREATE INDEX "leads_quote_items_product_idx" ON "leads_quote_items" USING btree ("product_id");
  CREATE INDEX "leads_quote_items_line_idx" ON "leads_quote_items" USING btree ("line_id");
  CREATE INDEX "leads_internal_notes_order_idx" ON "leads_internal_notes" USING btree ("_order");
  CREATE INDEX "leads_internal_notes_parent_id_idx" ON "leads_internal_notes" USING btree ("_parent_id");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_type_idx" ON "leads" USING btree ("type");
  CREATE INDEX "leads_full_name_idx" ON "leads" USING btree ("full_name");
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_project_type_idx" ON "leads" USING btree ("project_type");
  CREATE INDEX "leads_product_idx" ON "leads" USING btree ("product_id");
  CREATE INDEX "leads_product_line_idx" ON "leads" USING btree ("product_line_id");
  CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_products_id_idx" ON "redirects_rels" USING btree ("products_id");
  CREATE INDEX "redirects_rels_product_lines_id_idx" ON "redirects_rels" USING btree ("product_lines_id");
  CREATE INDEX "redirects_rels_projects_id_idx" ON "redirects_rels" USING btree ("projects_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_lines_id_idx" ON "payload_locked_documents_rels" USING btree ("product_lines_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_project_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("project_categories_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_blocks_hero_links_order_idx" ON "homepage_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_links_parent_id_idx" ON "homepage_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_highlights_order_idx" ON "homepage_blocks_hero_highlights" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_highlights_parent_id_idx" ON "homepage_blocks_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_settings_hide_on_order_idx" ON "homepage_blocks_hero_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_hero_settings_hide_on_parent_idx" ON "homepage_blocks_hero_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_hero_order_idx" ON "homepage_blocks_hero" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_parent_id_idx" ON "homepage_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_path_idx" ON "homepage_blocks_hero" USING btree ("_path");
  CREATE INDEX "homepage_blocks_hero_image_idx" ON "homepage_blocks_hero" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_statement_settings_hide_on_order_idx" ON "homepage_blocks_statement_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_statement_settings_hide_on_parent_idx" ON "homepage_blocks_statement_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_statement_order_idx" ON "homepage_blocks_statement" USING btree ("_order");
  CREATE INDEX "homepage_blocks_statement_parent_id_idx" ON "homepage_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_statement_path_idx" ON "homepage_blocks_statement" USING btree ("_path");
  CREATE INDEX "homepage_blocks_benefits_items_order_idx" ON "homepage_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_benefits_items_parent_id_idx" ON "homepage_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_benefits_settings_hide_on_order_idx" ON "homepage_blocks_benefits_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_benefits_settings_hide_on_parent_idx" ON "homepage_blocks_benefits_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_benefits_order_idx" ON "homepage_blocks_benefits" USING btree ("_order");
  CREATE INDEX "homepage_blocks_benefits_parent_id_idx" ON "homepage_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_benefits_path_idx" ON "homepage_blocks_benefits" USING btree ("_path");
  CREATE INDEX "homepage_blocks_process_steps_order_idx" ON "homepage_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "homepage_blocks_process_steps_parent_id_idx" ON "homepage_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_process_links_order_idx" ON "homepage_blocks_process_links" USING btree ("_order");
  CREATE INDEX "homepage_blocks_process_links_parent_id_idx" ON "homepage_blocks_process_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_process_settings_hide_on_order_idx" ON "homepage_blocks_process_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_process_settings_hide_on_parent_idx" ON "homepage_blocks_process_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_process_order_idx" ON "homepage_blocks_process" USING btree ("_order");
  CREATE INDEX "homepage_blocks_process_parent_id_idx" ON "homepage_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_process_path_idx" ON "homepage_blocks_process" USING btree ("_path");
  CREATE INDEX "homepage_blocks_process_image_idx" ON "homepage_blocks_process" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_advisor_settings_hide_on_order_idx" ON "homepage_blocks_advisor_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_advisor_settings_hide_on_parent_idx" ON "homepage_blocks_advisor_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_advisor_order_idx" ON "homepage_blocks_advisor" USING btree ("_order");
  CREATE INDEX "homepage_blocks_advisor_parent_id_idx" ON "homepage_blocks_advisor" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_advisor_path_idx" ON "homepage_blocks_advisor" USING btree ("_path");
  CREATE INDEX "homepage_blocks_gallery_images_order_idx" ON "homepage_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "homepage_blocks_gallery_images_parent_id_idx" ON "homepage_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_gallery_images_image_idx" ON "homepage_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_gallery_settings_hide_on_order_idx" ON "homepage_blocks_gallery_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_gallery_settings_hide_on_parent_idx" ON "homepage_blocks_gallery_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_gallery_order_idx" ON "homepage_blocks_gallery" USING btree ("_order");
  CREATE INDEX "homepage_blocks_gallery_parent_id_idx" ON "homepage_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_gallery_path_idx" ON "homepage_blocks_gallery" USING btree ("_path");
  CREATE INDEX "homepage_blocks_faq_items_order_idx" ON "homepage_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_faq_items_parent_id_idx" ON "homepage_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_faq_settings_hide_on_order_idx" ON "homepage_blocks_faq_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_faq_settings_hide_on_parent_idx" ON "homepage_blocks_faq_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_faq_order_idx" ON "homepage_blocks_faq" USING btree ("_order");
  CREATE INDEX "homepage_blocks_faq_parent_id_idx" ON "homepage_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_faq_path_idx" ON "homepage_blocks_faq" USING btree ("_path");
  CREATE INDEX "homepage_blocks_contact_settings_hide_on_order_idx" ON "homepage_blocks_contact_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_contact_settings_hide_on_parent_idx" ON "homepage_blocks_contact_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_contact_order_idx" ON "homepage_blocks_contact" USING btree ("_order");
  CREATE INDEX "homepage_blocks_contact_parent_id_idx" ON "homepage_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_contact_path_idx" ON "homepage_blocks_contact" USING btree ("_path");
  CREATE INDEX "homepage_blocks_video_settings_hide_on_order_idx" ON "homepage_blocks_video_settings_hide_on" USING btree ("order");
  CREATE INDEX "homepage_blocks_video_settings_hide_on_parent_idx" ON "homepage_blocks_video_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "homepage_blocks_video_order_idx" ON "homepage_blocks_video" USING btree ("_order");
  CREATE INDEX "homepage_blocks_video_parent_id_idx" ON "homepage_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_video_path_idx" ON "homepage_blocks_video" USING btree ("_path");
  CREATE INDEX "homepage_blocks_video_poster_idx" ON "homepage_blocks_video" USING btree ("poster_id");
  CREATE INDEX "homepage_blocks_spacer_order_idx" ON "homepage_blocks_spacer" USING btree ("_order");
  CREATE INDEX "homepage_blocks_spacer_parent_id_idx" ON "homepage_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_spacer_path_idx" ON "homepage_blocks_spacer" USING btree ("_path");
  CREATE INDEX "homepage_meta_meta_image_idx" ON "homepage" USING btree ("meta_image_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_pages_id_idx" ON "homepage_rels" USING btree ("pages_id");
  CREATE INDEX "homepage_rels_products_id_idx" ON "homepage_rels" USING btree ("products_id");
  CREATE INDEX "homepage_rels_product_lines_id_idx" ON "homepage_rels" USING btree ("product_lines_id");
  CREATE INDEX "homepage_rels_projects_id_idx" ON "homepage_rels" USING btree ("projects_id");
  CREATE INDEX "_homepage_v_blocks_hero_links_order_idx" ON "_homepage_v_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_links_parent_id_idx" ON "_homepage_v_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_highlights_order_idx" ON "_homepage_v_blocks_hero_highlights" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_highlights_parent_id_idx" ON "_homepage_v_blocks_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_settings_hide_on_order_idx" ON "_homepage_v_blocks_hero_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_hero_settings_hide_on_parent_idx" ON "_homepage_v_blocks_hero_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_order_idx" ON "_homepage_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_parent_id_idx" ON "_homepage_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_path_idx" ON "_homepage_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_hero_image_idx" ON "_homepage_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_statement_settings_hide_on_order_idx" ON "_homepage_v_blocks_statement_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_statement_settings_hide_on_parent_idx" ON "_homepage_v_blocks_statement_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_statement_order_idx" ON "_homepage_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_statement_parent_id_idx" ON "_homepage_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_statement_path_idx" ON "_homepage_v_blocks_statement" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_benefits_items_order_idx" ON "_homepage_v_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_benefits_items_parent_id_idx" ON "_homepage_v_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_benefits_settings_hide_on_order_idx" ON "_homepage_v_blocks_benefits_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_benefits_settings_hide_on_parent_idx" ON "_homepage_v_blocks_benefits_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_benefits_order_idx" ON "_homepage_v_blocks_benefits" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_benefits_parent_id_idx" ON "_homepage_v_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_benefits_path_idx" ON "_homepage_v_blocks_benefits" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_process_steps_order_idx" ON "_homepage_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_process_steps_parent_id_idx" ON "_homepage_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_process_links_order_idx" ON "_homepage_v_blocks_process_links" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_process_links_parent_id_idx" ON "_homepage_v_blocks_process_links" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_process_settings_hide_on_order_idx" ON "_homepage_v_blocks_process_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_process_settings_hide_on_parent_idx" ON "_homepage_v_blocks_process_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_process_order_idx" ON "_homepage_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_process_parent_id_idx" ON "_homepage_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_process_path_idx" ON "_homepage_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_process_image_idx" ON "_homepage_v_blocks_process" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_advisor_settings_hide_on_order_idx" ON "_homepage_v_blocks_advisor_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_advisor_settings_hide_on_parent_idx" ON "_homepage_v_blocks_advisor_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_advisor_order_idx" ON "_homepage_v_blocks_advisor" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_advisor_parent_id_idx" ON "_homepage_v_blocks_advisor" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_advisor_path_idx" ON "_homepage_v_blocks_advisor" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_gallery_images_order_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_gallery_images_parent_id_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_gallery_images_image_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_gallery_settings_hide_on_order_idx" ON "_homepage_v_blocks_gallery_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_gallery_settings_hide_on_parent_idx" ON "_homepage_v_blocks_gallery_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_gallery_order_idx" ON "_homepage_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_gallery_parent_id_idx" ON "_homepage_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_gallery_path_idx" ON "_homepage_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_faq_items_order_idx" ON "_homepage_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_faq_items_parent_id_idx" ON "_homepage_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_faq_settings_hide_on_order_idx" ON "_homepage_v_blocks_faq_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_faq_settings_hide_on_parent_idx" ON "_homepage_v_blocks_faq_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_faq_order_idx" ON "_homepage_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_faq_parent_id_idx" ON "_homepage_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_faq_path_idx" ON "_homepage_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_contact_settings_hide_on_order_idx" ON "_homepage_v_blocks_contact_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_contact_settings_hide_on_parent_idx" ON "_homepage_v_blocks_contact_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_contact_order_idx" ON "_homepage_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_contact_parent_id_idx" ON "_homepage_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_contact_path_idx" ON "_homepage_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_video_settings_hide_on_order_idx" ON "_homepage_v_blocks_video_settings_hide_on" USING btree ("order");
  CREATE INDEX "_homepage_v_blocks_video_settings_hide_on_parent_idx" ON "_homepage_v_blocks_video_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_blocks_video_order_idx" ON "_homepage_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_video_parent_id_idx" ON "_homepage_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_video_path_idx" ON "_homepage_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_video_poster_idx" ON "_homepage_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_homepage_v_blocks_spacer_order_idx" ON "_homepage_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_spacer_parent_id_idx" ON "_homepage_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_spacer_path_idx" ON "_homepage_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_homepage_v_version_meta_version_meta_image_idx" ON "_homepage_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_autosave_idx" ON "_homepage_v" USING btree ("autosave");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_pages_id_idx" ON "_homepage_v_rels" USING btree ("pages_id");
  CREATE INDEX "_homepage_v_rels_products_id_idx" ON "_homepage_v_rels" USING btree ("products_id");
  CREATE INDEX "_homepage_v_rels_product_lines_id_idx" ON "_homepage_v_rels" USING btree ("product_lines_id");
  CREATE INDEX "_homepage_v_rels_projects_id_idx" ON "_homepage_v_rels" USING btree ("projects_id");
  CREATE INDEX "archives_blocks_hero_links_order_idx" ON "archives_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "archives_blocks_hero_links_parent_id_idx" ON "archives_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_hero_highlights_order_idx" ON "archives_blocks_hero_highlights" USING btree ("_order");
  CREATE INDEX "archives_blocks_hero_highlights_parent_id_idx" ON "archives_blocks_hero_highlights" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_hero_settings_hide_on_order_idx" ON "archives_blocks_hero_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_hero_settings_hide_on_parent_idx" ON "archives_blocks_hero_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_hero_order_idx" ON "archives_blocks_hero" USING btree ("_order");
  CREATE INDEX "archives_blocks_hero_parent_id_idx" ON "archives_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_hero_path_idx" ON "archives_blocks_hero" USING btree ("_path");
  CREATE INDEX "archives_blocks_hero_image_idx" ON "archives_blocks_hero" USING btree ("image_id");
  CREATE INDEX "archives_blocks_statement_settings_hide_on_order_idx" ON "archives_blocks_statement_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_statement_settings_hide_on_parent_idx" ON "archives_blocks_statement_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_statement_order_idx" ON "archives_blocks_statement" USING btree ("_order");
  CREATE INDEX "archives_blocks_statement_parent_id_idx" ON "archives_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_statement_path_idx" ON "archives_blocks_statement" USING btree ("_path");
  CREATE INDEX "archives_blocks_benefits_items_order_idx" ON "archives_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "archives_blocks_benefits_items_parent_id_idx" ON "archives_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_benefits_settings_hide_on_order_idx" ON "archives_blocks_benefits_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_benefits_settings_hide_on_parent_idx" ON "archives_blocks_benefits_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_benefits_order_idx" ON "archives_blocks_benefits" USING btree ("_order");
  CREATE INDEX "archives_blocks_benefits_parent_id_idx" ON "archives_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_benefits_path_idx" ON "archives_blocks_benefits" USING btree ("_path");
  CREATE INDEX "archives_blocks_process_steps_order_idx" ON "archives_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "archives_blocks_process_steps_parent_id_idx" ON "archives_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_process_links_order_idx" ON "archives_blocks_process_links" USING btree ("_order");
  CREATE INDEX "archives_blocks_process_links_parent_id_idx" ON "archives_blocks_process_links" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_process_settings_hide_on_order_idx" ON "archives_blocks_process_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_process_settings_hide_on_parent_idx" ON "archives_blocks_process_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_process_order_idx" ON "archives_blocks_process" USING btree ("_order");
  CREATE INDEX "archives_blocks_process_parent_id_idx" ON "archives_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_process_path_idx" ON "archives_blocks_process" USING btree ("_path");
  CREATE INDEX "archives_blocks_process_image_idx" ON "archives_blocks_process" USING btree ("image_id");
  CREATE INDEX "archives_blocks_advisor_settings_hide_on_order_idx" ON "archives_blocks_advisor_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_advisor_settings_hide_on_parent_idx" ON "archives_blocks_advisor_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_advisor_order_idx" ON "archives_blocks_advisor" USING btree ("_order");
  CREATE INDEX "archives_blocks_advisor_parent_id_idx" ON "archives_blocks_advisor" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_advisor_path_idx" ON "archives_blocks_advisor" USING btree ("_path");
  CREATE INDEX "archives_blocks_gallery_images_order_idx" ON "archives_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "archives_blocks_gallery_images_parent_id_idx" ON "archives_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_gallery_images_image_idx" ON "archives_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "archives_blocks_gallery_settings_hide_on_order_idx" ON "archives_blocks_gallery_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_gallery_settings_hide_on_parent_idx" ON "archives_blocks_gallery_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_gallery_order_idx" ON "archives_blocks_gallery" USING btree ("_order");
  CREATE INDEX "archives_blocks_gallery_parent_id_idx" ON "archives_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_gallery_path_idx" ON "archives_blocks_gallery" USING btree ("_path");
  CREATE INDEX "archives_blocks_faq_items_order_idx" ON "archives_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "archives_blocks_faq_items_parent_id_idx" ON "archives_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_faq_settings_hide_on_order_idx" ON "archives_blocks_faq_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_faq_settings_hide_on_parent_idx" ON "archives_blocks_faq_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_faq_order_idx" ON "archives_blocks_faq" USING btree ("_order");
  CREATE INDEX "archives_blocks_faq_parent_id_idx" ON "archives_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_faq_path_idx" ON "archives_blocks_faq" USING btree ("_path");
  CREATE INDEX "archives_blocks_contact_settings_hide_on_order_idx" ON "archives_blocks_contact_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_contact_settings_hide_on_parent_idx" ON "archives_blocks_contact_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_contact_order_idx" ON "archives_blocks_contact" USING btree ("_order");
  CREATE INDEX "archives_blocks_contact_parent_id_idx" ON "archives_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_contact_path_idx" ON "archives_blocks_contact" USING btree ("_path");
  CREATE INDEX "archives_blocks_video_settings_hide_on_order_idx" ON "archives_blocks_video_settings_hide_on" USING btree ("order");
  CREATE INDEX "archives_blocks_video_settings_hide_on_parent_idx" ON "archives_blocks_video_settings_hide_on" USING btree ("parent_id");
  CREATE INDEX "archives_blocks_video_order_idx" ON "archives_blocks_video" USING btree ("_order");
  CREATE INDEX "archives_blocks_video_parent_id_idx" ON "archives_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_video_path_idx" ON "archives_blocks_video" USING btree ("_path");
  CREATE INDEX "archives_blocks_video_poster_idx" ON "archives_blocks_video" USING btree ("poster_id");
  CREATE INDEX "archives_blocks_spacer_order_idx" ON "archives_blocks_spacer" USING btree ("_order");
  CREATE INDEX "archives_blocks_spacer_parent_id_idx" ON "archives_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "archives_blocks_spacer_path_idx" ON "archives_blocks_spacer" USING btree ("_path");
  CREATE INDEX "archives_products_products_image_idx" ON "archives" USING btree ("products_image_id");
  CREATE INDEX "archives_products_seo_products_seo_image_idx" ON "archives" USING btree ("products_seo_image_id");
  CREATE INDEX "archives_lines_lines_image_idx" ON "archives" USING btree ("lines_image_id");
  CREATE INDEX "archives_lines_seo_lines_seo_image_idx" ON "archives" USING btree ("lines_seo_image_id");
  CREATE INDEX "archives_projects_projects_image_idx" ON "archives" USING btree ("projects_image_id");
  CREATE INDEX "archives_projects_seo_projects_seo_image_idx" ON "archives" USING btree ("projects_seo_image_id");
  CREATE INDEX "archives_rels_order_idx" ON "archives_rels" USING btree ("order");
  CREATE INDEX "archives_rels_parent_idx" ON "archives_rels" USING btree ("parent_id");
  CREATE INDEX "archives_rels_path_idx" ON "archives_rels" USING btree ("path");
  CREATE INDEX "archives_rels_pages_id_idx" ON "archives_rels" USING btree ("pages_id");
  CREATE INDEX "archives_rels_products_id_idx" ON "archives_rels" USING btree ("products_id");
  CREATE INDEX "archives_rels_product_lines_id_idx" ON "archives_rels" USING btree ("product_lines_id");
  CREATE INDEX "archives_rels_projects_id_idx" ON "archives_rels" USING btree ("projects_id");
  CREATE INDEX "site_settings_working_hours_order_idx" ON "site_settings_working_hours" USING btree ("_order");
  CREATE INDEX "site_settings_working_hours_parent_id_idx" ON "site_settings_working_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_product_info_panels_rows_order_idx" ON "site_settings_product_info_panels_rows" USING btree ("_order");
  CREATE INDEX "site_settings_product_info_panels_rows_parent_id_idx" ON "site_settings_product_info_panels_rows" USING btree ("_parent_id");
  CREATE INDEX "site_settings_product_info_panels_order_idx" ON "site_settings_product_info_panels" USING btree ("_order");
  CREATE INDEX "site_settings_product_info_panels_parent_id_idx" ON "site_settings_product_info_panels" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_light_idx" ON "site_settings" USING btree ("logo_light_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "header_navigation_mega_menu_columns_links_order_idx" ON "header_navigation_mega_menu_columns_links" USING btree ("_order");
  CREATE INDEX "header_navigation_mega_menu_columns_links_parent_id_idx" ON "header_navigation_mega_menu_columns_links" USING btree ("_parent_id");
  CREATE INDEX "header_navigation_mega_menu_columns_order_idx" ON "header_navigation_mega_menu_columns" USING btree ("_order");
  CREATE INDEX "header_navigation_mega_menu_columns_parent_id_idx" ON "header_navigation_mega_menu_columns" USING btree ("_parent_id");
  CREATE INDEX "header_navigation_order_idx" ON "header_navigation" USING btree ("_order");
  CREATE INDEX "header_navigation_parent_id_idx" ON "header_navigation" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_products_id_idx" ON "header_rels" USING btree ("products_id");
  CREATE INDEX "header_rels_product_lines_id_idx" ON "header_rels" USING btree ("product_lines_id");
  CREATE INDEX "header_rels_projects_id_idx" ON "header_rels" USING btree ("projects_id");
  CREATE INDEX "footer_cta_links_order_idx" ON "footer_cta_links" USING btree ("_order");
  CREATE INDEX "footer_cta_links_parent_id_idx" ON "footer_cta_links" USING btree ("_parent_id");
  CREATE INDEX "footer_navigation_links_order_idx" ON "footer_navigation_links" USING btree ("_order");
  CREATE INDEX "footer_navigation_links_parent_id_idx" ON "footer_navigation_links" USING btree ("_parent_id");
  CREATE INDEX "footer_navigation_order_idx" ON "footer_navigation" USING btree ("_order");
  CREATE INDEX "footer_navigation_parent_id_idx" ON "footer_navigation" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_products_id_idx" ON "footer_rels" USING btree ("products_id");
  CREATE INDEX "footer_rels_product_lines_id_idx" ON "footer_rels" USING btree ("product_lines_id");
  CREATE INDEX "footer_rels_projects_id_idx" ON "footer_rels" USING btree ("projects_id");
  CREATE INDEX "advisor_questions_answers_weights_order_idx" ON "advisor_questions_answers_weights" USING btree ("_order");
  CREATE INDEX "advisor_questions_answers_weights_parent_id_idx" ON "advisor_questions_answers_weights" USING btree ("_parent_id");
  CREATE INDEX "advisor_questions_answers_weights_line_idx" ON "advisor_questions_answers_weights" USING btree ("line_id");
  CREATE INDEX "advisor_questions_answers_order_idx" ON "advisor_questions_answers" USING btree ("_order");
  CREATE INDEX "advisor_questions_answers_parent_id_idx" ON "advisor_questions_answers" USING btree ("_parent_id");
  CREATE INDEX "advisor_questions_order_idx" ON "advisor_questions" USING btree ("_order");
  CREATE INDEX "advisor_questions_parent_id_idx" ON "advisor_questions" USING btree ("_parent_id");
  CREATE INDEX "advisor_results_order_idx" ON "advisor_results" USING btree ("_order");
  CREATE INDEX "advisor_results_parent_id_idx" ON "advisor_results" USING btree ("_parent_id");
  CREATE INDEX "advisor_results_line_idx" ON "advisor_results" USING btree ("line_id");
  CREATE INDEX "advisor_fallback_line_idx" ON "advisor" USING btree ("fallback_line_id");
  CREATE INDEX "forms_settings_needs_order_idx" ON "forms_settings_needs" USING btree ("_order");
  CREATE INDEX "forms_settings_needs_parent_id_idx" ON "forms_settings_needs" USING btree ("_parent_id");
  CREATE INDEX "forms_settings_needs_preset_product_idx" ON "forms_settings_needs" USING btree ("preset_product_id");
  CREATE INDEX "forms_settings_project_types_order_idx" ON "forms_settings_project_types" USING btree ("_order");
  CREATE INDEX "forms_settings_project_types_parent_id_idx" ON "forms_settings_project_types" USING btree ("_parent_id");
  CREATE INDEX "forms_settings_notification_emails_order_idx" ON "forms_settings_notification_emails" USING btree ("_order");
  CREATE INDEX "forms_settings_notification_emails_parent_id_idx" ON "forms_settings_notification_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_settings_rels_order_idx" ON "forms_settings_rels" USING btree ("order");
  CREATE INDEX "forms_settings_rels_parent_idx" ON "forms_settings_rels" USING btree ("parent_id");
  CREATE INDEX "forms_settings_rels_path_idx" ON "forms_settings_rels" USING btree ("path");
  CREATE INDEX "forms_settings_rels_product_categories_id_idx" ON "forms_settings_rels" USING btree ("product_categories_id");
  CREATE INDEX "seo_defaults_default_image_idx" ON "seo_defaults" USING btree ("default_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_facts" CASCADE;
  DROP TABLE "products_configurations" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_benefits" CASCADE;
  DROP TABLE "products_applications" CASCADE;
  DROP TABLE "products_technical_specifications" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "_products_v_version_facts" CASCADE;
  DROP TABLE "_products_v_version_configurations" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_version_benefits" CASCADE;
  DROP TABLE "_products_v_version_applications" CASCADE;
  DROP TABLE "_products_v_version_technical_specifications" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "product_lines_facts" CASCADE;
  DROP TABLE "product_lines_card_highlights" CASCADE;
  DROP TABLE "product_lines_gallery" CASCADE;
  DROP TABLE "product_lines_features" CASCADE;
  DROP TABLE "product_lines_applications" CASCADE;
  DROP TABLE "product_lines_faqs" CASCADE;
  DROP TABLE "product_lines_technical_specs" CASCADE;
  DROP TABLE "product_lines_quote_glass_options" CASCADE;
  DROP TABLE "product_lines" CASCADE;
  DROP TABLE "_product_lines_v_version_facts" CASCADE;
  DROP TABLE "_product_lines_v_version_card_highlights" CASCADE;
  DROP TABLE "_product_lines_v_version_gallery" CASCADE;
  DROP TABLE "_product_lines_v_version_features" CASCADE;
  DROP TABLE "_product_lines_v_version_applications" CASCADE;
  DROP TABLE "_product_lines_v_version_faqs" CASCADE;
  DROP TABLE "_product_lines_v_version_technical_specs" CASCADE;
  DROP TABLE "_product_lines_v_version_quote_glass_options" CASCADE;
  DROP TABLE "_product_lines_v" CASCADE;
  DROP TABLE "product_categories" CASCADE;
  DROP TABLE "_product_categories_v" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_facts" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_facts" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "project_categories" CASCADE;
  DROP TABLE "pages_blocks_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero_highlights" CASCADE;
  DROP TABLE "pages_blocks_hero_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_statement_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_statement" CASCADE;
  DROP TABLE "text_img_tags" CASCADE;
  DROP TABLE "text_img_bullets" CASCADE;
  DROP TABLE "text_img_facts" CASCADE;
  DROP TABLE "text_img_links" CASCADE;
  DROP TABLE "text_img_settings_hide_on" CASCADE;
  DROP TABLE "text_img" CASCADE;
  DROP TABLE "pages_blocks_benefits_items" CASCADE;
  DROP TABLE "pages_blocks_benefits_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_benefits" CASCADE;
  DROP TABLE "prod_lines_settings_hide_on" CASCADE;
  DROP TABLE "prod_lines" CASCADE;
  DROP TABLE "prod_cats_settings_hide_on" CASCADE;
  DROP TABLE "prod_cats" CASCADE;
  DROP TABLE "prod_grid_settings_hide_on" CASCADE;
  DROP TABLE "prod_grid" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_process_links" CASCADE;
  DROP TABLE "pages_blocks_process_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_process" CASCADE;
  DROP TABLE "pages_blocks_advisor_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_advisor" CASCADE;
  DROP TABLE "quote_cta_links" CASCADE;
  DROP TABLE "quote_cta_settings_hide_on" CASCADE;
  DROP TABLE "quote_cta" CASCADE;
  DROP TABLE "proj_grid_settings_hide_on" CASCADE;
  DROP TABLE "proj_grid" CASCADE;
  DROP TABLE "pages_blocks_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_gallery_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_contact_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "quote_wiz_settings_hide_on" CASCADE;
  DROP TABLE "quote_wiz" CASCADE;
  DROP TABLE "rich_text_settings_hide_on" CASCADE;
  DROP TABLE "rich_text" CASCADE;
  DROP TABLE "pages_blocks_video_settings_hide_on" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_spacer" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_highlights" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_statement_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_statement" CASCADE;
  DROP TABLE "_text_img_v_tags" CASCADE;
  DROP TABLE "_text_img_v_bullets" CASCADE;
  DROP TABLE "_text_img_v_facts" CASCADE;
  DROP TABLE "_text_img_v_links" CASCADE;
  DROP TABLE "_text_img_v_settings_hide_on" CASCADE;
  DROP TABLE "_text_img_v" CASCADE;
  DROP TABLE "_pages_v_blocks_benefits_items" CASCADE;
  DROP TABLE "_pages_v_blocks_benefits_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_benefits" CASCADE;
  DROP TABLE "_prod_lines_v_settings_hide_on" CASCADE;
  DROP TABLE "_prod_lines_v" CASCADE;
  DROP TABLE "_prod_cats_v_settings_hide_on" CASCADE;
  DROP TABLE "_prod_cats_v" CASCADE;
  DROP TABLE "_prod_grid_v_settings_hide_on" CASCADE;
  DROP TABLE "_prod_grid_v" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_links" CASCADE;
  DROP TABLE "_pages_v_blocks_process_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_process" CASCADE;
  DROP TABLE "_pages_v_blocks_advisor_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_advisor" CASCADE;
  DROP TABLE "_quote_cta_v_links" CASCADE;
  DROP TABLE "_quote_cta_v_settings_hide_on" CASCADE;
  DROP TABLE "_quote_cta_v" CASCADE;
  DROP TABLE "_proj_grid_v_settings_hide_on" CASCADE;
  DROP TABLE "_proj_grid_v" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_quote_wiz_v_settings_hide_on" CASCADE;
  DROP TABLE "_quote_wiz_v" CASCADE;
  DROP TABLE "_rich_text_v_settings_hide_on" CASCADE;
  DROP TABLE "_rich_text_v" CASCADE;
  DROP TABLE "_pages_v_blocks_video_settings_hide_on" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "leads_quote_items" CASCADE;
  DROP TABLE "leads_internal_notes" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_blocks_hero_links" CASCADE;
  DROP TABLE "homepage_blocks_hero_highlights" CASCADE;
  DROP TABLE "homepage_blocks_hero_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_hero" CASCADE;
  DROP TABLE "homepage_blocks_statement_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_statement" CASCADE;
  DROP TABLE "homepage_blocks_benefits_items" CASCADE;
  DROP TABLE "homepage_blocks_benefits_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_benefits" CASCADE;
  DROP TABLE "homepage_blocks_process_steps" CASCADE;
  DROP TABLE "homepage_blocks_process_links" CASCADE;
  DROP TABLE "homepage_blocks_process_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_process" CASCADE;
  DROP TABLE "homepage_blocks_advisor_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_advisor" CASCADE;
  DROP TABLE "homepage_blocks_gallery_images" CASCADE;
  DROP TABLE "homepage_blocks_gallery_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_gallery" CASCADE;
  DROP TABLE "homepage_blocks_faq_items" CASCADE;
  DROP TABLE "homepage_blocks_faq_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_faq" CASCADE;
  DROP TABLE "homepage_blocks_contact_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_contact" CASCADE;
  DROP TABLE "homepage_blocks_video_settings_hide_on" CASCADE;
  DROP TABLE "homepage_blocks_video" CASCADE;
  DROP TABLE "homepage_blocks_spacer" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_links" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_highlights" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero" CASCADE;
  DROP TABLE "_homepage_v_blocks_statement_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_statement" CASCADE;
  DROP TABLE "_homepage_v_blocks_benefits_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_benefits_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_benefits" CASCADE;
  DROP TABLE "_homepage_v_blocks_process_steps" CASCADE;
  DROP TABLE "_homepage_v_blocks_process_links" CASCADE;
  DROP TABLE "_homepage_v_blocks_process_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_process" CASCADE;
  DROP TABLE "_homepage_v_blocks_advisor_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_advisor" CASCADE;
  DROP TABLE "_homepage_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_homepage_v_blocks_gallery_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_gallery" CASCADE;
  DROP TABLE "_homepage_v_blocks_faq_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_faq_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_faq" CASCADE;
  DROP TABLE "_homepage_v_blocks_contact_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_contact" CASCADE;
  DROP TABLE "_homepage_v_blocks_video_settings_hide_on" CASCADE;
  DROP TABLE "_homepage_v_blocks_video" CASCADE;
  DROP TABLE "_homepage_v_blocks_spacer" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "archives_blocks_hero_links" CASCADE;
  DROP TABLE "archives_blocks_hero_highlights" CASCADE;
  DROP TABLE "archives_blocks_hero_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_hero" CASCADE;
  DROP TABLE "archives_blocks_statement_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_statement" CASCADE;
  DROP TABLE "archives_blocks_benefits_items" CASCADE;
  DROP TABLE "archives_blocks_benefits_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_benefits" CASCADE;
  DROP TABLE "archives_blocks_process_steps" CASCADE;
  DROP TABLE "archives_blocks_process_links" CASCADE;
  DROP TABLE "archives_blocks_process_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_process" CASCADE;
  DROP TABLE "archives_blocks_advisor_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_advisor" CASCADE;
  DROP TABLE "archives_blocks_gallery_images" CASCADE;
  DROP TABLE "archives_blocks_gallery_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_gallery" CASCADE;
  DROP TABLE "archives_blocks_faq_items" CASCADE;
  DROP TABLE "archives_blocks_faq_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_faq" CASCADE;
  DROP TABLE "archives_blocks_contact_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_contact" CASCADE;
  DROP TABLE "archives_blocks_video_settings_hide_on" CASCADE;
  DROP TABLE "archives_blocks_video" CASCADE;
  DROP TABLE "archives_blocks_spacer" CASCADE;
  DROP TABLE "archives" CASCADE;
  DROP TABLE "archives_rels" CASCADE;
  DROP TABLE "site_settings_working_hours" CASCADE;
  DROP TABLE "site_settings_product_info_panels_rows" CASCADE;
  DROP TABLE "site_settings_product_info_panels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "header_navigation_mega_menu_columns_links" CASCADE;
  DROP TABLE "header_navigation_mega_menu_columns" CASCADE;
  DROP TABLE "header_navigation" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_cta_links" CASCADE;
  DROP TABLE "footer_navigation_links" CASCADE;
  DROP TABLE "footer_navigation" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "advisor_questions_answers_weights" CASCADE;
  DROP TABLE "advisor_questions_answers" CASCADE;
  DROP TABLE "advisor_questions" CASCADE;
  DROP TABLE "advisor_results" CASCADE;
  DROP TABLE "advisor" CASCADE;
  DROP TABLE "forms_settings_needs" CASCADE;
  DROP TABLE "forms_settings_project_types" CASCADE;
  DROP TABLE "forms_settings_notification_emails" CASCADE;
  DROP TABLE "forms_settings" CASCADE;
  DROP TABLE "forms_settings_rels" CASCADE;
  DROP TABLE "analytics" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TYPE "public"."enum_products_quote_pricing";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_quote_pricing";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_product_lines_status";
  DROP TYPE "public"."enum__product_lines_v_version_status";
  DROP TYPE "public"."enum_product_categories_status";
  DROP TYPE "public"."enum__product_categories_v_version_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_background";
  DROP TYPE "public"."enum_pages_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_statement_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_statement_variant";
  DROP TYPE "public"."enum_pages_blocks_statement_link_type";
  DROP TYPE "public"."enum_pages_blocks_statement_settings_background";
  DROP TYPE "public"."enum_pages_blocks_statement_settings_spacing";
  DROP TYPE "public"."enum_text_img_links_link_type";
  DROP TYPE "public"."enum_text_img_links_link_appearance";
  DROP TYPE "public"."enum_text_img_settings_hide_on";
  DROP TYPE "public"."enum_text_img_variant";
  DROP TYPE "public"."enum_text_img_image_position";
  DROP TYPE "public"."enum_text_img_settings_background";
  DROP TYPE "public"."enum_text_img_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_benefits_items_icon";
  DROP TYPE "public"."enum_pages_blocks_benefits_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_benefits_variant";
  DROP TYPE "public"."enum_pages_blocks_benefits_marker";
  DROP TYPE "public"."enum_pages_blocks_benefits_settings_background";
  DROP TYPE "public"."enum_pages_blocks_benefits_settings_spacing";
  DROP TYPE "public"."enum_prod_lines_settings_hide_on";
  DROP TYPE "public"."enum_prod_lines_variant";
  DROP TYPE "public"."enum_prod_lines_settings_background";
  DROP TYPE "public"."enum_prod_lines_settings_spacing";
  DROP TYPE "public"."enum_prod_cats_settings_hide_on";
  DROP TYPE "public"."enum_prod_cats_cta_type";
  DROP TYPE "public"."enum_prod_cats_settings_background";
  DROP TYPE "public"."enum_prod_cats_settings_spacing";
  DROP TYPE "public"."enum_prod_grid_settings_hide_on";
  DROP TYPE "public"."enum_prod_grid_variant";
  DROP TYPE "public"."enum_prod_grid_source";
  DROP TYPE "public"."enum_prod_grid_cta_type";
  DROP TYPE "public"."enum_prod_grid_settings_background";
  DROP TYPE "public"."enum_prod_grid_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_process_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_process_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_process_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_process_variant";
  DROP TYPE "public"."enum_pages_blocks_process_settings_background";
  DROP TYPE "public"."enum_pages_blocks_process_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_advisor_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_advisor_settings_background";
  DROP TYPE "public"."enum_pages_blocks_advisor_settings_spacing";
  DROP TYPE "public"."enum_quote_cta_links_link_type";
  DROP TYPE "public"."enum_quote_cta_links_link_appearance";
  DROP TYPE "public"."enum_quote_cta_settings_hide_on";
  DROP TYPE "public"."enum_quote_cta_variant";
  DROP TYPE "public"."enum_quote_cta_settings_background";
  DROP TYPE "public"."enum_quote_cta_settings_spacing";
  DROP TYPE "public"."enum_proj_grid_settings_hide_on";
  DROP TYPE "public"."enum_proj_grid_source";
  DROP TYPE "public"."enum_proj_grid_cta_type";
  DROP TYPE "public"."enum_proj_grid_settings_background";
  DROP TYPE "public"."enum_proj_grid_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_gallery_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_gallery_settings_background";
  DROP TYPE "public"."enum_pages_blocks_gallery_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_background";
  DROP TYPE "public"."enum_pages_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_contact_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_contact_promo_link_type";
  DROP TYPE "public"."enum_pages_blocks_contact_settings_background";
  DROP TYPE "public"."enum_pages_blocks_contact_settings_spacing";
  DROP TYPE "public"."enum_quote_wiz_settings_hide_on";
  DROP TYPE "public"."enum_quote_wiz_settings_background";
  DROP TYPE "public"."enum_quote_wiz_settings_spacing";
  DROP TYPE "public"."enum_rich_text_settings_hide_on";
  DROP TYPE "public"."enum_rich_text_settings_background";
  DROP TYPE "public"."enum_rich_text_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_video_settings_hide_on";
  DROP TYPE "public"."enum_pages_blocks_video_aspect";
  DROP TYPE "public"."enum_pages_blocks_video_settings_background";
  DROP TYPE "public"."enum_pages_blocks_video_settings_spacing";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_hero_variant";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_statement_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_statement_variant";
  DROP TYPE "public"."enum__pages_v_blocks_statement_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_statement_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_statement_settings_spacing";
  DROP TYPE "public"."enum__text_img_v_links_link_type";
  DROP TYPE "public"."enum__text_img_v_links_link_appearance";
  DROP TYPE "public"."enum__text_img_v_settings_hide_on";
  DROP TYPE "public"."enum__text_img_v_variant";
  DROP TYPE "public"."enum__text_img_v_image_position";
  DROP TYPE "public"."enum__text_img_v_settings_background";
  DROP TYPE "public"."enum__text_img_v_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_variant";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_marker";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_benefits_settings_spacing";
  DROP TYPE "public"."enum__prod_lines_v_settings_hide_on";
  DROP TYPE "public"."enum__prod_lines_v_variant";
  DROP TYPE "public"."enum__prod_lines_v_settings_background";
  DROP TYPE "public"."enum__prod_lines_v_settings_spacing";
  DROP TYPE "public"."enum__prod_cats_v_settings_hide_on";
  DROP TYPE "public"."enum__prod_cats_v_cta_type";
  DROP TYPE "public"."enum__prod_cats_v_settings_background";
  DROP TYPE "public"."enum__prod_cats_v_settings_spacing";
  DROP TYPE "public"."enum__prod_grid_v_settings_hide_on";
  DROP TYPE "public"."enum__prod_grid_v_variant";
  DROP TYPE "public"."enum__prod_grid_v_source";
  DROP TYPE "public"."enum__prod_grid_v_cta_type";
  DROP TYPE "public"."enum__prod_grid_v_settings_background";
  DROP TYPE "public"."enum__prod_grid_v_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_process_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_process_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_process_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_process_variant";
  DROP TYPE "public"."enum__pages_v_blocks_process_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_process_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_advisor_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_advisor_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_advisor_settings_spacing";
  DROP TYPE "public"."enum__quote_cta_v_links_link_type";
  DROP TYPE "public"."enum__quote_cta_v_links_link_appearance";
  DROP TYPE "public"."enum__quote_cta_v_settings_hide_on";
  DROP TYPE "public"."enum__quote_cta_v_variant";
  DROP TYPE "public"."enum__quote_cta_v_settings_background";
  DROP TYPE "public"."enum__quote_cta_v_settings_spacing";
  DROP TYPE "public"."enum__proj_grid_v_settings_hide_on";
  DROP TYPE "public"."enum__proj_grid_v_source";
  DROP TYPE "public"."enum__proj_grid_v_cta_type";
  DROP TYPE "public"."enum__proj_grid_v_settings_background";
  DROP TYPE "public"."enum__proj_grid_v_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_contact_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_contact_promo_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_contact_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_contact_settings_spacing";
  DROP TYPE "public"."enum__quote_wiz_v_settings_hide_on";
  DROP TYPE "public"."enum__quote_wiz_v_settings_background";
  DROP TYPE "public"."enum__quote_wiz_v_settings_spacing";
  DROP TYPE "public"."enum__rich_text_v_settings_hide_on";
  DROP TYPE "public"."enum__rich_text_v_settings_background";
  DROP TYPE "public"."enum__rich_text_v_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_video_settings_hide_on";
  DROP TYPE "public"."enum__pages_v_blocks_video_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_video_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_video_settings_spacing";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_homepage_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_homepage_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_homepage_blocks_hero_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_hero_variant";
  DROP TYPE "public"."enum_homepage_blocks_hero_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_statement_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_statement_variant";
  DROP TYPE "public"."enum_homepage_blocks_statement_link_type";
  DROP TYPE "public"."enum_homepage_blocks_statement_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_statement_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_benefits_items_icon";
  DROP TYPE "public"."enum_homepage_blocks_benefits_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_benefits_variant";
  DROP TYPE "public"."enum_homepage_blocks_benefits_marker";
  DROP TYPE "public"."enum_homepage_blocks_benefits_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_benefits_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_process_links_link_type";
  DROP TYPE "public"."enum_homepage_blocks_process_links_link_appearance";
  DROP TYPE "public"."enum_homepage_blocks_process_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_process_variant";
  DROP TYPE "public"."enum_homepage_blocks_process_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_process_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_advisor_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_advisor_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_advisor_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_gallery_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_gallery_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_gallery_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_faq_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_faq_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_contact_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_contact_promo_link_type";
  DROP TYPE "public"."enum_homepage_blocks_contact_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_contact_settings_spacing";
  DROP TYPE "public"."enum_homepage_blocks_video_settings_hide_on";
  DROP TYPE "public"."enum_homepage_blocks_video_aspect";
  DROP TYPE "public"."enum_homepage_blocks_video_settings_background";
  DROP TYPE "public"."enum_homepage_blocks_video_settings_spacing";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_links_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_variant";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_statement_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_statement_variant";
  DROP TYPE "public"."enum__homepage_v_blocks_statement_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_statement_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_statement_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_items_icon";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_variant";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_marker";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_benefits_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_process_links_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_process_links_link_appearance";
  DROP TYPE "public"."enum__homepage_v_blocks_process_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_process_variant";
  DROP TYPE "public"."enum__homepage_v_blocks_process_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_process_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_advisor_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_advisor_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_advisor_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_gallery_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_gallery_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_gallery_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_faq_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_faq_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_contact_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_contact_promo_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_contact_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_contact_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_blocks_video_settings_hide_on";
  DROP TYPE "public"."enum__homepage_v_blocks_video_aspect";
  DROP TYPE "public"."enum__homepage_v_blocks_video_settings_background";
  DROP TYPE "public"."enum__homepage_v_blocks_video_settings_spacing";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum_archives_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_archives_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_archives_blocks_hero_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_hero_variant";
  DROP TYPE "public"."enum_archives_blocks_hero_settings_background";
  DROP TYPE "public"."enum_archives_blocks_hero_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_statement_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_statement_variant";
  DROP TYPE "public"."enum_archives_blocks_statement_link_type";
  DROP TYPE "public"."enum_archives_blocks_statement_settings_background";
  DROP TYPE "public"."enum_archives_blocks_statement_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_benefits_items_icon";
  DROP TYPE "public"."enum_archives_blocks_benefits_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_benefits_variant";
  DROP TYPE "public"."enum_archives_blocks_benefits_marker";
  DROP TYPE "public"."enum_archives_blocks_benefits_settings_background";
  DROP TYPE "public"."enum_archives_blocks_benefits_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_process_links_link_type";
  DROP TYPE "public"."enum_archives_blocks_process_links_link_appearance";
  DROP TYPE "public"."enum_archives_blocks_process_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_process_variant";
  DROP TYPE "public"."enum_archives_blocks_process_settings_background";
  DROP TYPE "public"."enum_archives_blocks_process_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_advisor_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_advisor_settings_background";
  DROP TYPE "public"."enum_archives_blocks_advisor_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_gallery_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_gallery_settings_background";
  DROP TYPE "public"."enum_archives_blocks_gallery_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_faq_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_faq_settings_background";
  DROP TYPE "public"."enum_archives_blocks_faq_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_contact_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_contact_promo_link_type";
  DROP TYPE "public"."enum_archives_blocks_contact_settings_background";
  DROP TYPE "public"."enum_archives_blocks_contact_settings_spacing";
  DROP TYPE "public"."enum_archives_blocks_video_settings_hide_on";
  DROP TYPE "public"."enum_archives_blocks_video_aspect";
  DROP TYPE "public"."enum_archives_blocks_video_settings_background";
  DROP TYPE "public"."enum_archives_blocks_video_settings_spacing";
  DROP TYPE "public"."enum_header_navigation_mega_menu_columns_links_link_type";
  DROP TYPE "public"."enum_header_navigation_link_type";
  DROP TYPE "public"."enum_header_navigation_mega_menu_promo_link_type";
  DROP TYPE "public"."enum_header_cta_type";
  DROP TYPE "public"."enum_footer_cta_links_link_type";
  DROP TYPE "public"."enum_footer_cta_links_link_appearance";
  DROP TYPE "public"."enum_footer_navigation_links_link_type";
  DROP TYPE "public"."enum_footer_legal_links_link_type";
  DROP TYPE "public"."enum_advisor_questions_answers_icon";
  DROP TYPE "public"."enum_seo_defaults_organization_type";`)
}
