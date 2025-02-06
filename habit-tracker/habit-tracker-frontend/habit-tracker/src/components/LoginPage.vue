<template>
    <div id="logindiv" class="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <div class="card p-5 shadow-lg rounded-3" style="max-width: 400px; width: 100%; background: #222;">
            <h1 class="text-center mb-4 text-info">Welcome to QuestLog</h1>
            <h2 class="text-center text-light mb-4">Login</h2>
            <div class="mb-3">
                <input
                    id="loginUsername"
                    type="text"
                    class="form-control"
                    placeholder="Username og email"
                    v-model="username"
                    @keyup.enter="handleLogin"
                />
            </div>
            <div class="mb-3">
                <input
                    id="loginPassword"
                    type="password"
                    class="form-control"
                    placeholder="Password"
                    v-model="password"
                    @keyup.enter="handleLogin"
                />
            </div>
            <div class="d-flex justify-content-between">
                <button id="loginbtn" class="btn btn-primary w-48" @click="handleLogin">Login</button>
                <button id="registerbtn" class="btn btn-secondary w-48" @click="$router.push('/register')">Register</button>
            </div>
            <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'LoginPage',
    data() {
        return {
            username: '',
            password: '',
            errorMessage: ''
        };
    },
    methods: {
        async handleLogin() {
            if (this.username === '' || this.password === '') {
                this.errorMessage = 'Please enter both username and password.';
                return;
            }

            this.errorMessage = '';
            try {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    username: this.username,
                    password: this.password
                });
                const token = response.data.token;
                localStorage.setItem('token', token);
                this.$router.push('/main');
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Wrong username or password';
            }
        }
    }
};
</script>

<style scoped>
#logindiv {
    background-color: #121212;
}
.card {
    background: #1c1c1c;
    border: none;
}
button {
    transition: background-color 0.3s;
}
button:hover {
    background-color: #0056b3;
}
</style>
