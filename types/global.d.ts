export interface IDoc {
  info: {
    title: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  securityDefinitions: {
    apiKeyAuth: {
      type: string;
      in: string;
      name: string;
    };
  };
  produces: string[];
  tags: Array<{
    name: string;
    description: string;
  }>;
  definitions: {
    [key: string]: {
      success: boolean;
      message?: string;
      state?: string;
      error?: string;
    };
  };
}
