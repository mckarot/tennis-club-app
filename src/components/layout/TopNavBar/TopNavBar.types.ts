export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moniteur' | 'client';
}
