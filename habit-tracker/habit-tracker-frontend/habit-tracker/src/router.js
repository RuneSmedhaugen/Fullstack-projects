import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './pages/LoginPage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import MainPage from './pages/MainPage.vue';
import ChatComponent from './components/chatComponent.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/',
    name: 'home',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage
  },

  {
    path: '/chat/:friendId',
    name: 'Chat',
    component: ChatComponent
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
