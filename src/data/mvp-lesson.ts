import {
  Question,
  QuestionType,
} from 'src/questions/interfaces/question.interface';

const list: Question[] = [
  {
    _id: 1,
    text: 'Hitamo ubusobanuro bwa “Icyayi”',
    type: QuestionType.MultipleChoice,
    options: ['Milk🥛', 'Tea🍵', 'Bread🍞'],
    answer: 'Tea🍵',
  },
  {
    _id: 2,
    text: 'Vuga ibyo usoma: \n Hello',
    type: QuestionType.Writing,
    answer: 'Hello',
  },
  {
    _id: 3,
    text: 'Hitamo ubusobanuro bwa “Muraho”',
    type: QuestionType.MultipleChoice,
    options: ['Thank you', 'Hello', 'Goodbye'],
    answer: 'Hello',
  },
  {
    _id: 4,
    text: 'Hitamo ijambo ryuzuza iyi nteruro: \n I read a ..... at school.',
    type: QuestionType.MultipleChoice,
    options: ['Food', 'Book', 'Cow'],
    answer: 'Book',
  },
  {
    _id: 5,
    text: 'Hitamo ijambo ryuzuza iyi nteruro: \n We ate ..... in the morning.',
    type: QuestionType.MultipleChoice,
    options: ['Rice', 'Water', 'Tea'],
    answer: 'Rice',
  },
  {
    _id: 6,
    text: 'Vuga ibyo usoma: \n Water',
    type: QuestionType.Writing,
    answer: 'Water',
  },
  {
    _id: 7,
    text: 'Ni iki wumva?',
    type: QuestionType.MultipleChoice,
    audio: 'https://leow.netlify.app/Pronunciation_hello_.mp3',
    options: ['Hello', 'Below', 'Yellow'],
    answer: 'Hello',
  },
  {
    _id: 8,
    text: 'Ni iki wumva?',
    type: QuestionType.MultipleChoice,
    audio: 'https://leow.netlify.app/Pronunciation_water.mp3',
    options: ['Water', 'Butter', 'Quarter'],
    answer: 'Water',
  },
  {
    _id: 9,
    text: 'Ni iki wumva?',
    type: QuestionType.MultipleChoice,
    audio: 'https://leow.netlify.app/Pronunciation%20_yes_.mp3',
    options: ['yes', 'guess', 'rest'],
    answer: 'yes',
  },
  {
    _id: 10,
    text: "Uzuza iki kiganiro: \nUmuntu A: Hi! How are you doing today?\nUmuntu B: I'm good, thanks, How about you?\nUmuntu A: ………..",
    type: QuestionType.MultipleChoice,
    options: ["I'm fine, thank you!", "What's your name?", "Let's go."],
    answer: "I'm fine, thank you!",
  },
  {
    _id: 11,
    text: 'Uzuza iki kiganiro: \nUmuntu A: Do you want coffee? \nUmuntu B: Sure! ……………',
    type: QuestionType.MultipleChoice,
    options: ["I don't drink coffee", 'How about 3 PM?', "Let's Swim."],
    answer: 'How about 3 PM?',
  },
  {
    _id: 12,
    text: 'Soma maze usubize: \n"Don\'t forget your umbrella; it\'s raining" \n *Uvuga arashaka:*',
    type: QuestionType.MultipleChoice,
    options: ['Give weather advice', 'Plan a vacation', 'Describe a recipe'],
    answer: 'Give weather advice',
  },
  {
    _id: 13,
    text: 'Soma maze usubize: \n"The children are playing" \n *Uvuga arashaka:*',
    type: QuestionType.MultipleChoice,
    options: ['Describe work', 'Talk about children', 'Recap a meeting'],
    answer: 'Talk about children',
  },
  {
    _id: 14,
    text: 'Andika "Ndi mu rugo." mu Cyongereza',
    type: QuestionType.Writing,
    answer: 'I am at home',
  },
  {
    _id: 15,
    text: 'Andika "Ndashaka kurya." mu Cyongereza',
    type: QuestionType.Writing,
    answer: 'I want to eat',
  },
];

export default list;
