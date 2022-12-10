<template>
  <div class="start">
    <div>
      <h1> Welcome to {{ tournament.name }} verification.</h1>
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
        <li>Add role(s) to your user on the server on behalf of the host.</li>
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
      <p>By proceeding you will agree to the <strong>functional</strong> use of cookies.</p>
    </div>
    <a
      href="/auth/osu"
      class="flex button osu"
    > Log in with osu! </a>
    <p v-if="error !== ''" style="color:#FF4C4C; font-weight:bold; font-size: 1.2rem">{{error}}</p>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data: () => ({}),
  async asyncData({ req, error, $axios }) {
    let body = {
      error: '',
      tournament: {}
    };

    if (process.server) {
      const request = req as any;
      if (request.session.flash !== undefined) {
        console.log(request.session.flash);
        if (request.session.flash.error !== undefined) {
          body.error = request.session.flash.error[0];
          request.flash("error");
        }
      }
    }

    try {
      const tournament = await $axios.$get(`${process.env.DOMAIN_URL}/api/tournament`);
      body.tournament = tournament;
      return body;
    } catch (err) {
      error({ statusCode: 404, message: `Tournament not found.` });
    }
  },
});
</script>
