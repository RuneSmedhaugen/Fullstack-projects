<template>
    <div class="container mt-4">
        <h2>QuestLog</h2>
        <form @submit.prevent="addHabit">
            <input v-model="newHabit" class="form-control mb-2" placeholder="enter new habit" />
            <button class="btn btn-primary">Add Habit</button>
        </form>
        <ul class="list-group mt-3">
            <li v-for="(habit, index) in habits" :key="index" class="list-group-item d-flex justify-content-between">
                {{ habit }}
                <button class="btn btn-danger btm-sm" @click="removeHabit(index)">Delete</button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            newHabit: '',
            habits: []
        };
    },
    methods: {
        addHabit() {
            if(this.newHabit.trim()) {
                this.habits.push(this.newHabit);
                this.newHabit = '';
            }
        },
        removeHabit(index) {
            this.habits.splice(index, 1);
        }
    }
};
</script>