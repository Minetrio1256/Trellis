<script setup>

import { ref, computed, onMounted } from "vue";
import Permission from "../permissions.js";


const groups = ref([]);

const users = ref([]);

const selected = ref(null);

const editing = ref(false);

const creating = ref(false);

const loading = ref(false);

const loadingUsers = ref(false);

const error = ref("");


const form = ref({

  name: "",
  description: "",
  permissions: [],
  discord_role_id: ""

});


const selectedPermission = ref("");

const selectedUser = ref("");


/*
 * Permissions available from permissions.js.
 *
 * Already assigned permissions are removed
 * from the dropdown.
 */

const availablePermissions = computed(() => {

  return Object.values(Permission).filter(
      permission =>
          !form.value.permissions.includes(permission)
  );

});


/*
 * Users who are not currently members
 * of the selected group.
 */

const availableUsers = computed(() => {

  if (!selected.value)
    return users.value;

  const memberIds = new Set(
      selected.value.members?.map(
          member => String(member.id)
      ) ?? []
  );

  return users.value.filter(
      user =>
          !memberIds.has(String(user.id))
  );

});


/*
 * API
 */

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


/*
 * Load groups
 */

async function loadGroups() {

  loading.value = true;

  error.value = "";

  try {

    const res = await api(
        "/api/groups"
    );

    if (!res.ok) {

      throw new Error(
          "Failed loading groups"
      );

    }

    groups.value =
        await res.json();

  }

  catch (err) {

    error.value =
        err.message;

  }

  finally {

    loading.value = false;

  }

}


/*
 * Load users
 */

async function loadUsers() {

  loadingUsers.value = true;

  try {

    const res = await api(
        "/api/users"
    );

    if (!res.ok) {

      throw new Error(
          "Failed loading users"
      );

    }

    users.value =
        await res.json();

  }

  catch (err) {

    error.value =
        err.message;

  }

  finally {

    loadingUsers.value = false;

  }

}


/*
 * Load a group.
 */

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

    name:
        selected.value.name ?? "",

    description:
        selected.value.description ?? "",

    permissions: [
      ...(selected.value.permissions ?? [])
    ],

    discord_role_id:
        selected.value.discord_role_id ?? ""

  };

  selectedPermission.value = "";

  selectedUser.value = "";

  editing.value = true;

  creating.value = false;

}


/*
 * Create a new group.
 */

function newGroup() {

  selected.value = null;

  form.value = {

    name: "",

    description: "",

    permissions: [],

    discord_role_id: ""

  };

  selectedPermission.value = "";

  selectedUser.value = "";

  creating.value = true;

  editing.value = true;

}


/*
 * Add permission.
 */

function addPermission() {

  const permission =
      selectedPermission.value;

  if (!permission)
    return;

  if (
      !form.value.permissions.includes(
          permission
      )
  ) {

    form.value.permissions.push(
        permission
    );

  }

  selectedPermission.value = "";

}


/*
 * Remove permission.
 */

function removePermission(permission) {

  form.value.permissions =
      form.value.permissions.filter(
          p => p !== permission
      );

}


/*
 * Add user to group.
 */

async function addUser() {

  if (!selected.value)
    return;

  if (!selectedUser.value)
    return;

  error.value = "";

  const userId =
      selectedUser.value;

  const res = await api(

      `/api/groups/${selected.value.uuid}/users/${userId}`,

      {

        method: "POST"

      }

  );

  if (!res.ok) {

    error.value =
        "Failed adding user to group";

    return;

  }

  selectedUser.value = "";

  await selectGroup(selected.value);

}


/*
 * Remove user from group.
 */

async function removeUser(user) {

  if (!selected.value)
    return;

  if (
      !confirm(
          `Remove ${getUserName(user)} from this group?`
      )
  ) {

    return;

  }

  error.value = "";

  const res = await api(

      `/api/groups/${selected.value.uuid}/users/${user.id}`,

      {

        method: "DELETE"

      }

  );

  if (!res.ok) {

    error.value =
        "Failed removing user from group";

    return;

  }

  await selectGroup(selected.value);

}


/*
 * User display helpers.
 *
 * Adjust these if your user API exposes
 * a different display-name field.
 */

function getUserName(user) {

  return (
      user.username ??
      user.name ??
      user.global_name ??
      user.id
  );

}


function getUserDisplay(user) {

  const name =
      getUserName(user);

  if (name === String(user.id))
    return name;

  return `${name} (${user.id})`;

}


/*
 * Save group.
 */

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

          name:
          form.value.name,

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

  selectedPermission.value = "";

  selectedUser.value = "";

  await loadGroups();

}


/*
 * Delete group.
 */

async function deleteGroup() {

  if (!selected.value)
    return;


  if (
      !confirm(
          "Delete this group?"
      )
  ) {

    return;

  }


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

  selectedPermission.value = "";

  selectedUser.value = "";

  await loadGroups();

}


/*
 * Initial load.
 */

