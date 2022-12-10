<template>
  <div class="start">
    <p class="right-align">
      Currently verifying {{ username || "" }} ({{ osuId || "" }})
      <strong>Log out?</strong>
    </p>
    <div>
      <h1>Connect your Discord account</h1>
    </div>
    <div>
      <p>
        In this last step, we will need some information about your
        discord account.
      </p>
      <p>This information will be used to:</p>
      <ul>
        <li>Join your account to the server, if you haven't yet.</li>
        <li>
          Change the nickname on the discord server to your osu! username.
        </li>
        <li>Add the following roles to your account on the server:</li>
      </ul>
      <ul
        v-for="role in roles"
        :key="role"
      >
        <li>{{ role }}</li>
      </ul>
      <p>
        <strong>Make sure you're on the correct Discord account before
          accepting the prompt on their side.</strong>
      </p>
    </div>
    <a
      href="/auth/discord"
      class="flex button discord"
    >
      Log in with Discord!
    </a>
  </div>
</template>
<script lang="ts">
import { Context } from "@nuxt/types";
import { IUser } from "~/server/auth/IUser";
import Vue from "vue";

export default Vue.extend({
  name: "VerifyStepTwo",
  async asyncData({ req, $axios }: Context) {
    let username = "???";
    let osuId = "???";
    const roles = await $axios.$get(`${process.env.DOMAIN_URL}/api/discord-roles`);
    if (process.server) {
      const r: any = req;
      if (r.session.passport !== null) {
        const user: IUser = r.session.passport.user;
        username = user.osu.displayName || "???";
        osuId = user.osu.id || "???";
        return { roles, username, osuId };
      }
    }
    return { roles, username, osuId };
  },
});
</script>
