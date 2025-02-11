<template>
    <div id="yourHabitsDiv" class="container mt-4">
      <h2>Your Habits</h2>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div class="list-group">
        <div class="list-group-item" v-for="habit in habits" :key="habit.id">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="'habit-' + habit.id"
                :checked="habit.done"
                :disabled="habit.done"
                @change="handleCheckboxChange(habit)"
              />
              <label class="form-check-label" :for="'habit-' + habit.id">
                {{ habit.name }}
              </label>
            </div>
            <div>
              <button class="btn btn-link" @click="toggleEdit(habit)">
                <i class="bi bi-gear-fill"></i>
              </button>
            </div>
          </div>
  
          <div v-if="editingHabitId === habit.id" class="mt-2">
            <form @submit.prevent="updateHabit(habit)">
              <div class="mb-2">
                <label>Name:</label>
                <input type="text" v-model="habit.editName" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Description:</label>
                <textarea v-model="habit.editDescription" class="form-control"></textarea>
              </div>
              <div class="mb-2">
                <label>Purpose:</label>
                <input type="text" v-model="habit.editPurpose" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Time Perspective:</label>
                <select v-model="habit.editTimePerspective" class="form-control">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <button type="submit" class="btn btn-primary btn-sm">Save</button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm ms-2"
                  @click="cancelEdit()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm ms-2"
                  @click="deleteHabit(habit)"
                >
                  Delete
                </button>
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
        successMessage: ""
      };
    },
    mounted() {
      this.fetchHabits();
    },
    methods: {
      
      async fetchHabits() {
        const token = localStorage.getItem("token");
        if (!token) {
          this.errorMessage = "No token found. Please log in again.";
          return;
        }
        try {
          
          const habitsResponse = await axios.get("http://localhost:5000/api/habits", {
            headers: { Authorization: `Bearer ${token}` }
          });
         
          let habits = habitsResponse.data.map((habit) => ({
            ...habit,
            editName: habit.name,
            editDescription: habit.description,
            editPurpose: habit.purpose,
            editTimePerspective: habit.time_perspective,
            done: false  
          }));
          
          const completionsResponse = await axios.get("http://localhost:5000/api/habits/completions", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const completions = completionsResponse.data;
          
          habits.forEach((habit) => {
            if (completions.find((c) => c.habit_id === habit.id)) {
              habit.done = true;
            }
          });
          this.habits = habits;
        } catch (error) {
          this.errorMessage =
            error.response?.data?.message || "Error fetching habits.";
        }
      },
  
      
      async handleCheckboxChange(habit) {
        
        if (habit.done) return;
        await this.markHabitDone(habit);
      },
  
      
      async markHabitDone(habit) {
        const token = localStorage.getItem("token");
        if (!token) {
          this.errorMessage = "No token found. Please log in again.";
          return;
        }
        try {
          await axios.post(
            `http://localhost:5000/api/habits/${habit.id}/completion`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          habit.done = true;
          this.successMessage = `Habit "${habit.name}" marked as done!`;
        } catch (error) {
          this.errorMessage =
            error.response?.data?.message || "Error marking habit as done.";
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
              streak_current: habit.streak_current,
              streak_longest: habit.streak_longest,
              xp_reward: habit.xp_reward,
              gold_reward: habit.gold_reward
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
          this.errorMessage =
            error.response?.data?.message || "Error updating habit.";
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
            headers: { Authorization: `Bearer ${token}` }
          });
          this.habits = this.habits.filter((h) => h.id !== habit.id);
          this.successMessage = `Habit "${habit.name}" deleted successfully!`;
        } catch (error) {
          this.errorMessage =
            error.response?.data?.message || "Error deleting habit.";
        }
      }
    }
  };
  </script>
  
  <style scoped>
  #yourHabitsDiv {
    padding: 20px;
  }
  
  .list-group-item {
    margin-bottom: 10px;
  }
  </style>
  