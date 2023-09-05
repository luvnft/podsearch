<template>
  <div class="bg-white border-gray-200 fixed bottom-0 left-0 z-50  h-24 w-full border-t px-10 flex justify-around">
    <div class="flex w-full items-center">
      <div class="w-full">
        <div class="mx-auto mb-1 flex items-center justify-center">
          <button data-tooltip-target="tooltip-shuffle" type="button" class="group mr-1 rounded-full p-2.5 hover:bg-gray-100 focus:ring-gray-200 focus:outline-none focus:ring-4">
            <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.484 6.166 13 4h6m0 0-3-3m3 3-3 3M1 14h5l1.577-2.253M1 4h5l7 10h6m0 0-3 3m3-3-3-3" />
            </svg>
            <span class="sr-only">Shuffle video</span>
          </button>
          <div
            id="tooltip-shuffle"
            role="tooltip"
            class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
          >
            Shuffle video
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-previous" type="button" class="group rounded-full p-2.5 hover:bg-gray-100 focus:ring-gray-200 focus:outline-none focus:ring-4">
            <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 12 16">
              <path
                d="M10.819.4a1.974 1.974 0 0 0-2.147.33l-6.5 5.773A2.014 2.014 0 0 0 2 6.7V1a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0V9.3c.055.068.114.133.177.194l6.5 5.773a1.982 1.982 0 0 0 2.147.33A1.977 1.977 0 0 0 12 13.773V2.227A1.977 1.977 0 0 0 10.819.4Z"
              />
            </svg>
            <span class="sr-only">Previous video</span>
          </button>
          <div
            id="tooltip-previous"
            role="tooltip"
            class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
          >
            Previous video
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button
            data-tooltip-target="tooltip-pause"
            type="button"
            class="bg-dark-500 group mx-2 inline-flex items-center justify-center rounded-full p-2.5 font-medium hover:bg-gray-700 dark:hover:bg-blue-400 dark:focus:ring-blue-300 focus:ring-gray-300 dark:bg-blue-500 bg-gray-500 focus:outline-none focus:ring-4"
          >
            <svg class="text-white h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 10 16">
              <path
                fill-rule="evenodd"
                d="M0 .8C0 .358.32 0 .714 0h1.429c.394 0 .714.358.714.8v14.4c0 .442-.32.8-.714.8H.714a.678.678 0 0 1-.505-.234A.851.851 0 0 1 0 15.2V.8Zm7.143 0c0-.442.32-.8.714-.8h1.429c.19 0 .37.084.505.234.134.15.209.354.209.566v14.4c0 .442-.32.8-.714.8H7.857c-.394 0-.714-.358-.714-.8V.8Z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="sr-only">Pause video</span>
          </button>
          <div
            id="tooltip-pause"
            role="tooltip"
            class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
          >
            Pause video
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-next" type="button" class="group mr-1 rounded-full p-2.5 hover:bg-gray-100 focus:ring-gray-200 focus:outline-none focus:ring-4">
            <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 12 16">
              <path
                d="M11 0a1 1 0 0 0-1 1v5.7a2.028 2.028 0 0 0-.177-.194L3.33.732A2 2 0 0 0 0 2.227v11.546A1.977 1.977 0 0 0 1.181 15.6a1.982 1.982 0 0 0 2.147-.33l6.5-5.773A1.88 1.88 0 0 0 10 9.3V15a1 1 0 1 0 2 0V1a1 1 0 0 0-1-1Z"
              />
            </svg>
            <span class="sr-only">Next video</span>
          </button>
          <div
            id="tooltip-next"
            role="tooltip"
            class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
          >
            Next video
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-restart" type="button" class="group mr-1 rounded-full p-2.5 hover:bg-gray-100 focus:ring-gray-200 focus:outline-none focus:ring-4">
            <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97" />
            </svg>
            <span class="sr-only">Restart video</span>
          </button>
          <div
            id="tooltip-restart"
            role="tooltip"
            class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
          >
            Restart video
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
        <div class="flex items-center justify-between space-x-2">
          <span class="text-gray-500 text-sm font-medium">3:45</span>
          <div class="bg-gray-200 h-1.5 w-full rounded-full">
            <div class="dark:bg-blue-600 bg-gray-600 h-1.5 rounded-full" style="width: 65%"></div>
          </div>
          <span class="text-gray-500 text-sm font-medium">5:00</span>
        </div>
      </div>
    </div>
    <div class="ml-auto hidden items-center justify-center md:flex">
      <div
        id="tooltip-playlist"
        role="tooltip"
        class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
      >
        View playlist
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
      <div
        id="tooltip-expand"
        role="tooltip"
        class="tooltip text-white bg-gray-700 invisible absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium opacity-0 shadow-sm transition-opacity duration-300"
      >
        Full screen
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
      
    </div>
  </div>
</template>
