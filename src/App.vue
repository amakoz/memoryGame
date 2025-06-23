<script setup lang="ts">
import GameBoard from "@/components/GameBoard/GameBoard.vue";
import GameControls from "@/components/GameControls/GameControls.vue";
import GameHistory from "@/components/GameHistory/GameHistory.vue";
import "./App.css";
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
