<template>
    <div id="registerDiv" class="register-container">
        <h2>Create your account</h2>
        <form @submit.prevent="handleRegister" class="register-form">
            <div class="input-group">
                <input v-model="username" type="text" placeholder="Username" required />
            </div>
            <div class="input-group">
                <input v-model="email" type="email" placeholder="Email" required />
            </div>
            <div class="input-group">
                <input v-model="password" type="password" placeholder="Password" required />
            </div>
            <div class="input-group">
                <input v-model="confirmPassword" type="password" placeholder="Confirm password" required />
            </div>
            <button type="submit" class="submit-btn">Register</button>
        </form>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        
        <button @click="goToLogin" class="back-btn">Back to Login</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'RegisterPage',
    data() {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
            successMessage: ''
        };
    },
    methods: {
        async handleRegister() {
            this.errorMessage = '';
            this.successMessage = '';

            if (this.password !== this.confirmPassword) {
                this.errorMessage = 'Passwords do not match';
                return;
            }

            try {
                await axios.post('http://localhost:5000/api/auth/register', {
                    username: this.username,
                    email: this.email,
                    password: this.password
                });
                this.successMessage = 'Account created successfully! You can now log in.';
                this.clearForm();
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'An error occurred during registration.';
            }
        },
        clearForm() {
            this.username = '';
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
        },
        goToLogin() {
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-group {
    position: relative;
}

input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s ease;
}

input:focus {
    border-color: #007bff;
    outline: none;
}

button {
    padding: 12px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

.error {
    color: red;
    font-size: 14px;
    margin-top: 10px;
}

.success {
    color: green;
    font-size: 14px;
    margin-top: 10px;
}

.back-btn {
    margin-top: 20px;
    background-color: #555;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
}

.back-btn:hover {
    background-color: #333;
}
</style>
