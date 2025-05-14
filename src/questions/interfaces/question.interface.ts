export enum QuestionType {
  MultipleChoice = 'interactive',
  Writing = 'text',
}

export interface Question {
  _id: number;
  text: string;
  answer: string;
  options?: string[];
  type: QuestionType;
  audio?: string;
}
