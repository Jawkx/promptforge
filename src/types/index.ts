export type Context = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly charCount: number;
  readonly hash: string;
};

export type ContextFormData = {
  id?: string;
  title: string;
  content: string;
};
