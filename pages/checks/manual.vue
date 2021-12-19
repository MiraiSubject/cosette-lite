<template>
  <div id="start">
    <div>
      <h1>Manual verification required</h1>
      <p>Please ping the @Moderators role in the verification channel with a screenshot of this page.</p>
      <p>Reason: {{ reason }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Context } from "@nuxt/types";
import Vue from "vue";
import { IUser } from "~/server/auth/IUser";
export default Vue.extend({
  asyncData({ req }: Context) {
    if (process.server) {
      const r: any = req;
      const user: IUser = r.session.passport.user;
      const reason = user.failureReason || 'Blame subject';
      return { reason }
    }
  }
});
</script>