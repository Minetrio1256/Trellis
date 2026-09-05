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

const saving = ref(false);

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
 * Load all boards accessible
 * to the current user.
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
        err.message ||
        "Failed loading boards";

  }
  finally {

    loading.value = false;

  }

}


/*
 * Select a board.
 *
 * Fetch the full board from
 * GET /api/boards/:uuid
 */

async function selectBoard(board) {

  error.value = "";

  try {

    const res = await api(

        `/api/boards/${encodeURIComponent(board.uuid)}`

    );


    if (!res.ok) {

      throw new Error(
          "Failed loading board"
      );

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
  catch (err) {

    error.value =
        err.message ||
        "Failed loading board";

  }

}


/*
 * Start creating a new board.
 */

function newBoard() {

  selected.value = null;

  form.value = {

    name: "",

    description: ""

  };


  editing.value = true;

  creating.value = true;

  error.value = "";

}


/*
 * Cancel editing.
 */

function cancelEdit() {

  selected.value = null;

  editing.value = false;

  creating.value = false;

  saving.value = false;

  error.value = "";


  form.value = {

    name: "",

    description: ""

  };

}


/*
 * Save a board.
 *
 * New:
 * POST /api/boards
 *
 * Existing:
 * PATCH /api/boards/:uuid
 */

async function saveBoard() {

  error.value = "";


  if (!form.value.name.trim()) {

    error.value =
        "Board name is required.";

    return;

  }


  saving.value = true;


  try {

    let url =
        "/api/boards";

    let method =
        "POST";


    /*
     * Editing an existing board.
     */

    if (
        !creating.value &&
        selected.value
    ) {

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
                form.value.name.trim(),

            description:
                form.value.description.trim()

          })

        }

    );


    if (!res.ok) {

      if (res.status === 403) {

        throw new Error(
            "You do not have permission to modify this board."
        );

      }


      throw new Error(
          "Failed saving board."
      );

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

    if (method === "POST") {

      const data =
          await res.json();


      await loadBoards();


      /*
       * Find the newly-created board
       * in the refreshed list.
       */

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

    const uuid =
        selected.value.uuid;


    await loadBoards();


    const updated =
        boards.value.find(
            board =>
                board.uuid === uuid
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
  catch (err) {

    error.value =
        err.message ||
        "Failed saving board.";

  }
  finally {

    saving.value = false;

  }

}


/*
 * Delete selected board.
 */

async function deleteBoard() {

  if (!selected.value)
    return;


  const name =
      selected.value.name ||
      "this board";


  if (
      !confirm(
          `Delete "${name}"?`
      )
  ) {

    return;

  }


  error.value = "";

  saving.value = true;


  try {

    const res = await api(

        `/api/boards/${encodeURIComponent(selected.value.uuid)}`,

        {

          method: "DELETE"

        }

    );


    if (!res.ok) {

      if (res.status === 403) {

        throw new Error(
            "You do not have permission to delete this board."
        );

      }


      throw new Error(
          "Failed deleting board."
      );

    }


    cancelEdit();

    await loadBoards();

  }
  catch (err) {

    error.value =
        err.message ||
        "Failed deleting board.";

  }
  finally {

    saving.value = false;

  }

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


    <!-- ========================= -->
    <!-- MAIN COLUMNS -->
    <!-- ========================= -->

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
            :disabled="loading || saving"
            @click="newBoard"
        >

          New

        </button>


        <!-- Loading -->

        <div
            v-if="loading"
            class="empty"
        >

          Loading...

        </div>


        <!-- Empty -->

        <div
            v-else-if="boards.length === 0"
            class="empty"
        >

          No boards.

        </div>


        <!-- Board list -->

        <div
            v-for="board in boards"
            :key="board.uuid"
            class="board-item"
            :class="{
                        selected:
                            selected &&
                            selected.uuid === board.uuid
                    }"
            @click="selectBoard(board)"
        >

          <img
              src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png"
              alt=""
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


          <!-- ========================= -->
          <!-- NAME -->
          <!-- ========================= -->

          <label>

            Name

          </label>


          <input
              v-model="form.name"
              type="text"
              :disabled="saving"
              autocomplete="off"
          >


          <!-- ========================= -->
          <!-- DESCRIPTION -->
          <!-- ========================= -->

          <label>

            Description

          </label>


          <textarea
              v-model="form.description"
              :disabled="saving"
          ></textarea>


          <!-- ========================= -->
          <!-- UUID -->
          <!-- ========================= -->

          <template v-if="selected">

            <label>

              UUID

            </label>


            <input
                :value="selected.uuid"
                type="text"
                readonly
            >

          </template>


          <!-- ========================= -->
          <!-- ACTIONS -->
          <!-- ========================= -->

          <div class="actions">


            <button
                type="button"
                :disabled="
                                saving ||
                                !form.name.trim()
                            "
                @click="saveBoard"
            >

              {{
                saving
                    ? "Saving..."
                    : "Save"
              }}

            </button>


            <button
                type="button"
                :disabled="saving"
                @click="cancelEdit"
            >

              Cancel

            </button>


            <button
                v-if="selected && !creating"
                type="button"
                :disabled="saving"
                @click="deleteBoard"
            >

              Delete

            </button>


          </div>


        </template>


        <!-- Nothing selected -->

        <div
            v-else
            class="nothing-selected"
        >

          <p>

            Select a board.

          </p>


          <p>

            Or click
            <b>New</b>
            to create one.

          </p>

        </div>

      </fieldset>

    </div>


    <!-- ========================= -->
    <!-- ERROR -->
    <!-- ========================= -->

    <div
        v-if="error"
        class="error"
    >

      {{ error }}

    </div>


    <!-- ========================= -->
    <!-- STATUS BAR -->
    <!-- ========================= -->

    <div class="status-bar">

      <p class="status-bar-field">

        Board Manager

      </p>


      <p class="status-bar-field">

        {{
          loading
              ? "Loading..."
              : `${boards.length} board${boards.length === 1 ? "" : "s"}`
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


/*
 * Board list.
 */

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


/*
 * Board item.
 */

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


.board-item.selected {

  background: #000080;

  color: white;

}


.board-item span {

  min-width: 0;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.board-item img {

  width: 20px;

  height: 20px;

  flex-shrink: 0;

}


/*
 * Empty / loading state.
 */

.empty {

  padding: 5px;

  color: #666;

}


/*
 * Form controls.
 */

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


input[readonly] {

  color: #555;

}


/*
 * New button.
 */

.new {

  margin-bottom: 10px;

}


/*
 * Actions.
 */

.actions {

  display: flex;

  gap: 4px;

  margin-top: 8px;

  flex-wrap: wrap;

}


/*
 * Nothing selected.
 */

.nothing-selected {

  color: #666;

}


.nothing-selected p {

  margin-top: 5px;

  margin-bottom: 8px;

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


/*
 * Status bar.
 */

.status-bar {

  margin-top: 4px;

}

</style>