declare module '@react-native-community/datetimepicker' {
  const DateTimePicker: any;
  export default DateTimePicker;
  export type DateTimePickerEvent = any;
}

declare module 'date-fns' {
  export function format(date: any, fmt: string): string;
}

declare module 'react-native-calendars' {
  import { ComponentType } from 'react';
  export const Calendar: ComponentType<any>;
}
