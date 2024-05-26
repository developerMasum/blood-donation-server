 export interface ZodIssue {
    code: string;
    expected: string;
    received: string;
    path: string[];
    message: string;
  }
  
   export interface ZodError extends Error {
    issues: ZodIssue[];
  }