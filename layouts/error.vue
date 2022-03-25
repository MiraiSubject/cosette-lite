<template>
  <div class="start">
    <div>
      <h1>{{ error.message }}</h1>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  computed: {
    statusCode() {
      return (this.error && (this.error as any).statusCode) || 500;
    },
    message() {
      return (this.error as any).message;
    },
  },
});

interface errorMessage {
  statusCode: number;
  message:string;
}
</script>
