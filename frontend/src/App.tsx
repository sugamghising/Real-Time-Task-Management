import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import Board from "./components/Board/Board";
import Modal from "./components/common/Modal";
import Button from "./components/common/Button";
import Input from "./components/common/Input";
import type { AppState, Task } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";

const initialData: AppState = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Take out the garbage",
      description: "Separate recyclables",
      priority: "low",
    },
    "task-2": {
      id: "task-2",
      title: "Watch my favorite show",
      description: "New episode out today",
      priority: "medium",
    },
    "task-3": {
      id: "task-3",
      title: "Charge my phone",
      description: "Battery is low",
      priority: "high",
    },
    "task-4": {
      id: "task-4",
      title: "Cook dinner",
      description: "Pasta night",
      priority: "medium",
    },
  },
  boards: {
    "board-1": {
      id: "board-1",
      title: "My Task Board",
      columns: {
        "column-1": {
          id: "column-1",
          title: "To Do",
          taskIds: ["task-1", "task-2", "task-3", "task-4"],
        },
        "column-2": {
          id: "column-2",
          title: "In Progress",
          taskIds: [],
        },
        "column-3": {
          id: "column-3",
          title: "Done",
          taskIds: [],
        },
      },
      columnsOrder: ["column-1", "column-2", "column-3"],
    },
  },
  boardsOrder: ["board-1"],
};

function App() {
  const [data, setData] = useLocalStorage<AppState>(
    "kanban-board-data",
    initialData
  );
  const board = data.boards[data.boardsOrder[0]];

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = board.columns[source.droppableId];
    const finishColumn = board.columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        boards: {
          ...data.boards,
          [board.id]: {
            ...board,
            columns: {
              ...board.columns,
              [newColumn.id]: newColumn,
            },
          },
        },
      };

      setData(newState);
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      boards: {
        ...data.boards,
        [board.id]: {
          ...board,
          columns: {
            ...board.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
          },
        },
      },
    };

    setData(newState);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddClick = (columnId: string) => {
    setActiveColumnId(columnId);
    setIsAddModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !activeColumnId) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: newTaskTitle,
      priority: "medium" as const,
      description: "",
    };

    const column = data.boards[board.id].columns[activeColumnId];
    const newTaskIds = [...column.taskIds, newTaskId];

    const newState = {
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      boards: {
        ...data.boards,
        [board.id]: {
          ...board,
          columns: {
            ...board.columns,
            [activeColumnId]: {
              ...column,
              taskIds: newTaskIds,
            },
          },
        },
      },
    };

    setData(newState);
    setNewTaskTitle("");
    setIsAddModalOpen(false);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const newState = {
      ...data,
      tasks: {
        ...data.tasks,
        [editingTask.id]: editingTask,
      },
    };

    setData(newState);
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;

    // Find the column containing the task
    const columnId = Object.keys(data.boards[board.id].columns).find((colId) =>
      data.boards[board.id].columns[colId].taskIds.includes(editingTask.id)
    );

    if (!columnId) return;

    const column = data.boards[board.id].columns[columnId];
    const newTaskIds = column.taskIds.filter((id) => id !== editingTask.id);

    // Create new tasks object without the deleted task
    const newTasks = { ...data.tasks };
    delete newTasks[editingTask.id];

    const newState = {
      ...data,
      tasks: newTasks,
      boards: {
        ...data.boards,
        [board.id]: {
          ...board,
          columns: {
            ...board.columns,
            [columnId]: {
              ...column,
              taskIds: newTaskIds,
            },
          },
        },
      },
    };

    setData(newState);
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="app">
      <DragDropContext onDragEnd={onDragEnd}>
        <Board
          board={board}
          tasks={data.tasks}
          onAddClick={handleAddClick}
          onTaskClick={handleTaskClick}
        />
      </DragDropContext>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Task Title"
            value={editingTask?.title || ""}
            onChange={(e) =>
              setEditingTask((prev) =>
                prev ? { ...prev, title: e.target.value } : null
              )
            }
            placeholder="Enter task title..."
          />
          <div className="flex flex-col gap-1 mb-3">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow min-h-[100px]"
              value={editingTask?.description || ""}
              onChange={(e) =>
                setEditingTask((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              placeholder="Enter description..."
            />
          </div>
          <div className="flex flex-col gap-1 mb-3">
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              value={editingTask?.priority || "medium"}
              onChange={(e) =>
                setEditingTask((prev) =>
                  prev
                    ? { ...prev, priority: e.target.value as Task["priority"] }
                    : null
                )
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button variant="danger" onClick={handleDeleteTask}>
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>Save Changes</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
