export type Board = {
  id: string;
  title: string;
  createdAt?: string;
};

export type Column = {
  id: string;
  title: string;
  boardId: string;
  position?: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position?: number;
};
