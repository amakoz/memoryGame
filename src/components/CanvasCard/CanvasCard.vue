<template>
  <canvas
    ref="cardCanvas"
    class="card-canvas"
    :class="{ flipped: isFlipped, matched: isMatched }"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @touchmove="handleTouchMove"
    @mouseleave="resetParallax"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Card } from "@/types";
import "./CanvasCard.css";

const props = defineProps<{
  card: Card;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
  rarityGradient: {
    startColor: string;
    endColor: string;
  };
}>();

const emit = defineEmits<{
  (e: "flip", index: number): void;
}>();

// Canvas reference
const cardCanvas = ref<HTMLCanvasElement | null>(null);
const cardImage = ref<HTMLImageElement | null>(null);
const cardWidth = ref(160); // Increased width for better aspect ratio
const cardHeight = ref(180); // Slightly reduced height for better aspect ratio

// Parallax effect variables
const parallaxOffset = ref({ x: 0, y: 0 });
const maxTilt = 15; // maximum rotation in degrees
const maxShift = 10; // maximum shift for parallax effect

// Card flip transition animation
let flipTimer: number | null = null;
const isFlipping = ref(false);
const flipProgress = ref(0);

// Calculate card dimensions based on viewport
const calculateCardDimensions = () => {
  const isMobile = window.innerWidth < 768;
  cardWidth.value = isMobile ? 100 : 160; // Wider cards on both mobile and desktop
  cardHeight.value = isMobile ? 120 : 180; // Adjusted height for better aspect ratio

  if (cardCanvas.value) {
    cardCanvas.value.width = cardWidth.value;
    cardCanvas.value.height = cardHeight.value;
    renderCard();
  }
};

// Handle mouse move for parallax effect
const handleMouseMove = (event: MouseEvent) => {
  if (!cardCanvas.value || isFlipping.value) return;

  const rect = cardCanvas.value.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Calculate normalized position (-1 to 1)
  parallaxOffset.value = {
    x: ((mouseX - centerX) / centerX) * maxTilt,
    y: ((mouseY - centerY) / centerY) * maxTilt,
  };

  renderCard();
};

// Handle touch move for parallax on mobile
const handleTouchMove = (event: TouchEvent) => {
  if (!cardCanvas.value || isFlipping.value || !event.touches[0]) return;

  const rect = cardCanvas.value.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const touchX = event.touches[0].clientX - rect.left;
  const touchY = event.touches[0].clientY - rect.top;

  // Calculate normalized position (-1 to 1)
  parallaxOffset.value = {
    x: ((touchX - centerX) / centerX) * maxTilt,
    y: ((touchY - centerY) / centerY) * maxTilt,
  };

  renderCard();
};

// Reset parallax effect when mouse leaves
const resetParallax = () => {
  parallaxOffset.value = { x: 0, y: 0 };
  renderCard();
};

// Handle card click
const handleClick = () => {
  emit("flip", props.index);
};

// Load card image
const loadCardImage = () => {
  cardImage.value = new Image();
  cardImage.value.src = props.card.image;
  cardImage.value.onload = () => {
    renderCard();
  };
  // Add error handler in case image fails to load
  cardImage.value.onerror = () => {
    console.error(`Failed to load image: ${props.card.image}`);
    // Render anyway so at least the card is visible
    renderCard();
  };
};

