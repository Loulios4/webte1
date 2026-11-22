<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "./stores/favorites.js";

const router = useRouter();
const favorites = useFavoritesStore();
const query = ref("");

function search() {
  router.push({ name: "city", params: { name: query.value } });
  query.value = "";
}
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Domov</RouterLink>
      <RouterLink :to="{ name: 'favorites' }">Obľúbené ({{ favorites.count }})</RouterLink>
    </nav>
    <form @submit.prevent="search">
      <input v-model="query" placeholder="Mesto" required>
      <button type="submit">Hľadať</button>
    </form>
  </header>
  <RouterView />
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
}

.router-link-active {
  font-weight: bold;
}
</style>