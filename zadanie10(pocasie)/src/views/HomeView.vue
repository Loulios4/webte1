<script setup>
const SUGGESTIONS = ["Bratislava", "Košice", "Žilina", "Trenčín"];
</script>

<template>
  <main>
    <h1>Počasie</h1>
    <p>Vyhľadajte mesto alebo vyberte jedno z týchto:</p>
    <ul>
      <li v-for="name in SUGGESTIONS" :key="name">
        <RouterLink :to="{ name: 'city', params: { name } }">{{ name }}</RouterLink>
      </li>
    </ul>
  </main>
</template>
