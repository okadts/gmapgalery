<script lang='ts'>
	import { Easing, Tween, update } from '@tweenjs/tween.js';
	import { onMount } from 'svelte';
	import { PUBLIC_MAP_ID, PUBLIC_API_KEY_GMAPS } from '$env/static/public';
	import { Loader } from '@googlemaps/js-api-loader';
	import { Motion } from 'svelte-motion';
	import mapSceneStore from '$lib/mapSceneStore';
	import { get } from 'svelte/store';
	import { nanoid } from 'nanoid';
	import { tick } from 'svelte';
	import { page } from '$app/stores';

	let gmapready = false; // cek if Google maps loaded
	let mapHolder: HTMLElement; // Hold Google maps data
	let gMaps: google.maps.Map;
	let autocomplete: google.maps.places.Autocomplete;
	let autocompleteHolder: HTMLInputElement;
	
	let sceneId = nanoid()
	if (Object.keys(get(mapSceneStore)).length === 0) {
		$mapSceneStore = {
			[sceneId]: {
				title: 'Menjelajah Bali',
				subText: 'Mari bersama dengan Google Maps Kita explore Bali',
				lat: -8.4431407,
				lng: 115.1933933,
				scene: [
					{
						title: 'Menuju ke Bajra Sandhi',
						subText: 'Monumen terkenal yang penuh dengan ornamen bagi orang Bali, dengan taman berumput di sekitarnya.',
						lat: -8.6717295,
						lng: 115.2317133,
						pic: []						
					},
					{
						title: 'Menuju ke Garuda Wisnu Kencana Cultural Park',
						subText: 'Taman megah yang menampilkan patung Hindu monumental, dengan pertunjukan tari & konser reguler',
						lat: -8.8104175,
						lng: 115.1654099,
						pic: []						
					},
					{
						title: 'Menuju ke Taman Kertha Gosa',
						subText: 'Pura Hindu Bali abad ke-18 dengan cerita dari Bhima Swarga yang dilukis di atap.',
						lat: -8.5362251,
						lng: 115.4011612,
						pic: []						
					},
					{
						title: 'Menuju ke Tanah Lot',
						subText: 'Menikmati Sunset disini sangat bagus!',
						lat: -8.6212065,
						lng: 115.0846145,
						pic: []						
					}
				]
			}
		}
	} else {
		// get any sid query string
		const params = new URLSearchParams($page.url.searchParams)
		if (params.get('sid') && params.get('sid') !== '') {
			sceneId = params.get('sid') as string
		} else {
			sceneId = Object.keys(get(mapSceneStore))[0];
		}
	}

	// handle form editing
	let showFormEdit = false
	let showBottonEdit = true
	let placeDetail = ''
	const addScene = async () => {
		if (!gmapready) return
		sceneId = nanoid()
		$mapSceneStore[sceneId] = {
			title: 'Explore Map',
			subText: 'Explore Bali',
			lat: -8.4431407,
			lng: 115.1933933,
			scene: [
				{
					title: 'Place One',
					subText: 'Place One Desc.',
					lat: -8.6717295,
					lng: 115.2317133,
					pic: []						
				}
			]
		}
		window.history.replaceState({ additionalInformation: 'Updated the URL with Current Scene' }, $mapSceneStore[sceneId].title, `/?sid=${sceneId}`);
		return editScene()
	}
	const editScene = async () => {
		if (!gmapready) return
		doAnim = 0
		showFormEdit = true
		await tick();
		autocomplete = new google.maps.places.Autocomplete(autocompleteHolder, {
			fields: ["formatted_address", "geometry", "name"],
			strictBounds: false,
			types: ["establishment"]
		});
		autocomplete.addListener("place_changed", fillInAddress);

		function fillInAddress() {
			// Get the place details from the autocomplete object.
			const place = autocomplete.getPlace();
			placeDetail = `
			Name: ${place.name}<br />
			Lat: ${place.geometry?.location?.lat()}<br />
			Lng: ${place.geometry?.location?.lng()}<br /><hr style="margin-top: 5px"/>
			`
		}
	}
	const addSubScene = () => {
		$mapSceneStore[sceneId].scene.push({
			title: 'Place One',
			subText: 'Place One Desc.',
			lat: -8.6717295,
			lng: 115.2317133,
			pic: []						
		})
		return tick();
	}
	const finishEditScene = () => {
		if (!gmapready) return
		showFormEdit = false
		doAnim = 1
	}

    const variants = {
        visible: { opacity: 1, x: 0 },
        hidden: { opacity: 0, x: -500 },
    };
	let doAnim = 1
	$: hideSHow = ["hidden", "visible"][doAnim];
	$: currentSceneTitle = ''
	$: currentSceneSubTitle = ''
	$: firstAnim = true
	// animation core
	const tweenMap = ({
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
	}) => {
		if (!gmapready) return
		return new Promise((resolve) => {
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
				.start() // Start the tween immediately.
				.onComplete(() => {
					return resolve('done')
				})

			// Setup the animation loop.
			function animate(time: number) {
				requestAnimationFrame(animate);
				update(time);
			}

			requestAnimationFrame(animate);
		})
		
	}

	// add some delay utility
	const delay = ms => new Promise(res => setTimeout(res, ms))
	// animation schene
	const startMapJourney = (async () => {
		if (!gmapready) return
		let timeOutSpeed = 15000
		let timeOutSpeedReturn = 9000
		// first animation
		doAnim = 0
		firstAnim = false // to hide start button
		showBottonEdit = false
		setTimeout(() => {
			currentSceneTitle = $mapSceneStore[sceneId].scene[0].title
			currentSceneSubTitle = $mapSceneStore[sceneId].scene[0].subText
			doAnim = 1	
		}, 3000)
		console.log('====================== first Animation')
		console.log('Start Move and Zoom In from :', $mapSceneStore[sceneId].lat, $mapSceneStore[sceneId].lng)
		await tweenMap({
			speed: timeOutSpeed, 
			startTilt: 0,
			startHeading: 0,
			startZoom: 10,
			startLat: $mapSceneStore[sceneId].lat,
			startLng: $mapSceneStore[sceneId].lng,
			endTilt: 65,
			endHeading: 90,
			endZoom: 18,
			endLat: $mapSceneStore[sceneId].scene[0].lat,
			endLng: $mapSceneStore[sceneId].scene[0].lng
		});
		console.log('End Move and Zoom In at :', $mapSceneStore[sceneId].scene[0].lat, $mapSceneStore[sceneId].scene[0].lng)
			
		for (let index = 0; index < $mapSceneStore[sceneId].scene.length; index++) {
			const element = $mapSceneStore[sceneId].scene[index];

			setTimeout(() => {
				doAnim = 0
			}, 5000)
			await delay(500);
			
			console.log()
			console.log('====================== Animation loop #' + (index) + ' part a')
			console.log('Start Zoom Out at:', element.lat, element.lng)
			await tweenMap({
				speed: timeOutSpeedReturn, 
				startTilt: 65,
				startHeading: 90,
				startZoom: 18,
				startLat: element.lat,
				startLng: element.lng,
				endTilt: 0,
				endHeading: 0,
				endZoom: 15,
				endLat: element.lat,
				endLng: element.lng
			});
			console.log('End Zoom Out at :', element.lat, element.lng)

			const tweenData = {
				speed: timeOutSpeed, 
				startTilt: 0,
				startHeading: 0,
				startZoom: 15,
				startLat: element.lat,
				startLng: element.lng,
				endTilt: 65,
				endHeading: 90,
				endZoom: 18
			}
			if (index + 1 === $mapSceneStore[sceneId].scene.length) {
				tweenData.speed = timeOutSpeedReturn
				tweenData.endTilt = 0
				tweenData.endHeading = 0
				tweenData.endZoom = 10
				tweenData.endLat = $mapSceneStore[sceneId].lat
				tweenData.endlng = $mapSceneStore[sceneId].lng
				// return back the start button
				setTimeout(() => {
					firstAnim = true
					currentSceneTitle = $mapSceneStore[sceneId].title
					currentSceneSubTitle = $mapSceneStore[sceneId].subText
					doAnim = 1
					showBottonEdit = true
				}, 4000)
			} else {
				tweenData.endLat = $mapSceneStore[sceneId].scene[index + 1].lat
				tweenData.endlng = $mapSceneStore[sceneId].scene[index + 1].lng
				setTimeout(() => {
					currentSceneTitle = $mapSceneStore[sceneId].scene[index + 1].title
					currentSceneSubTitle = $mapSceneStore[sceneId].scene[index + 1].subText
					doAnim = 1
				}, 3000)
			}

			await delay(2000);
			console.log()
			console.log('====================== Animation loop #' + (index) + ' part b') 
			console.log('Start Move and Zoom In from :', tweenData.startLat, tweenData.startLng)
			await tweenMap(tweenData);
			console.log('End Move and Zoom In at :', tweenData.endLat, tweenData.endlng)

		}
			
	});

	/**
	 * Handling Google Map on Client
	 */	
	onMount( async () => {
		// just make sure we use the same scene id when reload
		window.history.replaceState({ additionalInformation: 'Updated the URL with Current Scene' }, $mapSceneStore[sceneId].title, `/?sid=${sceneId}`);

		currentSceneTitle = $mapSceneStore[sceneId].title
		currentSceneSubTitle = $mapSceneStore[sceneId].subText

		// create map options
		const cameraOptions: google.maps.CameraOptions = {
			tilt: 0,
			heading: 0,
			zoom: 10,
			center: {
				lat: $mapSceneStore[sceneId].lat ? $mapSceneStore[sceneId].lat : -8.4431407,
				lng: $mapSceneStore[sceneId].lng ? $mapSceneStore[sceneId].lng : 115.1933933
			}
		};

		const mapOptions = {
			...cameraOptions,
			disableDefaultUI: true,
			mapId: PUBLIC_MAP_ID
		};

		async function initMap(): Promise<void> {
			const apiLoader = new Loader({
				apiKey: PUBLIC_API_KEY_GMAPS,
				version: "weekly",
  				libraries: ["places"]
			});
			await apiLoader.load();
			gMaps = new google.maps.Map(mapHolder, mapOptions);
		}
		
		await initMap();
		gmapready = true;
	})

	/**
	 * Handling Screen Record
	 */
	let videoHolder: HTMLVideoElement;
	let stream: any; // TODO: find this type
	let mediaRecorder: any; // TODO: find this type
	let onRecordStage = false;

	const stopRecord = () => {
		stream.getTracks().forEach((track: any) => track.stop()); // TODO: find this type
		onRecordStage = false;
	}

	const handleRecod = async () => {
		try {

			onRecordStage = true;
			stream = await navigator.mediaDevices.getDisplayMedia({
				audio: true, 
				video: true
			})

			// for better browser support
			const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm"
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: mime
			})

			let chunks = [] as any; // TODO: find this type
			mediaRecorder.addEventListener('dataavailable', function(e: any ) { // TODO: find this type
				chunks.push(e.data)
			})

			mediaRecorder.addEventListener('stop', () => {
				let blob = new Blob(chunks, {
					type: chunks[0].type
				})
				let url = URL.createObjectURL(blob)
				videoHolder.src = url
				
				const timeStamp = new Date().getTime()
				let a = document.createElement('a')
				a.href = url
				a.download = `video-${timeStamp}.webm`
				a.click()
			})

			mediaRecorder.start()

		} catch(err) {
			onRecordStage = false;
			console.error("Error: " + err);
		}
	}
