import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type { TaskStore } from "./task";
import { researchStore } from "@/utils/storage";
import { customAlphabet } from "nanoid";
import { clone, pick } from "radash";

export interface ResearchHistory extends TaskStore {
  createdAt: number;
  updatedAt?: number;
}

export interface HistoryStore {
  history: ResearchHistory[];
}

interface HistoryFunction {
  save: (taskStore: TaskStore) => string;
  load: (id: string) => TaskStore | void;
  update: (id: string, taskStore: TaskStore) => boolean;
  remove: (id: string) => boolean;
}

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 12);

export const useHistoryStore = create(
  persist<HistoryStore & HistoryFunction>(
    (set, get) => ({
      history: [],
      save: (taskStore) => {
        // Only tasks with a title and final report are saved to the history
        if (taskStore.title && taskStore.finalReport) {
          const id = nanoid();
          const newHistory: ResearchHistory = {
            ...clone(taskStore),
            id,
            createdAt: Date.now(),
          };
          set((state) => ({ history: [newHistory, ...state.history] }));
          return id;
        }
        return "";
      },
      load: (id) => {
        const current = get().history.find((item) => item.id === id);
        if (current) return clone(current);
      },
      update: (id, taskStore) => {
        const history = get().history;
        const index = history.findIndex((item) => item.id === id);

        if (index === -1) return false;

        // Clone only the item being updated, not all items
        const updatedItem = {
          ...clone(history[index]),
          ...clone(taskStore),
          id: history[index].id,
          createdAt: history[index].createdAt,
          updatedAt: Date.now(),
        } as ResearchHistory;

        // Create new array with updated item
        const newHistory = [
          ...history.slice(0, index),
          updatedItem,
          ...history.slice(index + 1),
        ];

        set(() => ({ history: newHistory }));
        return true;
      },
      remove: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
        return true;
      },
    }),
    {
      name: "historyStore",
      version: 1,
      storage: {
        getItem: async (key: string) => {
          return await researchStore.getItem<
            StorageValue<HistoryStore & HistoryFunction>
          >(key);
        },
        setItem: async (
          key: string,
          store: StorageValue<HistoryStore & HistoryFunction>
        ) => {
          return await researchStore.setItem(key, {
            state: pick(store.state, ["history"]),
            version: store.version,
          });
        },
        removeItem: async (key: string) => await researchStore.removeItem(key),
      },
    }
  )
);