// Render the card on canvas with parallax effect
const renderCard = () => {
  const canvas = cardCanvas.value;
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const { width, height } = canvas;

  // Clear canvas
  context.clearRect(0, 0, width, height);

  // Save the current context state
  context.save();

  // Apply parallax transformation
  context.translate(width / 2, height / 2);
  context.rotate((parallaxOffset.value.x / 180) * Math.PI);
  context.translate(-width / 2, -height / 2);

  // Apply 3D-like perspective
  const parallaxShiftX = (parallaxOffset.value.x / maxTilt) * maxShift;
  const parallaxShiftY = (parallaxOffset.value.y / maxTilt) * maxShift;

  if (props.isFlipped || props.isMatched) {
    // Draw card front (item image)
    // Draw rounded rect background with gradient
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(width - 10, 0);
    context.quadraticCurveTo(width, 0, width, 10);
    context.lineTo(width, height - 10);
    context.quadraticCurveTo(width, height, width - 10, height);
    context.lineTo(10, height);
    context.quadraticCurveTo(0, height, 0, height - 10);
    context.lineTo(0, 10);
    context.quadraticCurveTo(0, 0, 10, 0);
    context.closePath();

    // Create gradient based on item rarity using the proper color values
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, props.rarityGradient.startColor);
    gradient.addColorStop(1, props.rarityGradient.endColor);

    context.fillStyle = gradient;
    context.fill();

    // Draw border
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.lineWidth = 2;
    context.stroke();

    // Draw image with parallax effect if image loaded successfully
    if (cardImage.value && cardImage.value.complete) {
      const imgWidth = width - 30 - Math.abs(parallaxShiftX);
      const imgHeight = height - 30 - Math.abs(parallaxShiftY);
      context.drawImage(
        cardImage.value,
        15 + parallaxShiftX,
        15 + parallaxShiftY,
        imgWidth,
        imgHeight,
      );
    } else {
      // Draw fallback text if image failed to load
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      context.font = `${width < 100 ? "12" : "16"}px Arial`;
      context.textAlign = "center";
      context.fillText(props.card.name, width / 2, height / 2);
    }

    // Save context state before drawing text to apply counter-transformation
    context.save();

    // Counter-transform to ensure text is not mirrored
    if (document.querySelector(".card-canvas.flipped") !== null) {
      // Apply counter-transform for text
      context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      context.translate(width / 2, height - 15);
      context.scale(-1, 1); // Mirror horizontally to counter the flip transform in CSS
      context.textAlign = "center";
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      context.font = `${width < 100 ? "10" : "14"}px Arial`;
      context.fillText(props.card.name, 0, 0);
    } else {
      // Normal text rendering if no CSS flip is applied
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      context.font = `${width < 100 ? "10" : "14"}px Arial`;
      context.textAlign = "center";
      context.fillText(props.card.name, width / 2, height - 15);
    }

    // Restore context to the state before text drawing
    context.restore();
  } else {
    // Draw card back
    // Draw rounded rect background
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(width - 10, 0);
    context.quadraticCurveTo(width, 0, width, 10);
    context.lineTo(width, height - 10);
    context.quadraticCurveTo(width, height, width - 10, height);
    context.lineTo(10, height);
    context.quadraticCurveTo(0, height, 0, height - 10);
    context.lineTo(0, 10);
    context.quadraticCurveTo(0, 0, 10, 0);
    context.closePath();

    // Dark gradient for card back
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#2d3748");
    gradient.addColorStop(1, "#1a202c");
    context.fillStyle = gradient;
    context.fill();

    // Draw border
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.lineWidth = 2;
    context.stroke();

    // Draw CS2 logo or pattern on back
    context.fillStyle = "rgba(255, 255, 255, 0.1)";
    context.font = `${width < 100 ? "18" : "24"}px Arial`;
    context.textAlign = "center";
    context.fillText(
      "CS2",
      width / 2 + parallaxShiftX / 2,
      height / 2 + parallaxShiftY / 2,
    );
  }

  // Restore context
  context.restore();
};

// Reset and update card when props change
watch(
  () => props.isFlipped,
  () => {
    // Animate flip transition
    isFlipping.value = true;
    flipProgress.value = 0;

    if (flipTimer) {
      cancelAnimationFrame(flipTimer);
    }

    const animateFlip = () => {
      flipProgress.value += 0.05;
      renderCard();

      if (flipProgress.value < 1) {
        flipTimer = requestAnimationFrame(animateFlip);
      } else {
        isFlipping.value = false;
        flipTimer = null;
      }
    };

    flipTimer = requestAnimationFrame(animateFlip);
  },
);

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("resize", calculateCardDimensions);
  calculateCardDimensions();
  loadCardImage();

  return () => {
    window.removeEventListener("resize", calculateCardDimensions);
    if (flipTimer) {
      cancelAnimationFrame(flipTimer);
    }
  };
});
</script>
