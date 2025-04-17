export interface Question {
  _id: number;
  question_number: number;
  question: string;
  options?: string[];
  type?: string;
  answer: string;
}
