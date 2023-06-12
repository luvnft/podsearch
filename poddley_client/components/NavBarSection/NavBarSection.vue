<template>
  <nav class="navbar navbar-light navbar-expand-md tw-py-1.5 tw-shadow tw-shadow-slate-200 md:tw-py-3">
    <div class="container-fluid mb-1 tw-max-w-screen-2xl tw-px-2.5 md:tw-px-5">
      <div class="row g-0 w-100">
        <div class="col d-flex align-items-center justify-content-center tw-p-2 md:tw-justify-start">
          <NavTitle />
        </div>
        <div class="col d-flex align-items-center tw-justify-center tw-gap-1.5 md:tw-justify-start">
          <SearchBoxSection />
          <ButtonsContactButton />
          <a href="https://www.buymeacoffee.com/poddley" title="donateLink">
            <ButtonsDonateButton />
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>
