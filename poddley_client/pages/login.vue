<template>
  <div class="tw-flex tw-min-h-screen tw-flex-col tw-items-center tw-justify-center tw-py-12 sm:tw-px-6 lg:tw-px-8">
    <h2 class="tw-u-text-white tw-my-6 tw-text-center tw-text-3xl tw-font-extrabold">Sign in to continue to Poddley</h2>
    <div class="tw-mt-4 tw-w-1/3">
      <button @click="signInWithGoogle" class="tw-w-full tw-rounded-lg tw-border tw-border-gray-300 tw-bg-white tw-py-2.5 tw-text-sm tw-font-medium tw-text-gray-900 tw-shadow-sm hover:tw-bg-gray-50">
        Log in with Google
      </button>
      <button class="tw-mt-3 tw-w-full tw-rounded-lg tw-bg-black tw-py-2.5 tw-text-sm tw-font-medium tw-text-white tw-shadow-sm hover:tw-bg-gray-700">Log in with ....</button>
      <button @click="signInWithGitHub" class="tw-mt-3 tw-w-full tw-rounded-lg tw-bg-gray-900 tw-py-2.5 tw-text-sm tw-font-medium tw-text-white tw-shadow-sm hover:tw-bg-gray-800">
        Log in with GitHub
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseAuthClient();
const user = useSupabaseUser();
const router = useRouter();

watchEffect(() => {
  if (user.value) {
    //TODO: maybe change this later
    router.push("/");
  }
});

async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });
  console.log(data, error);
}

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  console.log(data, error);
}

async function signout() {
  const { error } = await supabase.auth.signOut();
}
</script>

<style scoped>
.inputContainer {
  display: flex;
  flex-direction: column;
}

input {
  font-size: 1.5em;
}
.buttonContainer {
  display: flex;
  flex-direction: column;
  margin-top: 1em;
}

button {
  margin-bottom: 1em;
  padding: 1em 2em 1em 2em;
}
</style>