</script>

<div class="relative">
	{#if gmapready}
		<Motion initial="visible" animate={hideSHow} {variants} let:motion>
			<div use:motion class="flex h-screen justify-center items-center absolute m-auto left-0 right-0" style="z-index:25">
				<div class="text-center bg-blue-400 p-2 rounded-tr-lg rounded-bl-lg">
					<h1 class="text-3xl p-2">{ currentSceneTitle }</h1>
					<p class="text-3xl p-2">{ currentSceneSubTitle }</p>
					{#if firstAnim}
						<button class="btn bg-primary-500 btn-base text-white my-2" on:click={startMapJourney}>Lets Go!</button>
					{/if}
			</div>
		</Motion>
	{/if}
  	{#if onRecordStage}
	  <button class="btn bg-primary-500 btn-base text-white fixed bottom-7 right-1" style="z-index:9999; height: 28px;" on:click={stopRecord}>Stop</button>
	{:else}	
		{#if showBottonEdit}
			<div class=" fixed bottom-7 left-1" style="z-index:9999">
				<div class="flex justify-between">
					<div class="flex items-start">
						<button class="btn bg-primary-500 btn-base text-white" style="height: 28px;"  on:click={ editScene }>Map Scene</button>
					</div>
					<button class="btn bg-primary-500 btn-base text-white ml-2" style="height: 28px;"  on:click={ addScene }>Add New</button>
					<select bind:value={sceneId} class="btn bg-primary-500 btn-base text-white ml-2" on:change="{() => window.location.replace(`/?sid=${sceneId}`)}" style="height: 28px;">
						{#each Object.keys($mapSceneStore) as sceneKey}
							<option value={sceneKey}>
								{$mapSceneStore[sceneKey].title}
							</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
		<button class="btn bg-primary-500 btn-base text-white fixed bottom-7 right-1" style="z-index:9999; height: 28px;" on:click={handleRecod}>Record</button>
	{/if}
	<div class="h-screen" style="" bind:this={mapHolder}></div>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video src="" class="invisible" bind:this={videoHolder} width="100%" controls autoplay loop></video>
	{#if showFormEdit}
		<div tabindex="-1" aria-hidden="true" class="overflow-y-scroll overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal max-h-screen md:h-full">
			<div class="relative p-4 w-full max-w-md h-full md:h-auto">
				<!-- Modal content -->
				<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<button type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" on:click="{finishEditScene}">
						<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
						<span class="sr-only">Close modal</span>
					</button>
					<div class="py-6 px-6 lg:px-8">
						<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Update Map Gallery</h3>
						<form class="space-y-6" action="#">
							<div class="sticky top-0 bg-white dark:bg-gray-700">
								<label for="autocompleteHolderT">
									<span>Search Place</span>
									<input type="text" name="autocompleteHolderT" bind:this={autocompleteHolder}>
								</label>
								<p>{@html placeDetail }</p>
							</div>
							<label for="name">
								<span>Title</span>
								<input type="text" name="name" bind:value={$mapSceneStore[sceneId].title} minlength="5" required>
							</label>

							<label for="newSceneSubText">
								<span>Short Desc</span>
								<textarea bind:value={$mapSceneStore[sceneId].subText}></textarea>
							</label>

							<div class="flex justify-between">
								<div class="flex items-start">
									<label for="lat">
										<span>Lat</span>
										<input type="number" id="lat" bind:value={$mapSceneStore[sceneId].lat}>
									</label>
								</div>
								<label for="lat">
									<span>Lng</span>
									<input type="number" id="lat" bind:value={$mapSceneStore[sceneId].lng}>
								</label>
							</div>
							{#each $mapSceneStore[sceneId].scene as { title, subText, lat, lng }, i}
								<fieldset>
									<label for="name">
										<span>Title Scene { i + 1 }&nbsp;<a on:click={addSubScene}>+</a></span>
										<input type="text" name="name" bind:value={$mapSceneStore[sceneId].scene[i].title} minlength="5" required>
									</label>
		
									<label for="newSceneSubText">
										<span>Short Desc Scene { i + 1 }</span>
										<textarea bind:value={$mapSceneStore[sceneId].scene[i].subText}></textarea>
									</label>
		
									<div class="flex justify-between">
										<div class="flex items-start">
											<label for="lat">
												<span>Lat Scene { i + 1 }</span>
												<input type="number" id="lat" bind:value={$mapSceneStore[sceneId].scene[i].lat}>
											</label>
										</div>
										<label for="lat">
											<span>Lng Scene { i + 1 }</span>
											<input type="number" id="lat" bind:value={$mapSceneStore[sceneId].scene[i].lng}>
										</label>
									</div>
								</fieldset>
							{/each}
							<button type="button" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" on:click="{finishEditScene}">Close</button>
							<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
								** all field are required
							</div>
						</form>
					</div>
				</div>
			</div>
		</div> 
	{/if}
</div>