onMounted(async () => {

  await Promise.all([

    loadGroups(),

    loadUsers()

  ]);

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
            type="button"
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


          <!-- NAME -->

          <label>
            Name
          </label>

          <input
              v-model="form.name"
          >


          <!-- DESCRIPTION -->

          <label>
            Description
          </label>

          <textarea
              v-model="form.description"
          />


          <!-- DISCORD ROLE -->

          <label>
            Discord Role ID
          </label>

          <input
              v-model="form.discord_role_id"
          >


          <!-- PERMISSIONS -->

          <label>
            Permissions
          </label>


          <div class="permission-selector">

            <select
                v-model="selectedPermission"
                class="permission-select"
            >

              <option value="">

                Select permission...

              </option>


              <option
                  v-for="permission in availablePermissions"
                  :key="permission"
                  :value="permission"
              >

                {{ permission }}

              </option>

            </select>


            <button
                type="button"
                @click="addPermission"
            >

              Add

            </button>

          </div>


          <div class="selected-permissions">

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
                  @click="
                    removePermission(permission)
                  "
              >

                X

              </button>

            </div>


            <div
                v-if="form.permissions.length === 0"
                class="no-permissions"
            >

              No permissions assigned.

            </div>

          </div>


          <div class="permission-count">

            {{ form.permissions.length }}
            permission{{
              form.permissions.length === 1
                  ? ""
                  : "s"
            }}

          </div>


          <!-- MEMBERS -->

          <label>
            Members
          </label>


          <div
              v-if="selected && !creating"
              class="members-section"
          >

            <!-- ADD USER -->

            <div class="member-add">

              <select
                  v-model="selectedUser"
                  class="user-select"
                  :disabled="loadingUsers"
              >

                <option value="">

                  {{
                    loadingUsers
                        ? "Loading users..."
                        : "Select user..."
                  }}

                </option>


                <option
                    v-for="user in availableUsers"
                    :key="user.id"
                    :value="user.id"
                >

                  {{ getUserDisplay(user) }}

                </option>

              </select>


              <button
                  type="button"
                  :disabled="!selectedUser"
                  @click="addUser"
              >

                Add

              </button>

            </div>


            <!-- CURRENT MEMBERS -->

            <div class="members-list">

              <div
                  v-for="user in (selected.members ?? [])"
                  :key="user.id"
                  class="member-item"
              >

                <span>

                  {{ getUserDisplay(user) }}

                </span>


                <button
                    type="button"
                    @click="removeUser(user)"
                >

                  Remove

                </button>

              </div>


              <div
                  v-if="
                    !selected.members ||
                    selected.members.length === 0
                  "
                  class="no-members"
              >

                No users in this group.

              </div>

            </div>

          </div>


          <div
              v-else-if="creating"
              class="new-group-members"
          >

            Save the group first to add members.

          </div>


          <!-- ACTIONS -->

          <div class="actions">

            <button
                type="button"
                @click="saveGroup"
            >

              Save

            </button>


            <button
                v-if="selected"
                type="button"
                @click="deleteGroup"
            >

              Delete

            </button>

          </div>


        </template>


        <p v-else>

          Select a group.

        </p>


      </fieldset>

    </div>


    <!-- ERROR -->

    <div
        v-if="error"
        class="error"
    >

      {{ error }}

    </div>


    <!-- STATUS BAR -->

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

  min-width: 220px;

}


.editor {

  flex: 1;

  min-width: 0;

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
 * Permission selector
 */

.permission-selector {

  display: flex;

  gap: 4px;

  width: 100%;

  box-sizing: border-box;

  margin-bottom: 8px;

}


.permission-select {

  flex: 1;

  min-width: 0;

}


/*
 * Selected permissions
 */

.selected-permissions {

  border: 1px solid #808080;

  background: white;

  padding: 2px;

  min-height: 30px;

  max-height: 100px;

  overflow-y: auto;

  box-sizing: border-box;

}


.permission-item {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 2px 3px;

  min-height: 20px;

  box-sizing: border-box;

}


.permission-item:hover {

  background: #000080;

  color: white;

}


.permission-item button {

  min-width: 22px;

  padding: 1px 4px;

}


.no-permissions {

  padding: 5px;

  color: #666;

  font-size: 11px;

}


.permission-count {

  margin: 4px 0 8px;

  font-size: 11px;

  color: #555;

}


/*
 * Members
 */

.members-section {

  margin-bottom: 10px;

}


.member-add {

  display: flex;

  gap: 4px;

  margin-bottom: 6px;

}


.user-select {

  flex: 1;

  min-width: 0;

}


.members-list {

  border: 1px solid #808080;

  background: white;

  padding: 2px;

  min-height: 30px;

  max-height: 120px;

  overflow-y: auto;

}


.member-item {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 5px;

  padding: 3px;

}


.member-item:hover {

  background: #000080;

  color: white;

}


.member-item button {

  flex-shrink: 0;

}


.no-members {

  padding: 5px;

  color: #666;

  font-size: 11px;

}


.new-group-members {

  padding: 5px 0;

  color: #666;

  font-size: 11px;

}


/*
 * Actions
 */

.actions {

  display: flex;

  gap: 4px;

  margin-top: 8px;

}


/*
 * Error
 */

.error {

  margin-top: 5px;

  padding: 3px;

  color: #800000;

}

</style>