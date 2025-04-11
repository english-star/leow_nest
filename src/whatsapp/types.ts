export interface WhatsAppWebhookPayload {
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

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}
