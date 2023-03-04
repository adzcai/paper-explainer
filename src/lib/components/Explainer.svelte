<script lang="ts">
    export let id: string;

    let explanation: string = "";
    let loading = false;
</script>

<button
    class="text-blue-500 hover:text-blue-700 font-semibold"
    on:click={() => {
        loading = true;
        fetch("/explain?id=" + id)
            .then((response) => response.text())
            .then((data) => {
                explanation = data;
                loading = false;
            });
    }}
>
    Explain
</button>

{#if loading}
<p class="text-gray-600 animate-pulse">Loading...</p>
{/if}

{#if explanation}
    <div class="mt-2">
        <p>{explanation}</p>
    </div>
{/if}
