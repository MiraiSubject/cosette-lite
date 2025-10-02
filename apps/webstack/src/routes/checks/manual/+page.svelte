<script lang="ts">
	import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div id="start">
    <div>
      <h1>Manual verification required</h1>
      <p>Please ping the @Moderators role in the verification channel with the following text: </p>
      <p>The reason I require manual verification is: { data.reason }</p>
        <p style="margin-top: 0.75rem; font-size: 0.9rem; opacity: 0.3;">
          <a href="/checks/discord" aria-label="Proceed to verification anyway" style="color: inherit; text-decoration: underline;">I understand this server is for staff only and not players — verify me anyway</a>
        </p>
    </div>
  </div>