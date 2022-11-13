<script lang='ts'>
	import { Easing, Tween, update } from "@tweenjs/tween.js";
	import { onMount } from 'svelte';
	import { PUBLIC_MAP_ID, PUBLIC_API_KEY_GMAPS } from '$env/static/public';
	import { Loader } from '@googlemaps/js-api-loader';

	let gmapready = false;
	let mapHolder: HTMLElement;
	let gMaps: google.maps.Map;

	
	onMount( async () => {

		const cameraOptions: google.maps.CameraOptions = {
			tilt: 0,
			heading: 0,
			zoom: 3,
			center: { lat: -8.6213817, lng: 115.0851476 }
		};

		const mapOptions = {
			...cameraOptions,
			mapId: PUBLIC_MAP_ID
		};
		
		function tweenMap({
			speed = 9000, 
			startTilt = 0 as number,
			startHeading = 0 as number,
			startZoom = 0 as number,
			startLat = -8.6213817,
			startLng = 115.0851476,
			endTilt = 0 as number,
			endHeading = 0 as number,
			endZoom = 0 as number,
			endLat = -8.6213817,
			endLng = 115.0851476
		}) {
			const cameraOptions = {
				tilt: startTilt,
				heading: startHeading,
				zoom: startZoom,
				center: { lat: startLat, lng: startLng }
			}
			new Tween(cameraOptions) // Create a new tween that modifies 'cameraOptions'.
				.to({ tilt: endTilt, heading: endHeading, zoom: endZoom, center: { lat: endLat, lng: endLng } }, speed) // Move to destination in speed second.
				.easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
				.onUpdate(() => {
					gMaps.moveCamera(cameraOptions);
				})
				.start(); // Start the tween immediately.

			// Setup the animation loop.
			function animate(time: number) {
				requestAnimationFrame(animate);
				update(time);
			}

			requestAnimationFrame(animate);
		}

		async function initMap(): Promise<void> {
			const apiLoader = new Loader({
				apiKey: PUBLIC_API_KEY_GMAPS,
				version: "beta"
			});
			await apiLoader.load();
			gmapready = true
			gMaps = new google.maps.Map(mapHolder, mapOptions
			);

			tweenMap({
				speed: 9000, 
				startTilt: 0,
				startHeading: 0,
				startZoom: 9,
				startLat: -8.6213817,
				startLng: 115.0851476,
				endTilt: 65,
				endHeading: 90,
				endZoom: 18,
				endLat: -8.4959826,
				endLng: 115.2485298
			})
		}

    (async () => {
			await initMap();
			setTimeout(
				function(){ tweenMap({
				speed: 9000, 
				startTilt: 65,
				startHeading: 90,
				startZoom: 18,
				startLat: -8.4959826,
				startLng: 115.2485298,
				endTilt: 0,
				endHeading: 0,
				endZoom: 15,
				endLat: -8.4959826,
				endLng: 115.2485298
			}); }
			, 11000);
			setTimeout(
				function(){ tweenMap({
				speed: 9000, 
				startTilt: 0,
				startHeading: 0,
				startZoom: 15,
				startLat: -8.4959826,
				startLng: 115.2485298,
				endTilt: 65,
				endHeading: 90,
				endZoom: 18,
				endLat: -8.5965254,
				endLng: 115.2781208
			}); }
			, 23000);
    })();

	})
</script>

<div class="container mx-auto p-8 space-y-8">
	{#if gmapready }
		<p>Hello</p>
	{/if}
	<div style="height: 500px" bind:this={mapHolder}></div>
	<hr />
	<section class="card card-body">
		<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
	</section>
</div>