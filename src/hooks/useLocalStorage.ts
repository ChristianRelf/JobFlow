import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
export function useApplications() {
  const [applications, setApplications] = useLocalStorage('oog_applications', []);
  return { applications, setApplications };
}

export function useCourses() {
  const [courses, setCourses] = useLocalStorage('oog_courses', []);
  return [courses, setCourses] as const;
}

// Use courses without sample data for production
export function useCoursesWithSamples() {
  const [courses, setCourses] = useLocalStorage('oog_courses', []);
  return [courses, setCourses] as const;
}
export function useUserProgress() {
  const [progress, setProgress] = useLocalStorage('oog_user_progress', []);
  return [progress, setProgress] as const;
}

export function useApplicationQuestions() {
  const [questions, setQuestions] = useLocalStorage('oog_app_questions', [
    {
      id: '1',
      question: 'What is your Discord username?',
      type: 'text',
      required: true,
      order: 1
    },
    {
      id: '2', 
      question: 'Why do you want to join Oakridge Operations Group?',
      type: 'textarea',
      required: true,
      order: 2
    },
    {
      id: '3',
      question: 'What is your experience with Roblox?',
      type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
      order: 3
    },
    {
      id: '4',
      question: 'Are you available for training sessions?',
      type: 'radio',
      options: ['Yes', 'No', 'Sometimes'],
      required: true,
      order: 4
    }
  ]);
  return [questions, setQuestions] as const;
}