import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import type { Card } from "../../types";
import CanvasCard from "../../components/CanvasCard/CanvasCard.vue";

// Mock canvas rendering context with all needed methods
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  fill: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
  font: "",
  textAlign: "",
  fillText: vi.fn(),
  setTransform: vi.fn(),
  scale: vi.fn(),
}));

// Mock document.querySelector
document.querySelector = vi.fn(() => null);

describe("CanvasCard.vue", () => {
  // Sample card data for testing
  const mockCard: Card = {
    id: "1-1",
    name: "AK-47",
    rarity: "common",
    image: "/images/ak47.png",
  };

  // Sample gradient data for testing
  const mockRarityGradient = {
    startColor: "#c0c0c0",
    endColor: "#e6e6e6",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render properly", () => {
    const wrapper = mount(CanvasCard, {
      props: {
        card: mockCard,
        index: 0,
        isFlipped: false,
        isMatched: false,
        rarityGradient: mockRarityGradient,
      },
    });

    // Basic rendering tests
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find("canvas").exists()).toBe(true);
  });

  it("should apply correct classes based on props", async () => {
    const wrapper = mount(CanvasCard, {
      props: {
        card: mockCard,
        index: 0,
        isFlipped: true,
        isMatched: false,
        rarityGradient: mockRarityGradient,
      },
      attachTo: document.body,
    });

    await flushPromises();

    // Check classes with flipped=true, matched=false
    const canvas = wrapper.find("canvas");
    expect(canvas.element.className).toContain("flipped");
    expect(canvas.element.className).not.toContain("matched");

    // Update props and check classes again
    await wrapper.setProps({ isMatched: true });
    await flushPromises();

    expect(canvas.element.className).toContain("matched");
  });

  it("should emit flip event when clicked", async () => {
    const wrapper = mount(CanvasCard, {
      props: {
        card: mockCard,
        index: 0,
        isFlipped: false,
        isMatched: false,
        rarityGradient: mockRarityGradient,
      },
    });

    // Trigger click and check event emission
    await wrapper.find("canvas").trigger("click");
    expect(wrapper.emitted("flip")).toBeTruthy();
    expect(wrapper.emitted("flip")![0]).toEqual([0]);
  });

  it("should handle mousemove for parallax effect", async () => {
    const wrapper = mount(CanvasCard, {
      props: {
        card: mockCard,
        index: 0,
        isFlipped: false,
        isMatched: false,
        rarityGradient: mockRarityGradient,
      },
    });

    // Mock getBoundingClientRect for mousemove calculations
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 160,
      height: 180,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 160,
      bottom: 180,
      toJSON: () => {},
    }));

    // Trigger mousemove
    await wrapper.find("canvas").trigger("mousemove", {
      clientX: 80,
      clientY: 90,
    });

    // Check that getContext was called (indicating rendering)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });

  it("should load card image on mount", () => {
    // Store original Image constructor
    const originalImage = global.Image;

    // Create Image mock
    global.Image = vi.fn().mockImplementation(() => ({
      onload: null,
      onerror: null,
      src: "",
      complete: true,
    }));

    // Mount component
    mount(CanvasCard, {
      props: {
        card: mockCard,
        index: 0,
        isFlipped: false,
        isMatched: false,
        rarityGradient: mockRarityGradient,
      },
    });

    // Verify Image constructor was called
    expect(global.Image).toHaveBeenCalled();

    // Restore original Image constructor
    global.Image = originalImage;
  });
});
