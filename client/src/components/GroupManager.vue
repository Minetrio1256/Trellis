<script setup>

import { ref, computed, onMounted } from "vue";
import Permission from "../permissions.js";


const groups = ref([]);

const selected = ref(null);

const editing = ref(false);

const creating = ref(false);

const loading = ref(false);

const error = ref("");


const form = ref({

  name: "",
  description: "",
  permissions: [],
  discord_role_id: ""

});


const permissionInput = ref("");

const permissionSuggestions = computed(() => {

  const input =
      permissionInput.value
          .trim()
          .toLowerCase();

  return Object.values(Permission)

      .filter(permission =>
          !form.value.permissions.includes(permission)
      )

      .filter(permission => {

        if (!input)
          return true;

        return permission
            .toLowerCase()
            .includes(input);

      });

});


async function api(url, options = {}) {

  return fetch(url, {

    credentials: "include",

    ...options,

    headers: {

      "Content-Type": "application/json",

      ...(options.headers || {})

    }

  });

}


async function loadGroups() {

  loading.value = true;

  error.value = "";

  try {

    const res = await api(
        "/api/groups"
    );

    if (!res.ok)
      throw new Error(
          "Failed loading groups"
      );

    groups.value =
        await res.json();

  }

  catch(err) {

    error.value = err.message;

  }

  finally {

    loading.value = false;

  }

}


async function selectGroup(group) {

  error.value = "";

  const res = await api(
      `/api/groups/${group.uuid}`
  );

  if (!res.ok) {

    error.value =
        "Failed loading group";

    return;

  }

  selected.value =
      await res.json();

  form.value = {

    name: selected.value.name ?? "",

    description:
        selected.value.description ?? "",

    permissions: [
      ...(selected.value.permissions ?? [])
    ],

    discord_role_id:
        selected.value.discord_role_id ?? ""

  };

  permissionInput.value = "";

  editing.value = true;

  creating.value = false;

}


function newGroup() {

  selected.value = null;

  form.value = {

    name: "",

    description: "",

    permissions: [],

    discord_role_id: ""

  };

  permissionInput.value = "";

  creating.value = true;

  editing.value = true;

}


function addPermission(permission = null) {

  const value = (
      permission ??
      permissionInput.value
  ).trim();

  if (!value)
    return;

  if (
      !form.value.permissions.includes(
          value
      )
  ) {

    form.value.permissions.push(
        value
    );

  }

  permissionInput.value = "";

}


function removePermission(permission) {

  form.value.permissions =
      form.value.permissions.filter(
          p => p !== permission
      );

}


function clearPermissionInput() {

  permissionInput.value = "";

}


async function saveGroup() {

  error.value = "";

  let url = "/api/groups";

  let method = "POST";

  if (selected.value) {

    url =
        `/api/groups/${selected.value.uuid}`;

    method = "PATCH";

  }

  const res = await api(

      url,

      {

        method,

        body: JSON.stringify({

          name: form.value.name,

          description:
          form.value.description,

          permissions:
          form.value.permissions,

          discord_role_id:
              form.value.discord_role_id || null

        })

      }

  );


  if (!res.ok) {

    error.value =
        "Failed saving group";

    return;

  }


  editing.value = false;

  creating.value = false;

  permissionInput.value = "";

  await loadGroups();

}


async function deleteGroup() {

  if (!selected.value)
    return;


  if (
      !confirm(
          "Delete this group?"
      )
  )
    return;


  const res = await api(

      `/api/groups/${selected.value.uuid}`,

      {

        method: "DELETE"

      }

  );


  if (!res.ok) {

    error.value =
        "Failed deleting group";

    return;

  }


  selected.value = null;

  editing.value = false;

  creating.value = false;

  await loadGroups();

}


onMounted(() => {

  loadGroups();

});

</script>


