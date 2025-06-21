export type Context = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly charCount: number;
  readonly originalHash: string;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type SelectedContext = Context & {
  readonly originalContextId?: string;
};

export type ContextFormData = {
  id?: string;
  title: string;
  content: string;
};
