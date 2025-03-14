<!-- filepath: c:\Users\Rune S\source\repos\fullstack\habit-tracker\habit-tracker-frontend\habit-tracker\src\tabs\YourHabits.vue -->
<template>
  <div id="yourHabitsDiv" class="container mt-4">
    <h2 class="h2class">Your Habits</h2>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'uncompleted' }" @click="currentTab = 'uncompleted'">Uncompleted</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">Completed</a>
      </li>
    </ul>

    <div v-if="currentTab === 'completed'" class="mb-3">
      <p class="text-muted">Reset in: <span class="fw-bold">{{ countdown }}</span></p>
    </div>

    <div class="list-group">
      <div class="list-group-item" v-for="habit in filteredHabits" :key="habit.id">
        <div class="d-flex justify-content-between align-items-center">
          <div class="form-check">
            <input
              class="form-check-input custom-checkbox"
              type="checkbox"
              :id="'habit-' + habit.id"
              :checked="habit.done"
              @change="handleCheckboxChange(habit)"
            />
            <label class="form-check-label" :for="'habit-' + habit.id">
              <span class="habit-details fw-bold">{{ habit.name }}</span>
              <span class="habit-description text-muted">Description: {{ habit.description }}</span>
              <span class="habit-purpose text-muted">Purpose: {{ habit.purpose }}</span>
              <span class="habit-time-perspective text-muted">{{ habit.time_perspective }}</span>
            </label>
          </div>
          <div>
            <button class="btn btn-link" @click="toggleEdit(habit)">Edit <i class="bi bi-gear-fill"></i></button>
          </div>
        </div>

        <div v-if="editingHabitId === habit.id" class="mt-2">
          <form @submit.prevent="updateHabit(habit)">
            <div class="mb-2">
              <label class="form-label">Name:</label>
              <input type="text" v-model="habit.editName" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label">Description:</label>
              <textarea v-model="habit.editDescription" class="form-control"></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label">Purpose:</label>
              <input type="text" v-model="habit.editPurpose" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label">Time Perspective:</label>
              <select v-model="habit.editTimePerspective" class="form-select">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <button type="submit" class="btn btn-primary btn-sm">Save</button>
              <button type="button" class="btn btn-secondary btn-sm ms-2" @click="cancelEdit()">Cancel</button>
              <button type="button" class="btn btn-danger btn-sm ms-2" @click="deleteHabit(habit)">Delete</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "YourHabits",
  data() {
    return {
      habits: [],
      editingHabitId: null,
      errorMessage: "",
      successMessage: "",
      currentTab: 'uncompleted',
      countdown: '',
    };
  },
  mounted() {
    this.fetchHabits();
    this.startCountdown();
  },
  computed: {
    filteredHabits() {
      return this.currentTab === 'completed'
        ? this.habits.filter(habit => habit.done)
        : this.habits.filter(habit => !habit.done);
    },
  },
  methods: {
    async fetchHabits() {
      console.log('fetching habits...');
      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "No token found. Please log in again.";
        return;
      }
      try {
        const habitsResponse = await axios.get("http://localhost:5000/api/habits", {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.habits = habitsResponse.data.map((habit) => ({
          ...habit,
          editName: habit.name,
          editDescription: habit.description,
          editPurpose: habit.purpose,
          editTimePerspective: habit.time_perspective,
          done: false,
        }));

        const completionsResponse = await axios.get("http://localhost:5000/api/habits/get-completions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const completions = completionsResponse.data;
        console.log("Completions Response:", completions);
        this.habits.forEach((habit) => {
          if (completions.some((c) => c.habit_id === habit.id)) {
            habit.done = true;
          }
        });
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || "Error fetching habits.";
      }
    },

    async handleCheckboxChange(habit) {
      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "No token found. Please log in again.";
        return;
      }
      try {
        if (habit.done) {
          const response = await axios.delete(
            `http://localhost:5000/api/habits/unmark-done/${habit.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          habit.done = false;
          this.successMessage = response.data.message;
        } else {
          const response = await axios.post(
            `http://localhost:5000/api/habits/mark-done/${habit.id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          habit.done = true;
          this.successMessage = `Habit completed! You earned ${response.data.xp_reward} XP and ${response.data.gold_reward} gold.`;
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error updating habit status.";
      }
    },

    toggleEdit(habit) {
      if (this.editingHabitId === habit.id) {
        this.editingHabitId = null;
      } else {
        this.editingHabitId = habit.id;

        habit.editName = habit.name;
        habit.editDescription = habit.description;
        habit.editPurpose = habit.purpose;
        habit.editTimePerspective = habit.time_perspective;
      }
    },

    cancelEdit() {
      this.editingHabitId = null;
    },

    async updateHabit(habit) {
      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "No token found. Please log in again.";
        return;
      }
      try {
        const response = await axios.put(
          `http://localhost:5000/api/habits/${habit.id}`,
          {
            name: habit.editName,
            description: habit.editDescription,
            purpose: habit.editPurpose,
            time_perspective: habit.editTimePerspective,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        habit.name = response.data.name;
        habit.description = response.data.description;
        habit.purpose = response.data.purpose;
        habit.time_perspective = response.data.time_perspective;
        this.editingHabitId = null;
        this.successMessage = `Habit "${habit.name}" updated successfully!`;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error updating habit.";
      }
    },

    async deleteHabit(habit) {
      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "No token found. Please log in again.";
        return;
      }
      try {
        await axios.delete(`http://localhost:5000/api/habits/${habit.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.habits = this.habits.filter((h) => h.id !== habit.id);
        this.successMessage = `Habit "${habit.name}" deleted successfully!`;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error deleting habit.";
      }
    },

    startCountdown() {
      const updateCountdown = () => {
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setUTCHours(23, 0, 0, 0); 
        if (now.getUTCHours() >= 23) {
          nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
        }
        const diff = nextMidnight - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        this.countdown = `${hours}h ${minutes}m ${seconds}s`;
      };
      updateCountdown();
      setInterval(updateCountdown, 1000);
    },
  },
};
</script>

<style scoped>
#yourHabitsDiv {
  padding: 20px;
}

.nav-tabs .nav-link {
  border: 1px solid #dee2e6;
  background-color: white;
  border-radius: 0.25rem;
  transition: background-color 0.3s;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  background-color: #007bff;
  color: white;
}

.list-group-item {
  margin-bottom: 10px;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  appearance: none;
  border: 2px solid #007bff;
  border-radius: 4px;
  position: relative;
}

.custom-checkbox:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 5px;
  width: 8px;
  height: 16px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

.habit-details {
  color: #333;
  font-size: 16px;
  margin-left: 10px;
  font-weight: bold;
}

.habit-description,
.habit-purpose,
.habit-time-perspective {
  display: block;
  font-size: 14px;
  color: #666;
}

.h2class {
  background-color: rgb(247, 247, 247);
  display: inline;
  box-shadow: 2px 2px 2px #888888;
}
</style>