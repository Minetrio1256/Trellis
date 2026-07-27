<script setup>

import { ref } from "vue";


const userId = ref("");

const user = ref(null);

const userGroups = ref([]);

const availableGroups = ref([]);

const permissions = ref([]);


const loading = ref(false);

const saving = ref(false);

const error = ref("");



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



async function loadUser() {


  if (!userId.value)
    return;


  loading.value = true;

  error.value = "";


  try {


    const userRes = await api(
        `/api/users/${userId.value}`
    );


    if (!userRes.ok)
      throw new Error("User not found");


    user.value = await userRes.json();



    const groupsRes = await api(
        `/api/users/${userId.value}/groups`
    );


    if (!groupsRes.ok)
      throw new Error("Failed loading groups");


    userGroups.value =
        await groupsRes.json();



    const allGroupsRes = await api(
        "/api/groups"
    );


    if (!allGroupsRes.ok)
      throw new Error("Failed loading group list");


    availableGroups.value =
        await allGroupsRes.json();



    const permissionRes = await api(
        `/api/users/${userId.value}/permissions`
    );


    if (permissionRes.ok) {

      permissions.value =
          await permissionRes.json();

    }



  }

  catch(err) {

    error.value = err.message;

    user.value = null;

  }

  finally {

    loading.value = false;

  }

}



function groupId(group) {

  /*
      Handles both possible backend formats:

      ["uuid1","uuid2"]

      or

      [
          {
              uuid:"uuid1"
          }
      ]
  */

  return typeof group === "string"
      ? group
      : group.uuid;

}



function hasGroup(uuid) {


  return userGroups.value.some(
      group => groupId(group) === uuid
  );


}



function toggleGroup(uuid) {


  const exists = hasGroup(uuid);


  if (exists) {


    userGroups.value =
        userGroups.value.filter(
            group => groupId(group) !== uuid
        );


  }

  else {


    userGroups.value.push(uuid);


  }


}



async function saveGroups() {


  saving.value = true;


  error.value = "";


  try {


    const response = await api(

        `/api/users/${userId.value}/groups`,

        {

          method:"PUT",

          body:JSON.stringify(

              userGroups.value.map(
                  group => groupId(group)
              )

          )

        }

    );


    if (!response.ok)

      throw new Error(
          "Failed saving groups"
      );


  }

  catch(err) {


    error.value = err.message;


  }

  finally {


    saving.value = false;


  }


}



</script>


<template>

  <div>


    <fieldset>

      <legend>
        User Lookup
      </legend>


      <div class="field-row">


        <input

            v-model="userId"

            placeholder="Discord User ID"

        >


        <button
            @click="loadUser"
        >
          Load
        </button>


      </div>


    </fieldset>



    <br>



    <div v-if="loading">

      Loading...

    </div>



    <div v-else-if="error">

      <strong>
        {{ error }}
      </strong>

    </div>



    <template v-else-if="user">


      <fieldset>


        <legend>
          User
        </legend>


        <p>

          <b>ID:</b>

          {{ user.id }}

        </p>


        <p v-if="user.created_at">

          <b>Created:</b>

          {{ new Date(user.created_at).toLocaleString() }}

        </p>


      </fieldset>



      <br>



      <fieldset>


        <legend>
          Groups
        </legend>


        <div

            v-for="group in availableGroups"

            :key="group.uuid"

        >

          <label>


            <input

                type="checkbox"

                :checked="hasGroup(group.uuid)"

                @change="
                            toggleGroup(group.uuid)
                        "

            >


            {{ group.name }}


          </label>


        </div>


      </fieldset>



      <br>



      <fieldset>


        <legend>
          Calculated Permissions
        </legend>


        <ul>

          <li
              v-for="permission in permissions"
              :key="permission"
          >

            {{ permission }}

          </li>

        </ul>


      </fieldset>



      <button

          @click="saveGroups"

          :disabled="saving"

      >

        {{ saving ? "Saving..." : "Save Groups" }}


      </button>


    </template>


  </div>

</template>


<style scoped>

.field-row {

  display:flex;

  gap:8px;

  align-items:center;

}


fieldset {

  padding:10px;

}


label {

  display:block;

  margin:5px 0;

}

</style>