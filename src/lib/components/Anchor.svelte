<script lang="ts">
    export let href: string;
</script>

<a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="text-blue-500 hover:opacity-75 transition-opacity"
>
    <slot />
</a>
