import { createContext } from 'react';
import { WorkflowContext } from './workflow-types';

// Context
export const WorkflowContextProvider = createContext<WorkflowContext | null>(null);