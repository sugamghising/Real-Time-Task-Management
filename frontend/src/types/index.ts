export type Task = {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    // status: "todo" | "inprogress" | "done";
    priority: "low" | "medium" | "high";
    createdAt?: string;
    dueDate?: string;
};

export type Board = {
    id: string;
    title: string;
    columnsOrder: string[];
    columns: Record<string, Column>;
};

export type Column = {
    id: string;
    title: string;
    taskIds: string[];
};

export type AppState = {
    boardsOrder: string[];
    boards: Record<string, Board>;
    tasks: Record<string, Task>;
};