<template>
    <div id="mainDiv">
        <!-- Inspirational Quote Ticker -->
        <div id="quoteTicker" class="quote-ticker">
            <p>{{ quote }}</p>
            <p><em>- {{ author }}</em></p>
        </div>

        <!-- Main Content Section -->
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
import axios from 'axios';
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
    },
    mounted() {
        this.fetchQuote();
    },
    methods: {
        fetchQuote() {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            this.quote = quotes[randomIndex].quote;
            this.author = quotes[randomIndex].author;
        }
    }
};
</script>

<style scoped>
/* Main Container */
#mainDiv {
    text-align: center;
    padding: 20px;
    font-family: Arial, sans-serif;
}

/* Quote Ticker Style */
.quote-ticker {
    width: 100%;
    background-color: #333;
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 5px 0;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
}

.quote-ticker p {
    white-space: nowrap;
    animation: scroll-left 15s linear infinite;
    margin: 0;
    padding-left: 100%;
}

@keyframes scroll-left {
    0% {
        transform: translateX(100%);
    }

    100% {
        transform: translateX(-100%);
    }
}

/* Main Buttons */
#mainButtons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 60px;
    /* To account for the ticker */
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

/* Tab Content */
#tabContent {
    margin-top: 20px;
}

/* Overall Page Style */
h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 20px;
}
</style>