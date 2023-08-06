<template>
  <div class="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
    <h2 class="u-text-white my-6 text-center text-3xl font-extrabold">Sign in to continue to Poddley</h2>
    <div class="mt-4 w-1/3">
      <button class="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50">
        Log in with Google
      </button>
      <button class="mt-3 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700">Log in with ....</button>
      <button  class="mt-3 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800">
        Log in with GitHub
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
// const supabase = useSupabaseAuthClient();

// async function signInWithGitHub() {
//   const { data, error } = await supabase.auth.signInWithOtp({
//     email: "luka_momcilovic@hotmail.com",
//   });
//   console.log(data, error);
// }

// async function signInWithGoogle() {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       queryParams: {
//         access_type: "offline",
//         prompt: "consent",
//       },
//     },
//   });
//   console.log(data, error);
// }

// async function signout() {
//   const { error } = await supabase.auth.signOut();
// }
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
