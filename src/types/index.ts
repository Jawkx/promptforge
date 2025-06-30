export type Label = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
};

export type Context = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly tokenCount: number;
  readonly version: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly labels: readonly Label[];
};

export type SelectedContext = Context & {
  readonly originalContextId?: string;
  readonly originalVersion?: string;
};

export type ContextFormData = {
  id?: string;
  title: string;
  content: string;
};
