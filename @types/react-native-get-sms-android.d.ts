declare module 'react-native-get-sms-android' {
    interface SMS {
      address: string;
      body: string;
      date: string;
    }
  
    interface Filter {
      box?: string;
      read?: number;
      indexFrom?: number;
      maxCount?: number;
    }
  
    export function list(
      filter: string,
      failureCallback: (error: string) => void,
      successCallback: (count: number, smsList: string) => void
    ): void;
  }
  