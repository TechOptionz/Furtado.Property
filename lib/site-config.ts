// Mira Living status lines used across the site. Update here when the sales or construction status changes.
const salesStatus = "Now selling";
const completion = "Q2 2026";
const constructionStatus = "50% complete";

export const site = {
  salesStatus,
  completion,
  constructionStatus,
  structureStatus: `Under way, ${constructionStatus}`,
  availability: "Limited availability remains.",
  statusLine: `${salesStatus} · Mira Living · Bargara QLD`,
  // The intro curtain only ever plays on the home page. true: once, when the visitor first enters the site there;
  // false: on every full load of the home page.
  introOncePerSession: true,
};
