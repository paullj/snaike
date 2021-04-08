<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear, scaleOrdinal } from 'd3-scale';
    import { zoom, zoomIdentity } from 'd3-zoom';
	import { schemeCategory10 } from 'd3-scale-chromatic';
	import { select, selectAll } from 'd3-selection';
	import { drag } from 'd3-drag';
	import { forceSimulation, forceLink, forceCollide, forceCenter, forceY } from 'd3-force';

    export let graph;
    let nodes: D3Node[];
    let links: D3Link[];
    
    $: {
        const old = new Map(graph.nodes.map(d => [d.id, d]));
        nodes = graph.nodes.map(d => Object.assign(old.get(d.id) || {}, d));
        links = graph.links.map(d => Object.assign({}, d));
    };
  
    interface D3Node {
        id: string,
        activationType: string,
        group: number,
        x?: number,
        y?: number,
    }

    interface D3Link {
        source: D3Node,
        target: D3Node,
        enabled: boolean,
        weight: number,
    }

	let svg;
	let width = 500;
	let height = 600;
    const nodeRadius = 7;

    $: if (simulation) {
        //TODO: Find a way so positions dont get reset ever time the graph changes
        simulation.nodes(nodes);
        simulation.force("link").links(links)
        simulation.alpha(1).restart();
        simulation.tick(10)
    }
	const colourScale = scaleOrdinal(schemeCategory10);
	let transform = zoomIdentity;
    let simulation

    function isolate(force, filter) {
        var initialize = force.initialize;
        force.initialize = function() { initialize.call(force, nodes.filter(filter)); };
        return force;
    }

    const clamp = (n: number, [min, max]: [number, number]) => Math.max(min, Math.min(n, max));

    const scale = (n: number, [xMin, xMax]: [number, number], [yMin, yMax]: [number, number]) => {
        const percent = clamp((n - yMin) / (yMax - yMin), [0, 1]);
        return percent * (xMax - xMin) + xMin;
    };

	onMount(() => {
        simulation = forceSimulation(nodes)
            .force("link", forceLink(links)
                .id(({id}) => id)
                .distance(15)
                .strength((l) => l.enabled ? 0.1 : 0.05))
            .force("y", isolate(forceY(height/4), (n) => n.group === 3).strength(1))
            .force("y", isolate(forceY(3*height/4), ({ group }) => group === 0 || group === 1).strength(1))
            .force("charge", forceCollide(nodeRadius * 4))
            .force("center", forceCenter(width / 2, height / 2))
            .on('tick', simulationUpdate);
            
        simulation.tick(100)
        select(svg)
            .call(drag()
                .container(svg)
                .subject(dragsubject)
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .call(zoom()
            .scaleExtent([1 / 10, 8])
            .on('zoom', zoomed));

        return () => {
            simulation.stop();
        };
	});

	function simulationUpdate () {
		simulation.tick();
		nodes = [...nodes];
		links = [...links];
	}
    function zoomed(currentEvent) {
        transform = currentEvent.transform;
        simulationUpdate();
    }
	function dragsubject(currentEvent) {
        const node = simulation.find(transform.invertX(currentEvent.x), transform.invertY(currentEvent.y), nodeRadius);
        if (node) {
            node.x = transform.applyX(node.x);
            node.y = transform.applyY(node.y);
        }
        return node;
	}
    function dragstarted(currentEvent) {
        if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
        currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
    }
    function dragged(currentEvent) {
        currentEvent.subject.fx = transform.invertX(currentEvent.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.y);
    }
    function dragended(currentEvent) {
        if (!currentEvent.active) simulation.alphaTarget(0);
        currentEvent.subject.fx = null;
        currentEvent.subject.fy = null;
    }
	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
</script>

<svelte:window on:resize='{resize}'/>

<svg bind:this={svg} width='{width}' height='{height}'>
	{#each links as { source, target, enabled, weight }}
        <g stroke='#999' stroke-opacity={enabled ? 0.7 : 0.4} stroke-width={scale(weight, [1, 3], [-2.5, 2.5] )}
                stroke-dasharray={enabled ? '0': '5,5'}
        >
            <line x1='{source.x}' y1='{source.y}' x2='{target.x}' y2='{target.y}'
                    transform='translate({transform.x} {transform.y}) scale({transform.k} {transform.k})'>
                    <title>{source.id}</title>
            </line>
        </g>
	{/each}

	{#each nodes as {id, x, y, group, activationType}}
        <circle class='node' r={nodeRadius} fill='{colourScale(group)}' cx='{x}' cy='{y}'
        transform='translate({transform.x} {transform.y}) scale({transform.k} {transform.k})'>
            <title>{id}</title>
        </circle>
        {#if group !== 2}
        <text {x} y={y + 20} text-anchor="middle"
        transform='translate({transform.x} {transform.y}) scale({transform.k} {transform.k})'>
            {id.slice(0, 5)}
                <!-- [{activationType}] -->
        </text>
        {/if}   
	{/each}
</svg>