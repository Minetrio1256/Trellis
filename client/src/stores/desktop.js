import { defineStore } from "pinia";
import { ref } from "vue";

export const useDesktopStore = defineStore("desktop", () => {

    const windows = ref([]);

    let nextZ = 10;

    function title(id) {

        switch (id) {

            case "users":
                return "User Manager";

            case "groups":
                return "Group Manager";

            default:
                return id;
        }

    }

    function icon(id) {

        switch (id) {

            case "users":
                return "https://win98icons.alexmeub.com/icons/png/user_computer-1.png";

            case "groups":
                return "https://win98icons.alexmeub.com/icons/png/user_computer_pair-0.png";

            default:
                return "";
        }

    }

    function activate(id) {

        windows.value.forEach(w => w.active = false);

        const win = windows.value.find(w => w.id === id);

        if (!win) return;

        win.active = true;
        win.z = ++nextZ;

    }

    function open(id) {

        const existing = windows.value.find(w => w.id === id);

        if (existing) {

            existing.minimized = false;

            activate(id);

            return;

        }

        windows.value.push({

            id,

            title: title(id),

            icon: icon(id),

            minimized: false,

            active: true,

            x: 120 + windows.value.length * 25,

            y: 70 + windows.value.length * 25,

            width: 520,

            height: 420,

            z: ++nextZ

        });

        activate(id);

    }

    function close(id) {

        windows.value = windows.value.filter(w => w.id !== id);

    }

    function minimize(id) {

        const win = windows.value.find(w => w.id === id);

        if (!win) return;

        win.minimized = true;
        win.active = false;

    }

    function toggle(id) {

        const win = windows.value.find(w => w.id === id);

        if (!win) return;

        if (win.minimized) {

            win.minimized = false;

            activate(id);

        } else {

            minimize(id);

        }

    }

    return {

        windows,

        open,
        close,
        activate,
        minimize,
        toggle

    };

});