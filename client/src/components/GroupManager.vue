<script setup>

import {
  ref,
  computed,
  onMounted
} from "vue";

import Permission from "../permissions.js";


const groups = ref([]);

const users = ref([]);

const selected = ref(null);

const editing = ref(false);

const creating = ref(false);

const loading = ref(false);

const loadingUsers = ref(false);

const loadingMembers = ref(false);

const error = ref("");

const memberProfiles = ref(new Map());


const form = ref({

  name: "",

  description: "",

  permissions: [],

  discord_role_id: ""

});


const selectedPermission = ref("");

const selectedUser = ref("");


/*
 * All permissions from permissions.js.
 *
 * Anything already assigned is removed
 * from the native select.
 */

const availablePermissions = computed(() => {

  return Object.values(Permission).filter(
      permission =>
          !form.value.permissions.includes(permission)
  );

});


/*
 * IDs of users currently in the group.
 */

const memberIds = computed(() => {

  if (!selected.value)
    return new Set();

  return new Set(
      (selected.value.members ?? []).map(
          member => String(
              typeof member === "object"
                  ? member.id
                  : member
          )
      )
  );

});


/*
 * Users available to add.
 */

const availableUsers = computed(() => {

  return users.value.filter(
      user =>
          !memberIds.value.has(
              String(user.id)
          )
  );

});


/*
 * API helper.
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
 * Load global groups.
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
 * Load all users known to the application.
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
 * Resolve a Discord user.
 *
 * The database only stores the Discord ID,
 * so ask the backend for the Discord profile.
 */

async function loadDiscordProfile(userId) {

  const id = String(userId);

  if (memberProfiles.value.has(id)) {

    return memberProfiles.value.get(id);

  }

  try {

    const res = await api(
        `/api/users/${encodeURIComponent(id)}/discord`
    );

    if (!res.ok) {

      return {
        id,
        username: id
      };

    }

    const profile =
        await res.json();

    const profiles =
        new Map(memberProfiles.value);

    profiles.set(
        id,
        profile
    );

    memberProfiles.value =
        profiles;

    return profile;

  }
  catch {

    return {
      id,
      username: id
    };

  }

}


/*
 * Load the members of a group.
 *
 * This intentionally uses the dedicated
 * /groups/:uuid/users endpoint.
 */

async function loadGroupMembers(groupUuid) {

  loadingMembers.value = true;

  try {

    const res = await api(
        `/api/groups/${groupUuid}/users`
    );

    if (!res.ok) {

      throw new Error(
          "Failed loading group members"
      );

    }

    const members =
        await res.json();

    /*
     * Normalize whatever the backend returns.
     *
     * Supports:
     *
     * ["123", "456"]
     *
     * or:
     *
     * [{ id: "123" }, { id: "456" }]
     */

    const normalized =
        members.map(member => {

          if (
              typeof member === "string" ||
              typeof member === "number"
          ) {

            return {
              id: String(member)
            };

          }

          return {
            ...member,
            id: String(member.id)
          };

        });


    selected.value = {

      ...selected.value,

      members: normalized

    };


    /*
     * Resolve Discord profiles.
     *
     * 100 users max is completely reasonable
     * for this internal tool.
     */

    await Promise.all(

        normalized.map(
            member =>
                loadDiscordProfile(member.id)
        )

    );

  }
  catch (err) {

    error.value =
        err.message;

  }
  finally {

    loadingMembers.value = false;

  }

}


/*
 * Select a group.
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

  const data =
      await res.json();


  selected.value = {

    ...data,

    members: []

  };


  form.value = {

    name:
        data.name ?? "",

    description:
        data.description ?? "",

    permissions: [
      ...(data.permissions ?? [])
    ],

    discord_role_id:
        data.discord_role_id ?? ""

  };


  selectedPermission.value = "";

  selectedUser.value = "";

  editing.value = true;

  creating.value = false;


  await loadGroupMembers(
      data.uuid
  );

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
 * Add a permission.
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
 * Remove a permission.
 */

