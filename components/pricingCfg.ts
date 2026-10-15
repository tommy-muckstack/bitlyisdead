import type { PBCfg } from "@/components/PricingBody";
export const pricingCfg: PBCfg = {
  vars: { "--plan-min": "480px", "--gap": "12px", "--ink": "#031f39", "--accent": "#ee6123", "--soft": "#f1f4f8", "--bg": "#f3f3f3", "--hero-bg": "#f3f3f3", "--hero-pt": "70px", "--hero-pb": "26px", "--h1": "40px", "--h1-ls": "-.4px", "--h-weight": "700", "--card-r": "8px", "--btn-r": "8px", "--plan-h2": "13px", "--plan-h2-lh": "18px", "--row": "44px", "--faq-bg": "#f3f3f3", "--faq-card": "#fff", "--cta-bg": "#f3f3f3", "--max": "1100px", "--tbl-bg": "#f3f3f3" } as Record<string, string>,
  title: "Pricing for brands and businesses of all sizes", sub: "Connect to your audience with branded links, QR Codes, and landing pages that will get their attention.", toggle: ["Pay annually", "Pay Monthly"],
  plans: [
    { name: "FREE", price: "$0", per: "/month", desc: "Try it out for free", cta: "Get Started", lead: "What’s included:", feats: ["5 QR Codes/month", "5 links/month", "3 custom back-halves/month", "Unlimited link clicks", "Advanced QR Code customization"] },
    { name: "CORE", price: "$0", per: "/month", desc: "Unlock powerful features", cta: "Get Started", lead: "Everything in Free, plus:", feats: ["10 QR Codes/month", "100 links/month", "30 day link click history", "UTM builder", "Link & QR Code redirects"] },
    { name: "GROWTH", price: "$0", per: "/month", desc: "Unlock memorable brand experiences", cta: "Get Started", hot: true, tag: "Recommended", lead: "Everything in Core, plus:", feats: ["10 QR Codes/month", "500 links/month", "10 custom back-halves", "Complimentary custom domain", "Branded links", "Bulk link & QR Code creation"] },
    { name: "PREMIUM", price: "$0", per: "/month", desc: "Scale your connections", cta: "Get Started", lead: "Everything in Growth, plus:", feats: ["200 QR Codes/month", "3,000 links/month", "20 custom back-halves", "1 year of click & scan history", "City-level geo tracking"] },
  ],
  extra: { title: "Custom Pricing", text: "Custom number of links, QR Codes, and landing pages.", cta: "Get Quote", bullets: ["Customized onboarding", "Dedicated customer success", "99.99% uptime", "SSO"] },
  tableTitle: "Detailed Feature Comparison", cols: ["Free", "Core", "Growth", "Premium"],
  groups: [["Links", ["Short links", "Custom back-halves", "Link redirects", "Bulk creation", "UTM builder"]], ["QR Codes", ["Dynamic QR Codes", "Custom colors and logos", "Scan analytics"]]],
  faqTitle: "Frequently asked questions", faqs: [["Is Bitly free?", "This open-source version is free."], ["Do links expire?", "Links never expire unless you delete them."]],
  fill: 8,
  fillMobile: 0,
};
