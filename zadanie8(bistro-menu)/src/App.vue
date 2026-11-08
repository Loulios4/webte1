<script setup>
import { ref, computed } from "vue";
import MealItem from "./components/MealItem.vue";

const restaurant = "Bistro Pod Hradom";
const likes = ref(0);

const meals = ref([
  { id: 1, name: "Cesnaková polievka", price: 2.5, vegetarian: true },
  { id: 2, name: "Kuracie prsia s ryžou", price: 8.9, vegetarian: false },
  { id: 3, name: "Vyprážaný syr s hranolkami", price: 8.5, vegetarian: true },
  { id: 4, name: "Hovädzí guláš s knedľou", price: 9.4, vegetarian: false },
  { id: 5, name: "Cícerové kari", price: 8.2, vegetarian: true },
]);

const onlyVegetarian = ref(false);

function like() {
  likes.value++;
}

const visibleMeals = computed(() =>
  onlyVegetarian.value ? meals.value.filter((meal) => meal.vegetarian) : meals.value
);

const counts = ref({});

function addToOrder(meal) {
  counts.value[meal.id] = (counts.value[meal.id] ?? 0) + 1;
}

const orderTotal = computed(() =>
  meals.value.reduce((sum, meal) => sum + meal.price * (counts.value[meal.id] ?? 0), 0)
);

const newMeal = ref({ name: "", price: 0, vegetarian: false });
let nextId = 6;

function addMeal() {
  meals.value.push({ ...newMeal.value, id: nextId++ });
  newMeal.value = { name: "", price: 0, vegetarian: false };
}

</script>

<template>
  <main>
    <h1>{{ restaurant }}</h1>
    <button type="button" @click="like">Páči sa mi ({{ likes }})</button>

    <label><input type="checkbox" v-model="onlyVegetarian"> Iba vegetariánske</label>

    <ul v-if="visibleMeals.length > 0">
      <MealItem
        v-for="meal in visibleMeals"
        :key="meal.id"
        :meal="meal"
        :count="counts[meal.id] ?? 0"
        @order="addToOrder(meal)"
      />
    </ul>
    <p v-else>Dnes nemáme nič, čo by vyhovovalo filtru.</p>
    <p v-if="orderTotal > 0"><strong>Spolu: {{ orderTotal.toFixed(2) }} €</strong></p>
    <p v-else>Objednávka je prázdna.</p>
    <h2>Nové jedlo</h2>
    <form @submit.prevent="addMeal">
      <input v-model="newMeal.name" placeholder="Názov" required>
      <input v-model="newMeal.price" type="number" min="0" step="0.1" required>
      <label><input v-model="newMeal.vegetarian" type="checkbox"> vegetariánske</label>
      <button type="submit">Pridať</button>
    </form>
  </main>
</template>