function removePermission(permission) {

  form.value.permissions =
      form.value.permissions.filter(
          p => p !== permission
      );

}


/*
 * Add a user to the selected group.
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

      `/api/groups/${selected.value.uuid}/users/${encodeURIComponent(userId)}`,

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


  await loadGroupMembers(
      selected.value.uuid
  );

}


/*
 * Remove a user from the selected group.
 */

async function removeUser(user) {

  if (!selected.value)
    return;


  const userId =
      String(
          typeof user === "object"
              ? user.id
              : user
      );


  const name =
      getUserName(user);


  if (
      !confirm(
          `Remove ${name} from this group?`
      )
  ) {

    return;

  }


  error.value = "";


  const res = await api(

      `/api/groups/${selected.value.uuid}/users/${encodeURIComponent(userId)}`,

      {

        method: "DELETE"

      }

  );


  if (!res.ok) {

    error.value =
        "Failed removing user from group";

    return;

  }


  await loadGroupMembers(
      selected.value.uuid
  );

}


/*
 * Get a user profile.
 */

function getProfile(user) {

  const id =
      String(
          typeof user === "object"
              ? user.id
              : user
      );

  return (
      memberProfiles.value.get(id) ??
      null
  );

}


/*
 * Display name for a user.
 */

function getUserName(user) {

  const id =
      String(
          typeof user === "object"
              ? user.id
              : user
      );


  const profile =
      getProfile(user);


  if (!profile)
    return id;


  return (
      profile.global_name ??
      profile.username ??
      id
  );

}


/*
 * Display name + Discord ID.
 */

function getUserDisplay(user) {

  const id =
      String(
          typeof user === "object"
              ? user.id
              : user
      );


  const profile =
      getProfile(user);


  if (!profile)
    return id;


  const name =
      profile.global_name ??
      profile.username ??
      id;


  return `${name} (${id})`;

}


/*
 * Save group.
 */

