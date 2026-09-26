/* ==========================================================================
   Study Planner — DOM & Events exercise (Task 4.2)

   This task declares the typed state and the named helper functions that
   carry the app's logic. DOM selection/creation/removal (Task 4.3) and the
   event wiring (Task 4.4) are added in later tasks. The helpers below own the
   arithmetic, comparison and formatting logic so the event callbacks that come
   later stay thin.

   Classic (non-module) script loaded with `defer` from dom-events.html, so it
   runs after the DOM is parsed and works over the file:// protocol.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Typed state — several data types, each annotated with JSDoc so the intended
   type is visible without TypeScript (Requirement 3.2).
   -------------------------------------------------------------------------- */

/** A fixed string label for the app. @type {string} */
const APP_LABEL = 'Study Planner';

/** Monotonic counter used to hand out unique task ids. @type {number} */
let taskCounter = 0;

/** Whether compact mode is on. @type {boolean} */
let isCompactMode = false;

/**
 * The backing store for tasks: an array of task objects.
 * @type {{ id: number, title: string, minutes: number, done: boolean }[]}
 */
const tasks = [];

/* --------------------------------------------------------------------------
   Named helpers — the logic lives here rather than inline in event callbacks.
   They use arithmetic, strict equality, logical and ternary operators, and
   template literals (Requirement 3.2).
   -------------------------------------------------------------------------- */

/**
 * Add a task to the backing array and return the created task object.
 * Uses logical operators to guard against invalid input and arithmetic to
 * derive the next id. Returns `null` when the input is not usable.
 *
 * @param {string} title - the task title
 * @param {number} minutes - estimated minutes, must be a positive number
 * @returns {{ id: number, title: string, minutes: number, done: boolean } | null}
 */
function addTask(title, minutes) {
  // Logical guard: a non-empty title AND a positive minute count.
  const trimmed = typeof title === 'string' ? title.trim() : '';
  const isValid = trimmed.length > 0 && typeof minutes === 'number' && minutes > 0;
  if (!isValid) {
    return null;
  }

  // Arithmetic: bump the counter to produce a unique id.
  taskCounter = taskCounter + 1;

  /** @type {{ id: number, title: string, minutes: number, done: boolean }} */
  const task = {
    id: taskCounter,
    title: trimmed,
    minutes: minutes,
    done: false,
  };

  tasks.push(task);
  return task;
}

/**
 * Remove the task with the given id from the backing array.
 * Uses strict equality to find the match.
 *
 * @param {number} id - the id of the task to remove
 * @returns {boolean} true when a task was removed, false when none matched
 */
function removeTask(id) {
  const index = tasks.findIndex((task) => task.id === id); // strict equality
  if (index === -1) {
    return false;
  }
  tasks.splice(index, 1);
  return true;
}

/**
 * Flip the done state of the task with the given id.
 * Uses strict equality to match and a logical NOT to flip the flag.
 *
 * @param {number} id - the id of the task to toggle
 * @returns {boolean} the new done state, or false when no task matched
 */
function toggleTask(id) {
  const task = tasks.find((item) => item.id === id); // strict equality
  if (!task) {
    return false;
  }
  task.done = !task.done; // logical NOT flips the boolean
  return task.done;
}

/**
 * Build the human-readable summary line describing the current tasks.
 * Aggregates total minutes with arithmetic, counts done tasks, and uses a
 * ternary plus template literals to phrase the result. Returns the string so
 * the caller (Task 4.3) can write it to the summary region.
 *
 * @returns {string}
 */
function renderSummary() {
  // Arithmetic aggregate over the array.
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const doneCount = tasks.filter((task) => task.done === true).length; // strict equality
  const total = tasks.length;

  // Ternary chooses singular vs plural wording for the label.
  const taskWord = total === 1 ? 'task' : 'tasks';

  // Empty-state message via a ternary, otherwise a template-literal summary.
  return total === 0
    ? `${APP_LABEL}: no tasks yet — add one to get started.`
    : `${APP_LABEL}: ${total} ${taskWord}, ${doneCount} done, ${formatDuration(totalMinutes)} planned.`;
}

/**
 * Format a duration in minutes as a compact "Xh Ym" / "Ym" string.
 * Uses arithmetic (division and modulo), logical operators and template
 * literals to compose the output.
 *
 * @param {number} totalMinutes - a non-negative whole number of minutes
 * @returns {string}
 */
