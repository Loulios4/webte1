<script setup>
import { ref, watch } from "vue";
import { findCity, getForecast } from "../services/weatherApi.js";
import { useFavoritesStore } from "../stores/favorites.js";
import DayForecast from "../components/DayForecast.vue";

const props = defineProps({
  name: { type: String, required: true },
});

const favorites = useFavoritesStore();

const city = ref(null);
const weather = ref(null);
const error = ref("");
const loading = ref(false);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const found = await findCity(props.name);
    weather.value = await getForecast(found.latitude, found.longitude);
    city.value = found;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("sk-SK", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

watch(() => props.name, load, { immediate: true });
</script>

<template>
  <main>
    <p v-if="loading">Načítavam…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <section v-else-if="weather">
      <h1>{{ city.name }}, {{ city.country }}</h1>
      <button v-if="!favorites.has(city.id)" type="button" @click="favorites.add(city)">
        ☆ Pridať do obľúbených
      </button>
      <p v-else>★ V obľúbených</p>

      <p>{{ weather.current.temperature_2m }} °C, vietor {{ weather.current.wind_speed_10m }} km/h</p>
      <p>Namerané: {{ formatTime(weather.current.time) }}</p>

      <h2>Predpoveď na 7 dní</h2>
      <ul class="days">
        <DayForecast
          v-for="(date, i) in weather.daily.time"
          :key="date"
          :date="date"
          :max="weather.daily.temperature_2m_max[i]"
          :min="weather.daily.temperature_2m_min[i]"
        />
      </ul>
    </section>
  </main>
</template>

<style scoped>
.error {
  color: #b3261e;
}

.days {
  padding: 0;
  list-style: none;
}
</style>