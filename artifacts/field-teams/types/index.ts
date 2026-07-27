export interface User {
  id: string;
  employeeId: string;
  name: string;
  team: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'closed' | 'pending_sync';
export type FormFieldType = 'number' | 'text' | 'date' | 'dropdown' | 'phone' | 'textarea' | 'image';

export interface Task {
  id: string;
  seq: number;
  serviceNumber: string;
  meterNumber?: string;
  taskType: string;
  entryDate: string;
  expectedDate: string;
  status: TaskStatus;
  customerName: string;
  phone: string;
  address: string;
  areaName: string;
  propertyType: string;
  faultType: string;
  faultCategory: string;
  faultImportance: string;
  details: string;
  formSchemaId: string;
  assignedTo?: string;
  isSpecial?: boolean;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FormFieldSchema {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  digits?: number;
  maxLength?: number;
  dropdownOptions?: DropdownOption[];
  dropdownApiUrl?: string;
  multiple?: boolean;
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormFieldSchema[];
}

export interface SubmittedForm {
  id: string;
  taskId: string;
  formSchemaId: string;
  data: Record<string, unknown>;
  images: string[];
  submittedAt: string;
  synced: boolean;
}

export interface OfflineQueueItem {
  id: string;
  type: 'form_submit' | 'task_close';
  data: unknown;
  createdAt: string;
  retries: number;
}