function formatDuration(totalMinutes) {
  // Guard non-numbers and negatives with logical operators.
  const safe = typeof totalMinutes === 'number' && totalMinutes > 0 ? totalMinutes : 0;

  const hours = Math.floor(safe / 60); // arithmetic: whole hours
  const minutes = safe % 60; // arithmetic: leftover minutes

  // Logical AND builds each part only when it is non-zero; template literals
  // interpolate the values.
  const hourPart = hours > 0 ? `${hours}h` : '';
  const minutePart = minutes > 0 ? `${minutes}m` : '';

  // Ternary picks a sensible fallback when both parts are empty.
  const combined = `${hourPart} ${minutePart}`.trim();
  return combined.length > 0 ? combined : '0m';
}
/* ==========================================================================
   DOM selection, creation and removal (Task 4.3)

   Cache the elements the app touches, then provide the render helpers that
   build task rows with document.createElement, repopulate the list, remove a
   row with element.remove(), and write the summary/attributes back to the DOM.

   Element references and the render helpers are declared here so Task 4.4 can
   consume them; NO event listeners are attached in this task.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Element references — selected with all three query APIs so each is
   demonstrably exercised (Requirement 3.3): getElementById for the id-based
   lookups, querySelector for a scoped single match, querySelectorAll for a
   collection.
   -------------------------------------------------------------------------- */

/** The <main> landmark — compact mode is toggled on it later. @type {HTMLElement} */
const mainEl = document.querySelector('main');

/** The add-task form. @type {HTMLFormElement} */
const taskFormEl = document.getElementById('task-form');

/** The task title input. @type {HTMLInputElement} */
const taskTitleInput = document.getElementById('task-title');

/** The estimated-minutes input. @type {HTMLInputElement} */
const taskMinutesInput = document.getElementById('task-minutes');

/** The role="alert" error region. @type {HTMLElement} */
const taskErrorEl = document.getElementById('task-error');

/** The <ul> that holds the task rows. @type {HTMLUListElement} */
const taskListEl = document.getElementById('task-list');

/** The aria-live summary region. @type {HTMLElement} */
const taskSummaryEl = document.getElementById('task-summary');

/** The compact-mode toggle button. @type {HTMLButtonElement} */
const compactToggleBtn = document.getElementById('compact-toggle');

/**
 * All submit buttons inside the form, gathered with querySelectorAll to round
 * out the three selection APIs. Currently informational; Task 4.4 owns the
 * wiring.
 * @type {NodeListOf<HTMLButtonElement>}
 */
const formSubmitButtons = taskFormEl.querySelectorAll('button[type="submit"]');

/* --------------------------------------------------------------------------
   Render helpers — build and refresh the DOM from the `tasks` array. They do
   the DOM work only; event listeners are attached in Task 4.4, which dispatches
   on the data-action attributes set below.
   -------------------------------------------------------------------------- */

/**
 * Build a single task row (<li>) for the given task, with a title/minutes label
 * plus a done-toggle button and a delete button. Each button carries a
 * `data-action` attribute (so a delegated handler can dispatch via
 * closest('[data-action]')) and an `aria-label` for assistive tech. The
 * done-toggle reflects state through `aria-pressed` set with setAttribute.
 *
 * @param {{ id: number, title: string, minutes: number, done: boolean }} task
 * @returns {HTMLLIElement} the fully built row, not yet inserted into the list
 */
function createTaskRow(task) {
  const li = document.createElement('li');
  // Stash the id on the row so the delegated handler can recover it.
  li.dataset.taskId = String(task.id);
  // Reflect done state as a class the stylesheet strikes through.
  if (task.done === true) {
    li.classList.add('task--done');
  }

  // Text label: title plus the formatted duration.
  const label = document.createElement('span');
  label.className = 'task__label';
  label.textContent = `${task.title} — ${formatDuration(task.minutes)}`;

  // Done-toggle button: aria-pressed mirrors the done flag via setAttribute.
  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.dataset.action = 'toggle';
  doneBtn.setAttribute('aria-pressed', task.done === true ? 'true' : 'false');
  doneBtn.setAttribute('aria-label', `Mark "${task.title}" as ${task.done === true ? 'not done' : 'done'}`);
  doneBtn.textContent = task.done === true ? 'Done' : 'Mark done';

  // Delete button.
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
  deleteBtn.textContent = 'Delete';

  // Assemble the row with append (accepts multiple nodes at once).
  li.append(label, doneBtn, deleteBtn);
  return li;
}

/**
 * Clear the list and repopulate it from the backing `tasks` array, then refresh
 * the summary so the two never drift. Rebuilds every row with createTaskRow.
 *
 * @returns {void}
 */
function renderTasks() {
  // Clear existing rows before repopulating.
  taskListEl.replaceChildren();

  // Rebuild one row per task and append it.
  tasks.forEach((task) => {
    taskListEl.append(createTaskRow(task));
  });

  renderSummaryText();
}

/**
 * Remove a task's row from the DOM with element.remove() and keep the backing
 * array in sync (removeTask handles the array side). Refreshes the summary
 * afterwards. Returns whether a row was actually removed.
 *
 * @param {number} id - the id of the task to remove
 * @returns {boolean} true when a row and its task were removed
 */
