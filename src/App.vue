<script setup lang="ts">
import GameBoard from "@/components/GameBoard.vue";
import GameControls from "@/components/GameControls.vue";
import GameHistory from "@/components/GameHistory.vue";
</script>

<template>
  <div class="app-container">
    <header>
      <h1>CS2 Memory Game</h1>
    </header>

    <main>
      <GameControls />
      <GameBoard />
      <GameHistory />
    </main>

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} CS2 Memory Game</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f0f2f5;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 0.9rem;
  color: #718096;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>