<template>

  <div class="group-manager">

    <div class="columns">

      <!-- GROUP LIST -->

      <fieldset class="list">

        <legend>
          Groups
        </legend>


        <button
            class="new"
            @click="newGroup"
        >
          New
        </button>


        <div v-if="loading">

          Loading...

        </div>


        <div
            v-for="group in groups"
            :key="group.uuid"
            class="group-item"
            @click="selectGroup(group)"
        >

          <img
              src="https://win98icons.alexmeub.com/icons/png/user_computer_pair-0.png"
          >

          {{ group.name }}

        </div>

      </fieldset>


      <!-- EDITOR -->

      <fieldset class="editor">

        <legend>

          {{
            creating
                ? "New Group"
                : "Group Details"
          }}

        </legend>


        <template v-if="editing">

          <label>
            Name
          </label>

          <input
              v-model="form.name"
          >


          <label>
            Description
          </label>

          <textarea
              v-model="form.description"
          />


          <label>
            Discord Role ID
          </label>

          <input
              v-model="form.discord_role_id"
          >


          <label>
            Permissions
          </label>


          <div class="permission-editor">

            <div class="permission-input-row">

              <input
                  v-model="permissionInput"
                  placeholder="Search permissions..."
                  autocomplete="off"
                  @keyup.enter="addPermission()"
              >

              <button
                  @click="addPermission()"
              >
                Add
              </button>

            </div>


            <!-- PERMISSION SUGGESTIONS -->

            <div
                v-if="permissionInput || permissionSuggestions.length"
                class="permission-suggestions"
            >

              <button
                  v-for="permission in permissionSuggestions"
                  :key="permission"
                  type="button"
                  class="permission-suggestion"
                  @click="addPermission(permission)"
              >

                {{ permission }}

              </button>


              <div
                  v-if="permissionSuggestions.length === 0"
                  class="no-suggestions"
              >

                No matching permissions.

              </div>

            </div>

          </div>


          <!-- CURRENT PERMISSIONS -->

          <div class="permission-list">

            <div
                v-for="permission in form.permissions"
                :key="permission"
                class="permission-item"
            >

              <span>
                {{ permission }}
              </span>

              <button
                  type="button"
                  @click="removePermission(permission)"
              >
                X
              </button>

            </div>

          </div>


          <div class="permission-hint">

            {{ form.permissions.length }}
            permission{{ form.permissions.length === 1 ? "" : "s" }}

          </div>


          <button
              @click="saveGroup"
          >
            Save
          </button>


          <button
              v-if="selected"
              @click="deleteGroup"
          >
            Delete
          </button>

        </template>


        <p v-else>

          Select a group.

        </p>

      </fieldset>

    </div>


    <div
        v-if="error"
        class="error"
    >

      {{ error }}

    </div>


    <div class="status-bar">

      <p class="status-bar-field">

        Group Manager

      </p>


      <p class="status-bar-field">

        Ready

      </p>

    </div>

  </div>

</template>


<style scoped>

.group-manager {

  width: 100%;

}


.columns {

  display: flex;

  gap: 10px;

}


.list {

  width: 220px;

}


.editor {

  flex: 1;

}


.group-item {

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 4px;

  cursor: pointer;

}


.group-item:hover {

  background: #000080;

  color: white;

}


.group-item img {

  width: 20px;

  height: 20px;

}


input,
textarea {

  width: 100%;

  box-sizing: border-box;

  margin-bottom: 8px;

}


textarea {

  height: 80px;

}


.new {

  margin-bottom: 10px;

}


/*
 * Permission editor
 */

.permission-editor {

  position: relative;

}


.permission-input-row {

  display: flex;

  gap: 4px;

}


.permission-input-row input {

  flex: 1;

}


.permission-suggestions {

  position: absolute;

  z-index: 100;

  left: 0;

  right: 0;

  max-height: 180px;

  overflow-y: auto;

  background: #fff;

  color: #000;

  border: 2px solid;

  border-color: #808080 #fff #fff #808080;

  padding: 2px;

  box-sizing: border-box;

}


.permission-suggestion {

  display: block;

  width: 100%;

  border: 0;

  background: transparent;

  text-align: left;

  padding: 3px 5px;

  cursor: pointer;

  font-family: inherit;

}


.permission-suggestion:hover {

  background: #000080;

  color: white;

}


.no-suggestions {

  padding: 4px;

  color: #555;

}


/*
 * Selected permissions
 */

.permission-list {

  margin-top: 10px;

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.permission-item {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 3px 4px;

  background: #eee;

  border: 1px solid #999;

}


.permission-item button {

  min-width: 22px;

  padding: 1px 4px;

}


.permission-hint {

  margin: 5px 0 10px;

  color: #555;

  font-size: 11px;

}


.error {

  margin-top: 8px;

  color: #800000;

  padding: 4px;

}

</style>