<template>
    <div id="usersTab">
      <h2>Users</h2>
      <div class="user-cards">
        <div v-for="user in users" :key="user.id" class="user-card">
          <h3>{{ user.username }}</h3>
          <button
            :disabled="user.isFriendRequestSent || user.isFriend"
            @click="sendFriendRequest(user.id)"
          >
            {{ user.isFriendRequestSent ? 'Request Sent' : 'Add Friend' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UsersTab',
    data() {
      return {
        users: [],
      };
    },
    methods: {
        async fetchUsers() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const users = await response.json();
      this.users = users;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  async sendFriendRequest(friendId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/sendFriendRequest', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ receiver_id: friendId }),
        });

        if (response.ok) {
            console.log('Friend request sent');
            const user = this.users.find((u) => u.id === friendId);
            if (user) {
                user.isFriendRequestSent = true;
            }
        } else if (response.status === 401) {
            console.error('Unauthorized. Redirecting to login.');
            this.$router.push('/login');
        } else {
            console.error('Failed to send friend request:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
    }
}

    },
    mounted() {
      this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
  #usersTab {
    padding: 20px;
  }
  
  .user-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .user-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    width: 200px;
    background-color: rgb(255, 255, 255);
    color: black;
  }
  
  button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  button:hover:not(:disabled) {
    background-color: #0056b3;
  }
  </style>
  