async function saveGroup() {

  error.value = "";


  let url =
      "/api/groups";

  let method =
      "POST";


  if (selected.value) {

    url =
        `/api/groups/${selected.value.uuid}`;

    method =
        "PATCH";

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


  /*
   * If this was a new group, the API returns
   * its UUID. Reload the groups and leave the
   * user in the normal group-manager flow.
   */

  if (method === "POST") {

    const data =
        await res.json();

    editing.value = false;

    creating.value = false;

    selectedPermission.value = "";

    selectedUser.value = "";

    await loadGroups();

    const newGroupData =
        groups.value.find(
            group =>
                group.uuid === data.uuid
        );

    if (newGroupData) {

      await selectGroup(
          newGroupData
      );

    }

    return;

  }


  editing.value = false;

  creating.value = false;

  selectedPermission.value = "";

  selectedUser.value = "";


  await loadGroups();


  if (selected.value) {

    const updated =
        groups.value.find(
            group =>
                group.uuid === selected.value.uuid
        );

    if (updated) {

      await selectGroup(
          updated
      );

    }

  }

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


      <!-- ========================= -->
      <!-- GROUP LIST -->
      <!-- ========================= -->

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
            v-else-if="groups.length === 0"
            class="empty"
        >

          No groups.

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

          <span>
            {{ group.name }}
          </span>

        </div>

      </fieldset>


      <!-- ========================= -->
      <!-- EDITOR -->
      <!-- ========================= -->

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


          <!-- ========================= -->
          <!-- PERMISSIONS -->
          <!-- ========================= -->

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
                :disabled="!selectedPermission"
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
                  @click="removePermission(permission)"
              >

                X

              </button>

            </div>


            <div
                v-if="
                form.permissions.length === 0
              "
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


          <!-- ========================= -->
          <!-- MEMBERS -->
          <!-- ========================= -->

          <label>
            Members
          </label>


          <div
              v-if="selected && !creating"
              class="members-section"
          >


            <!-- ADD MEMBER -->

            <div class="member-add">

              <select
                  v-model="selectedUser"
                  class="user-select"
                  :disabled="
                  loadingUsers ||
                  loadingMembers ||
                  availableUsers.length === 0
                "
              >

                <option value="">

                  {{
                    loadingUsers
                        ? "Loading users..."
                        : loadingMembers
                            ? "Loading members..."
                            : availableUsers.length === 0
                                ? "All users are members"
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
                  :disabled="
                  !selectedUser ||
                  loadingMembers
                "
                  @click="addUser"
              >

                Add

              </button>

            </div>


            <!-- CURRENT MEMBERS -->

            <div class="members-list">

              <div
                  v-if="loadingMembers"
                  class="members-loading"
              >

                Loading members...

              </div>


              <div
                  v-for="user in (
                  selected.members ?? []
                )"
                  :key="user.id"
                  class="member-item"
              >

                <span
                    class="member-name"
                    :title="user.id"
                >

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
                  !loadingMembers &&
                  (
                    !selected.members ||
                    selected.members.length === 0
                  )
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


          <!-- ========================= -->
          <!-- ACTIONS -->
          <!-- ========================= -->

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

  box-sizing: border-box;

}


.columns {

  display: flex;

  gap: 10px;

  width: 100%;

  min-width: 0;

}


.list {

  width: 220px;

  min-width: 220px;

  box-sizing: border-box;

}


.editor {

  flex: 1;

  min-width: 0;

  box-sizing: border-box;

}


.group-item {

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 4px;

  cursor: pointer;

  overflow: hidden;

}


.group-item span {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.group-item:hover {

  background: #000080;

  color: white;

}


.group-item img {

  width: 20px;

  height: 20px;

  flex-shrink: 0;

}


.empty {

  padding: 5px;

  color: #666;

}


input,
textarea {

  width: 100%;

  box-sizing: border-box;

  margin-bottom: 8px;

}


textarea {

  height: 80px;

  resize: vertical;

}


/*
 * Native Win98-style select.
 *
 * Do NOT replace this with a custom div.
 * The browser's native select provides
 * the scrollbar/dropdown behavior.
 */

select {

  box-sizing: border-box;

  min-width: 0;

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

  margin-bottom: 6px;

}


.permission-select {

  flex: 1;

  width: 1px;

}


.permission-selector button {

  flex-shrink: 0;

}


/*
 * Assigned permissions.
 */

.selected-permissions {

  border: 2px inset #dfdfdf;

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

  gap: 5px;

  padding: 2px 3px;

  min-height: 20px;

  box-sizing: border-box;

}


.permission-item:hover {

  background: #000080;

  color: white;

}


.permission-item span {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.permission-item button {

  min-width: 22px;

  padding: 1px 4px;

  flex-shrink: 0;

}


.no-permissions {

  padding: 5px;

  color: #666;

  font-size: 11px;

}


.permission-count {

  margin: 3px 0 8px;

  font-size: 11px;

  color: #555;

}


/*
 * Members.
 */

.members-section {

  width: 100%;

  min-width: 0;

  margin-bottom: 8px;

}


.member-add {

  display: flex;

  gap: 4px;

  width: 100%;

  margin-bottom: 6px;

}


.user-select {

  flex: 1;

  width: 1px;

}


.member-add button {

  flex-shrink: 0;

}


.members-list {

  border: 2px inset #dfdfdf;

  background: white;

  padding: 2px;

  min-height: 30px;

  max-height: 120px;

  overflow-y: auto;

  box-sizing: border-box;

}


.members-loading {

  padding: 5px;

  color: #666;

  font-size: 11px;

}


.member-item {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 5px;

  padding: 3px;

  min-height: 22px;

  box-sizing: border-box;

}


.member-item:hover {

  background: #000080;

  color: white;

}


.member-name {

  min-width: 0;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

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
 * Actions.
 */

.actions {

  display: flex;

  gap: 4px;

  margin-top: 8px;

}


/*
 * Error.
 */

.error {

  margin-top: 5px;

  padding: 3px;

  color: #800000;

  overflow-wrap: anywhere;

}

</style>