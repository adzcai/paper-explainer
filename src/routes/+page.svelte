<script lang="ts">
    import otherCategories from "$lib/data/other-categories.json";
    import physicsCategories from "$lib/data/physics-categories.json";

    import Anchor from "$lib/components/Anchor.svelte";
    import PaperCard from "../lib/components/PaperCard.svelte";

    /**
     * query for the most recent papers from the arXiv api
     */
    async function fetchRecentPapers({
        numResults,
        categoryId,
        start = 0,
    }: {
        numResults: number;
        categoryId: string;
        start?: number;
    }) {
        const categoryString =
            categoryId === "All" ? "all" : "cat:" + categoryId;
        const response = await fetch(
            `https://export.arxiv.org/api/query?search_query=${categoryString}&start=${start}&max_results=${numResults}&sortBy=lastUpdatedDate&sortOrder=descending`
        );
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        const entries = xml.querySelectorAll("entry");
        return Array.from(entries);
    }

    let categoryId = "All";
    let subcategoryId = "";
    let numResults = 20;

    $: physicsCategory = physicsCategories.find(
        (c) => c.subtitle === categoryId
    );
    $: otherCategory = otherCategories.find((c) => c.name === categoryId);
    $: papers =
        categoryId === "All"
            ? fetchRecentPapers({
                  numResults,
                  categoryId: "All",
              })
            : subcategoryId
            ? fetchRecentPapers({
                  numResults,
                  categoryId: subcategoryId,
              })
            : Promise.resolve([]);
</script>

<div class="flex flex-col items-center mt-12 mb-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold">
        Recent
        <Anchor href="https://arxiv.org/">arXiv</Anchor>
        Papers
    </h1>

    <!-- categoryId selector -->
    <div class="mt-8">
        <select class="border-2 rounded p-2" bind:value={categoryId}>
            <option>All</option>
            <optgroup label="Physics">
                {#each physicsCategories as categoryId}
                    <option value={categoryId.subtitle}
                        >{categoryId.name}</option
                    >
                {/each}
            </optgroup>
            <optgroup label="Other">
                {#each otherCategories as categoryId}
                    <option value={categoryId.name}>{categoryId.name}</option>
                {/each}
            </optgroup>
        </select>
    </div>

    <!-- subcategoryId selector -->
    {#if categoryId !== "All"}
        <div class="mt-8">
            <select class="border-2 rounded p-2" bind:value={subcategoryId}>
                <option value="" />
                {#each (physicsCategory ?? otherCategory ?? { subcategories: [] }).subcategories as { name, description }}
                    <option value={name}>
                        ({name}) {description}
                    </option>
                {/each}
            </select>
        </div>
    {/if}

    <!-- input number of papers to get -->
    <div class="mt-8">
        <label
            for="numResults"
            class="block text-center text-sm font-bold mb-2"
        >
            Number of papers to get
        </label>
        <input
            type="number"
            id="numResults"
            max="50"
            bind:value={numResults}
            class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-md"
        />
    </div>

    <!-- list of papers -->
    <div class="mt-8 space-y-4 mx-4">
        {#await papers}
            <div>Loading...</div>
        {:then papers}
            {#each papers as paper}
                <PaperCard {paper} />
            {/each}
        {/await}
    </div>
</div>
