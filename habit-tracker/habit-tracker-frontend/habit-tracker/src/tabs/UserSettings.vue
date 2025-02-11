<template>
    <div class="container p-5">
      <h2 class="mb-4">User Settings</h2>
  
      <!-- Dark Mode Toggle -->
      <div class="mb-4">
        <label class="form-check-label h5" for="darkModeToggle">
          Dark Mode
        </label>
        <input
          type="checkbox"
          class="form-check-input"
          id="darkModeToggle"
          v-model="darkMode"
          @change="toggleDarkMode"
        />
      </div>
  
      <!-- Delete Account Section -->
      <div class="alert alert-warning mt-4">
        <p><strong>Warning:</strong> Deleting your account is permanent and cannot be undone.</p>
        <button
          class="btn btn-danger"
          @click="deleteAccount"
        >
          Delete Account
        </button>
      </div>
  
      <!-- Log Out Section -->
      <div class="mt-4">
        <button
          class="btn btn-primary"
          @click="logout"
        >
          Log Out
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        darkMode: false,
      };
    },
    mounted() {
      // Check localStorage for dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      this.darkMode = savedDarkMode;
      this.applyDarkMode(savedDarkMode);
    },
    methods: {
      toggleDarkMode() {
        // Save the dark mode preference to localStorage
        localStorage.setItem('darkMode', this.darkMode);
        this.applyDarkMode(this.darkMode);
      },
      applyDarkMode(isDark) {
        if (isDark) {
          document.body.classList.add('bg-dark', 'text-white');
        } else {
          document.body.classList.remove('bg-dark', 'text-white');
        }
      },
      async deleteAccount() {
        const confirmDelete = confirm('Are you sure you want to delete your account? This action is irreversible.');
        if (confirmDelete) {
          try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            if (response.ok) {
              alert('Your account has been deleted.');
              // Clear localStorage and redirect to login
              localStorage.clear();
              this.$router.push('/login');
            } else {
              console.error('Failed to delete account');
            }
          } catch (error) {
            console.error('Error deleting account:', error);
          }
        }
      },
      logout() {
        // Clear localStorage and redirect to login page
        localStorage.clear();
        this.$router.push('/login');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Optional: Styling to enhance dark mode behavior */
  body.bg-dark {
    background-color: #343a40 !important;
  }
  body.text-white {
    color: #f8f9fa !important;
  }
  </style>
  