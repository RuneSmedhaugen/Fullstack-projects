<template>
  <div id="addHabitDiv" class="container my-5">
    <div class="card shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Add a New Habit</h2>
        <form @submit.prevent="handleAddHabit">
          <FormGroup label="Habit Name" required>
            <input v-model="name" type="text" class="form-control" placeholder="Enter habit name..." />
          </FormGroup>
  
          <FormGroup label="Description">
            <textarea v-model="description" class="form-control" placeholder="Enter description..."></textarea>
          </FormGroup>
  
          <FormGroup label="Purpose">
            <input v-model="purpose" type="text" class="form-control" placeholder="Purpose (e.g., get in better shape)" />
          </FormGroup>
  
          <FormGroup label="Time Perspective">
            <select v-model="time_perspective" class="form-control">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </FormGroup>
  
          <div class="text-center">
            <button type="submit" class="btn btn-primary btn-lg mt-3">Add Habit</button>
          </div>
        </form>
  
        <!-- Inline message displays -->
        <div v-if="successMessage" class="alert alert-success mt-3">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// Assume FormGroup is imported or globally registered

export default {
  name: "AddHabit",
  data() {
    return {
      name: '',
      description: '',
      purpose: '',
      time_perspective: 'daily',
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    async handleAddHabit() {
      this.resetMessages();
      const token = localStorage.getItem('token');
      if (!token) {
        this.setError('No token found. Please log in again.');
        return;
      }
  
      // Map time perspective to the correct endpoint
      const endpointMap = {
        daily: 'daily',
        weekly: 'weekly',
        monthly: 'monthly',
        yearly: 'yearly',
      };
      const endpoint = endpointMap[this.time_perspective] || 'daily';
  
      // Store the habit name before clearing the form for the message
      const habitName = this.name;
  
      try {
        await axios.post(
          `http://localhost:5000/api/habits/${endpoint}`,
          {
            name: this.name,
            description: this.description,
            purpose: this.purpose,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.setSuccess(`Habit "${habitName}" added successfully!`);
        this.clearForm();
      } catch (error) {
        this.setError(error.response?.data?.message || 'An error occurred while adding the habit.');
      }
    },
    clearForm() {
      this.name = '';
      this.description = '';
      this.purpose = '';
      this.time_perspective = 'daily';
    },
    resetMessages() {
      this.successMessage = '';
      this.errorMessage = '';
    },
    setSuccess(message) {
      this.successMessage = message;
    },
    setError(message) {
      this.errorMessage = message;
    },
  },
};
</script>

<style scoped>
#addHabitDiv {
  padding: 20px;
}

/* Card styling for a modern look */
.card {
  border: none;
  border-radius: 10px;
  background: #fff;
}

.card-body {
  padding: 30px;
}

/* Button styling with subtle transition */
.btn-primary {
  background-color: #007bff;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Optional: spacing for form groups */
.form-group {
  margin-bottom: 1rem;
}
</style>
