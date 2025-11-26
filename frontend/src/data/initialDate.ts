import type { AppState } from "../types";

export const initialData: AppState = {
    boardsOrder: ["board-1"],
    boards: {
        "board-1": {
            id: "board-1",
            title: "Project Board",
            columnsOrder: ["col-1", "col-2", "col-3"],
            columns: {
                "col-1": { id: "col-1", title: "To Do", taskIds: ["task-1"] },
                "col-2": { id: "col-2", title: "Doing", taskIds: [] },
                "col-3": { id: "col-3", title: "Done", taskIds: [] },
            },
        },
    },
    tasks: {
        "task-1": {
            id: "task-1",
            title: "Design Homepage",
            description: "Create UI wireframes",
            priority: "high",
            tags: ["UI"],
            createdAt: new Date().toISOString(),
        },
    },
};
