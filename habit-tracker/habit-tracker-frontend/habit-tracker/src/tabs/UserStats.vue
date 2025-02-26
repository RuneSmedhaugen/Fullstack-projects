<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Habit Stats</h2>

    <!-- Overall Stats -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-100 p-4 rounded-lg shadow">
        <p class="text-lg font-medium">Total Habits</p>
        <p class="text-2xl font-bold">{{ stats.totalHabits }}</p>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg shadow">
        <p class="text-lg font-medium">Total Completions</p>
        <p class="text-2xl font-bold">{{ stats.totalCompletions }}</p>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg shadow">
        <p class="text-lg font-medium">Longest Streak</p>
        <p class="text-2xl font-bold">{{ stats.longestStreak }} days</p>
      </div>
    </div>

    <!-- Habit-Specific Stats -->
    <div v-if="habitStats.length > 0" class="mt-6">
      <h3 class="text-xl font-semibold mb-4">Stats for Each Habit</h3>
      <div v-for="habit in habitStats" :key="habit.id" class="mb-4 bg-gray-50 p-4 rounded-lg shadow">
        <h4 class="text-lg font-bold">{{ habit.name }}</h4>
        <p class="text-gray-600">{{ habit.description }}</p>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p class="text-sm text-gray-500">Current Streak</p>
            <p class="text-lg font-semibold">{{ habit.currentStreak }} days</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Longest Streak</p>
            <p class="text-lg font-semibold">{{ habit.longestStreak }} days</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Completions</p>
            <p class="text-lg font-semibold">{{ habit.completions }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Missed Days</p>
            <p class="text-lg font-semibold">{{ habit.missed }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: {
        totalHabits: 0,
        totalCompletions: 0,
        longestStreak: 0,
      },
      habitStats: [], // Store per-habit stats here
    };
  },
  async mounted() {
    try {
      const response = await fetch('http://localhost:5000/api/habits/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      this.stats = {
        totalHabits: data.totalHabits,
        totalCompletions: data.totalCompletions,
        longestStreak: data.longestStreak,
      };

      // Check if per-habit stats exist
      if (Array.isArray(data.habitStats)) {
        this.habitStats = data.habitStats;
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },
};
</script>

<style scoped>
p {
  margin: 0;
}
</style>
