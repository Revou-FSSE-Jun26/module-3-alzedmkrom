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
