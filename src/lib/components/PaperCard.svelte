<script lang="ts">
    // takes in the arXiv API response for a single paper
    // and renders a PaperCard component

    import Anchor from "./Anchor.svelte";
    import Explainer from "./Explainer.svelte";

    export let paper: Element;

    function extract(component: string) {
        const element = paper.querySelector(component);
        return element ? element.textContent! : "";
    }

    const url = extract("id");
    const id = url.split("/").pop()!;
    const title = extract("title");
    const summary = extract("summary");
</script>

<div class="rounded border-2 shadow-lg p-4">
    <h2 class="text-xl font-bold">
        <Anchor href={url}>
            {title}
        </Anchor>
    </h2>

    <p class="text-gray-400 mt-1">{id}</p>

    <!-- open-and-closeable dialog -->
    <details class="mt-2">
        <summary class="text-gray-600 cursor-pointer">
            Show abstract
        </summary>
        <div class="mt-2">
            <p>
                {summary}
            </p>
        </div>
    </details>

    <Explainer {id} />
</div>
