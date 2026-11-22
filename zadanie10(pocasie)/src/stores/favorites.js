import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "favorite-cities";

export const useFavoritesStore = defineStore("favorites", () => {
  const cities = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);

  watch(
    cities,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true }
  );

  const count = computed(() => cities.value.length);

  function has(id) {
    return cities.value.some((city) => city.id === id);
  }

  function add(city) {
    if (!has(city.id)) {
      cities.value.push({ id: city.id, name: city.name, country: city.country });
    }
  }

  function remove(id) {
    cities.value = cities.value.filter((city) => city.id !== id);
  }

  return { cities, count, has, add, remove };
});