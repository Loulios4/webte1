<script setup>
defineProps({
  meal: { type: Object, required: true },
  count: { type: Number, default: 0 },
});

const emit = defineEmits(["order"]);

</script>

<template>
  <li :class="{ veg: meal.vegetarian }">
    <span class="name">{{ meal.name }}</span>
    <span v-if="count > 0">{{ count }}×</span>
    <button type="button" @click="emit('order')">+</button>
    <span class="price">{{ meal.price.toFixed(2) }} €</span>
  </li>
</template>

<style scoped>
li {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  max-width: 28rem;
  padding: 0.3rem 0;
}

.veg .name {
  color: green;
}
</style>