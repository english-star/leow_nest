export interface ApiResponse {
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

export interface WebhookPayload {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<{
          [x: string]: any;
          from: string;
          id: string;
          type: string;
          text?: {
            body: string;
          };
        }>;
      };
    }>;
  }>;
}

export interface MessageResponse {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text?: {
    body: string;
  };
  audio?: {
    link: string;
  };
  video?: {
    link: string;
  };
}

export interface InteractiveMessageResponse {
  [x: string]: any;
  from: string;
  id: string;
  type: string;
  text?: {
    body: string;
  };
}

export enum MediaType {
  Video = 'video',
  Audio = 'audio',
}
