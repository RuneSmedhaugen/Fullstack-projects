<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">Habit Stats</h2>

    <!-- Overall Stats -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <p class="card-title">Total Habits</p>
            <p class="card-text display-4">{{ stats.totalHabits }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <p class="card-title">Total Completions</p>
            <p class="card-text display-4">{{ stats.totalCompletions }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <p class="card-title">Longest Streak</p>
            <p class="card-text display-4">{{ stats.longestStreak }} days</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Habit-Specific Stats -->
    <div v-if="habitStats.length > 0" class="row">
      <h3 class="text-center mb-4">Stats for Each Habit</h3>
      <div v-for="habit in habitStats" :key="habit.id" class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h4 class="card-title">{{ habit.name }}</h4>
            <p class="card-text text-muted">{{ habit.description }}</p>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Current Streak</p>
              <p class="text-lg font-semibold">{{ habit.streak_current }} days</p>
            </div>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Longest Streak</p>
              <p class="text-lg font-semibold">{{ habit.streak_longest }} days</p>
            </div>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Total Completions</p>
              <p class="text-lg font-semibold">{{ habit.completions }}</p>
            </div>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Missed Days</p>
              <p class="text-lg font-semibold">{{ habit.missed }}</p>
            </div>
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
        totalHabits: data.overall.total_habits,
        totalCompletions: data.overall.total_completions,
        longestStreak: data.overall.longest_streak,
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
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-text {
  font-size: 2rem;
  font-weight: bold;
}

.card-body {
  padding: 1.5rem;
}

.card {
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card h4 {
  font-size: 1.5rem;
  font-weight: bold;
}

.card p {
  margin: 0;
}

.text-sm {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>