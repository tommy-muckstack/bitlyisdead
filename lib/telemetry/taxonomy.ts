// PostHog taxonomy (lives in lib/telemetry/ because lib/analytics.ts is the product's own link-click stats) for the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md, see docs/ANALYTICS.md).
// Super properties: product (this app's slug), surface ("landing" = logged-out marketing pages, "app" = the working product
// and anything it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Never send user content (titles, URLs, emails, text) as properties.
export const APP = "bitlyisdead" as const;
export type Surface = "landing" | "app";
export const EVENTS = {
  app_signed_up: "app_signed_up",       // method ("password" | "google")
  app_signed_in: "app_signed_in",       // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_link_created: "app_link_created",           // entry_point ("form" | "home"), custom_back_half, has_tags, has_campaign, has_expiry, has_utm, with_qr (bools)
  app_link_updated: "app_link_updated",           // fields (count of changed keys), bulk (bool), count
  app_links_deleted: "app_links_deleted",         // count
  app_qr_created: "app_qr_created",               // from_link (bool), styled (bool)
  app_qr_downloaded: "app_qr_downloaded",         // format ("png" | "svg" | "jpeg")
  app_page_created: "app_page_created",
  app_page_published: "app_page_published",       // published (bool; false = unpublished), blocks (count)
  app_campaign_created: "app_campaign_created",   // has_utm (bool)
  app_domain_added: "app_domain_added",
  app_api_token_created: "app_api_token_created",
  landing_cta_clicked: "landing_cta_clicked", // target ("shorten_link" | "shorten_qr" | "add_tracking")
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment", "ads_blocked", "account_type"] as const;
