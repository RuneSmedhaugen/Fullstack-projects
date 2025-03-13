<template>
    <div class="chat-container">
      <h3>Chat with {{ friendUsername }}</h3>
      <div class="chat-messages">
        <div v-for="(message, index) in messages" :key="index" class="chat-message">
          <strong>{{ message.sender }}:</strong> {{ message.text }}
        </div>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        messages: [],
        newMessage: '',
        sender: 'User',
        friendUsername: ''
      };
    },
    mounted() {
      this.friendUsername = this.$route.params.friendUsername;
      this.loadMessages();
    },
    methods: {
      loadMessages() {
        const storedMessages = localStorage.getItem(`chatMessages_${this.friendUsername}`);
        if (storedMessages) {
          this.messages = JSON.parse(storedMessages);
        }
      },
      saveMessages() {
        localStorage.setItem(`chatMessages_${this.friendUsername}`, JSON.stringify(this.messages));
      },
      sendMessage() {
        if (this.newMessage.trim() !== '') {
          const message = {
            sender: this.sender,
            text: this.newMessage.trim()
          };
          this.messages.push(message);
          this.saveMessages();
          this.newMessage = '';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    border: 1px solid #ccc;
    padding: 10px;
    width: 300px;
    height: 400px;
    display: flex;
    flex-direction: column;
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  .chat-message {
    margin-bottom: 5px;
  }
  .chat-input {
    display: flex;
  }
  .chat-input input {
    flex: 1;
    padding: 5px;
  }
  .chat-input button {
    padding: 5px 10px;
  }
  </style>
  