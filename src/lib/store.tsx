import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { START_BALANCE, seedTransactions, type Recipient, type Tx } from './data';

export type Undo = { txId: string; amount: number; name: string } | null;

export type User = { name: string; email: string };

const DEFAULT_USER: User = { name: 'Oladimeji Abdulrazaq', email: 'abdulrazaq2a@gmail.com' };

type Store = {
  isAuthenticated: boolean;
  user: User;
  login: (email?: string, name?: string) => void;
  logout: () => void;
  balance: number;
  txs: Tx[];
  undo: Undo;
  send: (to: Recipient, amount: number) => { txId: string; newBalance: number };
  request: (from: Recipient, amount: number) => void;
  topUp: (amount: number) => void;
  offerUndo: (txId: string) => void;
  undoSend: () => void;
  clearUndo: () => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);
const UNDO_MS = 6000;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [balance, setBalance] = useState(START_BALANCE);
  const [txs, setTxs] = useState<Tx[]>(seedTransactions);
  const [undo, setUndo] = useState<Undo>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const login = useCallback((email?: string, name?: string) => {
    if (email || name) {
      setUser((prev) => ({
        email: email || prev.email,
        name: name || (email ? email.split('@')[0] : prev.name),
      }));
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const clearUndo = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setUndo(null);
  }, []);

  const send: Store['send'] = useCallback(
    (to, amount) => {
      const txId = `t${Date.now()}_${counter.current++}`;
      const tx: Tx = {
        id: txId,
        title: to.name,
        subtitle: 'Wallet',
        amount: -amount,
        date: Date.now(),
        icon: 'arrow-up-right',
        tint: '#7C5CFF',
      };
      setTxs((t) => [tx, ...t]);
      setBalance((b) => b - amount);
      return { txId, newBalance: balance - amount };
    },
    [balance],
  );

  const request: Store['request'] = useCallback((from, amount) => {
    const tx: Tx = {
      id: `r${Date.now()}_${counter.current++}`,
      title: from.name,
      subtitle: 'Requested',
      amount,
      date: Date.now(),
      icon: 'download',
      tint: '#C8F63D',
      pending: true,
    };
    setTxs((t) => [tx, ...t]);
  }, []);

  const topUp = useCallback((amount: number) => {
    const tx: Tx = {
      id: `u${Date.now()}_${counter.current++}`,
      title: 'Top up',
      subtitle: 'Card •••• 8421',
      amount,
      date: Date.now(),
      icon: 'plus',
      tint: '#3DDC97',
    };
    setTxs((t) => [tx, ...t]);
    setBalance((b) => b + amount);
  }, []);

  const offerUndo = useCallback(
    (txId: string) => {
      const tx = txs.find((t) => t.id === txId);
      if (!tx) return;
      if (timer.current) clearTimeout(timer.current);
      setUndo({ txId, amount: -tx.amount, name: tx.title });
      timer.current = setTimeout(() => setUndo(null), UNDO_MS);
    },
    [txs],
  );

  const undoSend = useCallback(() => {
    if (!undo) return;
    setTxs((t) => t.filter((x) => x.id !== undo.txId));
    setBalance((b) => b + undo.amount);
    clearUndo();
  }, [undo, clearUndo]);

  const reset = useCallback(() => {
    clearUndo();
    setBalance(START_BALANCE);
    setTxs(seedTransactions);
  }, [clearUndo]);

  const value = useMemo<Store>(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      balance,
      txs,
      undo,
      send,
      request,
      topUp,
      offerUndo,
      undoSend,
      clearUndo,
      reset,
    }),
    [
      isAuthenticated,
      user,
      login,
      logout,
      balance,
      txs,
      undo,
      send,
      request,
      topUp,
      offerUndo,
      undoSend,
      clearUndo,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

export const UNDO_DURATION = UNDO_MS;
