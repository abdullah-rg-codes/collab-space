// Task-related types and constants

export const TaskStatus = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface TasksState {
  tasks: Record<string, Task>; // tasks indexed by id
  ids: string[]; // ordered list of task ids
  filters: {
    status: TaskStatus[];
    priority: TaskPriority[];
    search: string;
  };
  sortBy: 'createdAt' | 'updatedAt' | 'priority';
}

export interface UIComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends UIComponentProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export interface TextInputProps extends UIComponentProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  type?: string;
  required?: boolean;
}

export interface SelectProps extends UIComponentProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface TagProps extends UIComponentProps {
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
  onRemove?: () => void;
}

export interface CardProps extends UIComponentProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export interface ModalProps extends UIComponentProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose: (id: string) => void;
}
