<script setup>

import { ref, onMounted } from "vue";


const groups = ref([]);

const selected = ref(null);


const editing = ref(false);

const creating = ref(false);


const loading = ref(false);

const error = ref("");



const form = ref({

  name:"",
  description:"",
  permissions:[],
  discord_role_id:""

});



const permissionInput = ref("");



async function api(url, options = {}) {


  return fetch(url, {

    credentials:"include",

    ...options,

    headers:{

      "Content-Type":"application/json",

      ...(options.headers || {})

    }

  });


}



async function loadGroups() {


  loading.value = true;


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


  const res = await api(
      `/api/groups/${group.uuid}`
  );


  if (!res.ok)
    return;


  selected.value =
      await res.json();


  form.value = {

    name:selected.value.name ?? "",

    description:selected.value.description ?? "",

    permissions:[
      ...(selected.value.permissions ?? [])
    ],

    discord_role_id:
        selected.value.discord_role_id ?? ""

  };


  editing.value = true;

  creating.value = false;

}



function newGroup() {


  selected.value = null;


  form.value = {

    name:"",

    description:"",

    permissions:[],

    discord_role_id:""

  };


  creating.value = true;

  editing.value = true;


}



function addPermission() {


  if (!permissionInput.value)
    return;


  if (
      !form.value.permissions.includes(
          permissionInput.value
      )
  ) {


    form.value.permissions.push(
        permissionInput.value
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



async function saveGroup() {


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

        body:JSON.stringify({

          name:form.value.name,

          description:form.value.description,

          permissions:form.value.permissions,

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

        method:"DELETE"

      }

  );



  if (!res.ok) {


    error.value =
        "Failed deleting group";


    return;

  }



  selected.value = null;


  editing.value = false;


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

          />



          <label>

            Permissions

          </label>


          <div>


            <input

                v-model="permissionInput"

                @keyup.enter="addPermission"

                placeholder="permission"

            >


            <button

                @click="addPermission"

            >

              Add

            </button>


          </div>



          <ul>


            <li

                v-for="permission in form.permissions"

                :key="permission"

            >

              {{ permission }}

              <button

                  @click="removePermission(permission)"

              >

                X

              </button>


            </li>


          </ul>



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

  width:100%;

}



.columns {

  display:flex;

  gap:10px;

}



.list {

  width:220px;

}



.editor {

  flex:1;

}



.group-item {


  display:flex;

  align-items:center;

  gap:8px;


  padding:4px;


  cursor:pointer;


}



.group-item:hover {

  background:#000080;

  color:white;

}



.group-item img {

  width:20px;

  height:20px;

}



input,
textarea {

  width:100%;

  box-sizing:border-box;

  margin-bottom:8px;

}



textarea {

  height:80px;

}



.new {

  margin-bottom:10px;

}



</style>