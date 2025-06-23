import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher.vue";

// Create mock for useI18n
const mockUseI18n = vi.fn();
vi.mock("vue-i18n", () => ({
  useI18n: () => mockUseI18n(),
}));

describe("LanguageSwitcher.vue", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseI18n.mockReset();
  });

  it("renders correctly", () => {
    // Setup basic English locale for rendering test
    mockUseI18n.mockReturnValue({
      locale: "en",
    });

    const wrapper = mount(LanguageSwitcher);

    // Verify basic component structure
    expect(wrapper.find(".language-switcher").exists()).toBe(true);
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("EN");
    expect(wrapper.findAll("button")[1].text()).toBe("PL");
  });

  it("applies active class to English button when locale is 'en'", () => {
    // Set English locale
    mockUseI18n.mockReturnValue({
      locale: "en",
    });

    const wrapper = mount(LanguageSwitcher);

    // Verify active class styling
    expect(wrapper.findAll("button")[0].classes()).toContain("active");
    expect(wrapper.findAll("button")[1].classes()).not.toContain("active");
  });

  it("applies active class to Polish button when locale is 'pl'", () => {
    // Set Polish locale
    mockUseI18n.mockReturnValue({
      locale: "pl",
    });

    const wrapper = mount(LanguageSwitcher);

    // Verify active class styling
    expect(wrapper.findAll("button")[0].classes()).not.toContain("active");
    expect(wrapper.findAll("button")[1].classes()).toContain("active");
  });

  it("switches to Polish language when PL button is clicked", async () => {
    // Create reactive locale object for click testing
    const mockLocale = { value: "en" };
    mockUseI18n.mockReturnValue({
      locale: mockLocale,
    });

    const wrapper = mount(LanguageSwitcher);

    // Trigger click on Polish button
    await wrapper.findAll("button")[1].trigger("click");

    // Verify locale was updated
    expect(mockLocale.value).toBe("pl");
  });

  it("switches to English language when EN button is clicked", async () => {
    // Create reactive locale object for click testing
    const mockLocale = { value: "pl" };
    mockUseI18n.mockReturnValue({
      locale: mockLocale,
    });

    const wrapper = mount(LanguageSwitcher);

    // Trigger click on English button
    await wrapper.findAll("button")[0].trigger("click");

    // Verify locale was updated
    expect(mockLocale.value).toBe("en");
  });
});
