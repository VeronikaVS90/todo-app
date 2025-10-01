export type Board = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  title: string;
  boardId: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  done: boolean;
};
