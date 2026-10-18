import type { IconName } from '../components/Icon';

export type Recipient = {
  id: string;
  name: string;
  first: string;
  initials: string;
  grad: [string, string];
};

const mk = (id: string, name: string, grad: [string, string]): Recipient => ({
  id,
  name,
  first: name.split(' ')[0],
  initials: name.split(' ').map((p) => p[0]).join(''),
  grad,
});

export const recipients: Recipient[] = [
  mk('ada', 'Ola Dimeji', ['#FF8A5B', '#FF3D81']),
  mk('leo', 'Dimeji Razaq', ['#4FD1FF', '#3D6BFF']),
  mk('nia', 'Mohamemd Ahmed', ['#C8F63D', '#3DDC97']),
  mk('kai', 'john Doe', ['#B18CFF', '#7C5CFF']),
  mk('zoe', 'David Sarah', ['#FFD166', '#FF8A5B']),
  mk('sam', 'Sam Idowu', ['#5EEAD4', '#2DA8FF']),
];

export type Tx = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: number;
  icon: IconName;
  tint: string;
  pending?: boolean;
};

const H = 3600_000;
const now = Date.now();

export const seedTransactions: Tx[] = [
  { id: 's1', title: 'Data purchase', subtitle: 'Card •••• 8421', amount: -14.99, date: now - 3 * H, icon: 'coffee', tint: '#FFB866' },
  { id: 's2', title: 'Salary', subtitle: 'Direct deposit', amount: 1850, date: now - 20 * H, icon: 'arrow-down-left', tint: '#3DDC97' },
  { id: 's3', title: 'Mobile App Gig', subtitle: 'Card •••• 5510', amount: -12.5, date: now - 30 * H, icon: 'film', tint: '#FF6B86' },
  { id: 's4', title: 'Uber ride', subtitle: 'Wallet', amount: -180, date: now - 52 * H, icon: 'arrow-up-right', tint: '#7C5CFF' },
  { id: 's5', title: 'Airtime purchase', subtitle: 'Card •••• 8421', amount: -22.4, date: now - 76 * H, icon: 'bus', tint: '#4FD1FF' },
  { id: 's6', title: 'Lunch', subtitle: 'Card •••• 8421', amount: -64.18, date: now - 100 * H, icon: 'bag', tint: '#C8F63D' },
];

export const START_BALANCE = 2500.5;

export type CardDef = {
  id: string;
  name: string;
  last4: string;
  balance: number;
  grad: [string, string];
};

export const cards: CardDef[] = [
  { id: 'c1', name: 'Pulse Debit', last4: '8421', balance: 5320.4, grad: ['#241466', '#7C5CFF'] },
  { id: 'c2', name: 'Savings Vault', last4: '0937', balance: 12480, grad: ['#0B3A2D', '#2FBF8F'] },
  { id: 'c3', name: 'Virtual Card', last4: '5510', balance: 340.25, grad: ['#3A0F2E', '#FF5C9A'] },
];