function removeTaskRow(id) {
  // Locate the row by the data-task-id stamped in createTaskRow.
  const row = taskListEl.querySelector(`li[data-task-id="${id}"]`);
  const removedFromArray = removeTask(id); // keep the array in sync

  if (row) {
    row.remove(); // element.remove() detaches the node from the DOM
  }

  renderSummaryText();
  return removedFromArray === true && row !== null;
}

/**
 * Write the current summary string into the summary region with textContent.
 * Delegates the wording to renderSummary() (Task 4.2).
 *
 * @returns {void}
 */
function renderSummaryText() {
  taskSummaryEl.textContent = renderSummary();
}
/* ==========================================================================
   Class toggling and event handling (Task 4.4)

   Wire the three interactions on top of the state (4.2) and DOM helpers (4.3):
     - the compact-mode button toggles `compact` on <main>,
     - the form's submit handler calls preventDefault() first, then validates
       and adds the task (Requirement 3.7 — no reload, URL unchanged),
     - a single delegated click handler on the list container dispatches on
       closest('[data-action]') so rows created later work without rebinding
       (Requirement 3.6).

   Invalid input is surfaced in the role="alert" region and the entered values
   are left intact — no alert() dialogs anywhere (Requirement 3.4).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Error-region helpers — write and clear the role="alert" message. Keeping
   these tiny means the callbacks stay declarative.
   -------------------------------------------------------------------------- */

/**
 * Show an inline validation message in the role="alert" region.
 * @param {string} message
 * @returns {void}
 */
function showError(message) {
  taskErrorEl.textContent = message;
}

/**
 * Clear any inline validation message.
 * @returns {void}
 */
function clearError() {
  taskErrorEl.textContent = '';
}

/* --------------------------------------------------------------------------
   Compact-mode toggle — flip `compact` on <main> and mirror the state in
   aria-pressed so assistive tech hears the change.
   -------------------------------------------------------------------------- */
compactToggleBtn.addEventListener('click', () => {
  // classList.toggle returns the new presence of the class.
  isCompactMode = mainEl.classList.toggle('compact');
  compactToggleBtn.setAttribute('aria-pressed', isCompactMode === true ? 'true' : 'false');
});

/* --------------------------------------------------------------------------
   Add-task form — preventDefault() is the FIRST statement so the browser never
   reloads the page or appends a query string (Requirement 3.7). Only after
   that do we read, validate, and add.
   -------------------------------------------------------------------------- */
taskFormEl.addEventListener('submit', (event) => {
  event.preventDefault(); // FIRST statement — stops the native form submit/reload.

  // Read the raw field values; keep them intact on failure so nothing is lost.
  const title = taskTitleInput.value;
  const minutes = Number(taskMinutesInput.value);

  // Delegate validation to addTask, which returns null on invalid input.
  const created = addTask(title, minutes);
  if (created === null) {
    showError('Enter a task title and a positive number of minutes.');
    return; // leave the entered values in the inputs untouched
  }

  // Success: clear any prior error, refresh the list, and reset for the next entry.
  clearError();
  renderTasks();
  taskFormEl.reset();
  taskTitleInput.focus();
});

/* --------------------------------------------------------------------------
   Delegated list clicks — a single listener on the <ul> handles every row's
   buttons, present and future, by walking up to the nearest [data-action]
   (Requirement 3.6). Dynamically created rows need no rebinding.
   -------------------------------------------------------------------------- */
taskListEl.addEventListener('click', (event) => {
  // Walk up from the click target to the nearest element carrying data-action.
  const actionEl = event.target.closest('[data-action]');
  if (actionEl === null) {
    return; // clicked in the row but not on an action button
  }

  // Recover the owning row and its task id (stamped in createTaskRow).
  const row = actionEl.closest('li[data-task-id]');
  if (row === null) {
    return;
  }
  const id = Number(row.dataset.taskId);

  // Dispatch on the declared action.
  const action = actionEl.dataset.action;
  if (action === 'toggle') {
    const nowDone = toggleTask(id); // strict-equality lookup + flip in the array
    row.classList.toggle('task--done', nowDone === true);
    actionEl.setAttribute('aria-pressed', nowDone === true ? 'true' : 'false');
    actionEl.textContent = nowDone === true ? 'Done' : 'Mark done';
    renderSummaryText();
  } else if (action === 'delete') {
    removeTaskRow(id); // element.remove() + array sync + summary refresh
  }
});

/* --------------------------------------------------------------------------
   Initial paint — render the (empty) list once so the summary region shows the
   empty-state message on load.
   -------------------------------------------------------------------------- */
renderTasks();
