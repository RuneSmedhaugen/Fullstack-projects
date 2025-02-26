<template>
    <div id="mainDiv">
        <!-- Notification Bell -->
        <div id="notificationBell" @click="openNotifications">
            <span v-if="unreadCount > 0" class="notification-dot"></span>
            🔔
        </div>

        <!-- Notification Modal -->
        <div v-if="showNotifications" class="modal-overlay" @click="closeNotifications">
            <div class="modal" @click.stop>
                <h3>Notifications</h3>
                <ul>
                    <li v-for="(notification, index) in notifications" :key="index">
                        {{ notification }}
                    </li>
                </ul>
                <button @click="closeNotifications">Close</button>
            </div>
        </div>

        <!-- Inspirational Quote Ticker -->
        <div id="quoteTicker" class="quote-ticker">
            <div class="scrolling-text" @animationend="fetchQuote">
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
import quotes from '@/quotes';

export default {
    name: 'MainPage',
    data() {
        return {
            currentTab: 'YourHabits',
            quote: '',
            author: '',
            notifications: ['New quest available!', 'Your daily streak is active!'],
            showNotifications: false,
            quoteInterval: null, // Add a variable to store the interval ID
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
            }[this.currentTab];
        },
        unreadCount() {
            return this.notifications.length;
        }
    },
    mounted() {
        this.fetchQuote();
        this.quoteInterval = setInterval(this.fetchQuote, 15000);
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
        openNotifications() {
            this.showNotifications = true;
            this.notifications = [];
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
}

.notification-dot {
    position: absolute;
    top: 0;
    right: 0;
    background: red;
    width: 10px;
    height: 10px;
    border-radius: 50%;
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
    background: white;
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
    animation: scroll-left 15s linear infinite; /* Adjust duration as needed */
}

.quote-ticker p {
    white-space: nowrap;
    margin: 0;
}

@keyframes scroll-left {
    0% {
        transform: translateX(450%); /* Start off-screen to the right */
    }

    100% {
        transform: translateX(-100%); /* End off-screen to the left */
    }
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
