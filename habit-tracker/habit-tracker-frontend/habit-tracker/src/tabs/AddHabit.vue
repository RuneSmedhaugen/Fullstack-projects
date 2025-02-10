<template>
    <div id="addHabitDiv">
        <h2>Add a New Habit</h2>
        <form @submit.prevent="handleAddHabit">
            <div class="form-group">
                <label for="name">Habit Name</label>
                <input v-model="name" type="text" id="name" class="form-control" required />
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea v-model="description" id="description" class="form-control"></textarea>
            </div>

            <div class="form-group">
                <label for="purpose">Purpose</label>
                <input v-model="purpose" type="text" id="purpose" class="form-control" />
            </div>

            <div class="form-group">
                <label for="timePerspective">Time Perspective</label>
                <select v-model="time_perspective" id="timePerspective" class="form-control">
                    <option value="Short-term">Short-term</option>
                    <option value="Mid-term">Mid-term</option>
                    <option value="Long-term">Long-term</option>
                </select>
            </div>

            <button type="submit" class="btn btn-primary">Add Habit</button>
        </form>

        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
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
            this.errorMessage = '';
            this.successMessage = '';

            const token = localStorage.getItem('token');

            if (!token) {
                this.errorMessage = 'No token found. Please log in again.';
                return;
            }

            try {
                console.log('sending post request')
                await axios.post(
                    'http://localhost:5000/api/habits',
                    {
                        name: this.name,
                        description: this.description,
                        purpose: this.purpose,
                        time_perspective: this.time_perspective,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                this.successMessage = 'Habit added successfully!';
                this.clearForm();
            } catch (error) {
                console.log('error: ', error.respone );
                this.errorMessage = error.response?.data?.message || 'An error occurred while adding the habit.';
            }
        },
        clearForm() {
            this.name = '';
            this.description = '';
            this.purpose = '';
            this.time_perspective = 'daily';
        },
    },
};
</script>


<style>
#addHabitDiv {
    padding: 20px;
}

.success {
    color: green;
}

.error {
    color: red;
}
</style>