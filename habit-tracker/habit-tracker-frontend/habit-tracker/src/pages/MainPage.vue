<template>
    <div id="mainDiv">
        <!-- Notification Bell -->
        <div id="notificationBell" :class="{ 'has-unread': unreadCount > 0 }" @click="openNotifications">
            <span v-if="unreadCount > 0" class="notification-dot"></span>
            🔔
        </div>

        <!-- Notification Modal -->
        <div v-if="showNotifications" class="modal-overlay" @click="closeNotifications">
            <div class="modal" @click.stop>
                <h3>Notifications gheherthrht</h3>
                <ul>
                    <li v-for="(notification, index) in notifications" :key="index">
    <strong>{{ notification.sender_id }}</strong>: {{ notification.type }} - {{ notification.status }} ({{ notification.created_at }})
</li>

                </ul>
                <button @click="closeNotifications">Close</button>
            </div>
        </div>

        <!-- Inspirational Quote Ticker -->
        <div id="quoteTicker" class="quote-ticker">
            <div class="scrolling-text" @animationiteration="fetchQuote">
                <p>{{ quote }}</p>
                <p><em>- {{ author }}</em></p>
            </div>
        </div>

        <!-- Tabs Section -->
        <div id="mainButtons">
            <h2>QuestLog</h2>
            <button @click="currentTab = 'YourHabits'">Your Habits</button>
            <button @click="currentTab = 'AddHabit'">Add a New Habit</button>
            <button @click="currentTab = 'ItemShop'">Item Shop</button>
            <button @click="currentTab = 'BossBattle'">Boss Battle</button>
            <button @click="currentTab = 'UserStats'">Stats</button>
            <button @click="currentTab = 'Scoreboard'">Scoreboard</button>
            <button @click="currentTab = 'UsersTab'">Users</button>
            <button @click="currentTab = 'UserProfile'">Profile</button>
            <button @click="currentTab = 'UserSettings'">Settings</button>
            
        </div>

        <div id="tabContent">
            <component :is="currentTabComponent" />
        </div>
    </div>
</template>

<script>
import AddHabit from '../tabs/AddHabit.vue';
import BossBattle from '../tabs/BossBattle.vue';
import ItemShop from '../tabs/ItemShop.vue';
import UserProfile from '../tabs/UserProfile.vue';
import UserSettings from '../tabs/UserSettings.vue';
import UserStats from '../tabs/UserStats.vue';
import YourHabits from '../tabs/YourHabits.vue';
import UsersTab from '../tabs/UsersTab.vue';
import quotes from '@/quotes';
import Scoreboard from '../tabs/Scoreboard.vue';

export default {
    name: 'MainPage',
    data() {
        return {
            currentTab: 'YourHabits',
            quote: '',
            author: '',
            notifications: [],
            showNotifications: false,
            quoteInterval: null,
        };
    },
    computed: {
        currentTabComponent() {
            return {
                AddHabit,
                BossBattle,
                ItemShop,
                UserProfile,
                UserSettings,
                UserStats,
                YourHabits,
                UsersTab, 
                Scoreboard,
            }[this.currentTab];
        },
        unreadCount() {
            return this.notifications.filter(notification => !notification.read).length;
        }
    },
    mounted() {
        this.fetchQuote();
        this.quoteInterval = setInterval(this.fetchQuote, 15000);
        this.fetchNotifications();
    },
    beforeUnmount() {
        clearInterval(this.quoteInterval);
    },
    methods: {
        fetchQuote() {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            this.quote = quotes[randomIndex].quote;
            this.author = quotes[randomIndex].author;
        },
        async fetchNotifications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched notifications:', data);
        this.notifications = data.map(notification => ({ ...notification, read: false })); // Add read status
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
    
},

        openNotifications() {
            this.showNotifications = true;
            // Mark notifications as read when opened
            this.notifications.forEach(notification => notification.read = true);
        },
        closeNotifications() {
            this.showNotifications = false;
        }
    }
};
</script>

<style scoped>
#notificationBell {
    position: fixed;
    top: 50px;
    right: 600px;
    font-size: 24px;
    cursor: pointer;
    position: relative;
    display: inline-block;
}

.notification-dot {
    position: absolute;
    top: -5px;
    right: -5px;
    background: red;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
    display: none;
}

/* Show dot only if unread notifications exist */
#notificationBell.has-unread .notification-dot {
    display: block;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: rgb(255, 255, 255);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}

#mainDiv {
    text-align: center;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.quote-ticker {
    display: flex;
    overflow: hidden;
    white-space: nowrap;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    background-color: #333;
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 1px 0;
}

.scrolling-text {
    display: inline-block;
    animation: scroll-left 15s linear infinite;
}

.quote-ticker p {
    white-space: nowrap;
    margin: 0;
}

@keyframes scroll-left {
    0% { transform: translateX(450%); }
    100% { transform: translateX(-100%); }
}

#mainButtons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 60px;
}

/* Button Styling */
button {
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
}

button:focus {
    outline: none;
}

#tabContent {
    margin-top: 20px;
}

h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 20px;
}
</style>
