<script setup>
import { computed } from "vue";

const props = defineProps({
  date: { type: String, required: true },
  max: { type: Number, required: true },
  min: { type: Number, required: true },
});

const label = computed(() =>
  new Date(props.date).toLocaleDateString("sk-SK", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  })
);
</script>

<template>
  <li class="day">
    <span class="label">{{ label }}</span>
    <span class="max">{{ max.toFixed(1) }} °C</span>
    <span class="min">{{ min.toFixed(1) }} °C</span>
  </li>
</template>

<style scoped>
.day {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  max-width: 24rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid #ddd;
}

.max {
  font-weight: bold;
}

.min {
  color: #666;
}
</style>
