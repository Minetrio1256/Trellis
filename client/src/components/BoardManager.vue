<script setup>

import {
  ref,
  onMounted
} from "vue";


const boards = ref([]);

const selected = ref(null);

const editing = ref(false);

const creating = ref(false);

const loading = ref(false);

const error = ref("");


const form = ref({

  name: "",

  description: ""

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
 * Load boards available to the
 * current user.
 */

async function loadBoards() {

  loading.value = true;

  error.value = "";

  try {

    const res = await api(
        "/api/boards"
    );

    if (!res.ok) {

      throw new Error(
          "Failed loading boards"
      );

    }

    boards.value =
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
 * Select a board.
 */

async function selectBoard(board) {

  error.value = "";

  const res = await api(
      `/api/boards/${encodeURIComponent(board.uuid)}`
  );

  if (!res.ok) {

    error.value =
        "Failed loading board";

    return;

  }

  const data =
      await res.json();

  selected.value =
      data;

  form.value = {

    name:
        data.name ?? "",

    description:
        data.description ?? ""

  };

  editing.value = true;

  creating.value = false;

}


/*
 * Start creating a board.
 */

function newBoard() {

  selected.value = null;

  form.value = {

    name: "",

    description: ""

  };

  editing.value = true;

  creating.value = true;

}


/*
 * Cancel editing.
 */

function cancelEdit() {

  selected.value = null;

  editing.value = false;

  creating.value = false;

  form.value = {

    name: "",

    description: ""

  };

}


/*
 * Save board.
 */

async function saveBoard() {

  error.value = "";

  const creatingBoard =
      creating.value;


  let url =
      "/api/boards";

  let method =
      "POST";


  if (!creatingBoard && selected.value) {

    url =
        `/api/boards/${encodeURIComponent(selected.value.uuid)}`;

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
          form.value.description

        })

      }

  );


  if (!res.ok) {

    error.value =
        "Failed saving board";

    return;

  }


  /*
   * New board.
   *
   * POST returns:
   *
   * {
   *     uuid: "..."
   * }
   */

  if (creatingBoard) {

    const data =
        await res.json();

    await loadBoards();

    const newBoardData =
        boards.value.find(
            board =>
                board.uuid === data.uuid
        );

    if (newBoardData) {

      await selectBoard(
          newBoardData
      );

    }
    else {

      cancelEdit();

    }

    return;

  }


  /*
   * Existing board.
   *
   * PATCH returns 204.
   */

  await loadBoards();


  const updated =
      boards.value.find(
          board =>
              board.uuid === selected.value?.uuid
      );


  if (updated) {

    await selectBoard(
        updated
    );

  }
  else {

    cancelEdit();

  }

}


/*
 * Delete board.
 */

async function deleteBoard() {

  if (!selected.value)
    return;


  if (
      !confirm(
          `Delete "${selected.value.name}"?`
      )
  ) {

    return;

  }


  error.value = "";


  const res = await api(

      `/api/boards/${encodeURIComponent(selected.value.uuid)}`,

      {

        method: "DELETE"

      }

  );


  if (!res.ok) {

    error.value =
        "Failed deleting board";

    return;

  }


  cancelEdit();

  await loadBoards();

}


/*
 * Initial load.
 */

onMounted(
    loadBoards
);

</script>


<template>

  <div class="board-manager">

    <div class="columns">


      <!-- ========================= -->
      <!-- BOARD LIST -->
      <!-- ========================= -->

      <fieldset class="list">

        <legend>
          Boards
        </legend>


        <button
            class="new"
            type="button"
            @click="newBoard"
        >

          New

        </button>


        <div v-if="loading">

          Loading...

        </div>


        <div
            v-else-if="boards.length === 0"
            class="empty"
        >

          No boards.

        </div>


        <div
            v-for="board in boards"
            :key="board.uuid"
            class="board-item"
            @click="selectBoard(board)"
        >

          <img
              src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png"
          >

          <span>
                        {{ board.name }}
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
                ? "New Board"
                : "Board Details"
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


          <!-- ACTIONS -->

          <div class="actions">

            <button
                type="button"
                @click="saveBoard"
            >

              Save

            </button>


            <button
                type="button"
                @click="cancelEdit"
            >

              Cancel

            </button>


            <button
                v-if="selected"
                type="button"
                @click="deleteBoard"
            >

              Delete

            </button>

          </div>


        </template>


        <p v-else>

          Select a board.

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

        Board Manager

      </p>


      <p class="status-bar-field">

        {{ boards.length }}
        board{{
          boards.length === 1
              ? ""
              : "s"
        }}

      </p>

    </div>

  </div>

</template>


<style scoped>

.board-manager {

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


.board-item {

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 4px;

  cursor: pointer;

  overflow: hidden;

}


.board-item:hover {

  background: #000080;

  color: white;

}


.board-item span {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.board-item img {

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

  height: 100px;

  resize: vertical;

}


.new {

  margin-bottom: 10px;

}


.actions {

  display: flex;

  gap: 4px;

  margin-top: 8px;

}


.error {

  margin-top: 5px;

  padding: 3px;

  color: #800000;

  overflow-wrap: anywhere;

}

</style>
