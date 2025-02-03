import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
// import AuthView from '../views/AuthView.vue';
//import ProfileView from '../views/ProfileView.vue';

const routes = [
  { path: '/', component: HomeView },
  //{ path: '/auth', component: AuthView },
  //{ path: '/profile', component: ProfileView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
