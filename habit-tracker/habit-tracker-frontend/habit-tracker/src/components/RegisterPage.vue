<template>
    <div id="registerDiv">
        <h2>Create your account</h2>
        <input v-model="username" type="text" placeholder="Username" />
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <input v-model="confirmPassword" type="password" placeholder="Confirm password" />
        <button @click="handleRegister">Register</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <button @click="goToLogin" id="backToLoginBtn">Back to Login</button>
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

<style>
#errorMessage {
    color: red;
}

#successMessage {
    color: green;
}

#backToLoginBtn {
    margin-top: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 4px;
}

#backToLoginBtn:hover {
    background-color: #0056b3;
}
</style>