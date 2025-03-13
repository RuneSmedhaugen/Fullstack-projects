import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import UserProfile from '../tabs/UserProfile.vue';
import ChatComponent from '../components/chatComponent.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/profile', component: UserProfile },
  { path: '/chat/:friendId', name: 'Chat', component: ChatComponent }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;