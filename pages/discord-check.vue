<template>
  <div class="start">
    <div class="grid-container container">
      <div class="flex center-align">
        <div class="row">
          <p class="right-align">
            Currently verifying {{ username }} ({{ osuId }})
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
              <li>Add the "Verified" role to your account on the server.</li>
            </ul>
            <p>
              <strong>Make sure you're on the correct Discord account before
                accepting the prompt on their side.</strong>
            </p>
          </div>
          <a
            href="/auth/discord"
            class="button discord"
          >
            Log in with Discord!
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Context } from "@nuxt/types";
import { IUser } from "~/server/auth/IUser";
import Vue from "vue";

export default Vue.extend({
  name: "VerifyStepTwo",
  asyncData({ req }: Context) {
    const r: any = req;
    const user: IUser = r.session.passport.user;
    const username = user.osu.displayName || "???";
    const osuId = user.osu.id || "???";
    return { username, osuId };
  },
});
</script>
