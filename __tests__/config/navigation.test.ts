import { describe, expect, it } from "vitest";
import { PROFILE_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";

describe("config/navigation", () => {
  it("defines the expected profile nav items", () => {
    expect(PROFILE_NAV_ITEMS).toHaveLength(5);

    const labels = PROFILE_NAV_ITEMS.map((item) => item.label);
    expect(labels).toEqual([
      "Account",
      "Security",
      "Sessions",
      "Linked Accounts",
      "Danger Zone",
    ]);

    const hrefs = PROFILE_NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toEqual([
      ROUTES.PROFILE.account,
      ROUTES.PROFILE.security,
      ROUTES.PROFILE.sessions,
      ROUTES.PROFILE.accounts,
      ROUTES.PROFILE.danger,
    ]);

    const dangerItem = PROFILE_NAV_ITEMS.find((item) => item.danger);
    expect(dangerItem?.label).toBe("Danger Zone");
  });
});

