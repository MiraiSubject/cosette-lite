<template>
  <div class="start">
    <div class="grid-container container">
      <div class="center-align">
        <div class="row">
          <div>
            <h1>Welcome to the osu! Tournament Hub</h1>
          </div>
          <div>
            <p>First we need to verify your account!</p>
            <p>
              You will be asked to login with your osu! account first, and then
              with your Discord account.
            </p>
            <p>Your osu! account information will be used to: </p>
            <ul>
              <li>
                Verify that you own this account, to prevent impersonation of
                others
              </li>
              <li>
                Attach your osu! username as a nickname in the discord server
              </li>
            </ul>
            <p>Your Discord account information will be used to: </p>
            <ul>
              <li>Join your account to the server, if you haven't yet</li>
              <li>
                Change the nickname on the discord server to your osu! username
              </li>
              <li>Add the "Verified" role to your account on the server.</li>
            </ul>
          </div>
          <div>
            <p>
              This web site is not endorsed by, directly affiliated with,
              maintained, authorized, or sponsored by osu!, ppy, or Discord. All
              product and company names are the registered trademarks of their
              original owners.
            </p>
            <p>This is an <strong>unofficial</strong> server.</p>
          </div>
          <a
            href="/auth/osu"
            class="button osu"
          > Log in with osu! </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "VerifyStepOne",
});
</script>
