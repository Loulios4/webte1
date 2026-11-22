<script setup>
import { useFavoritesStore } from "../stores/favorites.js";

const favorites = useFavoritesStore();
</script>

<template>
  <main>
    <h1>Obľúbené mestá</h1>
    <ul v-if="favorites.count > 0">
      <li v-for="city in favorites.cities" :key="city.id">
        <RouterLink :to="{ name: 'city', params: { name: city.name } }">
          {{ city.name }}, {{ city.country }}
        </RouterLink>
        <button type="button" @click="favorites.remove(city.id)">Odobrať</button>
      </li>
    </ul>
    <p v-else>Zatiaľ nemáte žiadne obľúbené mestá.</p>
  </main>
</template>
