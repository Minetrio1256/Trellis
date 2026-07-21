import { defineStore } from "pinia";
import { ref } from "vue";


export const useAuthStore = defineStore("auth", () => {

    const loading = ref(true);
    const authenticated = ref(false);
    const user = ref(null);


    async function check() {

        try {

            const res = await fetch(
                "/api/auth/me",
                {
                    credentials: "include"
                }
            );


            if (!res.ok) {
                throw new Error();
            }


            const data = await res.json();

            authenticated.value = true;
            user.value = data.user;


        } catch {

            authenticated.value = false;
            user.value = null;

        } finally {

            loading.value = false;

        }
    }


    return {
        loading,
        authenticated,
        user,
        check
    };

});