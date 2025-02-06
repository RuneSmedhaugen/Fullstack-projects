<template>
    <div id="registerDiv">
        <h2>Create your account</h2>
        <input id="regUsername" type="text" placeholder="Username" />
        <input id="regEmail" type="text" placeholder="Email" />
        <input id="regPassword" type="password" placeholder="Password" />
        <input id="confirmPassword" type="password" placeholder="Confirm password" />
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'RegisterPage',
    
}
</script>